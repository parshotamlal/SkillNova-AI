'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Lock } from "lucide-react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import { signupUser, googleAuth } from "../services/api";
import { gsap } from "gsap";
import GoogleSignupButton from "../components/common/GoogleSignUpButton";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import SEO from "../components/SEO";
 
export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleAuthPending, setIsGoogleAuthPending] = useState(false);

  // Handle Firebase redirect result
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const user = result.user;
          const data = await googleAuth(user.displayName, user.email, user.uid);
          if (data.message === "Login successful" || data.message === "Signup successful") {
            toast.success("Successfully logged in with Google!");
            router.push("/");
          } else {
            setError(data.message || "Google authentication failed");
            toast.error(data.message || "Failed to authenticate with Google.");
          }
        }
      })
      .catch((err) => {
        console.error("Redirect Google Auth Error:", err);
      });
  }, [router]);
 
  // ── Refs ───────────────────────────────────────────────────────────
  const pageRef      = useRef(null);
  const orb1Ref      = useRef(null);
  const orb2Ref      = useRef(null);
  const cardRef      = useRef(null);
  const backBtnRef   = useRef(null);
  const headingRef   = useRef(null);
  const subRef       = useRef(null);
  const nameRowRef   = useRef(null);
  const emailRowRef  = useRef(null);
  const passRowRef   = useRef(null);
  const submitBtnRef = useRef(null);
  const footerRef    = useRef(null);
  const errorRef     = useRef(null);
 
  // ── GSAP entrance ──────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (orb1Ref.current && orb2Ref.current) gsap.set([orb1Ref.current, orb2Ref.current], { scale: 0.5, opacity: 0 });
      if (cardRef.current) gsap.set(cardRef.current, { opacity: 0, y: 50, scale: 0.96 });
      if (backBtnRef.current) gsap.set(backBtnRef.current, { opacity: 0, x: -16 });
      if (headingRef.current) gsap.set(headingRef.current, { opacity: 0, y: 20 });
      if (subRef.current) gsap.set(subRef.current, { opacity: 0, y: 14 });
      if (nameRowRef.current) gsap.set(nameRowRef.current, { opacity: 0, y: 20 });
      if (emailRowRef.current) gsap.set(emailRowRef.current, { opacity: 0, y: 20 });
      if (passRowRef.current) gsap.set(passRowRef.current, { opacity: 0, y: 20 });
      if (submitBtnRef.current) gsap.set(submitBtnRef.current, { opacity: 0, y: 16 });
      if (footerRef.current) gsap.set(footerRef.current, { opacity: 0, y: 12 });
 
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
 
      if (orb1Ref.current && orb2Ref.current) {
        tl.to([orb1Ref.current, orb2Ref.current], { scale: 1, opacity: 1, duration: 1.6, stagger: 0.3, ease: "power2.out" }, 0);
      }
      if (cardRef.current) tl.to(cardRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.2)" }, 0.2);
      if (backBtnRef.current) tl.to(backBtnRef.current, { opacity: 1, x: 0, duration: 0.4 }, 0.45);
      if (headingRef.current) tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.5);
      if (subRef.current) tl.to(subRef.current, { opacity: 1, y: 0, duration: 0.45 }, 0.6);
      if (nameRowRef.current) tl.to(nameRowRef.current, { opacity: 1, y: 0, duration: 0.45 }, 0.65);
      if (emailRowRef.current) tl.to(emailRowRef.current, { opacity: 1, y: 0, duration: 0.45 }, 0.73);
      if (passRowRef.current) tl.to(passRowRef.current, { opacity: 1, y: 0, duration: 0.45 }, 0.81);
      if (submitBtnRef.current) tl.to(submitBtnRef.current, { opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.4)" }, 0.89);
      if (footerRef.current) tl.to(footerRef.current, { opacity: 1, y: 0, duration: 0.4 }, 0.97);
 
      if (orb1Ref.current) gsap.to(orb1Ref.current, { x: 30, y: 20, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      if (orb2Ref.current) gsap.to(orb2Ref.current, { x: -25, y: -18, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
 
      const onMove = (e) => {
        const px = e.clientX / window.innerWidth;
        const py = e.clientY / window.innerHeight;
        if (orb1Ref.current) gsap.to(orb1Ref.current, { x: px * 45 - 22, y: py * 30 - 15, duration: 1.8, ease: "power1.out", overwrite: "auto" });
        if (orb2Ref.current) gsap.to(orb2Ref.current, { x: -px * 30 + 15, y: -py * 24 + 12, duration: 2.2, ease: "power1.out", overwrite: "auto" });
      };
      const page = pageRef.current;
      page?.addEventListener("mousemove", onMove);
 
      return () => {
        page?.removeEventListener("mousemove", onMove);
      };
    });
 
    return () => ctx.revert();
  }, []);
 
  // ── Error shake animation ──────────────────────────────────────────
  useEffect(() => {
    if (!error || !cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { x: -8 },
      { x: 8, duration: 0.08, repeat: 5, yoyo: true, ease: "power1.inOut", onComplete: () => gsap.set(cardRef.current, { x: 0 }) }
    );
    if (errorRef.current) {
      gsap.fromTo(errorRef.current, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
    }
  }, [error]);
 
  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
 
    if (submitBtnRef.current) {
      gsap.to(submitBtnRef.current, { scale: 0.96, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" });
    }
 
    try {
      const data = await signupUser(name, email, password);
 
      if (data.message === "Signup successful") {
        toast.success("Successfully registered!");
        gsap.to(cardRef.current, {
          opacity: 0, y: -30, scale: 0.95, duration: 0.4, ease: "power2.in",
          onComplete: () => router.push("/"),
        });
      } else {
        setError(data.message || "Something went wrong");
        toast.error("Failed to sign up.");
      }
    } catch (err) {
      setError("Failed to sign up. Please try again later.");
      toast.error("Failed to sign up.");
    }
  };

  // ── Google Auth ────────────────────────────────────────────────────
  const handleGoogleAuth = async () => {
    if (isGoogleAuthPending) return;
    setIsGoogleAuthPending(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userName = user.displayName || user.email?.split("@")[0] || "User";
      
      const data = await googleAuth(userName, user.email, user.uid);

      if (data.message === "Login successful" || data.message === "Signup successful") {
        toast.success("Successfully logged in with Google!");
        gsap.to(cardRef.current, {
          opacity: 0, y: -30, scale: 0.95, duration: 0.4, ease: "power2.in",
          onComplete: () => router.push("/"),
        });
      } else {
        setError(data.message || "Google authentication failed");
        toast.error(data.message || "Failed to authenticate with Google.");
      }
    } catch (error) {
      console.error("Google auth error:", error);
      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/cancelled-popup-request" ||
        (error.message && error.message.includes("INTERNAL ASSERTION FAILED"))
      ) {
        console.log("Popup blocked or cancelled, attempting redirect fallback...");
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          console.error("Redirect fallback error:", redirectErr);
          setError("Google sign-in popup was blocked by browser. Please allow popups or try again.");
        }
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing authentication.");
      } else {
        setError(error.message || "Google authentication failed. Please try again.");
        toast.error("Failed to authenticate with Google.");
      }
    } finally {
      setIsGoogleAuthPending(false);
    }
  };
 
  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4 relative overflow-hidden"
    >
      <SEO
        title="Create Free Account — ResumeAI Online"
        description="Join ResumeAI Online to build ATS-friendly resumes, optimize your job match score, and land your next dream role."
        url="/signup"
        noindex={true}
      />
      <div
        ref={orb1Ref}
        className="pointer-events-none absolute -top-28 -left-36 w-[480px] h-[480px] rounded-full bg-blue-200/40"
        style={{ filter: "blur(90px)" }}
      />
      <div
        ref={orb2Ref}
        className="pointer-events-none absolute -bottom-20 -right-28 w-[400px] h-[400px] rounded-full bg-teal-200/40"
        style={{ filter: "blur(80px)" }}
      />
 
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        style={{ transformStyle: "preserve-3d" }}
      >
        <button
          ref={backBtnRef}
          onClick={() => router.push("/")}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </button>
 
        <div className="mb-6 text-center">
          <h1 ref={headingRef} className="text-2xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p ref={subRef} className="text-gray-600">
            Sign up to start analyzing your resumes with AI
          </p>
        </div>
 
        <form onSubmit={handleSubmit} className="space-y-5">
          <div ref={nameRowRef}>
            <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full py-3 pl-10 pr-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>
          </div>
 
          <div ref={emailRowRef}>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-3 pl-10 pr-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
          </div>
 
          <div ref={passRowRef}>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full py-3 pl-10 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-black"
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters long
            </p>
          </div>
 
          {error && (
            <div ref={errorRef} className="text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}
 
          <button
            ref={submitBtnRef}
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition cursor-pointer"
          >
            Create Account
          </button>
        </form>
        
        <div className="flex items-center justify-center mt-5">
          <GoogleSignupButton onClick={handleGoogleAuth} />
        </div>
 
        <p ref={footerRef} className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
 
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}