import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import { analyzeResume,generateATSResume,generateCoverLetter } from "../utils/geminiAnalyzer.js";
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
export default router;
