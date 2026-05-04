import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const MONGO = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
