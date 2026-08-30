import mongoose from "mongoose";

const paymentClaimSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      default: "",
    },
    paymentId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    plan: {
      type: String,
      default: "Pro",
    },
    amount: {
      type: String,
      default: "₹149",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const PaymentClaim = mongoose.model("PaymentClaim", paymentClaimSchema);
export default PaymentClaim;
