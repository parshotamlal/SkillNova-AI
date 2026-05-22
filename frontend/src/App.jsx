import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./context/ProtectedRoute.jsx";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useState, useEffect, lazy, Suspense } from "react";
import { HelmetProvider } from 'react-helmet-async';
import SEO from "./components/SEO";

// Lazy load pages for performance
const Home = lazy(() => import("./pages/Home"));
const Analyze = lazy(() => import("./pages/Analyze"));
const Result = lazy(() => import("./pages/Result"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Pricing = lazy(() => import("./pages/Pricing"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Success = lazy(() => import("./pages/Success.jsx"));
const HelpCenter = lazy(() => import("./pages/HelpCenter.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const TermsOfService = lazy(() => import("./pages/TermsofService.jsx"));
const Status = lazy(() => import("./pages/Status.jsx"));
const CheckAtsScore = lazy(() => import("./pages/AtsResumeAnalyze.jsx"));
const AtsResult = lazy(() => import("./pages/AtsResult.jsx"));
const Templates = lazy(() => import("./pages/template.jsx"))

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <SEO /> {/* Default SEO config across all pages */}
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/analyze"
                    element={
                      <ProtectedRoute>
                        <Analyze />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/check-ats-score"
                    element={
                      <ProtectedRoute>
                        <CheckAtsScore />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pricing"
                    element={
                      <ProtectedRoute>
                        <Pricing />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/result" element={<Result />} />
                  <Route path="/ats-result" element={<AtsResult />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/success" element={<Success />} />

                  {/* SUPPORT */}
                  <Route path="/help-center" element={<HelpCenter />} />
                  <Route path="/Privacy-Policy" element={<PrivacyPolicy />} />
                  <Route path="/Terms-of-Service" element={<TermsOfService />} />
                  <Route path="/status" element={<Status />} />
                  <Route path="/templates" element={<Templates />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
