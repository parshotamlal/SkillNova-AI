import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  RotateCcw,
  CheckCircle,
  XCircle,
  Lightbulb,
  Loader2,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  ShieldX,
  Shield,
} from "lucide-react";
import { useRef, useState, useMemo } from "react";
import jsPDF from "jspdf";
import { rewriteResume, generateCoverLetter } from "../services/api";
 
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
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState(null);
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
 
  // ── ATS Compatibility Logic ──────────────────────────────────────────────
  const getATSCompatibility = (resumeText) => {
    const text = resumeText || "";
    const lower = text.toLowerCase();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
 
    const checks = [];
 
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(text);
    checks.push({
      label: "Contact information present",
      pass: hasEmail && hasPhone,
      detail: !hasEmail
        ? "Email address not found"
        : !hasPhone
        ? "Phone number not found"
        : "Email and phone detected",
    });
 
    const standardHeaders = ["experience", "education", "skills", "summary", "projects", "certifications"];
    const foundHeaders = standardHeaders.filter((h) => lower.includes(h));
    checks.push({
      label: "Standard section headers",
      pass: foundHeaders.length >= 3,
      detail:
        foundHeaders.length >= 3
          ? `Found: ${foundHeaders.join(", ")}`
          : `Only found: ${foundHeaders.join(", ") || "none"} — add missing sections`,
    });
 
    const tableLikeLines = lines.filter(
      (l) => (l.match(/\|/g) || []).length >= 2 || (l.match(/\t/g) || []).length >= 3
    );
    checks.push({
      label: "No tables or columns",
      pass: tableLikeLines.length === 0,
      detail:
        tableLikeLines.length === 0
          ? "No table structures detected"
          : `${tableLikeLines.length} possible table/column line(s) — ATS may misread these`,
    });
 
    const specialCharCount = (text.match(/[★✓✔►▸◆■•→←]/g) || []).length;
    checks.push({
      label: "Minimal special characters",
      pass: specialCharCount < 5,
      detail:
        specialCharCount < 5
          ? "Character usage looks clean"
          : `${specialCharCount} special characters found — ATS may skip these`,
    });
 
    const dateMatches =
      text.match(
        /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{2}\/\d{4}|\d{4}\s*[-–]\s*(present|current|\d{4})/gi
      ) || [];
    checks.push({
      label: "Dates present in experience",
      pass: dateMatches.length >= 1,
      detail:
        dateMatches.length >= 1
          ? `${dateMatches.length} date reference(s) found`
          : "No employment dates detected — ATS relies on these for timeline parsing",
    });
 
    const actionVerbs = [
      "developed", "built", "led", "managed", "designed", "implemented", "created",
      "improved", "increased", "reduced", "delivered", "launched", "optimized",
      "collaborated", "architected", "engineered", "analyzed", "coordinated",
      "established", "automated",
    ];
    const foundVerbs = actionVerbs.filter((v) => lower.includes(v));
    checks.push({
      label: "Action verbs in bullets",
      pass: foundVerbs.length >= 3,
      detail:
        foundVerbs.length >= 3
          ? `${foundVerbs.length} strong action verbs detected`
          : `Only ${foundVerbs.length} action verb(s) found — use more (e.g. led, built, optimized)`,
    });
 
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    checks.push({
      label: "Sufficient text content",
      pass: wordCount >= 150,
      detail:
        wordCount >= 150
          ? `${wordCount} words — good content density`
          : `Only ${wordCount} words detected — resume may contain images or graphics ATS can't read`,
    });
 
    const hasDOB = /\b(date of birth|dob|born on|born:|age\s*:)\b/i.test(text);
    const hasPhoto = /\b(photo|photograph|picture|image)\b/i.test(text);
    checks.push({
      label: "No personal photo or DOB",
      pass: !hasDOB && !hasPhoto,
      detail:
        !hasDOB && !hasPhoto
          ? "No photo or DOB references found"
          : `Found: ${[hasDOB && "date of birth", hasPhoto && "photo reference"].filter(Boolean).join(", ")} — remove these`,
    });
 
    checks.push({
      label: "Plain text parseable format",
      pass: true,
      detail: "Resume text is machine-readable — good for ATS parsing",
    });
 
    const passed = checks.filter((c) => c.pass).length;
    const total = checks.length;
    const atsScore = Math.round((passed / total) * 100);
 
    let verdict = "Poor";
    let verdictVariant = "danger";
    if (atsScore >= 80) { verdict = "Excellent"; verdictVariant = "success"; }
    else if (atsScore >= 60) { verdict = "Good"; verdictVariant = "warning"; }
    else if (atsScore >= 40) { verdict = "Fair"; verdictVariant = "orange"; }
 
    return { checks, passed, total, atsScore, verdict, verdictVariant };
  };
 
  const atsData = useMemo(() => getATSCompatibility(resumeText), [resumeText]);
 
  const verdictStyles = {
    success: {
      badge: "bg-green-100 text-green-800 border border-green-200",
      ring: "text-green-500",
      bar: "bg-green-500",
      score: "text-green-700",
    },
    warning: {
      badge: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      ring: "text-yellow-500",
      bar: "bg-yellow-400",
      score: "text-yellow-700",
    },
    orange: {
      badge: "bg-orange-100 text-orange-800 border border-orange-200",
      ring: "text-orange-500",
      bar: "bg-orange-400",
      score: "text-orange-700",
    },
    danger: {
      badge: "bg-red-100 text-red-800 border border-red-200",
      ring: "text-red-500",
      bar: "bg-red-500",
      score: "text-red-700",
    },
  };
 
  // ── PDF Helpers ──────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const leftMargin = 20;
      const rightMargin = 20;
      const contentWidth = pageWidth - leftMargin - rightMargin;
      let yPos = 0;
 
      const checkPage = (needed) => {
        if (yPos + needed > pageHeight - 20) {
          pdf.addPage();
          drawPageHeader();
          yPos = 32;
        }
      };
 
      const drawPageHeader = () => {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageWidth, 22, "F");
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(148, 163, 184);
        pdf.text("ATS RESUME ANALYZER", leftMargin, 14);
        pdf.setFont("helvetica", "normal");
        pdf.text("ANALYSIS REPORT", pageWidth - rightMargin, 14, { align: "right" });
      };
 
      const sectionHeading = (title, accentR, accentG, accentB) => {
        checkPage(18);
        yPos += 6;
        pdf.setFillColor(accentR, accentG, accentB);
        pdf.rect(leftMargin, yPos - 5, 3, 10, "F");
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(15, 23, 42);
        pdf.text(title.toUpperCase(), leftMargin + 8, yPos + 1);
        yPos += 5;
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.4);
        pdf.line(leftMargin, yPos, pageWidth - rightMargin, yPos);
        yPos += 6;
      };
 
      const drawPill = (text, x, y, bgR, bgG, bgB, textR, textG, textB) => {
        const w = Math.min(pdf.getTextWidth(text) + 10, 90);
        pdf.setFillColor(bgR, bgG, bgB);
        pdf.roundedRect(x, y - 5, w, 8, 2, 2, "F");
        pdf.setFontSize(8.5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(textR, textG, textB);
        pdf.text(text, x + 5, y);
        return w + 4;
      };
 
      drawPageHeader();
      yPos = 32;
 
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text("Resume Analysis Report", leftMargin, yPos);
      yPos += 9;
 
      const now = new Date();
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `Generated on ${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
        leftMargin,
        yPos
      );
      yPos += 14;
 
      const cardH = 38;
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(leftMargin, yPos, contentWidth, cardH, 3, 3, "FD");
 
      const cx = leftMargin + 28;
      const cy = yPos + cardH / 2;
      const r = 13;
 
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(3);
      pdf.circle(cx, cy, r, "S");
 
      let scoreR = 239, scoreG = 68, scoreB = 68;
      if (matchScore >= 70) { scoreR = 34; scoreG = 197; scoreB = 94; }
      else if (matchScore >= 50) { scoreR = 234; scoreG = 179; scoreB = 8; }
 
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (matchScore / 100) * 2 * Math.PI;
      const steps = 60;
      const arcPoints = [];
      for (let i = 0; i <= steps; i++) {
        const angle = startAngle + (i / steps) * (endAngle - startAngle);
        arcPoints.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
      }
      for (let i = 0; i < arcPoints.length - 1; i++) {
        pdf.setLineWidth(3);
        pdf.setDrawColor(scoreR, scoreG, scoreB);
        pdf.line(arcPoints[i][0], arcPoints[i][1], arcPoints[i + 1][0], arcPoints[i + 1][1]);
      }
 
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(scoreR, scoreG, scoreB);
      pdf.text(`${matchScore}%`, cx, cy + 4, { align: "center" });
 
      const labelX = leftMargin + 50;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text("ATS Match Score", labelX, yPos + 13);
 
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      const desc =
        matchScore >= 70
          ? "Strong match — you are a top candidate for this role."
          : matchScore >= 50
          ? "Moderate match — a few improvements will strengthen your application."
          : "Low match — focus on the missing skills below to improve your score.";
      const descLines = pdf.splitTextToSize(desc, contentWidth - 54);
      pdf.text(descLines, labelX, yPos + 22);
      yPos += cardH + 12;
 
      const boxW = (contentWidth - 8) / 2;
      const boxH = 22;
 
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(187, 247, 208);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(leftMargin, yPos, boxW, boxH, 2, 2, "FD");
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(22, 163, 74);
      pdf.text(String(matchedSkills.length), leftMargin + 10, yPos + 15);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(21, 128, 61);
      pdf.text("Skills Matched", leftMargin + 10 + pdf.getTextWidth(String(matchedSkills.length)) + 4, yPos + 14);
 
      const box2X = leftMargin + boxW + 8;
      pdf.setFillColor(255, 241, 242);
      pdf.setDrawColor(254, 205, 211);
      pdf.roundedRect(box2X, yPos, boxW, boxH, 2, 2, "FD");
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(220, 38, 38);
      pdf.text(String(missingSkills.length), box2X + 10, yPos + 15);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(185, 28, 28);
      pdf.text("Skills Missing", box2X + 10 + pdf.getTextWidth(String(missingSkills.length)) + 4, yPos + 14);
      yPos += boxH + 14;
 
      if (matchedSkills.length > 0) {
        sectionHeading("Matched Skills", 34, 197, 94);
        let pillX = leftMargin;
        matchedSkills.forEach((skill) => {
          const w = Math.min(pdf.getTextWidth(skill) + 10, 90);
          if (pillX + w > pageWidth - rightMargin) { pillX = leftMargin; yPos += 11; checkPage(11); }
          drawPill(skill, pillX, yPos, 240, 253, 244, 21, 128, 61);
          pillX += w + 4;
        });
        yPos += 12;
      }
 
      if (missingSkills.length > 0) {
        sectionHeading("Missing Skills", 239, 68, 68);
        let pillX = leftMargin;
        missingSkills.forEach((skill) => {
          const w = Math.min(pdf.getTextWidth(skill) + 10, 90);
          if (pillX + w > pageWidth - rightMargin) { pillX = leftMargin; yPos += 11; checkPage(11); }
          drawPill(skill, pillX, yPos, 255, 241, 242, 185, 28, 28);
          pillX += w + 4;
        });
        yPos += 12;
      }
 
      if (suggestions?.length > 0) {
        sectionHeading("Improvement Suggestions", 99, 102, 241);
        suggestions.forEach((suggestion, idx) => {
          const text =
            typeof suggestion === "string"
              ? suggestion
              : suggestion.text || suggestion.message || String(suggestion);
          const lines = pdf.splitTextToSize(text, contentWidth - 22);
          const rowH = lines.length * 5.5 + 10;
          checkPage(rowH + 4);
 
          if (idx % 2 === 0) {
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(leftMargin, yPos - 5, contentWidth, rowH, 2, 2, "F");
          }
 
          pdf.setFillColor(99, 102, 241);
          pdf.circle(leftMargin + 5, yPos + 1.5, 4.5, "F");
          pdf.setFontSize(7.5);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(255, 255, 255);
          pdf.text(String(idx + 1), leftMargin + 5, yPos + 4, { align: "center" });
 
          pdf.setFontSize(9.5);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(30, 41, 59);
          lines.forEach((line, li) => { pdf.text(line, leftMargin + 13, yPos + li * 5.5); });
          yPos += rowH + 2;
        });
      }
 
      // ATS Compatibility in PDF
      const ats = atsData;
      checkPage(20);
      sectionHeading("ATS Compatibility Check", 14, 165, 233);
 
      checkPage(24);
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(leftMargin, yPos, contentWidth, 20, 2, 2, "FD");
 
      const [vR, vG, vB] =
        ats.verdictVariant === "success" ? [22, 163, 74]
        : ats.verdictVariant === "warning" ? [234, 179, 8]
        : ats.verdictVariant === "orange" ? [249, 115, 22]
        : [220, 38, 38];
 
      pdf.setFillColor(vR, vG, vB);
      pdf.roundedRect(leftMargin + 4, yPos + 4, 28, 12, 2, 2, "F");
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text(ats.verdict, leftMargin + 4 + 14, yPos + 12, { align: "center" });
 
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(vR, vG, vB);
      pdf.text(`${ats.atsScore}%`, leftMargin + 40, yPos + 13);
 
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `${ats.passed} of ${ats.total} ATS checks passed — independent of job description`,
        leftMargin + 60,
        yPos + 13
      );
      yPos += 26;
 
      ats.checks.forEach((check, idx) => {
        const rowH = 13;
        checkPage(rowH + 2);
        if (idx % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.roundedRect(leftMargin, yPos - 3, contentWidth, rowH, 1, 1, "F");
        }
        if (check.pass) { pdf.setFillColor(34, 197, 94); } else { pdf.setFillColor(239, 68, 68); }
        pdf.circle(leftMargin + 5, yPos + 3, 3, "F");
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);
        pdf.text(check.pass ? "✓" : "✗", leftMargin + 5, yPos + 5.5, { align: "center" });
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(15, 23, 42);
        pdf.text(check.label, leftMargin + 12, yPos + 4);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(check.pass ? 21 : 185, check.pass ? 128 : 28, check.pass ? 61 : 28);
        const detailLines = pdf.splitTextToSize(check.detail, contentWidth - 70);
        pdf.text(detailLines, pageWidth - rightMargin, yPos + 4, { align: "right" });
        yPos += rowH;
      });
 
      yPos += 6;
      checkPage(32);
      pdf.setFillColor(240, 249, 255);
      pdf.setDrawColor(186, 230, 253);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(leftMargin, yPos, contentWidth, 28, 2, 2, "FD");
      pdf.setFillColor(14, 165, 233);
      pdf.rect(leftMargin, yPos, 3, 28, "F");
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(7, 89, 133);
      pdf.text("Quick ATS Tips", leftMargin + 8, yPos + 8);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(3, 105, 161);
      const tips = [
        "• Use standard section headers (Experience, Education, Skills)",
        "• Save as .docx or plain PDF — avoid image-based or scanned PDFs",
        "• Use standard fonts (Arial, Calibri, Times New Roman)",
        "• Include keywords from the job description naturally in your content",
      ];
      tips.forEach((tip, i) => { pdf.text(tip, leftMargin + 8, yPos + 14 + i * 4.5); });
      yPos += 34;
 
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(148, 163, 184);
        pdf.text("Confidential — Resume Analysis Report", leftMargin, pageHeight - 8);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - rightMargin, pageHeight - 8, { align: "right" });
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.line(leftMargin, pageHeight - 14, pageWidth - rightMargin, pageHeight - 14);
      }
 
      pdf.save("resume-analysis-report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };
 
  // ── Rewrite Resume ───────────────────────────────────────────────────────
  const handleRewriteResume = async () => {
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
 
  // ── Generate Cover Letter ────────────────────────────────────────────────
  const handleGenerateCoverLetter = async () => {
    if (!resumeText || !jobDescription) {
      alert("Resume text or job description not available.");
      return;
    }
    try {
      setIsGeneratingCoverLetter(true);
      const data = await generateCoverLetter(resumeText, jobDescription);
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter);
      } else {
        alert(data.error || "Failed to generate cover letter.");
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
      alert("Failed to generate cover letter. Please try again.");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };
 
  // ── Copy to Clipboard ────────────────────────────────────────────────────
  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "resume") {
        setCopiedResume(true);
        setTimeout(() => setCopiedResume(false), 2000);
      } else {
        setCopiedCoverLetter(true);
        setTimeout(() => setCopiedCoverLetter(false), 2000);
      }
    } catch {
      alert("Failed to copy. Please select and copy manually.");
    }
  };
 
  // ── Download Rewritten Resume PDF ────────────────────────────────────────
  const handleDownloadResume = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20;
      const leftMargin = 20;
      const rightMargin = 20;
      const contentWidth = pageWidth - leftMargin - rightMargin;
 
      const rawText = typeof rewrittenResume === "string" ? rewrittenResume : "";
      if (!rawText.trim()) {
        alert("No rewritten resume to download. Please click 'Rewrite Resume' first.");
        return;
      }
 
      const KNOWN_HEADERS = [
        "summary", "professional summary", "skills", "technical skills",
        "experience", "work experience", "education", "projects",
        "certifications", "certifications & achievements", "achievements",
      ];
      const headerRegex = new RegExp(`^(${KNOWN_HEADERS.join("|")})[:\\s]*$`, "i");
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
 
      const headerLines = sections["header"] || [];
      const candidateName = headerLines[0] || "Resume";
      const contactLine = headerLines.slice(1).join("  |  ");
 
      const checkNewPage = (neededSpace) => {
        if (yPos + neededSpace > pageHeight - 20) { pdf.addPage(); yPos = 20; }
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
        wrapped.forEach((line) => { checkNewPage(6); pdf.text(line, leftMargin + indent, yPos); yPos += 5; });
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
 
      const renderOrder = [
        { key: "summary", label: "Professional Summary" },
        { key: "skills", label: "Skills" },
        { key: "experience", label: "Experience" },
        { key: "projects", label: "Projects" },
        { key: "education", label: "Education" },
        { key: "certifications", label: "Certifications & Achievements" },
      ];
 
      const rendered = new Set();
      renderOrder.forEach(({ key, label }) => {
        if (rendered.has(label)) return;
        const lines =
          key === "certifications"
            ? [...(sections["certifications"] || []), ...(sections["achievements"] || [])]
            : sections[key] || [];
        if (lines.length === 0) return;
        rendered.add(label);
        sectionHeader(label);
        lines.forEach((line) => {
          const isBullet = /^[-•*]/.test(line);
          isBullet ? bulletLine(line.replace(/^[-•*]\s*/, "")) : bodyText(line);
        });
        yPos += 3;
      });
 
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(160, 160, 160);
        pdf.text(`${candidateName} — Page ${i} of ${totalPages}`, leftMargin, pageHeight - 10);
      }
 
      const safeName = candidateName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
      pdf.save(`${safeName || "resume"}_ats.pdf`);
    } catch (error) {
      console.error("Error generating resume PDF:", error);
      alert("Failed to generate PDF: " + error.message);
    }
  };
 
  // ── Download Cover Letter PDF ────────────────────────────────────────────
  const handleDownloadCoverLetter = () => {
    try {
      if (!coverLetter?.trim()) {
        alert("No cover letter to download. Please generate one first.");
        return;
      }
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const leftMargin = 25;
      const rightMargin = 25;
      const contentWidth = pageWidth - leftMargin - rightMargin;
      let yPos = 30;
 
      pdf.setFillColor(22, 101, 52);
      pdf.rect(0, 0, pageWidth, 18, "F");
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text("COVER LETTER", leftMargin, 12);
 
      pdf.setTextColor(40, 40, 40);
      const paragraphs = coverLetter.split("\n").filter(Boolean);
      paragraphs.forEach((para) => {
        pdf.setFontSize(10.5);
        pdf.setFont("helvetica", "normal");
        const lines = pdf.splitTextToSize(para, contentWidth);
        lines.forEach((line) => {
          if (yPos > pageHeight - 25) { pdf.addPage(); yPos = 25; }
          pdf.text(line, leftMargin, yPos);
          yPos += 6;
        });
        yPos += 4;
      });
 
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(160, 160, 160);
        pdf.text(`Cover Letter — Page ${i} of ${totalPages}`, leftMargin, pageHeight - 10);
      }
      pdf.save("cover_letter.pdf");
    } catch (error) {
      console.error("Error generating cover letter PDF:", error);
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
 
  // ── ATS Score Arc Widget ─────────────────────────────────────────────────
  const ATSScoreArc = ({ score, variant }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const colorMap = {
      success: "text-green-500",
      warning: "text-yellow-400",
      orange: "text-orange-400",
      danger: "text-red-500",
    };
    const ringColor = colorMap[variant] || "text-gray-400";
    return (
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r="36" stroke="currentColor" strokeWidth="7" fill="transparent" className="text-gray-100" />
          <circle cx="44" cy="44" r="36" stroke="currentColor" strokeWidth="7" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className={`${ringColor} transition-all duration-700 ease-out`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${verdictStyles[variant]?.score}`}>{score}%</span>
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
    { bg: "bg-blue-100", color: "text-blue-500" },
    { bg: "bg-green-100", color: "text-green-500" },
    { bg: "bg-purple-100", color: "text-purple-500" },
    { bg: "bg-orange-100", color: "text-orange-500" },
    { bg: "bg-red-100", color: "text-red-500" },
  ];
 
  const atsTips = [
    "Use standard section headers: Experience, Education, Skills",
    "Save as .docx or plain PDF — avoid image-based or scanned PDFs",
    "Use standard fonts like Arial, Calibri, or Times New Roman",
    "Include keywords from the job description naturally in your content",
  ];
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* ── Navbar ── */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button onClick={() => navigate("/analyze")} className="flex items-center text-sm text-gray-700 hover:text-blue-600 font-medium">
                <ArrowLeft className="h-4 w-4 mr-2" />Back
              </button>
              <span className="text-xl font-bold text-gray-900 ml-6">Analysis Result</span>
            </div>
 
            {/* Desktop action buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              <button onClick={handleDownloadPDF} className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                <Download className="h-4 w-4 mr-2" />Download Report
              </button>
 
              {rewrittenResume && (
                <button onClick={handleDownloadResume} className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                  <Download className="h-4 w-4 mr-2" />Download ATS Resume
                </button>
              )}
 
              {coverLetter && (
                <button onClick={handleDownloadCoverLetter} className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                  <Download className="h-4 w-4 mr-2" />Download Cover Letter
                </button>
              )}
 
              <button onClick={handleRewriteResume} disabled={isRewriting}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:bg-green-400">
                {isRewriting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                {isRewriting ? "Rewriting..." : "Rewrite Resume"}
              </button>
 
              <button onClick={handleGenerateCoverLetter} disabled={isGeneratingCoverLetter}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:bg-purple-400">
                {isGeneratingCoverLetter ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                {isGeneratingCoverLetter ? "Generating..." : "Cover Letter"}
              </button>
 
              <button onClick={() => navigate("/analyze")} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                <RotateCcw className="h-4 w-4 mr-2" />Try Another
              </button>
            </div>
          </div>
        </div>
      </div>
 
      <main ref={reportRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Resume Match Score</h1>
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
 
        {/* Skills Grid */}
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
 
        {/* Suggestions */}
        <div className="bg-gradient-to-br from-white to-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <Lightbulb className="h-7 w-7 text-yellow-500 mr-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Improvement Suggestions</h2>
          </div>
          <div className="space-y-4">
            {suggestions.map((s, i) => {
              const theme = bulbThemes[i % bulbThemes.length];
              return (
                <div key={i} className="flex items-center bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg duration-300">
                  <div className={`flex items-center justify-center h-10 w-10 ${theme.bg} ${theme.color} mr-4 rounded-md flex-shrink-0`}>
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{s}</p>
                </div>
              );
            })}
          </div>
        </div>
 
        {/* ── ATS Compatibility Check Section ── */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-sky-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 bg-sky-100 text-sky-600 rounded-xl">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">ATS Compatibility Check</h2>
                <p className="text-sm text-gray-500 mt-0.5">Independent analysis of your resume's ATS-readability</p>
              </div>
            </div>
 
            {/* Score Summary */}
            <div className="flex items-center gap-4">
              <ATSScoreArc score={atsData.atsScore} variant={atsData.verdictVariant} />
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-1 ${verdictStyles[atsData.verdictVariant]?.badge}`}>
                  {atsData.verdict}
                </span>
                <p className="text-sm text-gray-500">
                  {atsData.passed} of {atsData.total} checks passed
                </p>
              </div>
            </div>
          </div>
 
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${verdictStyles[atsData.verdictVariant]?.bar}`}
              style={{ width: `${atsData.atsScore}%` }}
            />
          </div>
 
          {/* Checklist */}
          <div className="divide-y divide-gray-100">
            {atsData.checks.map((check, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-4 py-3.5 px-3 rounded-lg transition-colors ${idx % 2 === 0 ? "bg-gray-50/60" : ""}`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 mt-0.5 flex items-center justify-center w-6 h-6 rounded-full ${check.pass ? "bg-green-100" : "bg-red-100"}`}>
                  {check.pass
                    ? <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                    : <ShieldX className="h-3.5 w-3.5 text-red-500" />
                  }
                </div>
 
                {/* Label + detail */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${check.pass ? "text-gray-800" : "text-gray-700"}`}>
                    {check.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${check.pass ? "text-green-700" : "text-red-600"}`}>
                    {check.detail}
                  </p>
                </div>
 
                {/* Pass/Fail badge */}
                <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${check.pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {check.pass ? "Pass" : "Fail"}
                </span>
              </div>
            ))}
          </div>
 
          {/* Tips callout */}
          <div className="mt-8 bg-sky-50 border border-sky-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-sky-600" />
              <span className="text-sm font-semibold text-sky-800">Quick ATS Tips</span>
            </div>
            <ul className="space-y-1.5">
              {atsTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-sky-700">
                  <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-sky-400" />
                  {tip}
                </li>
              ))}
            </ul>
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopy(rewrittenResume, "resume")}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  {copiedResume ? <Check className="h-4 w-4 mr-2 text-green-600" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copiedResume ? "Copied!" : "Copy"}
                </button>
                <button onClick={handleDownloadResume} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />Download ATS PDF
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm leading-relaxed">
                {rewrittenResume}
              </pre>
            </div>
          </div>
        )}
 
        {/* Cover Letter Section */}
        {coverLetter && (
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-xl p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FileText className="h-7 w-7 text-purple-600 mr-4" />
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Cover Letter</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopy(coverLetter, "coverLetter")}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  {copiedCoverLetter ? <Check className="h-4 w-4 mr-2 text-purple-600" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copiedCoverLetter ? "Copied!" : "Copy"}
                </button>
                <button onClick={handleDownloadCoverLetter} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">
                  <Download className="h-4 w-4 mr-2" />Download PDF
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-sans">
                {coverLetter}
              </p>
            </div>
          </div>
        )}
 
        {/* Mobile action buttons */}
        <div className="sm:hidden flex flex-col space-y-3 mt-8">
          <button onClick={handleDownloadPDF} className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700">
            <Download className="h-4 w-4 mr-2" />Download Report
          </button>
          <button onClick={handleRewriteResume} disabled={isRewriting}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:bg-green-400">
            {isRewriting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
            {isRewriting ? "Rewriting..." : "Rewrite Resume"}
          </button>
          <button onClick={handleGenerateCoverLetter} disabled={isGeneratingCoverLetter}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:bg-purple-400">
            {isGeneratingCoverLetter ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            {isGeneratingCoverLetter ? "Generating..." : "Generate Cover Letter"}
          </button>
          <button onClick={() => navigate("/analyze")} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            <RotateCcw className="h-4 w-4 mr-2" />Try Another
          </button>
        </div>
      </main>
    </div>
  );
}