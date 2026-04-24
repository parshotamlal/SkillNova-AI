import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Upload, Brain, Target } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const paymentSuccess = urlParams.get('payment_success');

    if (sessionId || paymentSuccess === 'true') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const paymentSuccessFlag = localStorage.getItem('paymentSuccess');
    if (paymentSuccessFlag === 'true') {
      localStorage.removeItem('paymentSuccess');
    }

    // Hide loading when page is fully loaded
    const handleLoad = () => {
      setIsLoading(false);
    };

    if (document.readyState === 'complete') {
      setIsLoading(false);
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              AI Resume Analyzer
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              Upload your resume and job description to get instant feedback and match score.
            </p>

            <button
              onClick={() => navigate("/analyze")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 inline-flex items-center"
            >
              <Upload className="mr-2 h-5 w-5" />
              Start Analyzing
            </button>
          </div>

          {/* Illustration/Icon */}
          <div className="mt-16 lg:mt-20">
            <div className="relative max-w-md mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl p-6">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-2xl text-gray-400">→</div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <Brain className="h-8 w-8 text-teal-600" />
                    </div>
                    <div className="text-2xl text-gray-400">→</div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <Target className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4 font-medium">
                    Upload → Analyze → Match
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="bg-blue-100 rounded-xl p-3 w-fit mx-auto mb-4">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy Upload
              </h3>
              <p className="text-gray-600">
                Simply drag and drop your resume and job description for instant analysis.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="bg-teal-100 rounded-xl p-3 w-fit mx-auto mb-4">
                <Brain className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered
              </h3>
              <p className="text-gray-600">
                Advanced AI algorithms analyze and match your skills with job requirements.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="bg-green-100 rounded-xl p-3 w-fit mx-auto mb-4">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Instant Results
              </h3>
              <p className="text-gray-600">
                Get detailed feedback and improvement suggestions in seconds.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
