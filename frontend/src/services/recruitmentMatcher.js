import { getActiveJobs, isNotificationAlreadySent, recordNotification } from "./recruitmentService";
import { matchResumeWithJobs, sendNextRoundEmail } from "./recruitmentApi";

/**
 * Process uploaded resume text against all active recruitment job profiles.
 * Calculates match scores, checks thresholds, sends next-round emails,
 * and logs notifications in LocalStorage.
 * 
 * @param {string} resumeText - Extracted text of candidate resume
 */
export async function processRecruitmentMatching(resumeText) {
  if (!resumeText) {
    return { candidateInfo: null, matches: [], notificationsSent: [] };
  }

  const activeJobs = getActiveJobs();
  if (!activeJobs || activeJobs.length === 0) {
    return { candidateInfo: null, matches: [], notificationsSent: [] };
  }

  try {
    const matchResponse = await matchResumeWithJobs(resumeText, activeJobs);
    if (!matchResponse || !matchResponse.success) {
      return { candidateInfo: null, matches: [], notificationsSent: [] };
    }

    const { candidateInfo, matches } = matchResponse;
    const applicantEmail = candidateInfo?.applicantEmail || "";
    const applicantName = candidateInfo?.applicantName || "Applicant";

    const notificationsSent = [];

    for (const match of (matches || [])) {
      const threshold = match.matchThreshold || 90;
      const isEligible = match.matchScore >= threshold;

      if (isEligible && applicantEmail && applicantEmail.includes("@")) {
        const resumeId = `${resumeText.length}_${resumeText.slice(0, 30).replace(/\s+/g, '')}`;
        const alreadySent = isNotificationAlreadySent(match.jobId, applicantEmail, resumeId);

        if (!alreadySent) {
          // Trigger backend email API
          const emailResponse = await sendNextRoundEmail({
            applicantName,
            applicantEmail,
            companyName: match.companyName,
            jobTitle: match.jobTitle,
            matchScore: match.matchScore
          });

          const emailSent = emailResponse && emailResponse.success;
          const emailError = emailSent ? null : (emailResponse?.message || "Match found, but email could not be sent.");

          // Record notification log
          const record = recordNotification({
            jobId: match.jobId,
            applicantName,
            applicantEmail,
            companyName: match.companyName,
            jobTitle: match.jobTitle,
            matchScore: match.matchScore,
            matchStatus: "NEXT ROUND ELIGIBLE",
            emailSent,
            emailError,
            resumeIdentifier: resumeId
          });

          notificationsSent.push({
            jobId: match.jobId,
            applicantEmail,
            emailSent,
            emailError,
            record
          });
        }
      }
    }

    return {
      candidateInfo,
      matches,
      notificationsSent
    };
  } catch (err) {
    console.error("Recruitment matching processing error:", err);
    return { candidateInfo: null, matches: [], notificationsSent: [] };
  }
}
