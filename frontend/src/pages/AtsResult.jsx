import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  Lightbulb,
  ShieldCheck,
  ShieldX,
  Shield,
  FileText,
  AlertTriangle,
  Award,
  List
} from "lucide-react";
import { useRef } from "react";
import RecruitmentMatchResultsCard from "../components/RecruitmentMatchResultsCard";

export default function AtsResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;

  const reportRef = useRef(null);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-lg text-red-600 font-semibold">No analysis result found.</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" onClick={() => navigate("/check-ats-score")}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const {
    score = 0,
    breakdown = {},
    detailedChecklist = {},
    analysis = {},
    suggestions = []
  } = result;

  // ── Circular Score Widget ────────────────────────────────────────────────
  const CircularProgress = ({ percentage }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    let ringColor = "text-red-500";
    if (percentage >= 80) ringColor = "text-green-500";
    else if (percentage >= 50) ringColor = "text-yellow-500";

    return (
      <div className="relative w-40 h-40">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="60" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200" />
          <circle cx="70" cy="70" r="60" stroke="currentColor" strokeWidth="12" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className={`${ringColor} transition-all duration-1000 ease-out`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">{percentage}%</span>
          <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">ATS Score</span>
        </div>
      </div>
    );
  };

  const getVerdict = (s) => {
    if (s >= 80) return { text: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (s >= 60) return { text: "Good", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { text: "Needs Work", color: "text-red-600", bg: "bg-red-100" };
  };

  const verdict = getVerdict(score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* ── Navbar ── */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button onClick={() => navigate("/check-ats-score")} className="flex items-center text-sm text-gray-700 hover:text-blue-600 font-medium">
                <ArrowLeft className="h-4 w-4 mr-2" />Back
              </button>
              <span className="text-xl font-bold text-gray-900 ml-6">ATS Analysis Result</span>
            </div>

            <div className="flex items-center space-x-3">
              <button onClick={() => window.print()} className="hidden sm:flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                <FileText className="h-4 w-4 mr-2" />Print Report
              </button>
              <button onClick={() => navigate("/check-ats-score")} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                <RotateCcw className="h-4 w-4 mr-2" />Analyze Another
              </button>
            </div>
          </div>
        </div>
      </div>

      <main ref={reportRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:py-0">
        
        {/* Top Score Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 print:shadow-none print:border-none">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Resume ATS Score</h1>
            <p className="text-gray-500 mb-6 max-w-lg">
              This score indicates how well an Applicant Tracking System (ATS) can read and understand your resume, completely independent of any specific job description.
            </p>
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${verdict.bg} ${verdict.color}`}>
              <Shield className="w-5 h-5 mr-2" />
              <span className="font-semibold text-lg">{verdict.text} Compatibility</span>
            </div>
          </div>
          <div className="flex-shrink-0 flex justify-center">
            <CircularProgress percentage={score} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Breakdown Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-50 h-full print:shadow-none">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Award className="w-6 h-6 mr-2 text-blue-500" /> Score Breakdown
              </h2>
              <div className="space-y-5">
                {[
                  { label: "Content Quality", value: breakdown.contentQuality },
                  { label: "Formatting", value: breakdown.formatting },
                  { label: "Skills Presentation", value: breakdown.skillsPresentation },
                  { label: "Professionalism", value: breakdown.professionalism }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{stat.label}</span>
                      <span className="font-bold text-gray-900">{stat.value}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stat.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Checklist */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-50 h-full print:shadow-none">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <List className="w-6 h-6 mr-2 text-teal-500" /> Detailed Checklist
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(detailedChecklist).map(([key, status], idx) => {
                  const isPass = status?.toLowerCase().includes("pass");
                  const isPartial = status?.toLowerCase().includes("partial");
                  const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  
                  return (
                    <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${
                      isPass ? "bg-green-50 border-green-100" : isPartial ? "bg-yellow-50 border-yellow-100" : "bg-red-50 border-red-100"
                    }`}>
                      {isPass ? <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" /> : 
                       isPartial ? <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" /> : 
                       <ShieldX className="w-5 h-5 text-red-600 mt-0.5" />}
                      <div>
                        <p className={`font-semibold ${isPass ? "text-green-900" : isPartial ? "text-yellow-900" : "text-red-900"}`}>{title}</p>
                        <p className={`text-sm mt-1 ${isPass ? "text-green-700" : isPartial ? "text-yellow-700" : "text-red-700"}`}>{status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Deep Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-50 print:shadow-none">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Highlighted Elements
            </h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Detected Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.highlightedSkills?.length > 0 ? analysis.highlightedSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">{skill}</span>
                )) : <span className="text-sm text-gray-400 italic">No specific skills highlighted.</span>}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Impactful Phrases Found</h3>
              <ul className="space-y-2">
                {analysis.impactfulPhrases?.length > 0 ? analysis.impactfulPhrases.map((phrase, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start">
                    <span className="text-green-500 mr-2 font-bold">•</span> {phrase}
                  </li>
                )) : <li className="text-sm text-gray-400 italic">No highly impactful phrases detected.</li>}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-50 print:shadow-none">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <XCircle className="w-5 h-5 mr-2 text-red-500" /> Areas of Concern
            </h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Missing Sections</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSections?.length > 0 ? analysis.missingSections.map((section, i) => (
                  <span key={i} className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm font-medium">{section}</span>
                )) : <span className="text-sm text-gray-400 italic">No major sections missing.</span>}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Formatting Issues</h3>
              <ul className="space-y-2">
                {analysis.formattingIssues?.length > 0 ? analysis.formattingIssues.map((issue, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start">
                    <span className="text-red-500 mr-2 font-bold">•</span> {issue}
                  </li>
                )) : <li className="text-sm text-gray-400 italic">No formatting issues detected.</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl shadow-lg p-8 mb-8 border border-indigo-100 print:shadow-none print:border-none">
          <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center">
            <Lightbulb className="w-7 h-7 mr-3 text-yellow-500" /> Expert Suggestions for Improvement
          </h2>
          <div className="space-y-4">
            {suggestions?.map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm flex items-start gap-4">
                <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">{s}</p>
              </div>
            ))}
            {(!suggestions || suggestions.length === 0) && (
              <p className="text-gray-500 italic">No specific suggestions at this time.</p>
            )}
          </div>
        </div>

        {/* Recruitment Match Results */}
        {result?.recruitmentMatch && (
          <RecruitmentMatchResultsCard recruitmentMatch={result.recruitmentMatch} />
        )}

      </main>
    </div>
  );
}