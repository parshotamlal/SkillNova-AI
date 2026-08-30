import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Award, 
  Users, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  FileCheck,
  Zap,
  Globe2,
  Mail
} from "lucide-react";
import { gsap } from "gsap";
import SEO from "../components/SEO";

export default function AboutUs() {
  const pageRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    gsap.set([orb1Ref.current, orb2Ref.current], { scale: 0.5, opacity: 0 });
    tl.to([orb1Ref.current, orb2Ref.current], { 
      scale: 1, 
      opacity: 1, 
      duration: 1.5, 
      stagger: 0.2, 
      ease: "power2.out" 
    });

    return () => tl.kill();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden py-16">
      <SEO
        title="About Us — Mission, Technology & E-E-A-T Standards | ResumeAI Online"
        description="Learn about ResumeAI Online, our mission to democratize job applications with AI-driven ATS optimization, resume parsing, and career tools trusted by 100,000+ job seekers."
        url="/about"
        keywords="about ResumeAI Online, AI resume builder mission, ATS resume technology, career optimization tools, resume parser AI"
        schemaType="about"
        showBreadcrumb={true}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "About Us", url: "/about" },
        ]}
      />

      {/* Floating orbs */}
      <div
        ref={orb1Ref}
        className="pointer-events-none absolute -top-32 -left-40 w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-[90px]"
      />
      <div
        ref={orb2Ref}
        className="pointer-events-none absolute -bottom-24 -right-32 w-[420px] h-[420px] rounded-full bg-teal-200/40 blur-[80px]"
      />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/80 border border-blue-200 text-blue-600 shadow-sm mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Our Mission & Vision
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Empowering Job Seekers with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">AI Precision</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
            ResumeAI Online was founded with a singular purpose: to level the playing field for job seekers against automated screening systems (ATS) using state-of-the-art AI.
          </p>
        </section>

        {/* Key Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { metric: "100,000+", label: "Resumes Analyzed", icon: FileCheck },
            { metric: "98%", label: "ATS Accuracy Rate", icon: Target },
            { metric: "50+", label: "ATS Templates", icon: Award },
            { metric: "4.9/5", label: "User Satisfaction", icon: Users },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-md border border-slate-200/70 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="mx-auto w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{item.metric}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{item.label}</p>
            </div>
          ))}
        </section>

        {/* Why ResumeAI Online */}
        <section className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-xl mb-20">
          <div className="max-w-3xl mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why We Built ResumeAI Online
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Over 75% of qualified resumes are rejected by Applicant Tracking Systems (ATS) before a human recruiter ever sees them due to formatting glitches, missing keywords, and improper structure. We built ResumeAI Online to give candidates the exact insights needed to pass these automated filters effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Deep AI Analysis</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our proprietary algorithms dissect your resume line-by-line, comparing your skills directly against employer job descriptions in real-time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Actionable Tips</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Rather than generic scores, we provide concrete recommendations: missing high-impact keywords, power verbs, and quantifiable metrics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Privacy & Security</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We believe your career data is yours. Files are encrypted with TLS 1.3/AES-256 and never sold to third parties or recruiters without consent.
              </p>
            </div>
          </div>
        </section>

        {/* Global Reach & Commitment */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-4">
              <Globe2 className="w-3.5 h-3.5" /> Worldwide Support
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Designed for Global Job Markets
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Whether you are applying for software engineering roles in Silicon Valley, fresher opportunities in Bangalore, finance positions in London, or remote roles worldwide — our templates and algorithms adhere to regional and international hiring standards.
            </p>
            <ul className="space-y-3 text-slate-700 font-medium">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ATS standards verified against Taleo, Workday, Greenhouse & iCIMS
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                Specialized templates for freshers, career switchers & tech professionals
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                Automated cover letter generation aligned to your targeted job
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 sm:p-10 shadow-xl">
            <h3 className="text-2xl font-bold mb-4">Get in Touch with Our Team</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Have questions, feedback, or need enterprise hiring integrations? We love hearing from our community and constantly iterate based on your feedback.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-100 text-sm">
                <Mail className="w-5 h-5 text-teal-300 shrink-0" />
                <a href="mailto:parshotamworks@gmail.com" className="hover:text-white underline">
                  parshotamworks@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-blue-100 text-sm">
                <Award className="w-5 h-5 text-teal-300 shrink-0" />
                <span>Founder: Parshotam Lal</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-blue-400/40 flex flex-wrap gap-4">
              <Link
                to="/check-ats-score"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-sm"
              >
                Try Free ATS Checker <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/templates"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/40 text-white font-semibold hover:bg-blue-500/60 transition-colors border border-white/20"
              >
                Browse Templates
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
