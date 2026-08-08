import React from "react";
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  User, 
  Building2, 
  Sparkles,
  Check,
  AlertTriangle
} from "lucide-react";

export default function RecruitmentMatchResultsCard({ recruitmentMatch }) {
  if (!recruitmentMatch || !recruitmentMatch.matches || recruitmentMatch.matches.length === 0) {
    return null;
  }

  const { candidateInfo, matches, notificationsSent } = recruitmentMatch;
  const applicantEmail = candidateInfo?.applicantEmail || "";
  const applicantName = candidateInfo?.applicantName || "Applicant";

  return (
    <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-900/90 via-slate-900 to-indigo-950 text-white shadow-xl border border-blue-500/20 backdrop-blur-md">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Recruitment Job Matching Results
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Active Job Matching & Next Round Status
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Evaluated candidate profile against active recruiter job descriptions.
          </p>
        </div>

        {candidateInfo && (
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs text-slate-200">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" /> {applicantName}
            </p>
            {applicantEmail && (
              <p className="text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-teal-400" /> {applicantEmail}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Matches Grid */}
      <div className="space-y-4">
        {matches.map((match) => {
          const threshold = match.matchThreshold || 90;
          const isEligible = match.matchScore >= threshold || match.isEligible;
          
          // Check notification log for this match
          const notifLog = (notificationsSent || []).find(n => n.jobId === match.jobId);
          const emailSent = notifLog?.emailSent;

          return (
            <div
              key={match.jobId}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/30 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded border border-blue-400/20">
                      {match.companyName}
                    </span>
                    <span className="text-xs text-slate-400">Threshold: {threshold}%</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mt-1">
                    {match.jobTitle}
                  </h4>
                </div>

                {/* Score Pill & Status */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`text-xl font-extrabold ${isEligible ? "text-emerald-400" : "text-slate-400"}`}>
                      {match.matchScore}%
                    </span>
                    <span className="text-[10px] block text-slate-400 uppercase tracking-wider">Match Score</span>
                  </div>

                  <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                    isEligible 
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}>
                    {isEligible ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        NEXT ROUND ELIGIBLE
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-slate-400" />
                        Not Eligible
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Notification Banner */}
              {isEligible && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {emailSent 
                        ? `Shortlisted for Next Round! Email notification sent to ${applicantEmail}`
                        : notifLog?.emailError 
                        ? `Match found (${match.matchScore}%), but email could not be sent.`
                        : `Applicant eligible for Next Round (${match.matchScore}% >= ${threshold}%)`}
                    </span>
                  </div>
                  {emailSent && (
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">
                      ✓ Email Sent
                    </span>
                  )}
                </div>
              )}

              {/* Skills matched / missing */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-3 border-t border-white/5">
                {match.matchedSkills && match.matchedSkills.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-medium">Matched Skills: </span>
                    <span className="text-emerald-300 font-mono">{match.matchedSkills.join(", ")}</span>
                  </div>
                )}
                {match.missingSkills && match.missingSkills.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-medium">Missing Skills: </span>
                    <span className="text-rose-300 font-mono">{match.missingSkills.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
