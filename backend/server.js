import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import analyzeRoutes from "./routes/analyze.js";
import stripeRoutes from "./routes/Stripe.js";
import { requireAuth } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // origin: "https://resumes-analyzer.vercel.app",
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Public Routes
app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/stripe", stripeRoutes);

app.get("/api/profile", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get("/", (req, res) => {
  res.send("API is running");
});

// health check (for cron)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);

export default app; 
