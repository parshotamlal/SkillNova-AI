import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { fetchProfile } from "../services/api";

export default function Navbar({ showAuthButtons = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [login, setLogin] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isHome = location.pathname === "/";

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/analyze", label: "Analyze" },
    { path: "/pricing", label: "Pricing" },
  ];

  const scrollToFooter = () => {
    const f = document.querySelector("footer");
    if (f) f.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchProfile();
        setLogin(!!res.user);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setLogin(false);
      }
    };

    fetchData();
  });

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="p-2 mr-3 rounded-lg bg-gradient-to-br from-blue-600 to-teal-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-400">
                SkillNova Ai
              </h1>
              <p className="text-xs text-gray-500 leading-none">
                Powered by AI
              </p>
            </div>
            <h1 className="sm:hidden text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-400">
              SkillNova Ai
            </h1>
          </div>

          {isHome ? (
            <>
              {/* desktop nav */}
              <div className="hidden md:flex items-center space-x-6">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive(link.path)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  onClick={scrollToFooter}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition"
                >
                  Contact Us
                </button>
              </div>

              {/* desktop auth */}

              {showAuthButtons && (
                <>
                  {!login ? (
                    <div className="hidden md:flex items-center space-x-3">
                      <button
                        onClick={() => navigate("/login")}
                        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => navigate("/signup")}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 transition"
                      >
                        Get Started
                      </button>
                    </div>
                  ) : (
                    <div className="hidden md:block">
                      <button
                        onClick={() => navigate("/profile")}
                        className="p-1 text-gray-600 hover:text-blue-600 transition"
                      >
                        <img
                          src="/profile.png"
                          alt="Profile"
                          className="w-9 h-8 rounded-full object-cover"
                        />
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* mobile toggle */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition"
                >
                  {mobileOpen ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8h16M4 16h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </>
          ) : (
            // other pages: show profile image
            <div>
              <button
                onClick={() => navigate("/profile")}
                className="p-1 text-gray-600 hover:text-blue-600 transition"
              >
                <div className="p-1 ">
                  <img
                    src="/profile.png"
                    alt="Profile"
                    className="w-9 h-8 rounded-full object-cover"
                  />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* mobile menu */}
        {isHome && mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2  pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition ${
                    isActive(link.path)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col items-start px-2  space-y-1">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileOpen(false);
                  }}
                  className="px-1 py-1 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition"
                >
                  Account
                </button>
              </div>

              {!login && showAuthButtons && (
                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMobileOpen(false);
                    }}
                    className="w-full px-3 py-2 text-base font-medium border border-gray-300 rounded-md hover:text-blue-600 hover:border-blue-600 transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate("/signup");
                      setMobileOpen(false);
                    }}
                    className="w-full px-3 py-2 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 transition"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
