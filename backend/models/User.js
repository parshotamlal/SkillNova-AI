import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  templateId: { type: String, required: true },
  resumeData: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

const atsScoreSchema = new mongoose.Schema({
  score: { type: Number, required: true },
  fileName: { type: String, required: true },
  result: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  googleId: { type: String, required: false },
  resumes: [resumeSchema],
  atsScores: [atsScoreSchema]
});

const User = mongoose.model("User", userSchema);
export default User;
