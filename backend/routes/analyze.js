import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { analyzeResume, generateATSResume, generateCoverLetter, analyzeDetailedATS, generateSummary } from "../utils/geminiAnalyzer.js";
import { extractTextFromFile } from "../utils/resumeParser.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Setup multer for in-memory file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".pdf" || ext === ".docx") {
      cb(null, true);
    } else {
      cb(new Error("Only .pdf and .docx files are allowed"));
    }
  },
});

router.post("/", async (req, res) => {
  const { resume, jd } = req.body;

  console.log("Resume received:", resume?.slice(0, 100));
  console.log("JD received:", jd?.slice(0, 100));

  if (!resume || !jd) {
    return res.status(400).json({ error: "Resume and Job Description are required" });
  }

  try {
    const result = await analyzeResume(resume, jd);
    console.log("Analysis result:", result);
    // Include resumeText and jobDescription for rewrite functionality
    res.json({
      ...result,
      resumeText: resume,
      jobDescription: jd
    });
  } catch (err) {
    console.error("Error analyzing resume:", err.message || err);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

//  Route: Analyze using uploaded file
router.post("/file", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    const jd = req.body.jd;
    if (!jd) {
      return res.status(400).json({ error: "Job Description is required" });
    }

    const resumeText = await extractTextFromFile(req.file);
    console.log("Extracted Resume Text:", resumeText.slice(0, 200));

    const result = await analyzeResume(resumeText, jd);
    console.log("File Analysis result:", result);

    // Include resumeText and jobDescription for rewrite functionality
    res.json({
      ...result,
      resumeText,
      jobDescription: jd
    });
  } catch (err) {
    console.error("File Analyze Error:", err.message || err);
    res.status(500).json({ error: "Failed to analyze resume from file" });
  }
});
// Route: Detailed ATS Score
router.post("/ats-score", async (req, res) => {
  console.log("=== ATS SCORE ROUTE HIT ===");
  try {
    const { resume } = req.body;

    if (!resume) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(500).json({ error: "AI API key not configured on server" });
    }

    const result = await analyzeDetailedATS(resume);

    if (result.warning) {
      return res.status(500).json({ error: result.warning });
    }

    // Optional save to User profile if token exists
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          user.atsScores.push({
            score: result.score || 0,
            fileName: "Text Input",
            result: result,
            createdAt: new Date()
          });
          await user.save();
        }
      } catch (err) {
        console.error("Failed to auto-save ATS score to user profile:", err.message);
      }
    }

    res.json(result);

  } catch (err) {
    console.error("ATS Score Error:", err.message || err);
    res.status(500).json({ error: "Failed to analyze ATS score: " + (err.message || err) });
  }
});

// Route: Detailed ATS Score from File
router.post("/ats-score/file", upload.single("resume"), async (req, res) => {
  console.log("=== ATS SCORE FILE ROUTE HIT ===");
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(500).json({ error: "AI API key not configured on server" });
    }

    const resumeText = await extractTextFromFile(req.file);
    console.log("Extracted Resume Text for ATS Score:", resumeText.slice(0, 200));

    const result = await analyzeDetailedATS(resumeText);

    if (result.warning) {
      return res.status(500).json({ error: result.warning });
    }

    // Optional save to User profile if token exists
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          user.atsScores.push({
            score: result.score || 0,
            fileName: req.file.originalname || "Uploaded File",
            result: result,
            createdAt: new Date()
          });
          await user.save();
        }
      } catch (err) {
        console.error("Failed to auto-save ATS score to user profile:", err.message);
      }
    }

    res.json({
      ...result,
      resumeText
    });
  } catch (err) {
    console.error("ATS Score File Error:", err.message || err);
    res.status(500).json({ error: "Failed to analyze ATS score from file: " + (err.message || err) });
  }
});


router.post("/rewrite", async (req, res) => {

  console.log("=== REWRITE ROUTE HIT ===");
  console.log("API KEY:", process.env.AI_API_KEY ? "EXISTS" : "MISSING ❌");
  console.log("Body keys:", Object.keys(req.body));
  try {
    const { resumeText, jobDescription } = req.body;

    // Log incoming payload for debugging
    console.log("/rewrite payload:", {
      resumeText: resumeText ? `[length: ${resumeText.length}]` : undefined,
      jobDescription: jobDescription ? `[length: ${jobDescription.length}]` : undefined
    });

    if (!resumeText || !jobDescription) {
      console.error("Missing resumeText or jobDescription in payload");
      return res.status(400).json({ error: "Resume text and job description are required" });
    }

    // Log API key presence
    if (!process.env.AI_API_KEY) {
      console.error("AI_API_KEY is missing in environment variables");
      return res.status(500).json({ error: "AI API key not configured on server" });
    }

    const result = await generateATSResume(resumeText, jobDescription);

    if (result.warning) {
      console.error("generateATSResume warning:", result.warning);
      return res.status(500).json({ error: result.warning });
    }

    res.json({
      rewrittenResume: result.resume,
      changes: result.changes
    });

  } catch (err) {
    console.error("Rewrite Error:", err.message || err);
    res.status(500).json({ error: "Failed to rewrite resume: " + (err.message || err) });
  }
});


// Cover Letter Generation Route

router.post("/cover-letter", async (req, res) => {
  console.log("=== COVER LETTER ROUTE HIT ===");
  console.log("Body keys:", Object.keys(req.body));

  try {
    const { resumeText, jobDescription } = req.body;

    console.log("/cover-letter payload:", {
      resumeText: resumeText ? `[length: ${resumeText.length}]` : undefined,
      jobDescription: jobDescription ? `[length: ${jobDescription.length}]` : undefined
    });

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Resume text and job description are required" });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(500).json({ error: "AI API key not configured on server" });
    }

    const result = await generateCoverLetter(resumeText, jobDescription);

    if (result.warning) {
      return res.status(500).json({ error: result.warning });
    }

    res.json({ coverLetter: result.coverLetter });

  } catch (err) {
    console.error("Cover Letter Error:", err.message || err);
    res.status(500).json({ error: "Failed to generate cover letter: " + (err.message || err) });
  }
});

// Route: Generate Summary
router.post("/summary", async (req, res) => {
  console.log("=== GENERATE SUMMARY ROUTE HIT ===");
  try {
    const { personal, experience } = req.body;

    if (!process.env.AI_API_KEY) {
      return res.status(500).json({ error: "AI API key not configured on server" });
    }

    const result = await generateSummary(personal, experience);

    if (result.warning) {
      return res.status(500).json({ error: result.warning });
    }

    res.json({ summary: result.summary });
  } catch (err) {
    console.error("Summary Generation Error:", err.message || err);
    res.status(500).json({ error: "Failed to generate summary: " + (err.message || err) });
  }
});

export default router;

