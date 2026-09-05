import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, HelpCircle, Zap, CreditCard, Settings, MessageCircle, BookOpen } from "lucide-react";
import { gsap } from "gsap";
import SEO from "../components/SEO";
 
const categories = [
  { label: "All",             icon: BookOpen   },
  { label: "Getting Started", icon: Zap        },
  { label: "Analysis",        icon: Settings   },
  { label: "Billing",         icon: CreditCard },
  { label: "Account",         icon: HelpCircle },
];
 
const faqs = [
  {
    category: "Getting Started",
    items: [
      {
        q: "How do I upload my resume?",
        a: "Click 'Start Analyzing' on the home page, then drag and drop your resume PDF or DOCX file into the upload area. You can also click to browse files from your device.",
      },
      {
        q: "What file formats are supported?",
        a: "We support PDF, DOCX, and TXT formats. PDF is recommended for the best parsing accuracy. Files must be under 10MB.",
      },
      {
        q: "Is my data secure?",
        a: "Yes. All files are encrypted in transit using TLS 1.3 and at rest using AES-256. Resume files are automatically deleted from our servers within 24 hours of analysis.",
      },
      {
        q: "Do I need an account to use Resume Ai?",
        a: "You can run a single free analysis without an account. To save results, access history, and unlock premium features, you'll need to create a free account.",
      },
    ],
  },
  {
    category: "Analysis",
    items: [
      {
        q: "How long does the analysis take?",
        a: "Most analyses complete in under 3 seconds. Complex or multi-page resumes may take up to 10 seconds depending on server load.",
      },
      {
        q: "What does the match score mean?",
        a: "The match score (0–100%) reflects how well your resume aligns with the job description, based on skills, keywords, experience level, and formatting quality.",
      },
      {
        q: "Can I re-analyze after editing my resume?",
        a: "Absolutely. Simply re-upload your updated resume along with the job description. Each analysis is independent and generates a fresh score.",
      },
      {
        q: "How accurate is the AI analysis?",
        a: "Our AI achieves ~98% accuracy on standard resume formats. Unusual layouts or image-based PDFs may reduce accuracy — we recommend submitting text-based PDFs for best results.",
      },
    ],
  },
  {
    category: "Billing",
    items: [
      {
        q: "Can I cancel my subscription?",
        a: "Yes, you can cancel anytime from your Profile → Billing settings. You'll retain full access until the end of your current billing period — no hidden fees.",
      },
      {
        q: "Do you offer refunds?",
        a: "We offer a 7-day money-back guarantee for all paid plans. To request a refund, contact support@resumeai.com within 7 days of your purchase.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, Amex), UPI, and net banking via our secure payment partner Stripe.",
      },
    ],
  },
  {
    category: "Account",
    items: [
      {
        q: "How do I reset my password?",
        a: "Click 'Sign In' → 'Forgot password?' and enter your email address. You'll receive a reset link within a few minutes. Check your spam folder if it doesn't arrive.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Go to Profile → Settings → Delete Account. This permanently removes all your data, analysis history, and subscription. This action cannot be undone.",
      },
      {
        q: "How do I update my email address?",
        a: "Navigate to Profile → Settings → Account Details. Enter your new email and confirm with your current password. A verification link will be sent to your new address.",
      },
    ],
  },
];
 
export default function HelpCenter() {
  const navigate = useNavigate();
  const [query, setQuery]                   = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openItem, setOpenItem]             = useState(null);
 
  const pageRef       = useRef(null);
  const badgeRef      = useRef(null);
  const titleRef      = useRef(null);
  const subtitleRef   = useRef(null);
  const searchRef     = useRef(null);
  const catsRef       = useRef([]);
  const faqGroupsRef  = useRef([]);
  const ctaRef        = useRef(null);
  const orb1Ref       = useRef(null);
  const orb2Ref       = useRef(null);
  const answerRefs    = useRef({});
 
  // ── Entrance animation ──────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
 
    gsap.set([orb1Ref.current, orb2Ref.current], { scale: 0.4, opacity: 0 });
    gsap.set(badgeRef.current,     { opacity: 0, y: -20 });
    gsap.set(titleRef.current,     { opacity: 0, y: 40  });
    gsap.set(subtitleRef.current,  { opacity: 0, y: 25  });
    gsap.set(searchRef.current,    { opacity: 0, y: 20, scale: 0.97 });
    gsap.set(catsRef.current,      { opacity: 0, y: 18  });
    gsap.set(faqGroupsRef.current, { opacity: 0, y: 40  });
    gsap.set(ctaRef.current,       { opacity: 0, y: 30  });
 
    tl
      .to([orb1Ref.current, orb2Ref.current], { scale: 1, opacity: 1, duration: 1.6, stagger: 0.3, ease: "power2.out" }, 0)
      .to(badgeRef.current,     { opacity: 1, y: 0, duration: 0.6 }, 0.2)
      .to(titleRef.current,     { opacity: 1, y: 0, duration: 0.8 }, 0.4)
      .to(subtitleRef.current,  { opacity: 1, y: 0, duration: 0.7 }, 0.6)
      .to(searchRef.current,    { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.3)" }, 0.8)
      .to(catsRef.current,      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "back.out(1.5)" }, 1.0)
      .to(faqGroupsRef.current, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 }, 1.3)
      .to(ctaRef.current,       { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.2)" }, 1.8);
 
    // Floating orbs idle
    gsap.to(orb1Ref.current, { x: 30,  y: 20,  duration: 9,  repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(orb2Ref.current, { x: -25, y: -18, duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut" });
 
    // Mouse parallax
    const onMove = (e) => {
      const px = e.clientX / window.innerWidth;
      const py = e.clientY / window.innerHeight;
      gsap.to(orb1Ref.current, { x: px * 50 - 25, y: py * 35 - 17, duration: 1.8, ease: "power1.out", overwrite: "auto" });
      gsap.to(orb2Ref.current, { x: -px * 35 + 17, y: -py * 28 + 14, duration: 2.2, ease: "power1.out", overwrite: "auto" });
    };
    const page = pageRef.current;
    page?.addEventListener("mousemove", onMove);
 
    return () => {
      tl.kill();
      page?.removeEventListener("mousemove", onMove);
    };
  }, []);
 
  // ── Animated accordion toggle ───────────────────────────────────
  const toggleItem = (key) => {
    if (openItem === key) {
      const el = answerRefs.current[key];
      if (el) {
        gsap.to(el, { height: 0, opacity: 0, duration: 0.32, ease: "power2.inOut", onComplete: () => setOpenItem(null) });
      }
    } else {
      // Close previous
      if (openItem && answerRefs.current[openItem]) {
        gsap.to(answerRefs.current[openItem], { height: 0, opacity: 0, duration: 0.25, ease: "power2.in" });
      }
      setOpenItem(key);
      requestAnimationFrame(() => {
        const el = answerRefs.current[key];
        if (el) {
          gsap.fromTo(el, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" });
        }
      });
    }
  };
 
  // ── Category switch ─────────────────────────────────────────────
  const handleCategoryClick = (label, idx) => {
    setActiveCategory(label);
    setOpenItem(null);
    gsap.fromTo(catsRef.current[idx], { scale: 0.88 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
    gsap.fromTo(faqGroupsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, ease: "power3.out" });
  };
 
  // ── Filter ──────────────────────────────────────────────────────
  const filtered = faqs
    .filter((cat) => activeCategory === "All" || cat.category === activeCategory)
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(query.toLowerCase()) ||
          item.a.toLowerCase().includes(query.toLowerCase())
      ),
    }));

  const allFaqItems = useMemo(() => {
    return faqs.flatMap((c) => c.items);
  }, []);

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden"
    >
      <SEO
        title="Help Center & FAQs — Support, Guides & ATS Tips | ResumeAI Online"
        description="Find answers to frequently asked questions about ResumeAI Online, ATS scoring, resume uploads, privacy, templates, and subscription plans."
        url="/help-center"
        keywords="ResumeAI help, ATS checker FAQ, resume builder support, how to check ATS score, ATS resume format help"
        schemaType="page"
        showBreadcrumb={true}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Help Center", url: "/help-center" },
        ]}
        showFaq={true}
        faqItems={allFaqItems}
      />
      {/* Background orbs */}
      <div ref={orb1Ref} className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-200/40" style={{ filter: "blur(90px)" }} />
      <div ref={orb2Ref} className="pointer-events-none absolute -bottom-24 -right-32 w-[420px] h-[420px] rounded-full bg-teal-200/40" style={{ filter: "blur(80px)" }} />
 
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
 
        {/* ── Header ── */}
        <div className="text-center mb-12">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/80 border border-blue-200 text-blue-600 mb-5"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Help Center
          </div>
          <h1 ref={titleRef} className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How can we help?
          </h1>
          <p ref={subtitleRef} className="text-gray-500 text-lg">
            Search our knowledge base or browse by category.
          </p>
        </div>
 
        {/* ── Search ── */}
        <div ref={searchRef} className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpenItem(null); }}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white/80 shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-sm"
            style={{ backdropFilter: "blur(8px)" }}
          />
        </div>
 
        {/* ── Category pills ── */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {categories.map(({ label, icon: Icon }, idx) => {
            const active = activeCategory === label;
            return (
              <button
                key={label}
                ref={(el) => (catsRef.current[idx] = el)}
                onClick={() => handleCategoryClick(label, idx)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                    : "bg-white/80 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
 
        {/* ── FAQ groups ── */}
        <div className="space-y-10">
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <MessageCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No results for "{query}"</p>
              <p className="text-gray-400 text-sm mt-1">Try a different keyword or browse by category.</p>
            </div>
          )}
 
          {filtered.map((cat, gi) => (
            <div key={cat.category} ref={(el) => (faqGroupsRef.current[gi] = el)}>
              {/* Category divider */}
              <div className="flex items-center gap-3 mb-4">
                <span className="flex-1 h-px bg-blue-100" />
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-500">{cat.category}</span>
                <span className="flex-1 h-px bg-blue-100" />
              </div>
 
              <div className="space-y-2">
                {cat.items.map((item, i) => {
                  const key  = `${cat.category}-${i}`;
                  const isOpen = openItem === key;
                  return (
                    <div
                      key={key}
                      className={`rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${
                        isOpen
                          ? "bg-white border-blue-200 shadow-blue-50"
                          : "bg-white/80 border-gray-100 hover:border-blue-200"
                      }`}
                      style={{ backdropFilter: "blur(8px)" }}
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left text-gray-800 font-medium hover:bg-gray-50/60 transition text-sm sm:text-base"
                      >
                        <span>{item.q}</span>
                        <span
                          className={`ml-4 shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isOpen ? "bg-blue-600 text-white rotate-180" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </span>
                      </button>
 
                      {/* Animated answer panel */}
                      <div
                        ref={(el) => (answerRefs.current[key] = el)}
                        style={{ height: 0, overflow: "hidden", opacity: 0 }}
                      >
                        <div className="px-6 pb-5 pt-2 text-gray-500 text-sm leading-relaxed border-t border-gray-100">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
 
        {/* ── CTA ── */}
        <div
          ref={ctaRef}
          className="mt-16 bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl p-8 text-center text-white relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <MessageCircle className="h-8 w-8 text-white/70 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">Still need help?</h3>
            <p className="text-blue-100 text-sm mb-6">Our support team typically replies within 24 hours.</p>
            <a
              href="mailto:support@resumeai.com"
              className="inline-block bg-white text-blue-600 font-semibold px-7 py-3 rounded-xl text-sm hover:bg-blue-50 transition shadow-md"
            >
              Contact Support
            </a>
          </div>
        </div>
 
        <p
          className="text-center text-sm text-gray-400 mt-10 cursor-pointer hover:text-blue-500 transition"
          onClick={() => navigate("/")}
        >
          ← Back to home
        </p>
      </div>
    </div>
  );
}