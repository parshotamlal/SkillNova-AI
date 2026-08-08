import React, { useState, useEffect, useRef } from "react";
import { 
  Briefcase, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  UserCheck, 
  Building2, 
  SlidersHorizontal,
  Clock,
  Sparkles,
  Search,
  Check,
  AlertCircle,
  Upload as UploadIcon,
  FileText,
  Loader2,
  Send,
  RefreshCw,
  FileCheck
} from "lucide-react";
import { gsap } from "gsap";
import axios from "axios";
import SEO from "../components/SEO";
import { 
  getSavedJobs, 
  saveJob, 
  deleteJob, 
  toggleJobStatus, 
  getNotifications 
} from "../services/recruitmentService";
import { processRecruitmentMatching } from "../services/recruitmentMatcher";
import RecruitmentMatchResultsCard from "../components/RecruitmentMatchResultsCard";

export default function Recruitment() {
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Resume Upload & Matching state
  const [resumeFile, setResumeFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [uploadMode, setUploadMode] = useState("file"); // "file" or "text"
  const [isMatching, setIsMatching] = useState(false);
  const [matchingError, setMatchingError] = useState("");
  const [liveMatchResult, setLiveMatchResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const getApiBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL;
    if (!url) return "";
    url = url.trim().replace(/\/+$/, "");
    if (url.endsWith("/api")) url = url.slice(0, -4);
    return url;
  };
  const VITE_API_URL = getApiBaseUrl();

  // Form state for Job Profile
  const [formData, setFormData] = useState({
    recruiterName: "",
    recruiterEmail: "",
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    matchThreshold: 90,
    status: "active"
  });

  const [formError, setFormError] = useState("");

  // GSAP Refs
  const pageRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const uploadCardRef = useRef(null);
  const jobsGridRef = useRef(null);
  const historyRef = useRef(null);

  // Load jobs and notification history
  const loadData = () => {
    setJobs(getSavedJobs());
    setNotifications(getNotifications());
  };

  useEffect(() => {
    loadData();
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([orb1Ref.current, orb2Ref.current], { scale: 0.6, opacity: 0 });
      gsap.set(headerRef.current, { opacity: 0, y: 30 });
      gsap.set(statsRef.current, { opacity: 0, y: 20 });
      gsap.set(uploadCardRef.current, { opacity: 0, y: 20 });
      gsap.set(jobsGridRef.current, { opacity: 0, y: 25 });
      gsap.set(historyRef.current, { opacity: 0, y: 25 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to([orb1Ref.current, orb2Ref.current], { scale: 1, opacity: 1, duration: 1.4, stagger: 0.2 }, 0)
        .to(headerRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.2)
        .to(statsRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.4)
        .to(uploadCardRef.current, { opacity: 1, y: 0, duration: 0.55 }, 0.5)
        .to(jobsGridRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.65)
        .to(historyRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.8);

      gsap.to(orb1Ref.current, { x: 30, y: 20, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(orb2Ref.current, { x: -25, y: -15, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingJob(null);
    setFormData({
      recruiterName: "",
      recruiterEmail: "",
      companyName: "",
      jobTitle: "",
      jobDescription: "",
      matchThreshold: 90,
      status: "active"
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      recruiterName: job.recruiterName || "",
      recruiterEmail: job.recruiterEmail || "",
      companyName: job.companyName || "",
      jobTitle: job.jobTitle || "",
      jobDescription: job.jobDescription || "",
      matchThreshold: job.matchThreshold !== undefined ? job.matchThreshold : 90,
      status: job.status || "active"
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Submit Job Form
  const handleSubmitJob = (e) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.jobTitle.trim() || !formData.jobDescription.trim()) {
      setFormError("Please fill out Company Name, Job Title, and Job Description.");
      return;
    }

    try {
      saveJob({
        id: editingJob ? editingJob.id : undefined,
        ...formData
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || "Failed to save job profile.");
    }
  };

  // Delete Job Profile
  const handleDeleteJob = (jobId, title) => {
    if (window.confirm(`Are you sure you want to delete the job profile "${title}"?`)) {
      deleteJob(jobId);
      loadData();
    }
  };

  // Toggle Status
  const handleToggleStatus = (jobId) => {
    toggleJobStatus(jobId);
    loadData();
  };

  // Drag & Drop handlers for Resume Upload
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setResumeFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setResumeFile(e.target.files[0]);
  };

  // ── Run Match & Send Email Handler ─────────────────────────────────
  const handleMatchAndSend = async () => {
    const activeJobs = jobs.filter(j => j.status === "active" || j.status === true);
    
    if (activeJobs.length === 0) {
      setMatchingError("Please add at least one ACTIVE saved job profile before running match.");
      return;
    }

    if (uploadMode === "file" && !resumeFile) {
      setMatchingError("Please upload a resume file (PDF or DOCX).");
      return;
    }

    if (uploadMode === "text" && !pastedText.trim()) {
      setMatchingError("Please paste candidate resume text.");
      return;
    }

    try {
      setIsMatching(true);
      setMatchingError("");
      setLiveMatchResult(null);

      let extractedText = pastedText.trim();

      if (uploadMode === "file" && resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        
        // Use backend to extract plain text from uploaded PDF/DOCX
        const res = await axios.post(`${VITE_API_URL}/api/analyze/ats-score/file`, formData);
        if (res.data && res.data.resumeText) {
          extractedText = res.data.resumeText;
        } else {
          throw new Error("Failed to extract text from resume file.");
        }
      }

      if (!extractedText || extractedText.length < 10) {
        throw new Error("Resume content is empty or unreadable.");
      }

      // Process recruitment matching & send shortlisted email
      const matchResult = await processRecruitmentMatching(extractedText);
      
      setLiveMatchResult(matchResult);
      loadData(); // Refresh match history & stats

    } catch (err) {
      console.error("Match error:", err);
      setMatchingError(err.message || "Failed to process resume matching.");
    } finally {
      setIsMatching(false);
    }
  };

  // Filtering saved jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.recruiterName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "active") return matchesSearch && (job.status === "active" || job.status === true);
    if (statusFilter === "inactive") return matchesSearch && (job.status === "inactive" || job.status === false);
    return matchesSearch;
  });

  const activeJobsCount = jobs.filter(j => j.status === "active" || j.status === true).length;
  const emailsSentCount = notifications.filter(n => n.emailSent).length;

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden py-10">
      <SEO 
        title="Recruitment & Job Matching | SkillNova AI" 
        description="Manage job descriptions, match applicant resumes against candidate profiles, and automate next round email notifications."
      />

      {/* Background Orbs */}
      <div ref={orb1Ref} className="pointer-events-none absolute -top-32 -left-40 w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-[90px]" />
      <div ref={orb2Ref} className="pointer-events-none absolute -bottom-24 -right-32 w-[420px] h-[420px] rounded-full bg-teal-200/40 blur-[80px]" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/60 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" /> AI-Powered Candidate Matching
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Recruitment & Job Matching
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Save job descriptions, match applicant resumes automatically, and notify shortlisted candidates.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Add New Job
          </button>
        </div>

        {/* Stat Cards */}
        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/70 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Saved Jobs</p>
              <h3 className="text-2xl font-bold text-slate-900">{jobs.length}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/70 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Jobs</p>
              <h3 className="text-2xl font-bold text-slate-900">{activeJobsCount}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/70 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Matches</p>
              <h3 className="text-2xl font-bold text-slate-900">{notifications.length}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/70 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Emails Sent</p>
              <h3 className="text-2xl font-bold text-slate-900">{emailsSentCount}</h3>
            </div>
          </div>
        </div>

        {/* ── RESUME UPLOAD & IMMEDIATE MATCHING SECTION ─────────────────── */}
        <div ref={uploadCardRef} className="mb-10 p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
                <UploadIcon className="w-3.5 h-3.5 text-indigo-600" /> Candidate Resume Evaluator
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Upload Resume for Match & Email Notification
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Upload candidate resume to match against all active saved job descriptions and notify shortlisted applicants.
              </p>
            </div>

            {/* Upload Mode Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setUploadMode("file")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  uploadMode === "file" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upload File (PDF/DOCX)
              </button>
              <button
                onClick={() => setUploadMode("text")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  uploadMode === "text" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {matchingError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {matchingError}
            </div>
          )}

          {uploadMode === "file" ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive 
                  ? "border-blue-500 bg-blue-50/60 scale-[0.99]" 
                  : resumeFile 
                  ? "border-emerald-400 bg-emerald-50/30" 
                  : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
              }`}
            >
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              {resumeFile ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                    <FileCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{resumeFile.name}</p>
                    <p className="text-xs text-slate-500">{(resumeFile.size / 1024).toFixed(1)} KB • PDF / DOCX</p>
                  </div>
                  <p className="text-xs text-blue-600 font-medium">Click or drag another file to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                    <UploadIcon className="w-8 h-8" />
                  </div>
                  <p className="font-semibold text-slate-700 text-sm">
                    Drag and drop candidate resume file here, or <span className="text-blue-600 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-400">Supports PDF or DOCX files up to 10MB</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <textarea
                rows={5}
                placeholder="Paste complete candidate resume text here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono bg-slate-50/50"
              />
            </div>
          )}

          {/* Action Trigger */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Active Job Profiles to match: <span className="font-bold text-slate-800">{activeJobsCount}</span>
            </p>

            <button
              onClick={handleMatchAndSend}
              disabled={isMatching || activeJobsCount === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMatching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Evaluating & Sending Email...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Run Match & Send Email
                </>
              )}
            </button>
          </div>

          {/* Live Match Result Component */}
          {liveMatchResult && (
            <div className="mt-6">
              <RecruitmentMatchResultsCard recruitmentMatch={liveMatchResult} />
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, company, HR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                statusFilter === "all" ? "bg-blue-600 text-white" : "bg-white/80 text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                statusFilter === "active" ? "bg-blue-600 text-white" : "bg-white/80 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                statusFilter === "inactive" ? "bg-blue-600 text-white" : "bg-white/80 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Saved Jobs Section */}
        <div ref={jobsGridRef} className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" /> Saved Recruitment Profiles
          </h2>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-white/60 border border-dashed border-slate-300">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700">No Job Descriptions Found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
                {jobs.length === 0 
                  ? "Create your first recruitment job profile to automatically match applicant resumes and notify shortlisted candidates."
                  : "No saved jobs match your current search query or filter."}
              </p>
              {jobs.length === 0 && (
                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" /> Add Job Profile
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => {
                const isActive = job.status === "active" || job.status === true;
                return (
                  <div
                    key={job.id}
                    className="rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                            {job.companyName}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 mt-1 line-clamp-1">
                            {job.jobTitle}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleToggleStatus(job.id)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                            isActive 
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {isActive ? "● Active" : "○ Inactive"}
                        </button>
                      </div>

                      {/* Recruiter Details */}
                      {(job.recruiterName || job.recruiterEmail) && (
                        <div className="text-xs text-slate-500 mb-3 space-y-0.5">
                          {job.recruiterName && <p>HR: <span className="font-medium text-slate-700">{job.recruiterName}</span></p>}
                          {job.recruiterEmail && <p>Email: <span className="font-medium text-slate-700">{job.recruiterEmail}</span></p>}
                        </div>
                      )}

                      {/* Job Description Preview */}
                      <p className="text-xs text-slate-600 line-clamp-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">
                        {job.jobDescription}
                      </p>
                    </div>

                    <div>
                      {/* Threshold info */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs mb-4">
                        <span className="text-slate-500">Match Threshold:</span>
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {job.matchThreshold}% Match
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(job)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Job"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id, job.jobTitle)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Match History Section */}
        <div ref={historyRef}>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" /> Match History & Notifications
          </h2>

          {notifications.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-white/60 border border-slate-200 text-slate-500 text-sm">
              No matching records yet. Upload a candidate resume above to evaluate against active job profiles.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Applicant</th>
                    <th className="py-3.5 px-4">Company & Position</th>
                    <th className="py-3.5 px-4 text-center">Score</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Email Status</th>
                    <th className="py-3.5 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notifications.map((notif) => {
                    const isEligible = notif.matchScore >= 90 || notif.matchStatus === "NEXT ROUND ELIGIBLE";
                    return (
                      <tr key={notif.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{notif.applicantName}</p>
                          <p className="text-xs text-slate-500">{notif.applicantEmail}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-800">{notif.jobTitle}</p>
                          <p className="text-xs text-blue-600 font-semibold">{notif.company}</p>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            isEligible ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                          }`}>
                            {notif.matchScore}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isEligible ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                              <Check className="w-3.5 h-3.5" /> Next Round
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                              Not Eligible
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {notif.emailSent ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Email Sent
                            </span>
                          ) : notif.emailError ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600" title={notif.emailError}>
                              <AlertCircle className="w-4 h-4 text-rose-500" /> Failed
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Not Sent</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right text-xs text-slate-500">
                          {notif.sentAt ? new Date(notif.sentAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* Add / Edit Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {editingJob ? "Edit Job Profile" : "Add Job Profile"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmitJob} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC Technologies"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title / Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MERN Stack Developer"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">HR / Recruiter Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={formData.recruiterName}
                    onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">HR / Recruiter Email</label>
                  <input
                    type="email"
                    placeholder="e.g. hr@company.com"
                    value={formData.recruiterEmail}
                    onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste the full job description, required skills, and qualifications..."
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">Match Threshold (%)</label>
                    <span className="font-bold text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded">
                      {formData.matchThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    step={1}
                    value={formData.matchThreshold}
                    onChange={(e) => setFormData({ ...formData, matchThreshold: Number(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
                >
                  {editingJob ? "Update Profile" : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
