import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileText, Loader2 } from "lucide-react";
import axios from "axios";

export default function Upload() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setResumeFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      alert("Please upload a resume and paste the job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jd", jobDescription);

    try {
      setIsAnalyzing(true);
      const res = await axios.post(
        // "https://ai-resumeanalyzer.onrender.com/api/analyze/file",
        "https://ai-resumeanalyzer-bgl4.onrender.com/api/analyze/file",
        formData
      );
      const result = res.data;
      navigate("/result", { state: { result } });
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = resumeFile && jobDescription.trim().length > 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Your Documents
          </h1>
          <p className="text-gray-600">
            Upload your resume and job description to get started with the
            analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resume Upload
            </h2>
            <div
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
                    <p className="font-medium text-gray-900">
                      {resumeFile.name}
                    </p>
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
                    <p className="text-lg font-medium text-gray-900">
                      Drop your resume here
                    </p>
                    <p className="text-gray-500">or click to browse</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Supports PDF and DOCX files
                    </p>
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

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Job Description
            </h2>
            <textarea
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows={10}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>{jobDescription.length} characters</span>
              <span
                className={`${
                  jobDescription.length >= 50
                    ? "text-green-600"
                    : "text-orange-500"
                }`}
              >
                {jobDescription.length >= 50
                  ? "✓ Ready"
                  : "Minimum 50 characters required"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
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
