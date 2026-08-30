import { useState, useEffect } from "react";
import { getAdminPaymentClaims, updateAdminPaymentClaim, fetchProfile } from "../services/api";
import { CheckCircle2, XCircle, Clock, ShieldCheck, RefreshCw, Search, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function AdminPayments() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const profile = await fetchProfile();
      const adminEmail = "parshotamworks@gmail.com";
      if (profile?.user?.email?.toLowerCase() === adminEmail || profile?.user?.role === "admin") {
        setIsAdmin(true);
        const res = await getAdminPaymentClaims();
        if (res && res.claims) {
          setClaims(res.claims);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error(err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleAction = async (claimId, action) => {
    if (!window.confirm(`Are you sure you want to ${action.toUpperCase()} this payment claim?`)) {
      return;
    }

    setActionLoading(claimId);
    setMessage({ type: "", text: "" });

    try {
      const res = await updateAdminPaymentClaim(claimId, action);
      if (res.claim) {
        setMessage({ type: "success", text: res.message || `Claim ${action}d successfully!` });
        // Update list locally
        setClaims((prev) =>
          prev.map((c) => (c._id === claimId ? res.claim : c))
        );
      } else {
        setMessage({ type: "error", text: res.message || "Failed to update claim." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesFilter = filter === "all" || claim.status === filter;
    const matchesSearch =
      (claim.paymentId && claim.paymentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (claim.userEmail && claim.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (claim.userName && claim.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  if (!loading && isAdmin === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <SEO title="Access Denied" />
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full text-center">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm mb-6">
            Only the administrator (<span className="font-semibold text-slate-800">parshotamworks@gmail.com</span>) can access the payment approval dashboard.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition shadow-md"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <SEO title="Payment Claims Admin | ResumeAi Online" description="Admin verification dashboard" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-1">
              <ShieldCheck className="w-6 h-6" />
              <span>Admin Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Razorpay Payment Verification
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review submitted Payment IDs and approve Pro plan access in 1-click.
            </p>
          </div>

          <button
            onClick={fetchClaims}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh List
          </button>
        </div>

        {/* Alert message */}
        {message.text && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Controls: Search & Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Payment ID, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {["all", "pending", "approved", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  filter === f
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Claims Table / Cards */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
            Loading payment claims...
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No payment claims found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClaims.map((claim) => (
              <div
                key={claim._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-md text-sm">
                      {claim.paymentId}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        claim.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : claim.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {claim.status === "approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {claim.status === "rejected" && <XCircle className="w-3.5 h-3.5" />}
                      {claim.status === "pending" && <Clock className="w-3.5 h-3.5" />}
                      {claim.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-sm text-slate-600 pt-1">
                    <span className="font-semibold text-slate-800">{claim.userEmail}</span>
                    {claim.userName && <span className="text-slate-400"> ({claim.userName})</span>}
                  </div>

                  <div className="text-xs text-slate-400">
                    Plan: <span className="text-slate-700 font-medium">{claim.plan || "Pro"}</span> • Submitted:{" "}
                    {new Date(claim.createdAt).toLocaleString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 border-t pt-3 md:border-t-0 md:pt-0">
                  {claim.status !== "approved" && (
                    <button
                      onClick={() => handleAction(claim._id, "approve")}
                      disabled={actionLoading === claim._id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                      {actionLoading === claim._id ? "Processing..." : "Approve & Give Pro ✅"}
                    </button>
                  )}

                  {claim.status !== "rejected" && (
                    <button
                      onClick={() => handleAction(claim._id, "reject")}
                      disabled={actionLoading === claim._id}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-xl transition disabled:opacity-50"
                    >
                      Reject ❌
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
