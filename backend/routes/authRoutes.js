import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Return token in response body instead of cookie for iOS compatibility
    res.status(201).json({
      message: "Signup successful",
      token: token, // Send token directly for localStorage storage
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Return token in response body instead of cookie for iOS compatibility
    res.json({
      message: "Login successful",
      token: token, // Send token directly for localStorage storage
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  // Since we're not using cookies, logout is handled on frontend by removing token from localStorage
  res.json({ message: "Logged out" });
});
// Google Auth
router.post("/google", async (req, res) => {
  const { name, email, googleId } = req.body;

  try {
    const userName = name || (email ? email.split("@")[0] : "User");
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if they don't exist
      user = await User.create({ name: userName, email, googleId });
    } else {
      // If user exists but doesn't have a googleId, link them
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (!user.name) {
        user.name = userName;
      }
      await user.save();
    }

    const secret = process.env.JWT_SECRET || "skillnova_default_secret_key_2026";
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Google Auth backend error:", err);
    res.status(500).json({ message: "Google Auth failed", error: err.message });
  }
});

export default router;
