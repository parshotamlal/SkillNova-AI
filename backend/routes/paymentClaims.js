import express from "express";
import nodemailer from "nodemailer";
import PaymentClaim from "../models/PaymentClaim.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const SMTP_USER = "parshotamworks@gmail.com";
const SMTP_PASS = "rqfsqdusysynqnxe";
const ADMIN_EMAIL = "parshotamworks@gmail.com";
const sendAdminNotificationMail = async ({ userEmail, userName, paymentId, plan, amount }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },

    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 22px;">🔔 New Razorpay Payment Claim</h2>
          <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">A user has submitted a Payment ID for Pro Plan</p>
        </div>
        <div style="padding: 24px; background: #ffffff; color: #1e293b; line-height: 1.6;">
          <p style="font-size: 15px; margin-top: 0;">Hello Admin,</p>
          <p>A new payment claim has been submitted on ResumeAi Online:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Payment ID:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 15px; color: #4f46e5; font-weight: bold;">${paymentId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">User Email:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${userEmail}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">User Name:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${userName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Requested Plan:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #16a34a;">${plan} (${amount})</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Submitted At:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${new Date().toLocaleString()}</td>
            </tr>
          </table>

          <div style="text-align: center; margin: 30px 0 10px 0;">
            <a href="https://www.resumeaionline.in/admin/payments" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">
              Open Admin Dashboard to Approve →
            </a>
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
          ResumeAi Online Payment System • Automatic Alert
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"ResumeAi Online" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🔔 New Payment Claim Submitted: ${paymentId} (${userEmail})`,
      html: htmlContent,
    });
  } catch (err) {
    // error handled silently
  }
};

// 1. Submit a payment claim (User)
router.post("/claim", requireAuth, async (req, res) => {
  try {
    const { paymentId, plan, amount } = req.body;

    if (!paymentId || !paymentId.trim()) {
      return res.status(400).json({ message: "Payment ID is required." });
    }

    const cleanPaymentId = paymentId.trim();

    // Check if payment ID already submitted
    const existing = await PaymentClaim.findOne({ paymentId: cleanPaymentId });
    if (existing) {
      return res.status(400).json({
        message: "This Payment ID has already been submitted.",
        claim: existing,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newClaim = await PaymentClaim.create({
      userId: user._id,
      userEmail: user.email,
      userName: user.name || "",
      paymentId: cleanPaymentId,
      plan: plan || "Pro",
      amount: amount || "₹149",
      status: "pending",
    });

    // Send email notification to Admin asynchronously
    sendAdminNotificationMail({
      userEmail: user.email,
      userName: user.name,
      paymentId: cleanPaymentId,
      plan: plan || "Pro",
      amount: amount || "₹149",
    });

    res.status(201).json({
      message: "Payment claim submitted successfully! It will be reviewed shortly.",
      claim: newClaim,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error while submitting payment claim." });
  }
});

const ADMIN_EMAILS = ["parshotamworks@gmail.com"];

// 2. Get current user's payment claims (User)
router.get("/my-status", requireAuth, async (req, res) => {
  try {
    const claims = await PaymentClaim.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const user = await User.findById(req.user.id).select("email plan isPremium role");

    const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase()) || user?.role === "admin";

    res.json({
      claims,
      isPremium: user?.isPremium || false,
      plan: user?.plan || "Free",
      email: user?.email,
      isAdmin,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching claims." });
  }
});

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (!ADMIN_EMAILS.includes(user.email.toLowerCase()) && user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    req.adminUser = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Admin authorization failed." });
  }
};

// 3. Get all payment claims (Admin only)
router.get("/admin/all", requireAuth, requireAdmin, async (req, res) => {
  try {
    const claims = await PaymentClaim.find().sort({ createdAt: -1 });
    res.json({ claims });
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching all claims." });
  }
});

// 4. Approve or Reject a claim (Admin only)
router.post("/admin/action", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { claimId, action, notes } = req.body;

    if (!claimId || !["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Valid claimId and action ('approve' or 'reject') are required." });
    }

    const claim = await PaymentClaim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ message: "Payment claim not found." });
    }

    const isApprove = action === "approve";
    const updateData = isApprove
      ? { isPremium: true, plan: claim.plan || "Pro" }
      : { isPremium: false, plan: "Free" };

    claim.status = isApprove ? "approved" : "rejected";
    claim.reviewedAt = new Date();
    if (notes) claim.notes = notes;

    // Fast parallel write to both PaymentClaim and User records
    await Promise.all([
      claim.save(),
      claim.userId ? User.findByIdAndUpdate(claim.userId, { $set: updateData }, { new: true }) : Promise.resolve(),
      claim.userEmail ? User.updateMany({ email: claim.userEmail.toLowerCase().trim() }, { $set: updateData }) : Promise.resolve()
    ]);

    return res.json({
      message: isApprove
        ? `Payment ${claim.paymentId} approved! User ${claim.userEmail} upgraded to ${claim.plan}.`
        : `Payment ${claim.paymentId} marked as rejected and user plan reverted to Free.`,
      claim,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error while updating claim." });
  }
});

export default router;
