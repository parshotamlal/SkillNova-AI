import { Check, Crown, Gift } from "lucide-react";
import axios from "axios";

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
      price: "₹1,499",
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

  const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handlePurchase = async (planName) => {
    try {
      const res = await axios.post(
        // "https://ai-resumeanalyzer.onrender.com/api/stripe/create-checkout-session",
        // "https://ai-resumeanalyzer-bgl4.onrender.com/api/stripe/create-checkout-session",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 text-center px-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Select the perfect plan for your needs. Upgrade or downgrade at any
          time. All plans include our core AI-powered resume analysis.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col p-8"
            >
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
                <button
                  onClick={() => handlePurchase(plan.name)}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium text-base rounded-xl transition"
                >
                  {plan.buttonText}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

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
