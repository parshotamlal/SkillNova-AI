import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, Lock, Trash2, Bell, Mail } from "lucide-react";
import { gsap } from "gsap";
import SEO from "../components/SEO";
 
const sections = [
  {
    icon: Eye,
    title: "Information We Collect",
    content: `We collect information you provide directly to us, such as when you create an account, upload a resume, or contact support. This includes your name, email address, resume content, and job descriptions you submit for analysis. We also automatically collect certain technical information when you use our service, including your IP address, browser type, operating system, and usage data.`,
  },
  {
    icon: Shield,
    title: "How We Use Your Information",
    content: `We use the information we collect to provide, maintain, and improve our services; process your resume analysis requests; send you technical notices and support messages; respond to your comments and questions; and monitor and analyze trends and usage. We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.`,
  },
  {
    icon: Lock,
    title: "Data Security",
    content: `We implement industry-standard security measures to protect your personal information. All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Resume files are automatically deleted from our servers within 24 hours of analysis. We conduct regular security audits and penetration tests to ensure the integrity of our systems.`,
  },
  {
    icon: Trash2,
    title: "Data Retention & Deletion",
    content: `We retain your account information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time through your profile settings. Upon deletion, we will remove your personal data within 30 days, except where retention is required by law.`,
  },
  {
    icon: Bell,
    title: "Cookies & Tracking",
    content: `We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. If you do not accept cookies, some portions of our service may not function properly.`,
  },
  {
    icon: Mail,
    title: "Contact Us",
    content: `If you have any questions about this Privacy Policy, please contact us at privacy@resumeai.com. We will respond to all legitimate requests within 30 days. For EU residents, you have the right to lodge a complaint with your local data protection authority.`,
  },
];
 
export default function PrivacyPolicy() {
  const navigate = useNavigate();
 
  const pageRef      = useRef(null);
  const orb1Ref      = useRef(null);
  const orb2Ref      = useRef(null);
  const badgeRef     = useRef(null);
  const titleRef     = useRef(null);
  const dateRef      = useRef(null);
  const introRef     = useRef(null);
  const cardsRef     = useRef([]);
  const iconBoxesRef = useRef([]);
 
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
 
    // ── Initial states ──────────────────────────────────────────
    gsap.set([orb1Ref.current, orb2Ref.current], { scale: 0.4, opacity: 0 });
    gsap.set(badgeRef.current,   { opacity: 0, y: -20 });
    gsap.set(titleRef.current,   { opacity: 0, y: 40  });
    gsap.set(dateRef.current,    { opacity: 0, y: 15  });
    gsap.set(introRef.current,   { opacity: 0, y: 30, scale: 0.97 });
    gsap.set(cardsRef.current,   { opacity: 0, y: 50, rotateX: 12, transformPerspective: 900 });
    gsap.set(iconBoxesRef.current, { scale: 0, rotate: -15 });
 
    // ── Master timeline ─────────────────────────────────────────
    tl
      .to([orb1Ref.current, orb2Ref.current], { scale: 1, opacity: 1, duration: 1.6, stagger: 0.3, ease: "power2.out" }, 0)
      .to(badgeRef.current,  { opacity: 1, y: 0, duration: 0.6 }, 0.2)
      .to(titleRef.current,  { opacity: 1, y: 0, duration: 0.8 }, 0.4)
      .to(dateRef.current,   { opacity: 1, y: 0, duration: 0.6 }, 0.6)
      .to(introRef.current,  { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "back.out(1.2)" }, 0.8)
      .to(cardsRef.current,  { opacity: 1, y: 0, rotateX: 0, duration: 0.75, stagger: 0.12, ease: "back.out(1.1)" }, 1.2)
      .to(iconBoxesRef.current, { scale: 1, rotate: 0, duration: 0.5, stagger: 0.1, ease: "back.out(2)" }, 1.45);
 
    // ── Orb idle float ──────────────────────────────────────────
    gsap.to(orb1Ref.current, { x: 30,  y: 20,  duration: 9,  repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(orb2Ref.current, { x: -25, y: -18, duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut" });
 
    // ── Mouse parallax ──────────────────────────────────────────
    const onMove = (e) => {
      const px = e.clientX / window.innerWidth;
      const py = e.clientY / window.innerHeight;
      gsap.to(orb1Ref.current, { x: px * 50 - 25, y: py * 35 - 17, duration: 1.8, ease: "power1.out", overwrite: "auto" });
      gsap.to(orb2Ref.current, { x: -px * 35 + 17, y: -py * 28 + 14, duration: 2.2, ease: "power1.out", overwrite: "auto" });
    };
    const page = pageRef.current;
    page?.addEventListener("mousemove", onMove);
 
    // ── Card 3D tilt + icon bounce on hover ────────────────────
    const cardCleanups = cardsRef.current.map((card, i) => {
      if (!card) return () => {};
      const iconBox = iconBoxesRef.current[i];
 
      const onMouseMove = (e) => {
        const rect = card.getBoundingClientRect();
        const rotateY = gsap.utils.mapRange(0, rect.width,  -7, 7,  e.clientX - rect.left);
        const rotateX = gsap.utils.mapRange(0, rect.height,  7, -7, e.clientY - rect.top);
        gsap.to(card, { rotateY, rotateX, scale: 1.02, duration: 0.4, ease: "power2.out", transformPerspective: 900 });
      };
      const onMouseEnter = () => {
        gsap.to(iconBox, { scale: 1.2, rotate: 8, duration: 0.35, ease: "back.out(2)" });
      };
      const onMouseLeave = () => {
        gsap.to(card,    { rotateX: 0, rotateY: 0, scale: 1, duration: 0.55, ease: "power3.out" });
        gsap.to(iconBox, { scale: 1, rotate: 0, duration: 0.4, ease: "power3.out" });
      };
 
      card.addEventListener("mousemove",  onMouseMove);
      card.addEventListener("mouseenter", onMouseEnter);
      card.addEventListener("mouseleave", onMouseLeave);
      return () => {
        card.removeEventListener("mousemove",  onMouseMove);
        card.removeEventListener("mouseenter", onMouseEnter);
        card.removeEventListener("mouseleave", onMouseLeave);
      };
    });
 
    return () => {
      tl.kill();
      page?.removeEventListener("mousemove", onMove);
      cardCleanups.forEach((fn) => fn());
    };
  }, []);
 
  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden"
    >
      <SEO
        title="Privacy Policy | How We Protect Your Data — ResumeAI Online"
        description="ResumeAI Online's privacy policy explains how we collect, use, and protect your personal information and resume data. GDPR compliant. Data encrypted in transit and at rest."
        url="/privacy-policy"
        keywords="ResumeAI Online privacy policy, resume data protection, GDPR resume builder"
        schemaType="page"
        showBreadcrumb={true}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy-policy' },
        ]}
      />
      {/* Background orbs */}
      <div ref={orb1Ref} className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-200/40" style={{ filter: "blur(90px)" }} />
      <div ref={orb2Ref} className="pointer-events-none absolute -bottom-24 -right-32 w-[420px] h-[420px] rounded-full bg-teal-200/40" style={{ filter: "blur(80px)" }} />
 
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
 
        {/* ── Header ── */}
        <div className="text-center mb-14">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/80 border border-blue-200 text-blue-600 mb-5"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <Shield className="w-3.5 h-3.5" />
            Privacy Policy
          </div>
          <h1 ref={titleRef} className="text-4xl sm:text-5xl font-bold text-gray-900 mt-3 mb-3">
            Your Privacy Matters
          </h1>
          <p ref={dateRef} className="text-gray-400 text-sm">Last updated: June 1, 2025</p>
        </div>
 
        {/* ── Intro banner ── */}
        <div
          ref={introRef}
          className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl p-7 mb-10 text-white relative overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full" />
          <p className="relative z-10 text-blue-100 leading-relaxed text-sm">
            At Resume Ai, we are committed to protecting your personal information. This policy explains what data we collect, how we use it, and the rights you have over your information. We believe in full transparency — no hidden clauses, no surprises.
          </p>
        </div>
 
        {/* ── Sections ── */}
        <div className="space-y-5" style={{ perspective: "900px" }}>
          {/* eslint-disable-next-line no-unused-vars */}
          {sections.map(({ icon: Icon, title, content }, i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className="bg-white/80 rounded-2xl border border-gray-100 shadow-sm p-7 cursor-default"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  ref={(el) => (iconBoxesRef.current[i] = el)}
                  className="bg-blue-50 rounded-xl p-2.5 shrink-0"
                >
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-base font-bold text-gray-900">{title}</h2>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{content}</p>
            </div>
          ))}
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