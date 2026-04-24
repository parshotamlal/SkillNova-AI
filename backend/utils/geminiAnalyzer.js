





import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = "gemini-1.5-flash";

/*
========================================================
 MAIN PUBLIC FUNCTION (RETRY SAFE)
========================================================
*/

async function analyzeResumeWithRetry(resume, jobDescription, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await analyzeResume(resume, jobDescription);
    } catch (err) {
      console.log(`Attempt ${i + 1} failed →`, err.message);

      if (i === retries) {
        return fallbackResult("AI processing failed after retries");
      }

      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

/*
========================================================
 MAIN ANALYSIS FLOW
========================================================
*/

async function analyzeResume(resume, jobDescription) {
  console.log("🚀 Starting Resume Analysis...");

  if (!resume || !jobDescription) {
    return fallbackResult("Missing resume or job description");
  }

  try {
    const aiResult = await runGeminiAnalysis(resume, jobDescription);
    const validated = validateAIResult(aiResult);
    return computeScore(validated);
  } catch (err) {
    console.log("⚠️ Gemini failed → Using keyword fallback:", err.message);
    return performKeywordFallback(resume, jobDescription);
  }
}

/*
========================================================
 GEMINI STRICT JSON ANALYSIS
========================================================
*/

async function runGeminiAnalysis(resume, jobDescription) {
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `
You are an ATS resume screening engine.

Compare ONLY the SKILLS in the JOB DESCRIPTION against the RESUME.
Do NOT assume missing skills.
Do NOT reward irrelevant skills.
Do NOT give 100 unless ALL required skills exist.

Steps:
1. Extract required skills ONLY from job description
2. Check if each exists in resume (case-insensitive, exact skill)
3. Build matchedSkills and missingSkills
4. Suggest improvements

⚠ RULES:
- No hallucination
- No commentary
- Return ONLY valid JSON

FORMAT:
{
  "matchedSkills": [],
  "missingSkills": [],
  "suggestions": []
}

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}
`;

  const result = await model.generateContent(prompt);
  let raw = result.response.text().trim();

  console.log("🤖 RAW AI OUTPUT →", raw);

  // Handle ```json blocks safely
  if (raw.startsWith("```")) {
    raw = raw.replace(/```json|```/g, "").trim();
  }

  return JSON.parse(raw);
}

/*
========================================================
 VALIDATION & SAFETY
========================================================
*/

function validateAIResult(ai) {
  return {
    matchedSkills: Array.isArray(ai.matchedSkills) ? ai.matchedSkills : [],
    missingSkills: Array.isArray(ai.missingSkills) ? ai.missingSkills : [],
    suggestions: Array.isArray(ai.suggestions) ? ai.suggestions : []
  };
}

/*
========================================================
 BACKEND SCORE (SOURCE OF TRUTH)
========================================================
*/

function computeScore(result) {
  const total = result.matchedSkills.length + result.missingSkills.length;

  const score = total
    ? Math.round((result.matchedSkills.length / total) * 100)
    : 0;

  return {
    score: Math.max(0, Math.min(100, score)),
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills,
    suggestions: result.suggestions
  };
}

/*
========================================================
 KEYWORD FALLBACK (SUGGESTIONS VARIED ✅)
========================================================
*/

function performKeywordFallback(resume, jobDescription) {
  const resumeText = resume.toLowerCase();
  const jobText = jobDescription.toLowerCase();

  const skills = [
    "python","sql","javascript","typescript",
    "node.js","express","react","next.js",
    "angular","vue","java","c++","aws",
    "azure","docker","kubernetes","graphql",
    "mongodb","mysql","postgresql","html",
    "css","tailwind","machine learning",
    "data analysis","excel"
  ];

  const matched = [];
  const missing = [];

  for (const skill of skills) {
    const escaped = skill.replace(/[.+]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");

    if (regex.test(jobText)) {
      regex.test(resumeText)
        ? matched.push(skill)
        : missing.push(skill);
    }
  }

  const total = matched.length + missing.length;
  const score = total ? Math.round((matched.length / total) * 100) : 0;

  // ✅ VARIED SUGGESTIONS (ONLY CHANGE)
  const suggestionTemplates = [
    s => `Add hands-on experience with ${s} to strengthen your profile.`,
    s => `Highlight real-world projects or work involving ${s}.`,
    s => `Consider gaining professional exposure to ${s}.`,
    s => `Including ${s} in your skill set could improve ATS compatibility.`,
    s => `Showcase practical usage of ${s} in your resume.`
  ];

  const suggestions = missing.map(
    (skill, index) => suggestionTemplates[index % suggestionTemplates.length](skill)
  );

  return {
    score,
    matchedSkills: matched,
    missingSkills: missing,
    suggestions
  };
}

/*
========================================================
 FAIL-SAFE
========================================================
*/

function fallbackResult(message) {
  return {
    score: 0,
    matchedSkills: [],
    missingSkills: [],
    suggestions: [message]
  };
}

/*
========================================================
 EXPORTS
========================================================
*/

export {
  analyzeResume,
  analyzeResumeWithRetry
};
