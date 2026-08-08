import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer from "nodemailer";

dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || "dummy_key");
const MODEL = "gemini-2.0-flash";

/**
 * Extract email from text using regex fallback
 */
function extractEmailRegex(text) {
  if (!text) return "";
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "";
}

/**
 * Extract phone number using regex fallback
 */
function extractPhoneRegex(text) {
  if (!text) return "";
  const match = text.match(/(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0] : "";
}

/**
 * Extract candidate details using Gemini AI (with regex fallbacks)
 */
async function extractCandidateInfo(resumeText) {
  const fallbackEmail = extractEmailRegex(resumeText);
  const fallbackPhone = extractPhoneRegex(resumeText);

  if (!process.env.AI_API_KEY) {
    return {
      applicantName: resumeText.split("\n")[0]?.trim() || "Applicant",
      applicantEmail: fallbackEmail,
      applicantPhone: fallbackPhone,
      skills: [],
      experience: "",
      education: ""
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const prompt = `
You are a resume parsing engine.
Extract the candidate's details from the resume below.

Return ONLY valid JSON matching this structure:
{
  "applicantName": "Full Name",
  "applicantEmail": "Email Address",
  "applicantPhone": "Phone Number",
  "skills": ["Skill 1", "Skill 2"],
  "experience": "Summary of experience",
  "education": "Degrees / Institutions"
}

RESUME TEXT:
${resumeText.slice(0, 4000)}
`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/```json|```/g, "").trim();
    }
    const parsed = JSON.parse(raw);

    return {
      applicantName: parsed.applicantName || "Applicant",
      applicantEmail: parsed.applicantEmail || fallbackEmail,
      applicantPhone: parsed.applicantPhone || fallbackPhone,
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: parsed.experience || "",
      education: parsed.education || ""
    };
  } catch (err) {
    console.error("AI Candidate Extraction Error:", err.message);
    return {
      applicantName: resumeText.split("\n")[0]?.trim() || "Applicant",
      applicantEmail: fallbackEmail,
      applicantPhone: fallbackPhone,
      skills: [],
      experience: "",
      education: ""
    };
  }
}

/**
 * Compare resume text against job description using Gemini AI or keyword fallback
 */
async function computeJobMatch(resumeText, job) {
  const threshold = Number(job.matchThreshold) || 90;
  const jd = job.jobDescription || "";

  if (process.env.AI_API_KEY && jd.trim().length > 10) {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL });
      const prompt = `
You are an expert recruiter & ATS job matching system.

Compare the RESUME against the JOB DESCRIPTION for the role "${job.jobTitle}" at "${job.companyName}".

Evaluate compatibility based on:
1. Required technical & soft skills
2. Experience relevance
3. Role alignment & education

Return ONLY valid JSON:
{
  "matchScore": <number 0-100>,
  "matchedSkills": ["Skill A", "Skill B"],
  "missingSkills": ["Skill C", "Skill D"],
  "summary": "Brief 1-2 sentence match summary"
}

RESUME:
${resumeText.slice(0, 4000)}

JOB DESCRIPTION:
${jd.slice(0, 4000)}
`;

      const result = await model.generateContent(prompt);
      let raw = result.response.text().trim();
      if (raw.startsWith("```")) {
        raw = raw.replace(/```json|```/g, "").trim();
      }
      const parsed = JSON.parse(raw);
      const score = Math.max(0, Math.min(100, Math.round(Number(parsed.matchScore) || 0)));

      return {
        jobId: job.id,
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        recruiterName: job.recruiterName,
        recruiterEmail: job.recruiterEmail,
        matchThreshold: threshold,
        matchScore: score,
        isEligible: score >= threshold,
        matchStatus: score >= threshold ? "NEXT ROUND ELIGIBLE" : "Not Eligible",
        matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
        summary: parsed.summary || ""
      };
    } catch (err) {
      console.error("AI Job Match Error:", err.message);
    }
  }

  // Keyword-based fallback matching
  const lowerResume = resumeText.toLowerCase();
  const lowerJd = jd.toLowerCase();
  const words = lowerJd.split(/\W+/).filter(w => w.length > 3);
  const uniqueWords = [...new Set(words)];

  const matched = uniqueWords.filter(w => lowerResume.includes(w));
  const missing = uniqueWords.filter(w => !lowerResume.includes(w));
  const score = uniqueWords.length
    ? Math.round((matched.length / uniqueWords.length) * 100)
    : 0;

  return {
    jobId: job.id,
    jobTitle: job.jobTitle,
    companyName: job.companyName,
    recruiterName: job.recruiterName,
    recruiterEmail: job.recruiterEmail,
    matchThreshold: threshold,
    matchScore: score,
    isEligible: score >= threshold,
    matchStatus: score >= threshold ? "NEXT ROUND ELIGIBLE" : "Not Eligible",
    matchedSkills: matched.slice(0, 10),
    missingSkills: missing.slice(0, 10),
    summary: score >= threshold ? "High skill compatibility matched." : "Partial skills match."
  };
}

/**
 * POST /api/recruitment/match
 * Runs resume extraction & job matching against active job profiles
 */
router.post("/match", async (req, res) => {
  try {
    const { resumeText, activeJobs } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    if (!Array.isArray(activeJobs) || activeJobs.length === 0) {
      return res.json({
        success: true,
        candidateInfo: await extractCandidateInfo(resumeText),
        matches: []
      });
    }

    // 1. Extract Candidate Info
    const candidateInfo = await extractCandidateInfo(resumeText);

    // 2. Run match against each active job
    const matchPromises = activeJobs.map(job => computeJobMatch(resumeText, job));
    const matches = await Promise.all(matchPromises);

    res.json({
      success: true,
      candidateInfo,
      matches
    });
  } catch (err) {
    console.error("Recruitment Match Error:", err);
    res.status(500).json({ error: "Failed to process recruitment match: " + err.message });
  }
});

/**
 * POST /api/recruitment/send-next-round-email
 * Sends email notification to candidate if score >= threshold
 */
router.post("/send-next-round-email", async (req, res) => {
  try {
    const { applicantName, applicantEmail, companyName, jobTitle, matchScore } = req.body;

    // Validation
    if (!applicantEmail || !applicantEmail.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing applicant email address."
      });
    }

    const name = applicantName || "Applicant";
    const company = companyName || "the hiring company";
    const title = jobTitle || "the position";
    const score = matchScore || 90;

    const emailSubject = "Congratulations! You Have Been Shortlisted for the Next Round";

    const emailText = `Dear ${name},

Congratulations!

Your profile has been shortlisted for the next round of the recruitment process for the ${title} position at ${company}.

Based on the job requirements and the information available in your resume, your profile achieved a ${score}% match score.

Our recruitment team will provide further details regarding the next round.

Best regards,
Recruitment Team`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">Congratulations!</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your profile has been <strong>shortlisted for the next round</strong> of the recruitment process for the <strong>${title}</strong> position at <strong>${company}</strong>.</p>
        <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 15px; color: #0369a1;">
            <strong>Match Score:</strong> <span style="font-size: 18px; font-weight: bold; color: #0284c7;">${score}%</span>
          </p>
        </div>
        <p>Our recruitment team will provide further details regarding the next round shortly.</p>
        <br/>
        <p style="margin-bottom: 0;">Best regards,</p>
        <p style="margin-top: 4px; font-weight: bold; color: #475569;">Recruitment Team</p>
      </div>
    `;

    // Configure Mail Transporter
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Development mode: Create Ethereal test account or simulated transport
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      } catch (e) {
        console.log("Simulating email send (No SMTP credentials configured):");
        console.log(`To: ${applicantEmail}\nSubject: ${emailSubject}\nBody:\n${emailText}`);
        return res.json({
          success: true,
          simulated: true,
          message: "Shortlisted notification email dispatched successfully (development mode)."
        });
      }
    }

    const info = await transporter.sendMail({
      from: `"Recruitment Team" <${process.env.SMTP_USER || "no-reply@resumeaionline.in"}>`,
      to: applicantEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    console.log("✅ Email sent successfully:", info.messageId);

    res.json({
      success: true,
      messageId: info.messageId,
      message: "Shortlisted notification email sent successfully!"
    });
  } catch (err) {
    console.error("❌ Send Email Error:", err.message || err);
    res.status(500).json({
      success: false,
      message: "Match found, but email could not be sent. " + (err.message || "")
    });
  }
});

export default router;
