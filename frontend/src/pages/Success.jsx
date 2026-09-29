'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

export default function Success() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("paymentSuccess", "true");
    }

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful! 🎉
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Welcome to Pro Plan! Your payment has been processed successfully.
        </p>

        <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            You now have access to:
          </h3>
          <ul className="text-left text-gray-600 space-y-2">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Unlimited resume analysis
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Advanced AI recommendations
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Priority support
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Detailed match scoring
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting to home page in {countdown} seconds...
          </p>

          <div className="space-x-4">
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Go to Home
            </button>

            <button
              onClick={() => router.push("/analyze")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Start Analyzing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
