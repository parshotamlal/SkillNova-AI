import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { gsap } from "gsap";
import SEO from "../components/SEO";
 
const sections = [
  {
    number: "01",
    title: "Acceptance of Terms",
    content: `By accessing or using Resume Ai, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service. These terms apply to all visitors, users, and others who access the service.`,
  },
  {
    number: "02",
    title: "Use of Service",
    content: `Resume Ai grants you a limited, non-exclusive, non-transferable license to use the service for your personal, non-commercial purposes. You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the service without express written permission. You are responsible for maintaining the confidentiality of your account credentials.`,
  },
  {
    number: "03",
    title: "User Content",
    content: `You retain all rights to the content you upload, including your resume and job descriptions. By uploading content, you grant Resume Ai a limited license to process and analyze that content solely to provide the service. We do not claim ownership of your content, and we do not use it to train AI models without explicit consent.`,
  },
  {
    number: "04",
    title: "Prohibited Activities",
    content: `You may not use the service to upload malicious files, attempt to gain unauthorized access to our systems, scrape or harvest data, impersonate any person or entity, or engage in any activity that disrupts or interferes with the service. Violation of these terms may result in immediate termination of your account.`,
  },
  {
    number: "05",
    title: "Subscription & Payments",
    content: `Paid plans are billed on a recurring basis. You authorize us to charge your payment method on each renewal date. All fees are non-refundable except as required by law or as stated in our refund policy. We reserve the right to change pricing with 30 days' notice to existing subscribers.`,
  },
  {
    number: "06",
    title: "Disclaimer of Warranties",
    content: `The service is provided on an "as is" and "as available" basis without any warranties, express or implied. We do not warrant that the service will be uninterrupted, error-free, or free of viruses. Resume Ai is a tool to assist your job search — it does not guarantee employment outcomes.`,
  },
  {
    number: "07",
    title: "Limitation of Liability",
    content: `In no event shall Resume Ai, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the service. Our total liability to you for any claim shall not exceed the amount you paid us in the past 12 months.`,
  },
  {
    number: "08",
    title: "Changes to Terms",
    content: `We reserve the right to modify these terms at any time. We will provide notice of significant changes via email or a prominent notice on our website. Your continued use of the service after changes take effect constitutes your acceptance of the revised terms.`,
  },
];
 
export default function TermsOfService() {
  const navigate = useNavigate();
 
  const pageRef      = useRef(null);
  const orb1Ref      = useRef(null);
  const orb2Ref      = useRef(null);
  const badgeRef     = useRef(null);
  const titleRef     = useRef(null);
  const dateRef      = useRef(null);
  const introRef     = useRef(null);
  const cardsRef     = useRef([]);
  const contactRef   = useRef(null);
 
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
 
    // ── Initial states ──────────────────────────────────────────
    gsap.set([orb1Ref.current, orb2Ref.current], { scale: 0.4, opacity: 0 });
    gsap.set(badgeRef.current,   { opacity: 0, y: -20 });
    gsap.set(titleRef.current,   { opacity: 0, y: 40  });
    gsap.set(dateRef.current,    { opacity: 0, y: 15  });
    gsap.set(introRef.current,   { opacity: 0, y: 30, scale: 0.97 });
    gsap.set(cardsRef.current,   { opacity: 0, y: 50, rotateX: 15, transformPerspective: 900 });
    gsap.set(contactRef.current, { opacity: 0, y: 25 });
 
    // ── Entrance timeline ───────────────────────────────────────
    tl
      .to([orb1Ref.current, orb2Ref.current], { scale: 1, opacity: 1, duration: 1.6, stagger: 0.3, ease: "power2.out" }, 0)
      .to(badgeRef.current,   { opacity: 1, y: 0, duration: 0.6 }, 0.2)
      .to(titleRef.current,   { opacity: 1, y: 0, duration: 0.8 }, 0.4)
      .to(dateRef.current,    { opacity: 1, y: 0, duration: 0.6 }, 0.6)
      .to(introRef.current,   { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.2)" }, 0.8)
      .to(cardsRef.current,   { opacity: 1, y: 0, rotateX: 0, duration: 0.75, stagger: 0.1, ease: "back.out(1.1)" }, 1.1)
      .to(contactRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.2)" }, 2.1);
 
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
 
    // ── Card 3D tilt on hover ───────────────────────────────────
    const cardCleanups = cardsRef.current.map((card) => {
      if (!card) return () => {};
      const onMouseMove = (e) => {
        const rect = card.getBoundingClientRect();
        const rotateY = gsap.utils.mapRange(0, rect.width,  -6, 6,  e.clientX - rect.left);
        const rotateX = gsap.utils.mapRange(0, rect.height,  6, -6, e.clientY - rect.top);
        gsap.to(card, { rotateY, rotateX, scale: 1.02, duration: 0.4, ease: "power2.out", transformPerspective: 900 });
      };
      const onMouseLeave = () =>
        gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.55, ease: "power3.out" });
 
      card.addEventListener("mousemove", onMouseMove);
      card.addEventListener("mouseleave", onMouseLeave);
      return () => {
        card.removeEventListener("mousemove", onMouseMove);
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
        title="Terms of Service | ResumeAI Online — AI Resume Builder"
        description="Read ResumeAI Online's Terms of Service. Understand your rights when using our free AI resume builder, ATS checker, and resume templates."
        url="/terms-of-service"
        keywords="ResumeAI Online terms of service, resume builder terms, AI tool terms"
        schemaType="page"
        showBreadcrumb={true}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: '/terms-of-service' },
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
            <FileText className="w-3.5 h-3.5" />
            Terms of Service
          </div>
          <h1 ref={titleRef} className="text-4xl sm:text-5xl font-bold text-gray-900 mt-3 mb-3">
            Terms of Service
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
            Please read these terms carefully before using Resume Ai. By using our service, you agree to these terms. We've written them in plain language to make them easy to understand.
          </p>
        </div>
 
        {/* ── Sections ── */}
        <div className="space-y-4" style={{ perspective: "900px" }}>
          {sections.map(({ number, title, content }, i) => (
            <div
              key={number}
              ref={(el) => (cardsRef.current[i] = el)}
              className="bg-white/80 rounded-2xl border border-gray-100 shadow-sm p-7 flex gap-6 cursor-default"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <span className="text-3xl font-black text-blue-100 leading-none select-none shrink-0">
                {number}
              </span>
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{content}</p>
              </div>
            </div>
          ))}
        </div>
 
        {/* ── Contact ── */}
        <div
          ref={contactRef}
          className="mt-10 bg-white/80 rounded-2xl border border-gray-100 shadow-sm p-7 text-center"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <p className="text-gray-500 text-sm">
            Questions about these terms?{" "}
            <a href="mailto:legal@resumeai.com" className="text-blue-600 font-medium hover:underline">
              legal@resumeai.com
            </a>
          </p>
        </div>
 
        <p
          className="text-center text-sm text-gray-400 mt-8 cursor-pointer hover:text-blue-500 transition"
          onClick={() => navigate("/")}
        >
          ← Back to home
        </p>
      </div>
    </div>
  );
}