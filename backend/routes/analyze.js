import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import { analyzeResume } from "../utils/geminiAnalyzer.js";
import { extractTextFromFile } from "../utils/resumeParser.js";

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
    res.json(result);
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
    res.json(result);
  } catch (err) {
    console.error("File Analyze Error:", err.message || err);
    res.status(500).json({ error: "Failed to analyze resume from file" });
  }
});

export default router;
