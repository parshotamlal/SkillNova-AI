// LocalStorage service for Recruitment Jobs & Notification History

const JOBS_KEY = "resumeAI_recruitment_jobs";
const NOTIFICATIONS_KEY = "resumeAI_recruitment_notifications";

/**
 * Get all saved job profiles from LocalStorage
 */
export const getSavedJobs = () => {
  try {
    const data = localStorage.getItem(JOBS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading saved jobs from LocalStorage:", err);
    return [];
  }
};

/**
 * Get all active saved job profiles
 */
export const getActiveJobs = () => {
  const jobs = getSavedJobs();
  return jobs.filter(j => j.status === "active" || j.status === true || j.active === true);
};

/**
 * Save or update a job profile
 * @param {Object} job
 */
export const saveJob = (job) => {
  try {
    const jobs = getSavedJobs();
    const existingIndex = jobs.findIndex(j => j.id === job.id);

    const now = new Date().toISOString();
    const newJob = {
      id: job.id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      recruiterName: job.recruiterName || "",
      recruiterEmail: job.recruiterEmail || "",
      companyName: job.companyName || "",
      jobTitle: job.jobTitle || "",
      jobDescription: job.jobDescription || "",
      matchThreshold: Number(job.matchThreshold) || 90,
      status: job.status !== undefined ? job.status : "active",
      createdAt: job.createdAt || now,
      updatedAt: now
    };

    if (existingIndex >= 0) {
      jobs[existingIndex] = newJob;
    } else {
      jobs.unshift(newJob);
    }

    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    return newJob;
  } catch (err) {
    console.error("Error saving job to LocalStorage:", err);
    throw new Error("Failed to save job profile.");
  }
};

/**
 * Delete a job profile by ID
 * @param {string} jobId
 */
export const deleteJob = (jobId) => {
  try {
    const jobs = getSavedJobs();
    const filtered = jobs.filter(j => j.id !== jobId);
    localStorage.setItem(JOBS_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error("Error deleting job from LocalStorage:", err);
    return false;
  }
};

/**
 * Toggle active/inactive status of a job
 * @param {string} jobId
 */
export const toggleJobStatus = (jobId) => {
  try {
    const jobs = getSavedJobs();
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      job.status = job.status === "active" ? "inactive" : "active";
      job.updatedAt = new Date().toISOString();
      localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
      return job.status;
    }
    return null;
  } catch (err) {
    console.error("Error toggling job status:", err);
    return null;
  }
};

/**
 * Get all notification history logs
 */
export const getNotifications = () => {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading notifications from LocalStorage:", err);
    return [];
  }
};

/**
 * Generate a unique notification key to prevent duplicate emails
 */
export const createNotificationKey = (jobId, applicantEmail, resumeIdentifier = "") => {
  const cleanEmail = (applicantEmail || "").trim().toLowerCase();
  return `${jobId}_${cleanEmail}_${resumeIdentifier}`;
};

/**
 * Check if notification has already been sent to this applicant for this job
 */
export const isNotificationAlreadySent = (jobId, applicantEmail, resumeIdentifier = "") => {
  const notifications = getNotifications();
  const targetKey = createNotificationKey(jobId, applicantEmail, resumeIdentifier);
  
  return notifications.some(n => {
    if (n.key && n.key === targetKey) return true;
    // Fallback comparison
    return (
      n.jobId === jobId &&
      n.applicantEmail?.toLowerCase() === applicantEmail?.toLowerCase() &&
      n.emailSent === true
    );
  });
};

/**
 * Record a notification entry in LocalStorage
 */
export const recordNotification = (notificationData) => {
  try {
    const notifications = getNotifications();
    const key = createNotificationKey(
      notificationData.jobId,
      notificationData.applicantEmail,
      notificationData.resumeIdentifier || ""
    );

    const record = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      key,
      jobId: notificationData.jobId,
      applicantName: notificationData.applicantName || "Applicant",
      applicantEmail: notificationData.applicantEmail || "",
      company: notificationData.companyName || notificationData.company || "",
      jobTitle: notificationData.jobTitle || "",
      matchScore: notificationData.matchScore || 0,
      matchStatus: notificationData.matchStatus || "NEXT ROUND ELIGIBLE",
      emailSent: notificationData.emailSent ?? true,
      emailError: notificationData.emailError || null,
      sentAt: new Date().toISOString(),
      resumeIdentifier: notificationData.resumeIdentifier || ""
    };

    notifications.unshift(record);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    return record;
  } catch (err) {
    console.error("Error recording notification to LocalStorage:", err);
    return null;
  }
};
