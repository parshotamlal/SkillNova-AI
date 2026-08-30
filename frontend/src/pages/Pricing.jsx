import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Crown, Gift, ExternalLink, X, ShieldCheck } from "lucide-react";
// import axios from "axios";
import SEO from "../components/SEO";
import { submitPaymentClaim, getMyPaymentStatus } from "../services/api";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Ideal for active job seekers and professionals",
      icon: <Gift className="h-6 w-6" />,
      iconBg: "bg-green-100 text-green-600",
      features: [
        "10 resume analyses per month",
        "Detailed match score breakdown",
        "Complete skills gap analysis",
        "ATS optimization suggestions",
        "Industry-specific insights",
        "PDF report downloads",
        "Priority email support",
      ],
      buttonText: "",
      showButton: false,
    },
    {
      name: "Pro",
      price: "₹149",
      period: "/month",
      description: "For career coaches and recruitment professionals",
      icon: <Crown className="h-6 w-6" />,
      iconBg: "bg-purple-100 text-purple-600",
      features: [
        "Unlimited resume analyses",
        "Advanced AI recommendations",
        "Multiple job description comparisons",
        "Custom branding for reports",
        "Bulk processing capabilities",
        "API access for integrations",
        "Phone & chat support",
        "Team collaboration tools",
      ],
      buttonText: "Go Pro",
      showButton: true,
    },
  ];

  /*
  // Old Stripe Integration Code:
  const getApiBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL;
    if (!url) return "";
    url = url.trim().replace(/\/+$/, "");
    if (url.endsWith("/api")) url = url.slice(0, -4);
    return url;
  };
  const VITE_API_URL = getApiBaseUrl();

  const handlePurchase = async (planName) => {
    try {
      const res = await axios.post(
        `${VITE_API_URL}/stripe/create-checkout-session`,
        { planName },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = res.data;
      if (data.url) {
        window.location.href = data.url; // redirect to Stripe
      } else {
        alert("Something went wrong with payment.");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Error connecting to Stripe.");
    }
  };
  */

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentIdInput, setPaymentIdInput] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
  const [userStatus, setUserStatus] = useState({ isPremium: false, plan: "Free", claims: [], isAdmin: false });

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await getMyPaymentStatus();
      if (res) {
        setUserStatus({
          isPremium: res.isPremium || false,
          plan: res.plan || "Free",
          claims: res.claims || [],
          isAdmin: res.isAdmin || false,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePurchase = (planName) => {
    // Direct Razorpay payment link
    window.open("https://razorpay.me/@batwaltechnology", "_blank");
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!paymentIdInput.trim()) {
      setSubmitMessage({ type: "error", text: "Please enter your Payment ID." });
      return;
    }

    setSubmitLoading(true);
    setSubmitMessage({ type: "", text: "" });

    try {
      const res = await submitPaymentClaim(paymentIdInput.trim(), "Pro", "₹149");
      if (res.claim) {
        setSubmitMessage({
          type: "success",
          text: "Payment ID submitted successfully! We will review and upgrade your account shortly.",
        });
        setPaymentIdInput("");
        loadStatus();
      } else {
        setSubmitMessage({
          type: "error",
          text: res.message || "Failed to submit payment claim.",
        });
      }
    } catch (err) {
      setSubmitMessage({ type: "error", text: "Failed to submit. Please try again." });
    } finally {
      setSubmitLoading(false);
    }
  };

  const latestClaim = userStatus.claims && userStatus.claims[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <SEO
        title="Pricing — Free & Premium AI Resume Builder Plans | ResumeAI Online"
        description="ResumeAI Online offers a free plan for job seekers and an affordable premium plan. Compare features: ATS checker, AI resume builder, 50+ templates, PDF download. No credit card required."
        url="/pricing"
        keywords="resume builder pricing, free resume builder, AI resume builder cost, ATS checker plan, resume tool free vs paid, ResumeAI plans"
        schemaType="page"
        showBreadcrumb={true}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Pricing', url: '/pricing' },
        ]}
      />
      {/* Hero Section */}
      <section className="py-16 lg:py-24 text-center px-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Select the perfect plan for your needs. Upgrade or downgrade at any
          time. All plans include our core AI-powered resume analysis.
        </p>

        {/* Current Plan & Claim Status Banner */}
        {userStatus.isPremium ? (
          <div className="mt-8 max-w-md mx-auto bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl flex items-center justify-center gap-2 font-semibold">
            <Crown className="w-5 h-5 text-green-600" />
            <span>You are currently on the {userStatus.plan} Plan! Active ✨</span>
          </div>
        ) : latestClaim ? (
          <div className="mt-8 max-w-md mx-auto bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-sm shadow-sm">
            <p className="font-semibold">
              Payment Claim: <span className="font-mono">{latestClaim.paymentId}</span>
            </p>
            <p className="mt-1">
              Status:{" "}
              <span className={`font-bold capitalize ${latestClaim.status === "approved" ? "text-green-600" : latestClaim.status === "rejected" ? "text-red-600" : "text-amber-600"}`}>
                {latestClaim.status}
              </span>{" "}
              {latestClaim.status === "pending" && "(Under Review)"}
            </p>

            {latestClaim.status === "pending" && userStatus.isAdmin && (
              <div className="mt-3 pt-3 border-t border-amber-200/60">
                <Link
                  to="/admin/payments"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin: Review & Approve This Claim →
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-3xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col p-8 ${
                plan.name === "Pro" ? "border-2 border-indigo-500 relative" : ""
              }`}
            >
              {plan.name === "Pro" && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`mx-auto w-16 h-16 flex items-center justify-center rounded-2xl mb-4 ${plan.iconBg}`}
                >
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start text-sm text-gray-700"
                  >
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.showButton && (
                <div className="space-y-3">
                  <button
                    onClick={() => handlePurchase(plan.name)}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-base rounded-xl transition shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Pay with Razorpay
                  </button>

                  <button
                    onClick={() => {
                      setSubmitMessage({ type: "", text: "" });
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm rounded-xl transition"
                  >
                    Already Paid? Submit Payment ID
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Payment ID Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Claim Pro Access</h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter the Razorpay Payment ID from your receipt (e.g. <span className="font-mono text-indigo-600">pay_TVwNNxRT2qfBez</span>)
              </p>
            </div>

            {submitMessage.text && (
              <div
                className={`p-3.5 rounded-xl mb-4 text-xs font-medium ${
                  submitMessage.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {submitMessage.text}
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Razorpay Payment ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. pay_TVwNNxRT2qfBez"
                  value={paymentIdInput}
                  onChange={(e) => setPaymentIdInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-indigo-100 disabled:opacity-50"
              >
                {submitLoading ? "Submitting..." : "Verify & Claim Pro Access"}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                Haven't paid yet?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    handlePurchase("Pro");
                  }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Pay via Razorpay Link
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              {
                q: "Is my data secure?",
                a: "Absolutely. We use enterprise-grade encryption and never store your resume data longer than necessary for analysis.",
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 7-day money-back guarantee on all paid plans. No questions asked.",
              },
              {
                q: "Need a custom solution?",
                a: "Contact our sales team for enterprise pricing and custom integrations for your organization.",
              },
              {
                q: "Which payment methods are supported?",
                a: "We support all major credit and debit cards. Additional payment options may be available based on your location.",
              },
            ].map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
