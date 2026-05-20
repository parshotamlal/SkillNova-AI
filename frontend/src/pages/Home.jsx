import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Upload, Brain, Target, Star, ChevronDown } from "lucide-react";
import { IoDocumentOutline } from "react-icons/io5";

import { gsap } from "gsap";
import SEO from "../components/SEO";
 
export default function Index() {
  const navigate = useNavigate();
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
 
    const cards = cardsRef.current;
    const chips = flowChipsRef.current;
    const stats = statsRef.current;
 
    // ── Set initial states ─────────────────────────────────────────
    gsap.set(heroTagRef.current,      { opacity: 0, y: -24 });
    gsap.set(heroTitleRef.current,    { opacity: 0, y: 40 });
    gsap.set(heroSubRef.current,      { opacity: 0, y: 30 });
    gsap.set(heroBtnRef.current,      { opacity: 0, y: 20, scale: 0.9 });
    gsap.set(illustrationRef.current, { opacity: 0, scale: 0.85, rotate: 6 });
    gsap.set(chips,  { opacity: 0, y: 28 });
    gsap.set(cards,  { opacity: 0, y: 100, rotateX: 40, scale: 0.85, transformPerspective: 1000 });
    gsap.set(stats,  { opacity: 0, x: -20 });
    gsap.set([orb1Ref.current, orb2Ref.current], { scale: 0.5, opacity: 0 });
 
    // ── Master entrance timeline ───────────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
 
    tl
      .to([orb1Ref.current, orb2Ref.current], { scale: 1, opacity: 1, duration: 1.6, stagger: 0.3, ease: "power2.out" }, 0)
      .to(heroTagRef.current,      { opacity: 1, y: 0, duration: 0.7 }, 0.3)
      .to(heroTitleRef.current,    { opacity: 1, y: 0, duration: 0.9 }, 0.5)
      .to(heroSubRef.current,      { opacity: 1, y: 0, duration: 0.8 }, 0.75)
      .to(heroBtnRef.current,      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.4)" }, 0.95)
      .to(illustrationRef.current, { opacity: 1, scale: 1, rotate: 3, duration: 1, ease: "back.out(1.2)" }, 1.1)
      .to(chips,  { opacity: 1, y: 0, duration: 0.55, stagger: 0.13, ease: "back.out(1.5)" }, 1.3)
      .to(cards,  { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1, stagger: 0.18, ease: "back.out(1.2)" }, 1.5)
      .to(stats,  { opacity: 1, x: 0, duration: 0.55, stagger: 0.1 }, 2.1);
 
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
    gsap.to(orb1Ref.current, { x: 35, y: 25, duration: 9,  repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(orb2Ref.current, { x: -28, y: -20, duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut" });
 
    // ── Chip float ─────────────────────────────────────────────────
    gsap.to(chips, {
      y: -7, duration: 2.4,
      stagger: { each: 0.35, from: "center" },
      repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2,
    });
 
    // ── Card 3D tilt + floating ────────────────────────────────────
    const cardCleanups = cards.map((card, floatIndex) => {
      gsap.to(card, {
        y: floatIndex % 2 === 0 ? -10 : -16,
        duration: 2.2 + floatIndex * 0.5,
        repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.5,
      });
 
      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const rotateY = gsap.utils.mapRange(0, rect.width,  -12, 12,  e.clientX - rect.left);
        const rotateX = gsap.utils.mapRange(0, rect.height,  12, -12, e.clientY - rect.top);
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
      gsap.to(orb1Ref.current, { x: px * 50 - 25, y: py * 35 - 17, duration: 1.8, ease: "power1.out", overwrite: "auto" });
      gsap.to(orb2Ref.current, { x: -px * 35 + 17, y: -py * 28 + 14, duration: 2.2, ease: "power1.out", overwrite: "auto" });
    };
    const page = pageRef.current;
    page?.addEventListener("mousemove", onPageMove);
 
    // ── Stat counters ──────────────────────────────────────────────
    [
      { idx: 0, end: 98,  suffix: "%" },
      { idx: 1, end: 3,   suffix: "s" },
      { idx: 2, end: 50,  suffix: "k+" },
    ].forEach(({ idx, end, suffix }) => {
      const numEl = stats[idx]?.querySelector(".stat-number");
      if (!numEl) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: end, duration: 1.8, delay: 2.2, ease: "power2.out",
        onUpdate() { numEl.textContent = Math.round(obj.val) + suffix; },
      });
    });
 
    return () => {
      tl.kill();
      page?.removeEventListener("mousemove", onPageMove);
      cardCleanups.forEach((fn) => fn());
    };
  }, [isLoading]);
 
  // ── Payment / load effect (original) ─────────────────────────────
  useEffect(() => {
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
 
    const handleLoad = () => setIsLoading(false);
 
    if (document.readyState === "complete") {
      setIsLoading(false);
    } else {
      window.addEventListener("load", handleLoad);
    }
 
    return () => window.removeEventListener("load", handleLoad);
  }, []);
 
  // ── Loading screen (original) ─────────────────────────────────────
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
        title="ResumeAi Online | Best AI Resume Analyzer & ATS Checker"
        description="Optimize your resume with our AI-powered ATS resume checker. Get instant feedback, match jobs accurately, and boost your interview chances with ResumeAi Online."
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
 
            <h1 ref={heroTitleRef} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              AI Resume Analyzer
            </h1>
 
            <p ref={heroSubRef} className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              Upload your resume and job description to get instant feedback and match score.
            </p>
 
 <div ref={heroBtnRef} className="flex flex-col sm:flex-row justify-center items-center gap-4">
 
            <button
              aria-label="Check ATS Score"
              onClick={() => navigate("/check-ats-score")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 inline-flex items-center"
            >
              <IoDocumentOutline className="mr-2 h-5 w-5" aria-hidden="true" />
              Check ATS Score
            </button>
            <button
              aria-label="Start Analyzing Resume"
              onClick={() => navigate("/analyze")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 inline-flex items-center"
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
 
          {/* Feature Cards — original structure, GSAP-powered */}
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

        {/* ── Testimonials Section ──────────────────────────────────────── */}
        <section className="mt-32" aria-labelledby="testimonials-heading">
          <div className="text-center mb-12">
            <h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Loved by Job Seekers</h2>
            <p className="text-xl text-gray-600">See how ResumeAi Online has helped professionals land their dream jobs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", role: "Software Engineer", text: "ResumeAi Online's ATS checker highlighted exactly what my resume was missing. I got 3 interviews in a week after updating it!" },
              { name: "Michael T.", role: "Product Manager", text: "The AI feedback is incredibly detailed and accurate. It's like having a professional resume writer by your side 24/7." },
              { name: "Emily R.", role: "Marketing Specialist", text: "I struggled with getting past the ATS filters. Thanks to ResumeAi Online, my resume score went from 45% to 92%." }
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

        {/* ── FAQ Section ──────────────────────────────────────────────── */}
        <section className="mt-32 mb-10" aria-labelledby="faq-heading">
          <div className="text-center mb-12">
            <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about our AI Resume Analyzer.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "How does the ATS Resume Checker work?", a: "Our AI scans your resume against standard Applicant Tracking System (ATS) algorithms. It checks for keywords, formatting, and relevance to provide a match score and actionable feedback." },
              { q: "Is ResumeAi Online free to use?", a: "Yes! We offer a completely free tier that allows you to analyze your resume and get essential feedback to improve your job application." },
              { q: "How accurate is the AI feedback?", a: "Our AI is trained on millions of successful resumes and job descriptions, providing industry-standard accuracy of up to 98% in predicting ATS compatibility." }
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

      </main>
    </div>
  );
}