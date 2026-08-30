import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { gsap } from "gsap";
import SEO from "../components/SEO";
 
const services = [
  { name: "Resume Analysis API",  status: "operational", latency: "142ms" },
  { name: "AI Matching Engine",   status: "operational", latency: "89ms"  },
  { name: "File Upload Service",  status: "operational", latency: "56ms"  },
  { name: "Authentication",       status: "operational", latency: "34ms"  },
  { name: "Payment Processing",   status: "operational", latency: "210ms" },
  { name: "Email Notifications",  status: "degraded",    latency: "820ms" },
  { name: "PDF Export",           status: "operational", latency: "178ms" },
];
 
const incidents = [
  {
    date: "May 12, 2025",
    title: "Email Notification Delays",
    status: "investigating",
    updates: [
      { time: "14:32 UTC", text: "We are investigating reports of delayed email notifications. Analysis results are unaffected." },
      { time: "13:55 UTC", text: "Increased latency detected in email delivery service. Engineers are investigating." },
    ],
  },
  {
    date: "May 3, 2025",
    title: "Elevated API Response Times",
    status: "resolved",
    updates: [
      { time: "09:14 UTC", text: "Issue resolved. All systems operating normally. Root cause: database connection pool exhaustion during traffic spike." },
      { time: "08:40 UTC", text: "Fix deployed. Monitoring for stability." },
      { time: "07:55 UTC", text: "Identified cause. Deploying fix." },
    ],
  },
];
 
const statusConfig = {
  operational: { label: "Operational", color: "text-green-600",  bg: "bg-green-50",  border: "border-green-100",  dot: "bg-green-500"  },
  degraded:    { label: "Degraded",    color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100", dot: "bg-yellow-500" },
  outage:      { label: "Outage",      color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100",    dot: "bg-red-500"    },
};
 
const incidentStatusConfig = {
  investigating: { label: "Investigating", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  resolved:      { label: "Resolved",      color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200"  },
};
 
const allOperational = services.every((s) => s.status === "operational");
 
export default function Status() {
  const navigate = useNavigate();
 
  const pageRef          = useRef(null);
  const orb1Ref          = useRef(null);
  const orb2Ref          = useRef(null);
  const badgeRef         = useRef(null);
  const titleRef         = useRef(null);
  const subtitleRef      = useRef(null);
  const bannerRef        = useRef(null);
  const svcLabelRef      = useRef(null);
  const svcRowsRef       = useRef([]);
  const incLabelRef      = useRef(null);
  const incCardsRef      = useRef([]);
  const latencyBarsRef   = useRef([]);
 
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
 
    // ── Initial states ──────────────────────────────────────────
    gsap.set([orb1Ref.current, orb2Ref.current], { scale: 0.4, opacity: 0 });
    gsap.set(badgeRef.current,    { opacity: 0, y: -20 });
    gsap.set(titleRef.current,    { opacity: 0, y: 40  });
    gsap.set(subtitleRef.current, { opacity: 0, y: 15  });
    gsap.set(bannerRef.current,   { opacity: 0, y: 30, scale: 0.97 });
    gsap.set(svcLabelRef.current, { opacity: 0, x: -16 });
    gsap.set(svcRowsRef.current,  { opacity: 0, x: -40 });
    gsap.set(incLabelRef.current, { opacity: 0, x: -16 });
    gsap.set(incCardsRef.current, { opacity: 0, y: 40, rotateX: 10, transformPerspective: 900 });
    gsap.set(latencyBarsRef.current, { scaleX: 0, transformOrigin: "left" });
 
    // ── Master timeline ─────────────────────────────────────────
    tl
      .to([orb1Ref.current, orb2Ref.current], { scale: 1, opacity: 1, duration: 1.6, stagger: 0.3, ease: "power2.out" }, 0)
      .to(badgeRef.current,    { opacity: 1, y: 0, duration: 0.6 }, 0.2)
      .to(titleRef.current,    { opacity: 1, y: 0, duration: 0.8 }, 0.4)
      .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.6)
      .to(bannerRef.current,   { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.2)" }, 0.8)
      .to(svcLabelRef.current, { opacity: 1, x: 0, duration: 0.5 }, 1.1)
      .to(svcRowsRef.current,  { opacity: 1, x: 0, duration: 0.55, stagger: 0.08 }, 1.25)
      .to(latencyBarsRef.current, { scaleX: 1, duration: 0.6, stagger: 0.07, ease: "power2.out" }, 1.5)
      .to(incLabelRef.current, { opacity: 1, x: 0, duration: 0.5 }, 2.0)
      .to(incCardsRef.current, { opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.15, ease: "back.out(1.1)" }, 2.15);
 
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
 
    // ── Service row hover ───────────────────────────────────────
    const rowCleanups = svcRowsRef.current.map((row) => {
      if (!row) return () => {};
      const enter = () => gsap.to(row, { x: 6, scale: 1.01, duration: 0.25, ease: "power2.out" });
      const leave = () => gsap.to(row, { x: 0, scale: 1,    duration: 0.35, ease: "power3.out" });
      row.addEventListener("mouseenter", enter);
      row.addEventListener("mouseleave", leave);
      return () => { row.removeEventListener("mouseenter", enter); row.removeEventListener("mouseleave", leave); };
    });
 
    // ── Incident card hover ─────────────────────────────────────
    const cardCleanups = incCardsRef.current.map((card) => {
      if (!card) return () => {};
      const onMouseMove = (e) => {
        const rect = card.getBoundingClientRect();
        const rotateY = gsap.utils.mapRange(0, rect.width,  -5, 5,  e.clientX - rect.left);
        const rotateX = gsap.utils.mapRange(0, rect.height,  5, -5, e.clientY - rect.top);
        gsap.to(card, { rotateY, rotateX, scale: 1.02, duration: 0.4, ease: "power2.out", transformPerspective: 900 });
      };
      const onMouseLeave = () =>
        gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.55, ease: "power3.out" });
      card.addEventListener("mousemove", onMouseMove);
      card.addEventListener("mouseleave", onMouseLeave);
      return () => { card.removeEventListener("mousemove", onMouseMove); card.removeEventListener("mouseleave", onMouseLeave); };
    });
 
    return () => {
      tl.kill();
      page?.removeEventListener("mousemove", onMove);
      rowCleanups.forEach((fn) => fn());
      cardCleanups.forEach((fn) => fn());
    };
  }, []);
 
  // latency → bar width % (max = 900ms = 100%)
  const latencyWidth = (lat) => Math.min((parseInt(lat) / 900) * 100, 100);
 
  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden"
    >
      <SEO
        title="System Status & Uptime — ResumeAI Online"
        description="Check real-time system performance, API response latencies, and service uptime across ResumeAI Online systems."
        url="/status"
        keywords="ResumeAI status, system uptime, API response time, resume analyzer operational status"
        schemaType="page"
        showBreadcrumb={true}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "System Status", url: "/status" },
        ]}
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
            System Status
          </div>
          <h1 ref={titleRef} className="text-4xl sm:text-5xl font-bold text-gray-900 mt-3 mb-2">
            System Status
          </h1>
          <p ref={subtitleRef} className="text-gray-400 text-sm">Updated every 60 seconds</p>
        </div>
 
        {/* ── Overall banner ── */}
        <div
          ref={bannerRef}
          className={`rounded-3xl p-6 mb-10 flex items-center gap-4 relative overflow-hidden ${allOperational ? "bg-gradient-to-r from-green-500 to-teal-500" : "bg-gradient-to-r from-yellow-400 to-orange-400"}`}
        >
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="relative z-10 flex items-center gap-4">
            {allOperational
              ? <CheckCircle className="h-8 w-8 text-white shrink-0" />
              : <AlertCircle className="h-8 w-8 text-white shrink-0" />
            }
            <div>
              <p className="text-white font-bold text-lg leading-tight">
                {allOperational ? "All systems operational" : "Some systems degraded"}
              </p>
              <p className="text-white/80 text-sm mt-0.5">
                {allOperational
                  ? "Everything is running smoothly."
                  : "We are actively investigating issues. Check below for details."}
              </p>
            </div>
          </div>
        </div>
 
        {/* ── Services ── */}
        <h2 ref={svcLabelRef} className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">
          Services
        </h2>
        <div className="space-y-2 mb-12">
          {services.map((svc, i) => {
            const cfg = statusConfig[svc.status];
            return (
              <div
                key={svc.name}
                ref={(el) => (svcRowsRef.current[i] = el)}
                className={`bg-white/80 rounded-2xl border ${cfg.border} shadow-sm px-6 py-4 cursor-default`}
                style={{ backdropFilter: "blur(8px)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot} ${svc.status !== "operational" ? "animate-pulse" : ""}`} />
                    <span className="text-gray-800 text-sm font-medium">{svc.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs font-mono hidden sm:block">{svc.latency}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
 
                {/* Latency bar */}
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    ref={(el) => (latencyBarsRef.current[i] = el)}
                    className={`h-full rounded-full ${svc.status === "operational" ? "bg-green-400" : "bg-yellow-400"}`}
                    style={{ width: `${latencyWidth(svc.latency)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
 
        {/* ── Incident History ── */}
        <h2 ref={incLabelRef} className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">
          Incident History
        </h2>
        <div className="space-y-4" style={{ perspective: "900px" }}>
          {incidents.map((incident, i) => {
            const cfg = incidentStatusConfig[incident.status];
            return (
              <div
                key={i}
                ref={(el) => (incCardsRef.current[i] = el)}
                className="bg-white/80 rounded-2xl border border-gray-100 shadow-sm p-6 cursor-default"
                style={{ backdropFilter: "blur(8px)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{incident.date}</p>
                    <h3 className="text-gray-900 font-bold text-sm">{incident.title}</h3>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    {cfg.label}
                  </span>
                </div>
 
                <div className="space-y-3">
                  {incident.updates.map((u, j) => (
                    <div key={j} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <Clock className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5" />
                        {j < incident.updates.length - 1 && (
                          <div className="w-px flex-1 bg-gray-100 mt-1" />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="text-xs text-gray-400 font-mono mb-0.5">{u.time}</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{u.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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