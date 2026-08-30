import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { gsap } from "gsap";
import { fetchProfile } from "../services/api";
import Logo from "../../public/SkillNova-Logo.png";
 
export default function Navbar({ showAuthButtons = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [login, setLogin] = useState(false);
 
  // Refs for GSAP targets
  const logoRef = useRef(null);
  const navLinksRef = useRef([]);
  const authRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navbarRef = useRef(null);
 
  const [currentUser, setCurrentUser] = useState(null);

  const isActive = (path) => location.pathname === path;
  const isAdmin = currentUser?.email?.toLowerCase() === "parshotamworks@gmail.com";

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/analyze", label: "Analyze" },
    { path: "/recruitment", label: "Recruitment" },
    { path: "/pricing", label: "Pricing" },
    { path: "/check-ats-score", label: "ATS Checker" },
    { path: "/templates", label: "Templates" },
    ...(isAdmin ? [{ path: "/admin/payments", label: "Admin" }] : [])
  ];
 
  // ── Mount animation ──────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
 
      // Navbar bar slides down from above
      tl.fromTo(
        navbarRef.current,
        { yPercent: -100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.55 }
      );
 
      // Logo fades + slides in from the left
      tl.fromTo(
        logoRef.current,
        { x: -24, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45 },
        "-=0.25"
      );
 
      // Nav links stagger in from above
      if (navLinksRef.current.length) {
        tl.fromTo(
          navLinksRef.current,
          { y: -12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, stagger: 0.08 },
          "-=0.2"
        );
      }
 
      // Auth buttons slide in from the right
      if (authRef.current) {
        tl.fromTo(
          authRef.current,
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4 },
          "-=0.25"
        );
      }
    });
 
    return () => ctx.revert();
  }, []);
 
  // ── Mobile menu open/close animation ────────────────────────────
  useEffect(() => {
    if (!mobileMenuRef.current) return;
 
    if (mobileOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.35, ease: "power2.out" }
      );
      // Stagger the menu items inside
      const items = mobileMenuRef.current.querySelectorAll("button");
      gsap.fromTo(
        items,
        { x: -16, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.28, stagger: 0.06, ease: "power2.out", delay: 0.1 }
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      });
    }
  }, [mobileOpen]);
 
  // ── Nav link hover handler ───────────────────────────────────────
  const handleLinkHover = (el) => {
    gsap.to(el, { scale: 1.06, duration: 0.18, ease: "power1.out" });
  };
  const handleLinkLeave = (el) => {
    gsap.to(el, { scale: 1, duration: 0.18, ease: "power1.in" });
  };
 
  // ── Profile fetch ────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchProfile();
        if (res && res.user) {
          setLogin(true);
          setCurrentUser(res.user);
        } else {
          setLogin(false);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setLogin(false);
        setCurrentUser(null);
      }
    };
    fetchData();
  }, [location.pathname]);
 
  return (
    <nav
      ref={navbarRef}
      className="sticky top-0 z-50 bg-white/75 backdrop-blur-md border-b border-slate-200/50 shadow-sm shadow-slate-100/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
 
          {/* ── Logo ── */}
          <div
            ref={logoRef}
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="p-2 rounded-lg">
              <img src={Logo} className="w-10 h-10" alt="Resume Logo" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-400">
                Resume Ai
              </h1>
              <p className="text-xs text-gray-500 leading-none">Powered by AI</p>
            </div>
            <h1 className="sm:hidden text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-400">
              Resume Ai
            </h1>
          </div>
          <>
            {/* ── Desktop nav links ── */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link, i) => (
                <Link
                  key={link.path}
                  to={link.path}
                  ref={(el) => (navLinksRef.current[i] = el)}
                  onMouseEnter={(e) => handleLinkHover(e.currentTarget)}
                  onMouseLeave={(e) => handleLinkLeave(e.currentTarget)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? "text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-100/50 border border-blue-100/30"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-50/60"
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  )}
                </Link>
              ))}
            </div>

            {/* ── Desktop auth ── */}
            {showAuthButtons && (
              <div ref={authRef}>
                {!login ? (
                  <div className="hidden md:flex items-center space-x-3">
                    <button
                      onClick={() => navigate("/login")}
                      onMouseEnter={(e) => handleLinkHover(e.currentTarget)}
                      onMouseLeave={(e) => handleLinkLeave(e.currentTarget)}
                      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate("/signup")}
                      onMouseEnter={(e) => handleLinkHover(e.currentTarget)}
                      onMouseLeave={(e) => handleLinkLeave(e.currentTarget)}
                      className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 transition"
                    >
                      Get Started
                    </button>
                  </div>
                ) : (
                  <div className="hidden md:block">
                    <button
                      onClick={() => navigate("/profile")}
                      onMouseEnter={(e) => handleLinkHover(e.currentTarget)}
                      onMouseLeave={(e) => handleLinkLeave(e.currentTarget)}
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
              </div>
            )}

            {/* ── Mobile toggle ── */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-gray-600 hover:text-blue-600 transition"
              >
                {mobileOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                )}
              </button>
            </div>
          </>
        </div>

        {/* ── Mobile menu (animated via ref) ── */}
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t border-gray-200 bg-white overflow-hidden"
          style={{ height: 0, opacity: 0 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition ${
                  isActive(link.path)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex flex-col items-start px-2 space-y-1">
              <button
                onClick={() => { navigate("/profile"); setMobileOpen(false); }}
                className="px-1 py-1 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition"
              >
                Account
              </button>
            </div>

            {!login && showAuthButtons && (
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => { navigate("/login"); setMobileOpen(false); }}
                  className="w-full px-3 py-2 text-base font-medium border border-gray-300 rounded-md hover:text-blue-600 hover:border-blue-600 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { navigate("/signup"); setMobileOpen(false); }}
                  className="w-full px-3 py-2 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 transition"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

 