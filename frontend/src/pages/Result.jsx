import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  RotateCcw,
  CheckCircle,
  XCircle,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import { rewriteResume } from "../services/api";
 
export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;
 
  const matchScore = result?.score ?? 0;
  const matchedSkills = result?.matchedSkills ?? [];
  const missingSkills = result?.missingSkills ?? [];
  const suggestions = result?.suggestions ?? [];
  const resumeText = result?.resumeText ?? "";
  const jobDescription = result?.jobDescription ?? "";
 
  const reportRef = useRef(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenResume, setRewrittenResume] = useState(null);
 
  // ── PDF: Analysis Report ─────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;
 
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Resume Analysis Report", 20, yPos);
      yPos += 20;
 
      pdf.setFontSize(16);
      pdf.text(`Match Score: ${matchScore}%`, 20, yPos);
      yPos += 15;
 
      if (matchedSkills.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Matched Skills:", 20, yPos);
        yPos += 10;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        matchedSkills.forEach((skill) => {
          pdf.text(`• ${skill}`, 25, yPos);
          yPos += 8;
        });
        yPos += 10;
      }


 
      if (missingSkills.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Missing Skills:", 20, yPos);
        yPos += 10;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        missingSkills.forEach((skill) => {
          pdf.text(`• ${skill}`, 25, yPos);
          yPos += 8;
        });
        yPos += 10;
      }
 
      if (yPos > 250) { pdf.addPage(); yPos = 20; }
 
      if (suggestions && suggestions.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Improvement Suggestions:", 20, yPos);
        yPos += 10;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        suggestions.forEach((suggestion) => {
          if (yPos > 270) { pdf.addPage(); yPos = 20; }
          const suggestionText =
            typeof suggestion === "string"
              ? suggestion
              : suggestion.text || suggestion.message || String(suggestion);
          const lines = pdf.splitTextToSize(`• ${suggestionText}`, pageWidth - 40);
          lines.forEach((line) => {
            if (yPos > 280) { pdf.addPage(); yPos = 20; }
            pdf.text(line, 25, yPos);
            yPos += 6;
          });
          yPos += 4;
        });
      }
 
      pdf.save("resume-analysis-report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };
 
  // ── Rewrite Resume via AI ────────────────────────────────────────────────
  const handleRewriteResume = async () => {
  console.log("resumeText:", resumeText);
console.log("jobDescription:", jobDescription);

    if (!resumeText || !jobDescription) {

      alert("Resume text or job description not available.");
      return;
    }
    try {
      setIsRewriting(true);
      const data = await rewriteResume(resumeText, jobDescription);
      if (data.rewrittenResume) {
        setRewrittenResume(data.rewrittenResume);
      } else {
        alert("Failed to rewrite resume.");
      }
    } catch (error) {
      console.error("Error rewriting resume:", error);
      alert("Failed to rewrite resume. Please try again.");
    } finally {
      setIsRewriting(false);
    }
  };
 
  // ── PDF: Download ATS-Formatted Rewritten Resume ─────────────────────────
  const handleDownloadResume = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth  = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20;
      const leftMargin   = 20;
      const rightMargin  = 20;
      const contentWidth = pageWidth - leftMargin - rightMargin;
 
      // ── 1. GUARD ──────────────────────────────────────────────────────────
      const rawText = typeof rewrittenResume === "string" ? rewrittenResume : "";
 
      if (!rawText.trim()) {
        alert("No rewritten resume to download. Please click 'Rewrite Resume' first.");
        return;
      }
 
      // ── 2. PARSE INTO SECTIONS ────────────────────────────────────────────
      const KNOWN_HEADERS = [
        "summary", "professional summary",
        "skills", "technical skills",
        "experience", "work experience",
        "education",
        "projects",
        "certifications", "certifications & achievements", "achievements",
      ];
 
      const headerRegex = new RegExp(
        `^(${KNOWN_HEADERS.join("|")})[:\\s]*$`,
        "i"
      );
 
      const sections = { header: [] };
      let currentSection = "header";
 
      rawText.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (headerRegex.test(trimmed)) {
          currentSection = trimmed
            .toLowerCase()
            .replace(/[:\s]+$/, "")
            .replace(/^(professional|technical)\s+/, "")
            .replace(" & achievements", "");
          if (!sections[currentSection]) sections[currentSection] = [];
        } else {
          (sections[currentSection] = sections[currentSection] || []).push(trimmed);
        }
      });
 
      const headerLines  = sections["header"] || [];
      const candidateName = headerLines[0] || "Resume";
      const contactLine   = headerLines.slice(1).join("  |  ");
 
      // ── 3. HELPERS ────────────────────────────────────────────────────────
      const checkNewPage = (neededSpace) => {
        if (yPos + neededSpace > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
      };
 
      const sectionHeader = (title) => {
        checkNewPage(18);
        yPos += 4;
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 30, 30);
        pdf.text(title.toUpperCase(), leftMargin, yPos);
        yPos += 3;
        pdf.setDrawColor(30, 30, 30);
        pdf.setLineWidth(0.4);
        pdf.line(leftMargin, yPos, pageWidth - rightMargin, yPos);
        yPos += 6;
        pdf.setTextColor(0, 0, 0);
      };
 
      const bodyText = (text, indent = 0, bold = false) => {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setTextColor(40, 40, 40);
        const wrapped = pdf.splitTextToSize(text, contentWidth - indent);
        wrapped.forEach((line) => {
          checkNewPage(6);
          pdf.text(line, leftMargin + indent, yPos);
          yPos += 5;
        });
      };
 
      const bulletLine = (text, indent = 4) => {
        checkNewPage(6);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(40, 40, 40);
        pdf.text("-", leftMargin + indent, yPos);
        const wrapped = pdf.splitTextToSize(text, contentWidth - indent - 5);
        pdf.text(wrapped, leftMargin + indent + 5, yPos);
        yPos += wrapped.length * 5 + 1;
      };
 
      // ── 4. RENDER HEADER ──────────────────────────────────────────────────
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(20, 20, 20);
      pdf.text(candidateName, leftMargin, yPos);
      yPos += 8;
 
      if (contactLine) {
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(80, 80, 80);
        const wrappedContact = pdf.splitTextToSize(contactLine, contentWidth);
        wrappedContact.forEach((l) => { pdf.text(l, leftMargin, yPos); yPos += 5; });
      }
 
      yPos += 2;
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.3);
      pdf.line(leftMargin, yPos, pageWidth - rightMargin, yPos);
      yPos += 6;
 
      // ── 5. RENDER SECTIONS ────────────────────────────────────────────────
      const renderOrder = [
        { key: "summary",        label: "Professional Summary"          },
        { key: "skills",         label: "Skills"                        },
        { key: "experience",     label: "Experience"                    },
        { key: "projects",       label: "Projects"                      },
        { key: "education",      label: "Education"                     },
        { key: "certifications", label: "Certifications & Achievements" },
      ];
 
      const rendered = new Set();
 
      renderOrder.forEach(({ key, label }) => {
        if (rendered.has(label)) return;
        const lines = key === "certifications"
          ? [...(sections["certifications"] || []), ...(sections["achievements"] || [])]
          : (sections[key] || []);
        if (lines.length === 0) return;
        rendered.add(label);
 
        sectionHeader(label);
        lines.forEach((line) => {
          const isBullet = /^[-•*]/.test(line);
          isBullet ? bulletLine(line.replace(/^[-•*]\s*/, "")) : bodyText(line);
        });
        yPos += 3;
      });
 
      // ── 6. FOOTER ─────────────────────────────────────────────────────────
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(160, 160, 160);
        pdf.text(
          `${candidateName} — Page ${i} of ${totalPages}`,
          leftMargin,
          pageHeight - 10
        );
      }
 
      // ── 7. SAVE ───────────────────────────────────────────────────────────
      const safeName = candidateName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      pdf.save(`${safeName || "resume"}_ats.pdf`);
 
    } catch (error) {
      console.error("Error generating resume PDF:", error);
      alert("Failed to generate PDF: " + error.message);
    }
  };
 
  // ── Circular Score Widget ────────────────────────────────────────────────
  const CircularProgress = ({ percentage }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    let ringColor = "text-red-500";
    if (percentage >= 70) ringColor = "text-green-500";
    else if (percentage >= 50) ringColor = "text-yellow-500";
 
    return (
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className={`${ringColor} transition-all duration-1000 ease-out`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
    );
  };
 
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-lg text-red-600 font-semibold">No analysis result found.</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" onClick={() => navigate("/analyze")}>
            Go Back
          </button>
        </div>
      </div>
    );
  }
 
  const bulbThemes = [
    { bg: "bg-blue-100",   color: "text-blue-500"   },
    { bg: "bg-green-100",  color: "text-green-500"  },
    { bg: "bg-purple-100", color: "text-purple-500" },
    { bg: "bg-orange-100", color: "text-orange-500" },
    { bg: "bg-red-100",    color: "text-red-500"    },
  ];
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button onClick={() => navigate("/analyze")} className="flex items-center text-sm text-gray-700 hover:text-blue-600 font-medium">
                <ArrowLeft className="h-4 w-4 mr-2" />Back
              </button>
              <span className="text-xl font-bold text-gray-900 ml-6">Analysis Result</span>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <button onClick={handleDownloadPDF} className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                <Download className="h-4 w-4 mr-2" />Download Report
              </button>
 
              {/* Only show if rewritten resume exists */}
              {rewrittenResume && (
                <button onClick={handleDownloadResume} className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                  <Download className="h-4 w-4 mr-2" />Download ATS Resume
                </button>
              )}
 
              <button onClick={handleRewriteResume} disabled={isRewriting}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:bg-green-400">
                {isRewriting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                {isRewriting ? "Rewriting..." : "Rewrite Resume"}
              </button>
 
              <button onClick={() => navigate("/analyze")} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                <RotateCcw className="h-4 w-4 mr-2" />Try Another
              </button>
            </div>
          </div>
        </div>
      </div>
 
      <main ref={reportRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Resume Match Score</h1>
          <div className="flex justify-center mb-6">
            <CircularProgress percentage={matchScore} />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your resume matches {matchScore}% of the job requirements.
            {matchScore >= 70 ? " Great job! You're a strong candidate for this position."
              : matchScore >= 50 ? " You're on the right track, but there's room for improvement."
              : " Consider enhancing your resume with the missing skills and keywords below."}
          </p>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Matched Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">{skill}</span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">These skills from your resume match the job requirements.</p>
          </div>
 
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <XCircle className="h-6 w-6 text-red-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Missing Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">{skill}</span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">Consider adding these skills to improve your match score.</p>
          </div>
        </div>
 
        <div className="bg-gradient-to-br from-white to-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <Lightbulb className="h-7 w-7 text-yellow-500 mr-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Improvement Suggestions</h2>
          </div>
          <div className="space-y-4">
            {suggestions.map((s, i) => {
              const theme = bulbThemes[i % bulbThemes.length];
              return (
                <div key={i} className="flex items-center bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg duration-300">
                  <div className={`flex items-center justify-center h-10 w-10 ${theme.bg} ${theme.color} mr-4 rounded-md`}>
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{s}</p>
                </div>
              );
            })}
          </div>
        </div>
 
        {/* Rewritten Resume Section */}
        {rewrittenResume && (
          <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-xl p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <RotateCcw className="h-7 w-7 text-green-600 mr-4" />
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Rewritten Resume</h2>
              </div>
              <button onClick={handleDownloadResume} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />Download ATS PDF
              </button>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm leading-relaxed">
                {rewrittenResume}
              </pre>
            </div>
          </div>
        )}
 
        <div className="sm:hidden flex flex-col space-y-3 mt-8">
          <button onClick={handleDownloadPDF} className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700">
            <Download className="h-4 w-4 mr-2" />Download Report
          </button>
          <button onClick={() => navigate("/analyze")} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            <RotateCcw className="h-4 w-4 mr-2" />Try Another
          </button>
        </div>
      </main>
    </div>
  );
}