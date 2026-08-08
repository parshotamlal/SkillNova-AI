import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileText, Loader2 } from "lucide-react";
import axios from "axios";
import { gsap } from "gsap";
import SEO from "../components/SEO";
import { processRecruitmentMatching } from "../services/recruitmentMatcher";
 
export default function Upload() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const getApiBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL;
    if (!url) return "";
    url = url.trim().replace(/\/+$/, "");
    if (url.endsWith("/api")) url = url.slice(0, -4);
    return url;
  };
  const VITE_API_URL = getApiBaseUrl();
 
 
  // ── Refs ───────────────────────────────────────────────────────────
  const pageRef        = useRef(null);
  const orb1Ref        = useRef(null);
  const orb2Ref        = useRef(null);
  const headingRef     = useRef(null);
  const subRef         = useRef(null);
  const resumeCardRef  = useRef(null);
  const jdCardRef      = useRef(null);
  const bottomBarRef   = useRef(null);
  const analyzeBtn     = useRef(null);
  const dropZoneRef    = useRef(null);
 
  // ── GSAP entrance ──────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([orb1Ref.current, orb2Ref.current], { scale: 0.5, opacity: 0 });
      gsap.set(headingRef.current,    { opacity: 0, y: 30 });
      gsap.set(subRef.current,        { opacity: 0, y: 20 });
      gsap.set(resumeCardRef.current, { opacity: 0, x: -50, rotateY: -8, transformPerspective: 900 });
      gsap.set(jdCardRef.current,     { opacity: 0, x:  50, rotateY:  8, transformPerspective: 900 });
      gsap.set(bottomBarRef.current,  { opacity: 0, y: 30 });
 
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
 
      tl
        .to([orb1Ref.current, orb2Ref.current], { scale: 1, opacity: 1, duration: 1.6, stagger: 0.3, ease: "power2.out" }, 0)
        .to(headingRef.current,    { opacity: 1, y: 0, duration: 0.7 }, 0.3)
        .to(subRef.current,        { opacity: 1, y: 0, duration: 0.6 }, 0.5)
        .to(resumeCardRef.current, { opacity: 1, x: 0, rotateY: 0, duration: 0.85, ease: "back.out(1.2)" }, 0.65)
        .to(jdCardRef.current,     { opacity: 1, x: 0, rotateY: 0, duration: 0.85, ease: "back.out(1.2)" }, 0.8)
        .to(bottomBarRef.current,  { opacity: 1, y: 0, duration: 0.6 }, 1.1);
 
      // Orb drift
      gsap.to(orb1Ref.current, { x: 35, y: 25, duration: 9,  repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(orb2Ref.current, { x: -28, y: -20, duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut" });
 
      // Card subtle float
      gsap.to(resumeCardRef.current, { y: -5, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.2 });
      gsap.to(jdCardRef.current,     { y: -7, duration: 3.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.6 });
 
      // Mouse parallax
      const onMove = (e) => {
        const px = e.clientX / window.innerWidth;
        const py = e.clientY / window.innerHeight;
        gsap.to(orb1Ref.current, { x: px * 50 - 25, y: py * 35 - 17, duration: 1.8, ease: "power1.out", overwrite: "auto" });
        gsap.to(orb2Ref.current, { x: -px * 35 + 17, y: -py * 28 + 14, duration: 2.2, ease: "power1.out", overwrite: "auto" });
      };
      pageRef.current?.addEventListener("mousemove", onMove);
  
      // Card 3D tilt — resume card
      const addTilt = (el) => {
        const onCardMove = (e) => {
          const rect = el.getBoundingClientRect();
          const rx = gsap.utils.mapRange(0, rect.height,  5, -5, e.clientY - rect.top);
          const ry = gsap.utils.mapRange(0, rect.width,  -5,  5, e.clientX - rect.left);
          gsap.to(el, { rotateX: rx, rotateY: ry, duration: 0.4, ease: "power2.out", transformPerspective: 900, overwrite: "auto" });
        };
        const onCardLeave = () =>
          gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
        el.addEventListener("mousemove", onCardMove);
        el.addEventListener("mouseleave", onCardLeave);
        return () => { el.removeEventListener("mousemove", onCardMove); el.removeEventListener("mouseleave", onCardLeave); };
      };
 
      const cleanR = addTilt(resumeCardRef.current);
      const cleanJ = addTilt(jdCardRef.current);
 
      return () => {
        pageRef.current?.removeEventListener("mousemove", onMove);
        cleanR(); cleanJ();
      };
    }, pageRef);
 
    return () => ctx.revert();
  }, []);
 
  // ── Animate dropzone when file added/removed ───────────────────────
  useEffect(() => {
    if (!dropZoneRef.current) return;
    gsap.fromTo(
      dropZoneRef.current,
      { scale: 0.97 },
      { scale: 1, duration: 0.4, ease: "back.out(1.6)" }
    );
  }, [resumeFile]);
 
  // ── Analyze button pulse when ready ───────────────────────────────
  const canAnalyze = resumeFile && jobDescription.trim().length > 50;
 
  useEffect(() => {
    if (!analyzeBtn.current) return;
    if (canAnalyze) {
      gsap.to(analyzeBtn.current, { scale: 1.04, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" });
    }
  }, [canAnalyze]);
 
  // ── Drag handlers (original) ───────────────────────────────────────
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
 
  // ── Analyze handler (original) ────────────────────────────────────
  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      alert("Please upload a resume and paste the job description.");
      return;
    }
 
    // Button press animation
    gsap.to(analyzeBtn.current, { scale: 0.96, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" });
 
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jd", jobDescription);
 
    try {
      setIsAnalyzing(true);
      const res = await axios.post(`${VITE_API_URL}/api/analyze/file`, formData);
      const result = res.data;
 
      // Run Recruitment Job Matching
      if (result && result.resumeText) {
        try {
          const recruitmentMatch = await processRecruitmentMatching(result.resumeText);
          result.recruitmentMatch = recruitmentMatch;
        } catch (matchErr) {
          console.error("Recruitment match error:", matchErr);
        }
      }
 
      // Outro before navigate
      gsap.to([resumeCardRef.current, jdCardRef.current], {
        opacity: 0, y: -20, stagger: 0.1, duration: 0.35, ease: "power2.in",
        onComplete: () => navigate("/result", { state: { result } }),
      });
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };
 
  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden"
    >
      <SEO 
        title="Analyze Resume | ResumeAi Online"
        description="Upload your resume and job description to get a detailed AI analysis, ATS compatibility score, and actionable feedback."
      />
      {/* Background orbs */}
      <div
        ref={orb1Ref}
        className="pointer-events-none absolute -top-32 -left-40 w-[500px] h-[500px] rounded-full bg-blue-200/40"
        style={{ filter: "blur(90px)" }}
      />
      <div
        ref={orb2Ref}
        className="pointer-events-none absolute -bottom-24 -right-32 w-[420px] h-[420px] rounded-full bg-teal-200/40"
        style={{ filter: "blur(80px)" }}
      />
 
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
 
        {/* Header */}
        <div className="text-center mb-8">
          <h1 ref={headingRef} className="text-3xl font-bold text-gray-900 mb-2">
            Upload Your Documents
          </h1>
          <p ref={subRef} className="text-gray-600">
            Upload your resume and job description to get started with the analysis.
          </p>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
 
          {/* Resume upload card */}
          <div
            ref={resumeCardRef}
            className="bg-white rounded-2xl shadow-lg p-6"
            style={{ transformStyle: "preserve-3d" }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume Upload</h2>
            <div
              ref={dropZoneRef}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : resumeFile
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
              {resumeFile ? (
                <div className="space-y-4">
                  <div className="bg-green-100 rounded-full p-3 w-fit mx-auto">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{resumeFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setResumeFile(null)}
                    className="mt-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-full p-3 w-fit mx-auto">
                    <UploadIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Drop your resume here</p>
                    <p className="text-gray-500">or click to browse</p>
                    <p className="text-sm text-gray-400 mt-2">Supports PDF and DOCX files</p>
                  </div>
                  <label htmlFor="resume-upload">
                    <div className="inline-block px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      Browse Files
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>
 
          {/* Job description card */}
          <div
            ref={jdCardRef}
            className="bg-white rounded-2xl shadow-lg p-6"
            style={{ transformStyle: "preserve-3d" }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <textarea
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows={10}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>{jobDescription.length} characters</span>
              <span className={`${jobDescription.length >= 50 ? "text-green-600" : "text-orange-500"}`}>
                {jobDescription.length >= 50 ? "✓ Ready" : "Minimum 50 characters required"}
              </span>
            </div>
          </div>
        </div>
 
        {/* Analyze button */}
        <div ref={bottomBarRef} className="text-center">
          <button
            ref={analyzeBtn}
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className={`px-12 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 ${
              canAnalyze && !isAnalyzing
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FileText className="mr-2 h-5 w-5" />
                Analyze Now
              </span>
            )}
          </button>
          {!canAnalyze && (
            <p className="text-sm text-gray-500 mt-3">
              Please upload a resume and provide a job description to continue
            </p>
          )}
        </div>
 
      </main>
    </div>
  );
}