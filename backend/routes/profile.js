import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/profile - protected route
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/profile/resumes - Save user's resume
router.post("/resumes", requireAuth, async (req, res) => {
  const { name, templateId, resumeData } = req.body;

  if (!name || !templateId || !resumeData) {
    return res.status(400).json({ message: "Name, templateId, and resumeData are required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.resumes.push({ name, templateId, resumeData });
    await user.save();

    res.status(201).json({ message: "Resume saved successfully", resumes: user.resumes });
  } catch (err) {
    console.error("Save Resume Error:", err);
    res.status(500).json({ message: "Failed to save resume" });
  }
});

// DELETE /api/profile/resumes/:id - Delete a saved resume
router.delete("/resumes/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.resumes = user.resumes.filter((r) => r._id.toString() !== req.params.id);
    await user.save();

    res.json({ message: "Resume deleted successfully", resumes: user.resumes });
  } catch (err) {
    console.error("Delete Resume Error:", err);
    res.status(500).json({ message: "Failed to delete resume" });
  }
});

// DELETE /api/profile/ats-scores/:id - Delete an ATS score record
router.delete("/ats-scores/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.atsScores = user.atsScores.filter((s) => s._id.toString() !== req.params.id);
    await user.save();

    res.json({ message: "ATS score deleted successfully", atsScores: user.atsScores });
  } catch (err) {
    console.error("Delete ATS Score Error:", err);
    res.status(500).json({ message: "Failed to delete ATS score record" });
  }
});

export default router;
