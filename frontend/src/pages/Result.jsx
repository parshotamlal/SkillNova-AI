import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  RotateCcw,
  CheckCircle,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { useRef } from "react";
import jsPDF from "jspdf";


export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;

  const matchScore = result?.score ?? 0;
  const matchedSkills = result?.matchedSkills ?? [];
  const missingSkills = result?.missingSkills ?? [];
  const suggestions = result?.suggestions ?? [];

  const reportRef = useRef(null);

  //  PDF download function for resume analysis report
  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      // Title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Resume Analysis Report", 20, yPos);
      yPos += 20;

      // Score Section
      pdf.setFontSize(16);
      pdf.text(`Match Score: ${matchScore}%`, 20, yPos);
      yPos += 15;

      // Matched Skills
      if (matchedSkills.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Matched Skills:", 20, yPos);
        yPos += 10;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        matchedSkills.forEach((skill, index) => {
          pdf.text(`• ${skill}`, 25, yPos);
          yPos += 8;
        });
        yPos += 10;
      }

      // Missing Skills
      if (missingSkills.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Missing Skills:", 20, yPos);
        yPos += 10;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        missingSkills.forEach((skill, index) => {
          pdf.text(`• ${skill}`, 25, yPos);
          yPos += 8;
        });
        yPos += 10;
      }

      // Check if we need a new page
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }

      // Suggestions
      if (suggestions && suggestions.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Improvement Suggestions:", 20, yPos);
        yPos += 10;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);

        suggestions.forEach((suggestion, index) => {
          // Check if we need a new page for each suggestion
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }

          // Handle different data types for suggestions
          const suggestionText =
            typeof suggestion === "string"
              ? suggestion
              : suggestion.text || suggestion.message || String(suggestion);

          const lines = pdf.splitTextToSize(
            `• ${suggestionText}`,
            pageWidth - 40
          );
          lines.forEach((line, lineIndex) => {
            if (yPos > 280) {
              pdf.addPage();
              yPos = 20;
            }
            pdf.text(line, 25, yPos);
            yPos += 6;
          });
          yPos += 4;
        });
      } else {
        // Debug: Add this to see if suggestions array is empty
        pdf.setFontSize(12);
        pdf.text("No suggestions available.", 20, yPos);
        yPos += 10;
      }

      // Download
      pdf.save("resume-analysis-report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

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
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${ringColor} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {percentage}%
          </span>
        </div>
      </div>
    );
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-lg text-red-600 font-semibold">
            No analysis result found.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => navigate("/analyze")}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const bulbThemes = [
    { bg: "bg-blue-100", color: "text-blue-500" },
    { bg: "bg-green-100", color: "text-green-500" },
    { bg: "bg-purple-100", color: "text-purple-500" },
    { bg: "bg-orange-100", color: "text-orange-500" },
    { bg: "bg-red-100", color: "text-red-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/analyze")}
                className="flex items-center text-sm text-gray-700 hover:text-blue-600 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <span className="text-xl font-bold text-gray-900 ml-6">
                Analysis Result
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </button>
              <button
                onClick={() => navigate("/analyze")}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Another
              </button>
            </div>
          </div>
        </div>
      </div>

      <main
        ref={reportRef}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Your Resume Match Score
          </h1>
          <div className="flex justify-center mb-6">
            <CircularProgress percentage={matchScore} />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your resume matches {matchScore}% of the job requirements.
            {matchScore >= 70
              ? " Great job! You're a strong candidate for this position."
              : matchScore >= 50
              ? " You're on the right track, but there's room for improvement."
              : " Consider enhancing your resume with the missing skills and keywords below."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Matched Skills
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              These skills from your resume match the job requirements.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <XCircle className="h-6 w-6 text-red-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Missing Skills
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                >
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Consider adding these skills to improve your match score.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <Lightbulb className="h-7 w-7 text-yellow-500 mr-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              Improvement Suggestions
            </h2>
          </div>

          <div className="space-y-4">
            {suggestions.map((s, i) => {
              const theme = bulbThemes[i % bulbThemes.length];
              return (
                <div
                  key={i}
                  className="flex items-center bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg duration-300"
                >
                  <div
                    className={`flex items-center justify-center h-10 w-10 ${theme.bg} ${theme.color} mr-4 rounded-md`}
                  >
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{s}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sm:hidden flex flex-col space-y-3 mt-8">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </button>
          <button
            onClick={() => navigate("/analyze")}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Another
          </button>
        </div>
      </main>
    </div>
  );
}
