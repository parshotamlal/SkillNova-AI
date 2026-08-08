// API Service for Recruitment Matching and Email Notifications

const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "";
  if (!url) return "";
  url = url.trim().replace(/\/+$/, "");
  if (url.endsWith("/api")) {
    url = url.slice(0, -4);
  }
  return url;
};

const BASE_URL = getApiBaseUrl();

/**
 * Compare applicant resume against active jobs using AI/matching engine
 * @param {string} resumeText
 * @param {Array} activeJobs
 */
export const matchResumeWithJobs = async (resumeText, activeJobs) => {
  try {
    const res = await fetch(`${BASE_URL}/api/recruitment/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, activeJobs }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Match Resume API Error:", error);
    return {
      success: false,
      message: "Failed to connect to recruitment matching service.",
      matches: []
    };
  }
};

/**
 * Send shortlisted email to applicant
 * @param {Object} payload { applicantName, applicantEmail, companyName, jobTitle, matchScore }
 */
export const sendNextRoundEmail = async (payload) => {
  try {
    const res = await fetch(`${BASE_URL}/api/recruitment/send-next-round-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Send Next Round Email API Error:", error);
    return {
      success: false,
      message: "Match found, but email could not be sent. Server unreachable."
    };
  }
};
