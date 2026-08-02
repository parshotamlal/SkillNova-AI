"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import SEO from "../components/SEO";

export default function NotFound() {
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    gsap.set(["#num", "#heading", "#sub", "#btns"], { opacity: 0, y: 30 });

    tl.to("#num",     { opacity: 1, y: 0, duration: 0.8 })
      .to("#heading", { opacity: 1, y: 0, duration: 0.6 }, "-=0.5")
      .to("#sub",     { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
      .to("#btns",    { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");

    gsap.to("#num", {
      y: -10,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 1,
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-8 py-16">
      <SEO
        title="404 — Page Not Found | ResumeAI Online"
        description="The page you're looking for doesn't exist. Go back to the ResumeAI Online homepage to build your free ATS resume."
        url="/404"
        noindex={true}
      />
      <p id="num" className="text-8xl font-medium text-gray-200 tracking-tighter leading-none mb-4 select-none">
        404
      </p>
      <h1 id="heading" className="text-2xl font-medium text-gray-900 mb-3">
        Page not found
      </h1>
      <p id="sub" className="text-base text-gray-500 max-w-sm mb-10 leading-relaxed">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div id="btns" className="flex gap-3 flex-wrap justify-center">
        <a href="/" className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          ← Go home
        </a>
        <a href="/templates" className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Browse Templates
        </a>
      </div>
    </div>
  );
}