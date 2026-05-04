





import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
// const MODEL = "gemini-1.5-flash";
const MODEL = "gemini-2.0-flash";

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
 ATS RESUME GENERATOR
========================================================
*/
 
/**
 * Generates a new ATS-optimized resume based on the original resume
 * and a target job description.
 *
 * @param {string} resume          - The candidate's existing resume (plain text)
 * @param {string} jobDescription  - The target job description (plain text)
 * @param {number} retries         - Number of retry attempts on failure (default: 2)
 * @returns {Promise<{resume: string, changes: string[], warning: string|null}>}
 *   - resume:  The newly generated ATS-friendly resume as plain text
 *   - changes: A list of key improvements made over the original
 *   - warning: null on success, or an error message if generation failed
 */
async function generateATSResume(resume, jobDescription, retries = 2) {
  console.log("📝 Starting ATS Resume Generation...");
 
  if (!resume || !jobDescription) {
    return {
      resume: "",
      changes: [],
      warning: "Missing resume or job description"
    };
  }
 
  for (let i = 0; i <= retries; i++) {
    try {
      return await runGeminiResumeGeneration(resume, jobDescription);
    } catch (err) {
      console.log(`Generation attempt ${i + 1} failed →`, err.message);
 
      if (i === retries) {
        return {
          resume: "",
          changes: [],
          warning: "ATS resume generation failed after retries. Please try again."
        };
      }
 
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}
 
/**
 * Calls Gemini to rewrite the resume in an ATS-optimized format,
 * injecting relevant keywords from the job description without fabricating
 * any experience or credentials.
 */
async function runGeminiResumeGeneration(resume, jobDescription) {
  const model = genAI.getGenerativeModel({ model: MODEL });
 
  const prompt = `
You are a professional ATS resume writer and career coach.
 
Your task is to rewrite the candidate's EXISTING RESUME to be highly ATS-friendly
and tailored for the TARGET JOB DESCRIPTION, while following strict rules.
 
⚠ STRICT RULES:
- Do NOT fabricate, invent, or add any experience, skills, certifications, or education that is NOT in the original resume.
- Only rephrase, restructure, and keyword-optimize what already exists.
- Use exact keywords and phrases from the job description wherever they truthfully apply.
- Use standard ATS-safe section headers: Summary, Skills, Experience, Education, Certifications, Projects.
- Use plain text only — NO tables, NO columns, NO icons, NO graphics.
- Use bullet points (starting with "-") for experience and project entries.
- Start each bullet with a strong action verb.
- Quantify achievements if the original resume already includes numbers.
- Write a 2–4 sentence professional summary at the top tailored to the job.
- List skills as a comma-separated inline list under a "Skills" section.
- Keep formatting consistent and clean for ATS parsing.
 
OUTPUT FORMAT (return ONLY valid JSON, no markdown, no commentary):
{
  "resume": "<full plain-text ATS resume here, with \\n for line breaks>",
  "changes": [
    "Short description of each key improvement made"
  ]
}
 
ORIGINAL RESUME:
${resume}
 
TARGET JOB DESCRIPTION:
${jobDescription}
`;
 
  const result = await model.generateContent(prompt);
  let raw = result.response.text().trim();
 
  console.log("🤖 RAW GENERATION OUTPUT →", raw.substring(0, 300) + "...");
 
  // Strip markdown code fences if present
  if (raw.startsWith("```")) {
    raw = raw.replace(/```json|```/g, "").trim();
  }
 
  const parsed = JSON.parse(raw);
 
  return {
    resume: typeof parsed.resume === "string" ? parsed.resume : "",
    changes: Array.isArray(parsed.changes) ? parsed.changes : [],
    warning: null
  };
}


/*
========================================================
 COVER LETTER GENERATOR
========================================================
*/

/**
 * Generates a professional, ATS-friendly cover letter
 * tailored to the job description from the candidate's resume.
 *
 * @param {string} resume         - Candidate's resume (plain text)
 * @param {string} jobDescription - Target job description (plain text)
 * @param {number} retries        - Retry attempts on failure (default: 2)
 * @returns {Promise<{coverLetter: string, warning: string|null}>}
 */
async function generateCoverLetter(resume, jobDescription, retries = 2) {
  console.log("✉️ Starting Cover Letter Generation...");

  if (!resume || !jobDescription) {
    return { coverLetter: "", warning: "Missing resume or job description" };
  }

  for (let i = 0; i <= retries; i++) {
    try {
      return await runGeminiCoverLetterGeneration(resume, jobDescription);
    } catch (err) {
      console.log(`Cover letter attempt ${i + 1} failed →`, err.message);
      if (i === retries) {
        return {
          coverLetter: "",
          warning: "Cover letter generation failed after retries. Please try again."
        };
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function runGeminiCoverLetterGeneration(resume, jobDescription) {
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `
You are an expert career coach and professional cover letter writer.

Your task is to write a compelling, ATS-optimized cover letter for the candidate
based ONLY on their EXISTING RESUME and the TARGET JOB DESCRIPTION.

⚠ STRICT RULES:
- Do NOT fabricate any experience, skills, certifications, or education not in the resume.
- Use exact keywords and phrases from the job description wherever they truthfully apply.
- Write in a confident, professional, and personable first-person tone.
- Structure: Opening hook → Why this role → Key achievements/skills match → Closing CTA.
- Length: 3–4 paragraphs, no longer than 400 words.
- Do NOT include placeholder text like "[Company Name]" — infer company context from the job description if possible, otherwise write generically.
- Plain text only, no bullet points, no markdown.

OUTPUT FORMAT (return ONLY valid JSON, no markdown fences, no commentary):
{
  "coverLetter": "<full plain-text cover letter here, with \\n for paragraph breaks>"
}

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}
`;

  const result = await model.generateContent(prompt);
  let raw = result.response.text().trim();

  console.log("🤖 RAW COVER LETTER OUTPUT →", raw.substring(0, 300) + "...");

  if (raw.startsWith("```")) {
    raw = raw.replace(/```json|```/g, "").trim();
  }

  const parsed = JSON.parse(raw);

  return {
    coverLetter: typeof parsed.coverLetter === "string" ? parsed.coverLetter : "",
    warning: null
  };
}
 
/*
========================================================
 EXPORTS
========================================================
*/

export {
  analyzeResume,
  analyzeResumeWithRetry,
  generateATSResume,
  generateCoverLetter
};
