import { useEffect, useState } from "react";
import { fetchProfile, logoutUser, deleteUserResume, deleteUserAtsScore } from "../services/api";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  FileText, 
  Award, 
  Calendar, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  FileCheck
} from "lucide-react";
import SEO from "../components/SEO";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedScore, setSelectedScore] = useState(null); // For detailed ATS Modal
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile()
      .then((res) => {
        if (res.user) {
          setUser(res.user);
        } else {
          // Redirect if not logged in
          navigate("/login");
        }
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        navigate("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/");
  };

  const handleDeleteResume = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this saved resume?")) {
      try {
        const res = await deleteUserResume(id);
        if (res.resumes) {
          setUser(prev => ({ ...prev, resumes: res.resumes }));
        }
      } catch (err) {
        alert("Failed to delete resume");
      }
    }
  };

  const handleDeleteAtsScore = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this ATS analysis record?")) {
      try {
        const res = await deleteUserAtsScore(id);
        if (res.atsScores) {
          setUser(prev => ({ ...prev, atsScores: res.atsScores }));
        }
      } catch (err) {
        alert("Failed to delete ATS record");
      }
    }
  };

  const handleLoadResume = (resume) => {
    try {
      localStorage.setItem("resume-data-v3", JSON.stringify(resume.resumeData));
      localStorage.setItem("resume-template", JSON.stringify(resume.templateId));
      navigate("/templates");
    } catch (err) {
      alert("Failed to load resume into builder.");
    }
  };

  // Helper stats
  const getStats = () => {
    if (!user) return { totalResumes: 0, totalAts: 0, bestScore: 0, avgScore: 0 };
    const totalResumes = user.resumes?.length || 0;
    const totalAts = user.atsScores?.length || 0;
    
    let bestScore = 0;
    let avgScore = 0;
    if (totalAts > 0) {
      const scores = user.atsScores.map(s => s.score || 0);
      bestScore = Math.max(...scores);
      avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalAts);
    }
    
    return { totalResumes, totalAts, bestScore, avgScore };
  };

  const { totalResumes, totalAts, bestScore, avgScore } = getStats();

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50";
    if (score >= 50) return "text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50";
    return "text-red-500 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50";
  };

  const getChecklistIcon = (status) => {
    const s = String(status).toLowerCase();
    if (s.includes("pass")) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (s.includes("partial") || s.includes("warn")) return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="User Profile Dashboard | ResumeAi Online"
        description="Manage your account profile, review your resume history, and inspect your past ATS scoring reports in your personalized dashboard."
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-5 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                Profile Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your saved resumes, templates, and track your ATS scores.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-200 hover:border-red-300 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-xl text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR: PROFILE & STATS */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* User Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden relative group">
              <div className="h-24 bg-gradient-to-r from-blue-600 to-teal-500" />
              <div className="px-6 pb-6 relative">
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900 flex items-center justify-center text-blue-600 dark:text-teal-400 shadow-md">
                    <UserIcon className="w-12 h-12" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                    {user?.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 mt-1.5">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Analytics Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6">
              <h4 className="text-lg font-bold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Performance Overview
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Resumes</span>
                  <div className="text-2xl font-extrabold text-slate-950 dark:text-white mt-1">
                    {totalResumes}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">ATS Reports</span>
                  <div className="text-2xl font-extrabold text-slate-950 dark:text-white mt-1">
                    {totalAts}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Best ATS</span>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {bestScore}%
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Avg ATS</span>
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                    {avgScore}%
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANELS: MAIN HISTORY GRID */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* SAVED RESUMES SECTION */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    <FileCheck className="w-5.5 h-5.5 text-blue-600 dark:text-blue-400" />
                    Saved Resumes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Created and downloaded from the templates builder.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/templates")}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Create New
                </button>
              </div>

              {!user?.resumes || user.resumes.length === 0 ? (
                <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No saved resumes found</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">Launch our builder to design and download a professional resume.</p>
                  <button 
                    onClick={() => navigate("/templates")}
                    className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 transition"
                  >
                    Open Resume Builder
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.resumes.map((resume) => (
                    <div 
                      key={resume._id}
                      className="group border border-slate-100 hover:border-slate-200 dark:border-slate-800/80 dark:hover:border-slate-700/80 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/40 p-4 rounded-xl flex flex-col justify-between transition shadow-sm"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {resume.templateId} Template
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate max-w-[200px]" title={resume.name}>
                          {resume.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Role: {resume.resumeData?.personal?.title || "Not specified"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-4 pt-3 gap-2">
                        <button
                          onClick={() => handleLoadResume(resume)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition shadow-sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Load in Builder
                        </button>
                        <button
                          onClick={(e) => handleDeleteResume(resume._id, e)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                          title="Delete Resume"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ATS SCORE HISTORY SECTION */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5.5 h-5.5 text-blue-600 dark:text-blue-400" />
                    ATS Analysis History
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Your previous resume scanning reports and AI metrics.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/check-ats-score")}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  New Scan
                </button>
              </div>

              {!user?.atsScores || user.atsScores.length === 0 ? (
                <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No ATS reports found</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">Scan your resume against job specifications to run detailed audit.</p>
                  <button 
                    onClick={() => navigate("/check-ats-score")}
                    className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 transition"
                  >
                    Go to ATS Checker
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {user.atsScores.map((scoreCard) => (
                    <div 
                      key={scoreCard._id}
                      onClick={() => setSelectedScore(scoreCard)}
                      className="group border border-slate-100 hover:border-slate-200 dark:border-slate-800/60 dark:hover:border-slate-700/80 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/40 p-4 rounded-xl flex items-center justify-between transition shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {/* Score Indicator */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm border ${getScoreColor(scoreCard.score)}`}>
                          {scoreCard.score}%
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate max-w-[240px]" title={scoreCard.fileName}>
                            {scoreCard.fileName}
                          </h4>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(scoreCard.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedScore(scoreCard)}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition"
                        >
                          View Report
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteAtsScore(scoreCard._id, e)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* DETAILED ATS REPORT MODAL */}
      {selectedScore && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-[400px]">
                  ATS Report: {selectedScore.fileName}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Analyzed on {new Date(selectedScore.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedScore(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Score section & Breakdown progress bars */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-5 rounded-xl">
                
                {/* Big Score circle */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Overall Match</span>
                  <div className={`w-28 h-28 rounded-full border-8 flex flex-col items-center justify-center shadow-inner ${
                    selectedScore.score >= 80 ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" :
                    selectedScore.score >= 50 ? "border-amber-500 text-amber-600 dark:text-amber-400" :
                    "border-red-500 text-red-600 dark:text-red-400"
                  }`}>
                    <span className="text-3xl font-black">{selectedScore.score}</span>
                    <span className="text-xs font-bold opacity-60">/ 100</span>
                  </div>
                </div>

                {/* Score Breakdown list */}
                <div className="md:col-span-8 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Metrics breakdown</h4>
                  {selectedScore.result?.breakdown && Object.entries(selectedScore.result.breakdown).map(([key, val]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="capitalize text-slate-700 dark:text-slate-300">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{val}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            val >= 80 ? "bg-emerald-500" :
                            val >= 50 ? "bg-amber-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Checklist */}
              {selectedScore.result?.detailedChecklist && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Evaluation Checklist</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedScore.result.detailedChecklist).map(([key, val]) => (
                      <div 
                        key={key} 
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl"
                      >
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {getChecklistIcon(val)}
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 capitalize">
                            {val}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Lists */}
              {selectedScore.result?.analysis && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Analysis Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Highlighted Skills */}
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Highlighted Skills</span>
                      {selectedScore.result.analysis.highlightedSkills?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {selectedScore.result.analysis.highlightedSkills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">None found</p>
                      )}
                    </div>

                    {/* Missing Sections */}
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Missing Sections</span>
                      {selectedScore.result.analysis.missingSections?.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2">
                          {selectedScore.result.analysis.missingSections.map((sec, idx) => (
                            <li key={idx}>{sec}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">All standard sections present</p>
                      )}
                    </div>

                    {/* Impactful Phrases */}
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Strong Phrases</span>
                      {selectedScore.result.analysis.impactfulPhrases?.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2">
                          {selectedScore.result.analysis.impactfulPhrases.map((phrase, idx) => (
                            <li key={idx} className="italic">"{phrase}"</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">None detected</p>
                      )}
                    </div>

                    {/* Formatting Issues */}
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Formatting Issues</span>
                      {selectedScore.result.analysis.formattingIssues?.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2">
                          {selectedScore.result.analysis.formattingIssues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">No issues found</p>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* Suggestions */}
              {selectedScore.result?.suggestions && selectedScore.result.suggestions.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recommendations</h4>
                  <ul className="space-y-2">
                    {selectedScore.result.suggestions.map((sug, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
              <button
                onClick={() => setSelectedScore(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
