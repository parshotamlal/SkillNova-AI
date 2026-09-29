'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Upload, Brain, Target, Star, ChevronDown } from "lucide-react";
import { IoDocumentOutline } from "react-icons/io5";
import { gsap } from "gsap";
import SEO from "../components/SEO";
 
export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
 
  const cardsRef = useRef([]);
  const heroTagRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroBtnRef = useRef(null);
  const illustrationRef = useRef(null);
  const flowChipsRef = useRef([]);
  const statsRef = useRef([]);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const pageRef = useRef(null);
 
  // ── GSAP Animations (runs after loading) ──────────────────────────
  useEffect(() => {
    if (isLoading) return;
 
    const cards = cardsRef.current.filter(Boolean);
    const chips = flowChipsRef.current.filter(Boolean);
    const stats = statsRef.current.filter(Boolean);
 
    // ── Set initial states ─────────────────────────────────────────
    if (heroTagRef.current) gsap.set(heroTagRef.current, { opacity: 0, y: -24 });
    if (heroTitleRef.current) gsap.set(heroTitleRef.current, { opacity: 0, y: 40 });
    if (heroSubRef.current) gsap.set(heroSubRef.current, { opacity: 0, y: 30 });
    if (heroBtnRef.current) gsap.set(heroBtnRef.current, { opacity: 0, y: 20, scale: 0.9 });
    if (illustrationRef.current) gsap.set(illustrationRef.current, { opacity: 0, scale: 0.85, rotate: 6 });
    if (chips.length) gsap.set(chips, { opacity: 0, y: 28 });
    if (cards.length) gsap.set(cards, { opacity: 0, y: 100, rotateX: 40, scale: 0.85, transformPerspective: 1000 });
    if (stats.length) gsap.set(stats, { opacity: 0, x: -20 });
    if (orb1Ref.current && orb2Ref.current) {
      gsap.set([orb1Ref.current, orb2Ref.current], { scale: 0.5, opacity: 0 });
    }
 
    // ── Master entrance timeline ───────────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
 
    if (orb1Ref.current && orb2Ref.current) {
      tl.to([orb1Ref.current, orb2Ref.current], { scale: 1, opacity: 1, duration: 1.6, stagger: 0.3, ease: "power2.out" }, 0);
    }
    if (heroTagRef.current) tl.to(heroTagRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.3);
    if (heroTitleRef.current) tl.to(heroTitleRef.current, { opacity: 1, y: 0, duration: 0.9 }, 0.5);
    if (heroSubRef.current) tl.to(heroSubRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.75);
    if (heroBtnRef.current) tl.to(heroBtnRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.4)" }, 0.95);
    if (illustrationRef.current) tl.to(illustrationRef.current, { opacity: 1, scale: 1, rotate: 3, duration: 1, ease: "back.out(1.2)" }, 1.1);
    if (chips.length) tl.to(chips, { opacity: 1, y: 0, duration: 0.55, stagger: 0.13, ease: "back.out(1.5)" }, 1.3);
    if (cards.length) tl.to(cards, { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1, stagger: 0.18, ease: "back.out(1.2)" }, 1.5);
    if (stats.length) tl.to(stats, { opacity: 1, x: 0, duration: 0.55, stagger: 0.1 }, 2.1);
 
    // ── Illustration hover wobble ──────────────────────────────────
    const illus = illustrationRef.current;
    if (illus) {
      illus.addEventListener("mouseenter", () =>
        gsap.to(illus, { rotate: 0, scale: 1.03, duration: 0.45, ease: "power2.out" })
      );
      illus.addEventListener("mouseleave", () =>
        gsap.to(illus, { rotate: 3, scale: 1, duration: 0.55, ease: "power3.out" })
      );
    }
 
    // ── Floating orbs ──────────────────────────────────────────────
    if (orb1Ref.current) gsap.to(orb1Ref.current, { x: 35, y: 25, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
    if (orb2Ref.current) gsap.to(orb2Ref.current, { x: -28, y: -20, duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut" });
 
    // ── Chip float ─────────────────────────────────────────────────
    if (chips.length) {
      gsap.to(chips, {
        y: -7,
        duration: 2.4,
        stagger: { each: 0.35, from: "center" },
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
      });
    }
 
    // ── Card 3D tilt + floating ────────────────────────────────────
    const cardCleanups = cards.map((card, floatIndex) => {
      gsap.to(card, {
        y: floatIndex % 2 === 0 ? -10 : -16,
        duration: 2.2 + floatIndex * 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.5,
      });
 
      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const rotateY = gsap.utils.mapRange(0, rect.width, -12, 12, e.clientX - rect.left);
        const rotateX = gsap.utils.mapRange(0, rect.height, 12, -12, e.clientY - rect.top);
        gsap.to(card, { rotateY, rotateX, scale: 1.05, duration: 0.4, ease: "power2.out", transformPerspective: 1000 });
      };
      const onLeave = () =>
        gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: "power3.out" });
 
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      return () => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      };
    });
 
    // ── Mouse parallax on page ─────────────────────────────────────
    const onPageMove = (e) => {
      const px = e.clientX / window.innerWidth;
      const py = e.clientY / window.innerHeight;
      if (orb1Ref.current) gsap.to(orb1Ref.current, { x: px * 50 - 25, y: py * 35 - 17, duration: 1.8, ease: "power1.out", overwrite: "auto" });
      if (orb2Ref.current) gsap.to(orb2Ref.current, { x: -px * 35 + 17, y: -py * 28 + 14, duration: 2.2, ease: "power1.out", overwrite: "auto" });
    };
    const page = pageRef.current;
    page?.addEventListener("mousemove", onPageMove);
 
    // ── Stat counters ──────────────────────────────────────────────
    [
      { idx: 0, end: 98, suffix: "%" },
      { idx: 1, end: 3, suffix: "s" },
      { idx: 2, end: 50, suffix: "k+" },
    ].forEach(({ idx, end, suffix }) => {
      const numEl = stats[idx]?.querySelector(".stat-number");
      if (!numEl) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: end,
        duration: 1.8,
        delay: 2.2,
        ease: "power2.out",
        onUpdate() {
          numEl.textContent = Math.round(obj.val) + suffix;
        },
      });
    });
 
    return () => {
      tl.kill();
      page?.removeEventListener("mousemove", onPageMove);
      cardCleanups.forEach((fn) => fn());
    };
  }, [isLoading]);
 
  // ── Payment / load effect ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    const paymentSuccess = urlParams.get("payment_success");
 
    if (sessionId || paymentSuccess === "true") {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
 
    const paymentSuccessFlag = localStorage.getItem("paymentSuccess");
    if (paymentSuccessFlag === "true") {
      localStorage.removeItem("paymentSuccess");
    }
 
    setIsLoading(false);
  }, []);
 
  // ── Loading screen ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }
 
  // ── Page ──────────────────────────────────────────────────────────
  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden"
    >
      <SEO
        title="Free AI Resume Builder | ATS Score Checker & 50+ Templates — ResumeAI Online"
        description="Build a job-winning ATS resume in 5 minutes with AI. Free resume builder, ATS score checker, 50+ templates & cover letter generator. Trusted by 100,000+ freshers, software engineers & professionals in India, USA & UK."
        url="/"
        keywords="AI resume builder, free resume builder, ATS resume checker, ATS score checker free, resume builder India, resume for freshers, software engineer resume, online resume builder, resume templates, resume maker, AI CV builder, free ATS checker, resume optimizer, best resume builder 2026"
        schemaType="home"
        showFaq={true}
        showHowTo={true}
        howToTitle="How to Create an ATS-Optimized Resume with AI"
        howToDescription="Follow these 5 steps to build a resume that passes ATS screening and lands you more interviews."
        howToSteps={[
          { name: 'Upload or Start Your Resume', text: 'Choose a blank resume or upload your existing resume file (PDF). Our AI instantly detects your current information.', url: '/analyze' },
          { name: 'Select an ATS-Friendly Template', text: 'Pick from 50+ professionally designed ATS resume templates. All templates pass standard ATS parsing tests.', url: '/templates' },
          { name: 'Add Keywords from Job Description', text: 'Paste the job description and our AI automatically suggests missing keywords to improve your ATS match score.' },
          { name: 'Check Your ATS Score', text: 'Get an instant ATS compatibility score from 0–100. See exactly which keywords are missing and how to fix formatting issues.', url: '/check-ats-score' },
          { name: 'Download as ATS-Ready PDF', text: 'Export your polished, ATS-optimized resume as a high-quality PDF instantly — no watermarks, no sign-up required.' },
        ]}
      />
      {/* Floating background orbs */}
      <div
        ref={orb1Ref}
        className="pointer-events-none absolute -top-32 -left-40 w-[520px] h-[520px] rounded-full bg-blue-200/40"
        style={{ filter: "blur(90px)" }}
      />
      <div
        ref={orb2Ref}
        className="pointer-events-none absolute -bottom-20 -right-32 w-[420px] h-[420px] rounded-full bg-teal-200/40"
        style={{ filter: "blur(80px)" }}
      />
 
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center">
          <div className="max-w-3xl mx-auto">
 
            {/* Animated pill badge */}
            <div
              ref={heroTagRef}
              className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/80 border border-blue-200 text-blue-600"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              AI-Powered Career Tool
            </div>
 
            <h1 ref={heroTitleRef} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Optimize Your Resume with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-400">AI Intelligence</span>
            </h1>
 
            <p ref={heroSubRef} className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Get detailed ATS score checks, section-by-section improvements, and instant professional templates designed to land you interviews.
            </p>
            <div ref={heroBtnRef} className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                aria-label="Check ATS Score"
                onClick={() => router.push("/check-ats-score")}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-base font-semibold rounded-2xl shadow-lg shadow-blue-500/15 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 inline-flex items-center justify-center cursor-pointer"
              >
                <IoDocumentOutline className="mr-2 h-5 w-5" aria-hidden="true" />
                Check ATS Score
              </button>
              <button
                aria-label="Start Analyzing Resume"
                onClick={() => router.push("/analyze")}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 text-base font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 inline-flex items-center justify-center cursor-pointer"
              >
                <Upload className="mr-2 h-5 w-5" aria-hidden="true" />
                Start Analyzing
              </button>
            </div>
 
            {/* Stats row */}
            <div className="flex justify-center gap-10 mt-10 flex-wrap">
              {[
                { label: "Accuracy",  init: "98%"  },
                { label: "Avg. time", init: "3s"   },
                { label: "Resumes",   init: "50k+" },
              ].map((s, i) => (
                <div key={s.label} ref={(el) => (statsRef.current[i] = el)} className="flex flex-col items-center">
                  <span className="stat-number text-2xl font-bold text-blue-600">{s.init}</span>
                  <span className="text-xs text-gray-500 mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
 
          {/* Illustration */}
          <div className="mt-16 lg:mt-20">
            <div className="relative max-w-md mx-auto">
              <div
                ref={illustrationRef}
                className="bg-white rounded-3xl shadow-2xl p-8 cursor-default"
              >
                <div className="bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl p-6">
                  <div className="flex items-center justify-center space-x-4">
                    {[
                      { ref: (el) => (flowChipsRef.current[0] = el), icon: <Upload className="h-8 w-8 text-blue-600" /> },
                      { ref: (el) => (flowChipsRef.current[1] = el), icon: <Brain  className="h-8 w-8 text-teal-600" /> },
                      { ref: (el) => (flowChipsRef.current[2] = el), icon: <Target className="h-8 w-8 text-green-500" /> },
                    ].map((chip, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div ref={chip.ref} className="bg-white rounded-xl p-4 shadow-md">
                          {chip.icon}
                        </div>
                        {i < 2 && <div className="text-2xl text-gray-400">→</div>}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4 font-medium">
                    Upload → Analyze → Match
                  </p>
                </div>
              </div>
            </div>
          </div>
 
          {/* Feature Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8" style={{ perspective: "1000px" }}>
 
            {/* Card 1 */}
            <div
              ref={(el) => (cardsRef.current[0] = el)}
              className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl transition-colors duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="bg-blue-100 rounded-2xl p-4 w-fit mb-6">
                  <Upload className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Upload</h3>
                <p className="text-gray-600 leading-relaxed">
                  Simply drag and drop your resume and job description for instant analysis.
                </p>
              </div>
            </div>
 
            {/* Card 2 */}
            <div
              ref={(el) => (cardsRef.current[1] = el)}
              className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl transition-colors duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="bg-teal-100 rounded-2xl p-4 w-fit mb-6">
                  <Brain className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced AI algorithms analyze and match your skills with job requirements.
                </p>
              </div>
            </div>
 
            {/* Card 3 */}
            <div
              ref={(el) => (cardsRef.current[2] = el)}
              className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl transition-colors duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-lime-500/10 opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="absolute top-0 left-0 w-32 h-32 bg-green-400/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="bg-green-100 rounded-2xl p-4 w-fit mb-6">
                  <Target className="h-7 w-7 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Results</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get detailed feedback and improvement suggestions in seconds.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Why Resumes Fail ATS Section ─────────────────────────────── */}
        <section className="mt-32" aria-labelledby="why-ats-heading">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-600 font-semibold tracking-wider text-xs uppercase bg-blue-100/70 px-3.5 py-1.5 rounded-full">
              Industry Insights
            </span>
            <h2 id="why-ats-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-4">
              Why 75%+ of Resumes Never Reach a Human Recruiter
            </h2>
            <p className="text-gray-600 text-lg">
              Top companies like Google, Amazon, Microsoft, and TCS use Applicant Tracking Systems (ATS) to filter hundreds of applications in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-7 border border-red-100 shadow-lg">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold text-xl mb-5">
                ✕
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unparseable Graphics & Tables</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Complex columns, icons, text boxes, and Photoshop templates confuse ATS parsers like Workday and Greenhouse, resulting in immediate auto-rejection.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-7 border border-amber-100 shadow-lg">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold text-xl mb-5">
                !
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Missing Job Description Keywords</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                If your resume lacks the specific hard skills, technologies, and action verbs required by the job posting, your ATS match score drops below the interview cutoff.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-7 border border-green-100 shadow-lg">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-bold text-xl mb-5">
                ✓
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">The ResumeAI Online Solution</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Our AI scans your resume against the exact target job description, injects optimal keywords with zero keyword stuffing, and formats it to achieve a 90%+ ATS score.
              </p>
            </div>
          </div>
        </section>

        {/* ── Comparison Table (Rank booster for Google Featured Snippets) ── */}
        <section className="mt-32" aria-labelledby="comparison-heading">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-teal-600 font-semibold tracking-wider text-xs uppercase bg-teal-100/70 px-3.5 py-1.5 rounded-full">
              Feature Comparison
            </span>
            <h2 id="comparison-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-4">
              ResumeAI Online vs Traditional Resume Builders
            </h2>
            <p className="text-gray-600 text-lg">
              See why modern job seekers switch from basic graphic templates to AI-native ATS optimization.
            </p>
          </div>

          <div className="overflow-x-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-2 sm:p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 font-bold text-gray-900">Feature</th>
                  <th className="p-4 font-bold text-blue-600 bg-blue-50/70 rounded-t-xl text-center">
                    ResumeAI Online 🚀
                  </th>
                  <th className="p-4 font-medium text-gray-500 text-center">Canva / Word</th>
                  <th className="p-4 font-medium text-gray-500 text-center">Traditional Builders (Zety/Novo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                <tr>
                  <td className="p-4 font-semibold text-gray-800">Instant ATS Compatibility Score</td>
                  <td className="p-4 text-center font-bold text-green-600 bg-blue-50/40">✓ Yes (AI-Powered 0–100)</td>
                  <td className="p-4 text-center text-red-500">✕ No</td>
                  <td className="p-4 text-center text-amber-600">Limited / Paid Only</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-800">Job Description Keyword Matcher</td>
                  <td className="p-4 text-center font-bold text-green-600 bg-blue-50/40">✓ Real-time Matching</td>
                  <td className="p-4 text-center text-red-500">✕ No</td>
                  <td className="p-4 text-center text-red-500">✕ No</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-800">50+ Clean ATS-Tested Templates</td>
                  <td className="p-4 text-center font-bold text-green-600 bg-blue-50/40">✓ 100% ATS Compliant</td>
                  <td className="p-4 text-center text-red-500">✕ Often Fails ATS Parsing</td>
                  <td className="p-4 text-center text-green-600">✓ Partial</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-800">AI Bullet Point & Summary Rewriter</td>
                  <td className="p-4 text-center font-bold text-green-600 bg-blue-50/40">✓ Included Free</td>
                  <td className="p-4 text-center text-red-500">✕ No</td>
                  <td className="p-4 text-center text-amber-600">Paid Subscription</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-800">Watermark-Free High-Res PDF Export</td>
                  <td className="p-4 text-center font-bold text-green-600 bg-blue-50/40">✓ Free Unlimited</td>
                  <td className="p-4 text-center text-green-600">✓ Yes</td>
                  <td className="p-4 text-center text-red-500">✕ Paid Paywall</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Popular Job Categories / Keywords Hub ──────────────────────── */}
        <section className="mt-32" aria-labelledby="categories-heading">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-indigo-600 font-semibold tracking-wider text-xs uppercase bg-indigo-100/70 px-3.5 py-1.5 rounded-full">
              Industry Ready
            </span>
            <h2 id="categories-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-4">
              Resume Templates Tailored For Your Domain
            </h2>
            <p className="text-gray-600 text-lg">
              Explore ATS-compliant formats designed by industry hiring managers across top professions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: "Software Engineer", desc: "Full Stack, Frontend, Backend & DevOps", href: "/templates" },
              { title: "Data Analyst / AI", desc: "Python, SQL, PowerBI & Machine Learning", href: "/templates" },
              { title: "College Freshers", desc: "Zero-experience projects & academic highlights", href: "/templates" },
              { title: "Product Manager", desc: "Agile, Roadmaps, User Growth & KPIs", href: "/templates" },
              { title: "Digital Marketing", desc: "SEO, Performance Ads & Social Media", href: "/templates" },
              { title: "Finance & Accounting", desc: "Financial Modeling, CA, Auditing & Banking", href: "/templates" },
            ].map((cat, i) => (
              <button
                key={i}
                onClick={() => router.push(cat.href)}
                className="text-left bg-white/90 hover:bg-blue-50/80 p-5 rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer group"
              >
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 text-base mb-1">
                  {cat.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {cat.desc}
                </p>
                <span className="inline-block mt-3 text-xs font-semibold text-blue-600">
                  Build Resume →
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Testimonials Section ──────────────────────────────────────── */}
        <section className="mt-32" aria-labelledby="testimonials-heading">
          <div className="text-center mb-12">
            <h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Loved by 100,000+ Job Seekers</h2>
            <p className="text-xl text-gray-600">See how ResumeAI Online has helped candidates land top tech, banking & corporate roles.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", role: "Senior Software Engineer @ FinTech", text: "ResumeAI Online's ATS score checker highlighted exactly which keywords my resume was missing for React & AWS roles. I received 3 interview calls within 7 days!" },
              { name: "Michael T.", role: "Product Manager", text: "The AI summary and bullet point rewriter transformed my generic statements into high-impact, quantifiable achievements. Outstanding quality!" },
              { name: "Emily R.", role: "Marketing Specialist", text: "I struggled getting past corporate ATS filters. With ResumeAI Online, my score climbed from 48% to 94%, and I finally received multiple recruiter callbacks." }
            ].map((testimonial, idx) => (
              <article key={idx} className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-xl relative">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Comprehensive FAQ Section ─────────────────────────────────── */}
        <section className="mt-32 mb-10" aria-labelledby="faq-heading">
          <div className="text-center mb-12">
            <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about ATS resumes, AI analysis & hiring algorithms.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { 
                q: "What is an ATS Friendly Resume?", 
                a: "An ATS (Applicant Tracking System) friendly resume is structured and formatted so automated hiring systems (like Workday, Greenhouse, Taleo, and Lever) can parse and index your work experience, skills, and education without distortion. It avoids unparseable graphic tables, multi-layer text boxes, and incompatible fonts." 
              },
              { 
                q: "How does the ResumeAI Online ATS Score Checker work?", 
                a: "Our AI engine analyzes your uploaded resume against industry-standard ATS parsing algorithms and your target job description. It calculates a compatibility score (0–100) based on keyword density, quantifiable metrics, section clarity, and formatting compliance." 
              },
              { 
                q: "Is ResumeAI Online completely free to use?", 
                a: "Yes! You can analyze your resume, test your ATS score, customize 50+ resume templates, and download clean, watermark-free PDF resumes completely free." 
              },
              { 
                q: "Can freshers with zero experience create a high-scoring ATS resume?", 
                a: "Absolutely. ResumeAI Online provides specialized fresher templates highlighting academic coursework, internships, GitHub/live projects, certifications, and technical proficiencies to ensure high ATS rank even without years of prior employment." 
              },
              { 
                q: "What is considered a good ATS resume score?", 
                a: "An ATS score above 80% is considered strong, while a score of 90%+ puts your application in the top 5% of candidate pools, virtually guaranteeing human recruiter review." 
              },
              { 
                q: "Which file format is better for ATS: PDF or DOCX?", 
                a: "Both PDF and DOCX are accepted by modern ATS systems. ResumeAI Online generates clean, vector-rendered PDF documents that retain 100% font fidelity and structure across all major parsing engines." 
              }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white rounded-xl shadow-sm border border-gray-100 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-gray-900 font-semibold text-lg">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Final Call to Action ──────────────────────────────────────── */}
        <section className="mt-24 mb-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 rounded-3xl p-10 sm:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-blue-100 text-lg sm:text-xl mb-8 leading-relaxed">
              Scan your resume in 3 seconds, beat the ATS filters, and start getting interview callbacks this week.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => router.push("/check-ats-score")}
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-bold rounded-2xl shadow-lg transition-all transform hover:scale-105 cursor-pointer"
              >
                Scan My Resume Free →
              </button>
              <button
                onClick={() => router.push("/templates")}
                className="w-full sm:w-auto bg-blue-700/60 hover:bg-blue-700 text-white border border-white/30 px-8 py-4 text-lg font-semibold rounded-2xl transition-all cursor-pointer"
              >
                Explore 50+ Templates
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

