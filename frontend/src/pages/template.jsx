import { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { generateAISummary, saveUserResume } from "../services/api";
import { CanvaToolbar } from "../features/CanvaToolbar";

// ─── Tailwind class helpers ───────────────────────────────────────────────────
const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Icons (Heroicons-style inline SVGs) ─────────────────────────────────────
const ICONS = {
    sun: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
    ),
    moon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
    ),
    download: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
    ),
    plus: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M5 12h14M12 5v14" />
        </svg>
    ),
    trash: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
        </svg>
    ),
    chevronDown: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="m6 9 6 6 6-6" />
        </svg>
    ),
    sparkles: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17zM19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3z" />
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    ),
    briefcase: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    ),
    book: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    code: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="16,18 22,12 16,6" /><polyline points="8,6 2,12 8,18" />
        </svg>
    ),
    award: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="8" r="7" /><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88" />
        </svg>
    ),
    settings: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    image: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
        </svg>
    ),
    x: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    reset: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="1,4 1,10 7,10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
    ),
    grip: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="18" x2="16" y2="18" />
        </svg>
    ),
    link: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <path d="M10 13 a 5 5 0 0 0 7.54 0.54 l 3 -3 a 5 5 0 0 0 -7.07 -7.07 l -1.72 1.71" />
            <path d="M14 11 a 5 5 0 0 0 -7.54 -0.54 l -3 3 a 5 5 0 0 0 7.07 7.07 l 1.71 -1.71" />
        </svg>
    ),
    phone: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.77 9.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2.68 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.72 8.91a16 16 0 0 0 6.39 6.39l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    ),
    mail: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    zap: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
        </svg>
    ),
};

const Icon = ({ name }) => ICONS[name] ?? null;

// ─── ID generator ─────────────────────────────────────────────────────────────
let idCounter = 100;
const genId = () => ++idCounter;

// ─── useLocalStorage ──────────────────────────────────────────────────────────
function useLocalStorage(key, initial) {
    const [val, setVal] = useState(() => {
        try {
            const s = localStorage.getItem(key);
            return s ? JSON.parse(s) : initial;
        } catch {
            return initial;
        }
    });
    useEffect(() => {
        try { localStorage.setItem(key, JSON.stringify(val)); } catch { }
    }, [key, val]);
    return [val, setVal];
}

// ─── Default data ─────────────────────────────────────────────────────────────
const defaultData = {
    personal: {
        name: "Alex Johnson", email: "alex@example.com", phone: "+1 (555) 123-4567",
        location: "San Francisco, CA", linkedin: "linkedin.com/in/alexjohnson",
        github: "github.com/alexjohnson", title: "Senior Software Engineer",
        website: "alexjohnson.dev", photo: "",
    },
    summary:
        "Passionate software engineer with 6+ years of experience building scalable web applications. Proven track record in leading cross-functional teams and delivering high-impact products. Expertise in React, Node.js, and cloud infrastructure.",
    skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "PostgreSQL", "GraphQL", "Git", "Agile"],
    experience: [
        { id: 1, title: "Senior Software Engineer", company: "TechCorp Inc.", location: "San Francisco, CA", start: "Jan 2022", end: "Present", desc: "• Led development of microservices architecture serving 2M+ users\n• Reduced API response time by 40% through query optimization\n• Mentored 4 junior engineers and conducted technical interviews" },
        { id: 2, title: "Software Engineer", company: "StartupXYZ", location: "Remote", start: "Jun 2019", end: "Dec 2021", desc: "• Built real-time dashboard using React and WebSockets\n• Implemented CI/CD pipeline reducing deployment time by 60%\n• Collaborated with design team to improve UX across mobile app" },
    ],
    education: [
        { id: 1, degree: "B.S. Computer Science", school: "UC Berkeley", location: "Berkeley, CA", start: "2015", end: "2019", gpa: "3.8", honors: "Magna Cum Laude" },
    ],
    projects: [
        { id: 1, name: "OpenChat Platform", tech: "React, Node.js, Socket.io", desc: "Open-source real-time chat platform with 500+ GitHub stars. Features include end-to-end encryption, file sharing, and video calls.", url: "github.com/alex/openchat" },
        { id: 2, name: "Analytics Dashboard", tech: "Python, D3.js, FastAPI", desc: "Self-service analytics platform for small businesses. Reduced reporting time from days to minutes.", url: "" },
    ],
    certifications: [
        { id: 1, name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2023", expiry: "2026" },
        { id: 2, name: "Google Cloud Professional", issuer: "Google", date: "2022", expiry: "2025" },
    ],
    sectionOrder: ["summary", "skills", "experience", "education", "projects", "certifications"],
};

// ─── Templates config ─────────────────────────────────────────────────────────
const TEMPLATES = [
    { id: "modern", label: "Modern", desc: "Bold header with two-column layout" },
    { id: "ats_premium", label: "ATS Premium", desc: "Highly structured ATS-optimized design" },
    { id: "nordic_slate", label: "Nordic Slate", desc: "Split slate-blue header with vertical divider" },
    { id: "golden_elegance", label: "Golden Elegance", desc: "Corporate split layout with gold accents and timeline" },
    { id: "tech_minimal", label: "Tech Minimalist", desc: "Sleek tech layout with monospace accents and structured skills grid" },
    { id: "creative_teal", label: "Creative Teal", desc: "Modern creative layout with dark teal highlights and sidebar border" },
    { id: "classic_pro", label: "Classic Professional", desc: "Traditional centered layout with horizontal dividers and serif font" },
    { id: "slate_grid", label: "Slate Grid", desc: "Minimalist slate-grey grid layout with clean vertical spacings" },
    { id: "editorial_chic", label: "Modernist Editorial", desc: "High-end contemporary editorial layout with premium spacing and serif headers" },
    { id: "ats", label: "ATS Friendly", desc: "Clean, ATS-optimized single column" },
    { id: "minimal", label: "Minimal", desc: "Elegant serif typography" },
    { id: "sidebar", label: "Sidebar", desc: "Dark sidebar with main content" },
    { id: "executive", label: "Executive", desc: "Premium dark header design" },
];

const SECTION_LABELS = {
    summary: "Summary", skills: "Skills", experience: "Experience",
    education: "Education", projects: "Projects", certifications: "Certifications",
};

// ═══════════════════════════════════════════════════════════════════
// PRIMITIVE COMPONENTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Field — label + input wrapper
 * @param {string} label
 * @param {ReactNode} children
 * @param {string} className
 */
export function Field({ label, children, className = "" }) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                    {label}
                </label>
            )}
            {children}
        </div>
    );
}

/**
 * TextInput — styled text/email/tel input
 */
export function TextInput({ value, onChange, placeholder, type = "text" }) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700
                 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100
                 placeholder:text-slate-400 dark:placeholder:text-slate-600
                 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                 transition-colors"
        />
    );
}

/**
 * TextArea — styled textarea
 */
export function TextArea({ value, onChange, placeholder, rows = 3 }) {
    return (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700
                 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100
                 placeholder:text-slate-400 dark:placeholder:text-slate-600
                 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                 transition-colors resize-y"
        />
    );
}

/**
 * Button — variant: primary | ghost | danger | success | ai
 */
export function Button({ children, onClick, disabled, variant = "ghost", className = "", type = "button" }) {
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-sm hover:-translate-y-px",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        danger: "bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border-transparent",
        success: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-transparent",
        ai: "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white border-transparent shadow-sm hover:-translate-y-px",
    };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-150",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                variants[variant],
                className
            )}
        >
            {children}
        </button>
    );
}

/**
 * Badge — small pill chip
 */
export function Badge({ children, variant = "blue" }) {
    const variants = {
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
        slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
        green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    };
    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold", variants[variant])}>
            {children}
        </span>
    );
}

/**
 * Card — surface card with optional padding
 */
export function Card({ children, className = "", padding = true }) {
    return (
        <div className={cn(
            "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
            padding && "p-4",
            className
        )}>
            {children}
        </div>
    );
}

/**
 * Spinner — loading indicator
 */
export function Spinner({ size = "sm" }) {
    return (
        <span
            className={cn(
                "inline-block rounded-full border-2 border-white/30 border-t-white animate-spin",
                size === "sm" ? "w-3 h-3" : "w-5 h-5"
            )}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════
// FORM SECTION (collapsible)
// ═══════════════════════════════════════════════════════════════════

/**
 * FormSection — collapsible panel with icon, title, and optional badge
 * @param {ReactNode} icon
 * @param {string} title
 * @param {number|string} badge — item count or label shown in pill
 * @param {ReactNode} children
 */
export function FormSection({ icon, title, children, badge }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-slate-200 dark:border-slate-800">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2.5 w-full px-5 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
                <span className="text-blue-500">{icon}</span>
                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{title}</span>
                {badge != null && (
                    <Badge variant="blue">{badge}</Badge>
                )}
                <span className={cn("text-slate-400 transition-transform duration-200", open && "rotate-180")}>
                    <Icon name="chevronDown" />
                </span>
            </button>
            {open && (
                <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// SKILL CHIP + SKILL INPUT
// ═══════════════════════════════════════════════════════════════════

/**
 * SkillChip — removable skill pill
 */
export function SkillChip({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                     bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300
                     text-xs font-medium">
            {label}
            <button onClick={onRemove} className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors">
                <Icon name="x" />
            </button>
        </span>
    );
}

/**
 * SkillsEditor — full skill tag input with chips
 */
export function SkillsEditor({ skills, onChange }) {
    const [input, setInput] = useState("");

    const addSkill = (e) => {
        if (e.key === "Enter" && input.trim()) {
            onChange([...skills, input.trim()]);
            setInput("");
        }
    };
    const removeSkill = (i) => onChange(skills.filter((_, idx) => idx !== i));

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                    <SkillChip key={i} label={s} onRemove={() => removeSkill(i)} />
                ))}
            </div>
            <TextInput
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a skill and press Enter…"
            // pass the onKeyDown via wrapping div trick
            />
            {/* We need onKeyDown on the input — use a wrapper input directly */}
            <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="Type a skill and press Enter…"
                className="hidden" // hidden duplicate; see SkillsEditorInput below
            />
        </div>
    );
}

// Better version — standalone skill input
function SkillsEditorInput({ skills, onChange }) {
    const [input, setInput] = useState("");
    const addSkill = (e) => {
        if (e.key === "Enter" && input.trim()) {
            onChange([...skills, input.trim()]);
            setInput("");
        }
    };
    const removeSkill = (i) => onChange(skills.filter((_, idx) => idx !== i));

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[32px]">
                {skills.map((s, i) => (
                    <SkillChip key={i} label={s} onRemove={() => removeSkill(i)} />
                ))}
            </div>
            <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="Type a skill and press Enter…"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700
                   bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100
                   placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40
                   focus:border-blue-500 transition-colors"
            />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// ENTRY CARDS (experience / education / project / cert)
// ═══════════════════════════════════════════════════════════════════

/**
 * EntryCard — wrapper for list entries with index + remove button
 */
export function EntryCard({ index, onRemove, children }) {
    return (
        <Card className="mb-3" padding={false}>
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-400">#{index + 1}</span>
                <Button variant="danger" onClick={onRemove} className="py-1 text-xs">
                    <Icon name="trash" /> Remove
                </Button>
            </div>
            <div className="p-4 space-y-3">{children}</div>
        </Card>
    );
}

/**
 * ExperienceEntry — single work experience form card
 */
export function ExperienceEntry({ exp, index, onChange, onRemove }) {
    const u = (k) => (e) => onChange(exp.id, k, e.target.value);
    return (
        <EntryCard index={index} onRemove={onRemove}>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Job Title"><TextInput value={exp.title} onChange={u("title")} placeholder="Software Engineer" /></Field>
                <Field label="Company"><TextInput value={exp.company} onChange={u("company")} placeholder="Company Inc." /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Location"><TextInput value={exp.location} onChange={u("location")} placeholder="City, State" /></Field>
                <div className="grid grid-cols-2 gap-2">
                    <Field label="Start"><TextInput value={exp.start} onChange={u("start")} placeholder="Jan 2022" /></Field>
                    <Field label="End"><TextInput value={exp.end} onChange={u("end")} placeholder="Present" /></Field>
                </div>
            </div>
            <Field label="Description (use • for bullets)">
                <TextArea value={exp.desc} onChange={u("desc")} placeholder={"• Led development of…\n• Reduced response time by 40%"} rows={3} />
            </Field>
        </EntryCard>
    );
}

/**
 * EducationEntry — single education form card
 */
export function EducationEntry({ edu, index, onChange, onRemove }) {
    const u = (k) => (e) => onChange(edu.id, k, e.target.value);
    return (
        <EntryCard index={index} onRemove={onRemove}>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Degree"><TextInput value={edu.degree} onChange={u("degree")} placeholder="B.S. Computer Science" /></Field>
                <Field label="School"><TextInput value={edu.school} onChange={u("school")} placeholder="MIT" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="GPA"><TextInput value={edu.gpa} onChange={u("gpa")} placeholder="3.9" /></Field>
                <Field label="Honors"><TextInput value={edu.honors} onChange={u("honors")} placeholder="Summa Cum Laude" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Start Year"><TextInput value={edu.start} onChange={u("start")} placeholder="2015" /></Field>
                <Field label="End Year"><TextInput value={edu.end} onChange={u("end")} placeholder="2019" /></Field>
            </div>
        </EntryCard>
    );
}

/**
 * ProjectEntry — single project form card
 */
export function ProjectEntry({ proj, index, onChange, onRemove }) {
    const u = (k) => (e) => onChange(proj.id, k, e.target.value);
    return (
        <EntryCard index={index} onRemove={onRemove}>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Project Name"><TextInput value={proj.name} onChange={u("name")} placeholder="Awesome App" /></Field>
                <Field label="Tech Stack"><TextInput value={proj.tech} onChange={u("tech")} placeholder="React, Node.js" /></Field>
            </div>
            <Field label="Description">
                <TextArea value={proj.desc} onChange={u("desc")} placeholder="What it does and impact…" rows={2} />
            </Field>
            <Field label="URL / Link">
                <TextInput value={proj.url} onChange={u("url")} placeholder="github.com/you/project" />
            </Field>
        </EntryCard>
    );
}

/**
 * CertificationEntry — single certification form card
 */
export function CertificationEntry({ cert, index, onChange, onRemove }) {
    const u = (k) => (e) => onChange(cert.id, k, e.target.value);
    return (
        <EntryCard index={index} onRemove={onRemove}>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Certificate Name"><TextInput value={cert.name} onChange={u("name")} placeholder="AWS Solutions Architect" /></Field>
                <Field label="Issuing Org"><TextInput value={cert.issuer} onChange={u("issuer")} placeholder="Amazon Web Services" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Issue Date"><TextInput value={cert.date} onChange={u("date")} placeholder="2023" /></Field>
                <Field label="Expiry Date"><TextInput value={cert.expiry} onChange={u("expiry")} placeholder="2026" /></Field>
            </div>
        </EntryCard>
    );
}

// ═══════════════════════════════════════════════════════════════════
// SECTION ORDER EDITOR
// ═══════════════════════════════════════════════════════════════════

/**
 * SectionOrderEditor — drag-free up/down reordering for resume sections
 */
export function SectionOrderEditor({ order, onMove }) {
    return (
        <div className="space-y-2">
            {order.map((key, i) => (
                <div
                    key={key}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                     bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                    <span className="text-slate-300 dark:text-slate-600"><Icon name="grip" /></span>
                    <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {SECTION_LABELS[key]}
                    </span>
                    <button
                        disabled={i === 0}
                        onClick={() => onMove(key, "up")}
                        className="px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700
                       hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                    >↑</button>
                    <button
                        disabled={i === order.length - 1}
                        onClick={() => onMove(key, "down")}
                        className="px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700
                       hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                    >↓</button>
                </div>
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE SELECTOR
// ═══════════════════════════════════════════════════════════════════

/**
 * TemplateSelectorModal — Visual overlay grid to select template with scale preview
 */
export function TemplateSelectorModal({ current, onSelect, onClose, data }) {
    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop click listener */}
            <div className="absolute inset-0" onClick={onClose} />
            
            {/* Modal Box */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Select a Resume Template</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Choose a style below to format your resume. Previews show your active resume content.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Close Modal"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body / Template Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {TEMPLATES.map((t) => (
                            <div
                                key={t.id}
                                onClick={() => {
                                    onSelect(t.id);
                                    onClose();
                                }}
                                className={cn(
                                    "group flex flex-col rounded-xl border bg-white dark:bg-slate-900 overflow-hidden cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5",
                                    current === t.id
                                        ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20"
                                        : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                                )}
                            >
                                {/* Miniature Template Preview */}
                                <div className="relative w-full h-[220px] bg-slate-100 dark:bg-slate-950 overflow-hidden border-b border-slate-100 dark:border-slate-800/40">
                                    <div style={{
                                        position: "absolute",
                                        left: "50%",
                                        top: "16px",
                                        transform: "translateX(-50%) scale(0.18)",
                                        transformOrigin: "top center",
                                        width: "210mm",
                                        minWidth: "210mm",
                                        height: "297mm",
                                        minHeight: "297mm",
                                        pointerEvents: "none",
                                        userSelect: "none",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                        borderRadius: "2px"
                                    }}>
                                        <ResumePreview data={data} template={t.id} />
                                    </div>

                                    {/* Active State Icon */}
                                    {current === t.id && (
                                        <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1 shadow-md z-10">
                                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Hover overlay with button */}
                                    <div className="absolute inset-0 bg-slate-950/10 dark:bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transform translate-y-1.5 group-hover:translate-y-0 transition-all duration-200">
                                            {current === t.id ? "Selected" : "Use Template"}
                                        </span>
                                    </div>
                                </div>

                                {/* Template Information */}
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {t.label}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                            {t.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// TOP BAR
// ═══════════════════════════════════════════════════════════════════

/**
 * TopBar — app header with logo, tab switcher, actions
 */
export function TopBar({ dark, onToggleDark, onDownload, onReset, downloading, activeTab, onTabChange, onToggleTemplates }) {
    return (
        <header className="h-16 flex items-center gap-3 px-6 bg-white/80 dark:bg-slate-900/85 backdrop-blur-md
                       border-b border-slate-200/60 dark:border-slate-800/60 flex-shrink-0 z-20 shadow-sm shadow-slate-100/10">
            <a href="/" className="flex items-center gap-2 group mr-4">
                <span className="font-black text-xl bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent group-hover:rotate-12 transition-transform duration-200">
                    ✦
                </span>
                <span className="hidden sm:inline-block font-extrabold text-sm tracking-wide text-slate-800 dark:text-slate-200">
                    SkillNova <span className="text-blue-600">Workspace</span>
                </span>
            </a>
            <div className="flex-1" />

            {/* Mobile tab switcher */}
            <div className="flex md:hidden gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                {["form", "preview"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                            activeTab === tab
                                ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                                : "bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                        )}
                    >
                        {tab === "form" ? "Edit" : "Preview"}
                    </button>
                ))}
            </div>

            <Button variant="ghost" onClick={onToggleTemplates} className="hidden md:inline-flex text-xs py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50/80 rounded-lg">
                <Icon name="settings" /> Templates
            </Button>

            <Button variant="ai" onClick={onDownload} disabled={downloading} className="text-xs py-2 px-4 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 rounded-lg">
                {downloading ? <><Spinner /> Exporting…</> : <><Icon name="download" /> Download PDF</>}
            </Button>

            <Button variant="ghost" onClick={onToggleDark} className="px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50/80 rounded-lg" title="Toggle Theme">
                <Icon name={dark ? "sun" : "moon"} />
            </Button>

            <Button variant="ghost" onClick={onReset} className="px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded-lg" title="Reset to defaults">
                <Icon name="reset" />
            </Button>
        </header>
    );
}

// ═══════════════════════════════════════════════════════════════════
// PHOTO UPLOAD
// ═══════════════════════════════════════════════════════════════════

/**
 * PhotoUpload — circular avatar picker
 */
export function PhotoUpload({ src, onChange }) {
    const ref = useRef();
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange(ev.target.result);
        reader.readAsDataURL(file);
    };
    return (
        <>
            <button
                type="button"
                onClick={() => ref.current.click()}
                className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600
                   bg-slate-100 dark:bg-slate-800 flex items-center justify-center
                   hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20
                   transition-colors overflow-hidden flex-shrink-0"
            >
                {src
                    ? <img src={src} alt="profile" className="w-full h-full object-cover" />
                    : <span className="text-slate-400"><Icon name="image" /></span>
                }
            </button>
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════
// RESUME PREVIEW (all templates)
// ═══════════════════════════════════════════════════════════════════

function ContactItem({ icon, text }) {
    if (!text) return null;
    return (
        <span className="inline-flex items-center gap-1">
            <Icon name={icon} />
            <span>{text}</span>
        </span>
    );
}

/**
 * ResumePreview — renders the resume in the chosen template style.
 * Designed for screen preview and PDF export (white background, print-safe).
 * @param {object} data — resume data
 * @param {string} template — one of: modern | ats | minimal | sidebar | executive
 */
export function ResumePreview({ data, template, design, selectedElement, setSelectedElement, onUpdate }) {
    const d = data;
    const p = d.personal;
    
    const accentColor = design?.accentColor || "#2563eb";
    const fontFamily = design?.fontFamily || "Inter";
    const spacing = design?.spacing || "standard";

    const SelectableWrapper = ({ elementKey, children }) => {
        const isSelected = selectedElement === elementKey;
        return (
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(elementKey);
                }}
                className={cn(
                    "relative cursor-pointer transition-all duration-150 rounded",
                    isSelected 
                        ? "outline outline-2 outline-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.45)] outline-offset-4 z-10" 
                        : "hover:outline hover:outline-1 hover:outline-slate-200 hover:outline-offset-4"
                )}
            >
                {children}
            </div>
        );
    };

    const EditableText = ({ value, path, placeholder = "Type here...", isBlock = false }) => {
        const Tag = isBlock ? "div" : "span";
        return (
            <Tag
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                    const text = e.target.innerText;
                    onUpdate(path, text);
                }}
                className="focus:bg-slate-100/80 focus:outline-none rounded px-0.5 -mx-0.5 transition-colors cursor-text"
                style={{ 
                    display: isBlock ? "block" : "inline-block", 
                    minWidth: value ? "auto" : "50px",
                    whiteSpace: isBlock ? "pre-wrap" : "normal"
                }}
            >
                {value || placeholder}
            </Tag>
        );
    };

    const orderMap = {};
    (d.sectionOrder || []).forEach((s, i) => (orderMap[s] = i));

    const renderExp = () =>
        d.experience.filter((e) => e.title || e.company).map((e) => {
            const idx = d.experience.findIndex(item => item.id === e.id);
            return (
                <div key={e.id} style={{ marginBottom: spacing === "compact" ? 10 : spacing === "spacious" ? 18 : 14 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                            <EditableText value={e.title} path={`experience.${idx}.title`} placeholder="Job Title" />
                        </span>
                        <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                            <EditableText value={e.start} path={`experience.${idx}.start`} placeholder="Start Date" />
                            {(e.start || e.end) && " – "}
                            <EditableText value={e.end} path={`experience.${idx}.end`} placeholder="End Date" />
                        </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#4a5568" }}>
                        <EditableText value={e.company} path={`experience.${idx}.company`} placeholder="Company Name" />
                        {(e.company || e.location) && ", "}
                        <EditableText value={e.location} path={`experience.${idx}.location`} placeholder="Location" />
                    </div>
                    <div style={{ fontSize: 11.5, color: "#374151", marginTop: 4 }}>
                        <EditableText value={e.desc} path={`experience.${idx}.desc`} placeholder="Job Description" isBlock={true} />
                    </div>
                </div>
            );
        });

    const renderEdu = () =>
        d.education.filter((e) => e.degree || e.school).map((e) => {
            const idx = d.education.findIndex(item => item.id === e.id);
            return (
                <div key={e.id} style={{ marginBottom: spacing === "compact" ? 8 : spacing === "spacious" ? 16 : 12 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                            <EditableText value={e.degree} path={`education.${idx}.degree`} placeholder="Degree / Field" />
                        </span>
                        <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                            <EditableText value={e.start} path={`education.${idx}.start`} placeholder="Start Date" />
                            {(e.start || e.end) && " – "}
                            <EditableText value={e.end} path={`education.${idx}.end`} placeholder="End Date" />
                        </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#4a5568" }}>
                        <EditableText value={e.school} path={`education.${idx}.school`} placeholder="School / Institution" />
                        {(e.school || e.location) && ", "}
                        <EditableText value={e.location} path={`education.${idx}.location`} placeholder="Location" />
                    </div>
                    {(e.gpa || e.honors) && (
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                            <EditableText value={e.honors} path={`education.${idx}.honors`} placeholder="Honors / Awards" />
                            {(e.honors || e.gpa) && " | GPA: "}
                            <EditableText value={e.gpa} path={`education.${idx}.gpa`} placeholder="GPA" />
                        </div>
                    )}
                </div>
            );
        });

    const renderProjects = () =>
        d.projects.filter((pr) => pr.name).map((pr) => {
            const idx = d.projects.findIndex(item => item.id === pr.id);
            return (
                <div key={pr.id} style={{ marginBottom: spacing === "compact" ? 8 : spacing === "spacious" ? 16 : 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                        <EditableText value={pr.name} path={`projects.${idx}.name`} placeholder="Project Name" />
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>
                        <EditableText value={pr.tech} path={`projects.${idx}.tech`} placeholder="Technologies used" />
                    </div>
                    <div style={{ fontSize: 11.5, color: "#374151", marginTop: 2 }}>
                        <EditableText value={pr.desc} path={`projects.${idx}.desc`} placeholder="Project Description" isBlock={true} />
                    </div>
                    <div style={{ fontSize: 10, color: accentColor, marginTop: 2 }}>
                        <EditableText value={pr.url} path={`projects.${idx}.url`} placeholder="Project Link" />
                    </div>
                </div>
            );
        });

    const renderCerts = () =>
        d.certifications.filter((c) => c.name).map((c) => {
            const idx = d.certifications.findIndex(item => item.id === c.id);
            return (
                <div key={c.id} style={{ marginBottom: 8, display: "flex", justifyBetween: "space-between" }}>
                    <div>
                        <div style={{ fontWeight: 500, fontSize: 12 }}>
                            <EditableText value={c.name} path={`certifications.${idx}.name`} placeholder="Certification Name" />
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                            <EditableText value={c.issuer} path={`certifications.${idx}.issuer`} placeholder="Issuer" />
                        </div>
                    </div>
                    <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "right", marginLeft: "auto" }}>
                        <EditableText value={c.date} path={`certifications.${idx}.date`} placeholder="Date Issued" />
                    </div>
                </div>
            );
        });

    // Template-specific section title styles
    const sectionTitleStyle = {
        modern: { fontFamily: `'${fontFamily}', sans-serif`, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: 4, marginBottom: 14 },
        ats: { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#334155", borderBottom: `1.5px solid ${accentColor}80`, paddingBottom: 3, marginBottom: 12, marginTop: 20 },
        minimal: { fontFamily: `'${fontFamily}', serif`, fontSize: 18, fontWeight: 600, color: "#111", marginBottom: 12, marginTop: 20 },
        sidebar: { fontFamily: `'${fontFamily}', sans-serif`, fontSize: 13, fontWeight: 600, color: "#1e293b", borderLeft: `3px solid ${accentColor}`, paddingLeft: 10, marginBottom: 12, marginTop: 18 },
        executive: { fontFamily: `'${fontFamily}', serif`, fontSize: 16, color: "#1a1a2e", marginBottom: 12, marginTop: 20, paddingBottom: 6, borderBottom: `2px solid ${accentColor}` },
    };

    const skillBadgeStyle = {
        modern: { background: `${accentColor}15`, color: accentColor, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500, display: "inline-block", margin: 2 },
        ats: { background: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: 4, fontSize: 11, display: "inline-block", margin: 2, border: "1px solid #cbd5e1" },
        minimal: { background: "transparent", color: "#374151", fontSize: 12, display: "inline-block", margin: "2px 8px 2px 0" },
        sidebar: { background: "#334155", color: "#e2e8f0", padding: "3px 8px", borderRadius: 4, fontSize: 10, display: "inline-block", margin: 2 },
        executive: { background: `${accentColor}15`, color: accentColor, padding: "3px 10px", borderRadius: 4, fontSize: 11, display: "inline-block", margin: 2, border: `1px solid ${accentColor}30` },
    };

    const SectionTitle = ({ children }) => (
        <div style={sectionTitleStyle[template] || sectionTitleStyle.ats}>{children}</div>
    );
    const SkillBadge = ({ s }) => (
        <span style={skillBadgeStyle[template] || skillBadgeStyle.ats}>{s}</span>
    );

    const rawSections = [
        { key: "summary", render: () => d.summary ? <><SectionTitle>Professional Summary</SectionTitle><div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}><EditableText value={d.summary} path="summary" placeholder="Write a summary..." isBlock={true} /></div></> : null },
        { key: "skills", render: () => d.skills.filter(Boolean).length ? <><SectionTitle>Skills</SectionTitle><div style={{ lineHeight: 2 }}>{d.skills.map((s, i) => s !== undefined ? <span key={i} style={{ display: "inline-block", margin: "2px" }}><SkillBadge s={<EditableText value={s} path={`skills.${i}`} placeholder="Skill" />} /></span> : null)}</div></> : null },
        { key: "experience", render: () => d.experience.filter(e => e.title).length ? <><SectionTitle>Experience</SectionTitle>{renderExp()}</> : null },
        { key: "education", render: () => d.education.filter(e => e.degree).length ? <><SectionTitle>Education</SectionTitle>{renderEdu()}</> : null },
        { key: "projects", render: () => d.projects.filter(pr => pr.name).length ? <><SectionTitle>Projects</SectionTitle>{renderProjects()}</> : null },
        { key: "certifications", render: () => d.certifications.filter(c => c.name).length ? <><SectionTitle>Certifications</SectionTitle>{renderCerts()}</> : null },
    ];

    const sections = rawSections.map(s => ({
        key: s.key,
        render: () => {
            const content = s.render();
            if (!content) return null;
            return (
                <SelectableWrapper elementKey={s.key}>
                    <div className={`element-${s.key}`}>
                        {content}
                    </div>
                </SelectableWrapper>
            );
        }
    })).sort((a, b) => (orderMap[a.key] ?? 99) - (orderMap[b.key] ?? 99));

    const contactRowStyle = { display: "flex", flexWrap: "wrap", gap: 16, fontSize: 11 };
    const baseStyle = { fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.5, color: "#1a1a1a", background: "#fff" };

    if (template === "nordic_slate") {
        const slateBaseStyle = {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11.5px",
            lineHeight: 1.5,
            color: "#2d3748",
            background: "#ffffff",
            minHeight: "297mm",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column"
        };
        const headerStyle = {
            background: "#a1b9c9",
            color: "#1a202c",
            padding: "24px 32px",
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: "32px",
            boxSizing: "border-box"
        };
        const bodyStyle = {
            padding: "24px 32px",
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: "32px",
            flex: 1,
            boxSizing: "border-box"
        };
        const h1Style = { fontSize: "24px", fontWeight: 700, color: "#1a202c", marginBottom: 2 };
        const titleStyle = { fontSize: "13px", fontWeight: 600, color: "#4a5568", marginBottom: 12 };
        const h2Style = {
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#1a202c",
            borderBottom: "1.5px solid #2d3748",
            paddingBottom: 3,
            margin: "0 0 12px 0"
        };
        const h3Style = { fontSize: "12px", fontWeight: 700, color: "#1a202c", marginBottom: 2 };
        const dateStyle = { fontSize: "10.5px", color: "#718096", fontStyle: "italic", marginBottom: 6, display: "block" };

        const renderNordicBullets = (descText) => {
            if (!descText) return null;
            const bullets = descText.split("\n").map(line => line.replace(/^[•\-\*\s]+/, "").trim()).filter(Boolean);
            if (bullets.length === 0) return null;
            return (
                <p style={{ fontSize: "11.5px", lineHeight: 1.5, color: "#2d3748", marginTop: 4 }}>
                    {bullets.map((b, idx) => (
                        <span key={idx}>
                            {idx === 0 ? "• " : " • "}
                            {b}
                        </span>
                    ))}
                </p>
            );
        };

        const renderContactItem = (icon, text) => {
            if (!text) return null;
            const itemStyle = {
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "11px",
                color: "#2d3748",
                marginBottom: 6
            };
            const iconCircleStyle = {
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                color: "#2d3748",
                flexShrink: 0
            };
            return (
                <div style={itemStyle}>
                    <span style={iconCircleStyle}>
                        <Icon name={icon} />
                    </span>
                    <span>{text}</span>
                </div>
            );
        };

        return (
            <div style={slateBaseStyle}>
                {/* Header Section */}
                <div style={headerStyle}>
                    <div>
                        <h1 style={h1Style}>{p.name || "Your Name"}</h1>
                        <p style={titleStyle}>{p.title}</p>
                        {renderContactItem("mail", p.email)}
                        {renderContactItem("phone", p.phone)}
                        {renderContactItem("user", p.location)}
                        {renderContactItem("link", p.linkedin)}
                        {renderContactItem("link", p.github)}
                        {renderContactItem("link", p.website)}
                    </div>
                    <div>
                        <h2 style={{ ...h2Style, borderBottom: "1px solid #1a202c" }}>Summary</h2>
                        <p style={{ fontSize: "11.5px", lineHeight: 1.4, color: "#2d3748" }}>{d.summary}</p>
                    </div>
                </div>

                {/* Body Section */}
                <div style={bodyStyle}>
                    {/* Left Column */}
                    <div style={{ borderRight: "1px solid #cbd5e1", paddingRight: 24 }}>
                        {/* Education */}
                        {d.education.filter(e => e.school || e.degree).length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <h2 style={h2Style}>Education</h2>
                                {d.education.filter(e => e.school || e.degree).map((e) => (
                                    <div key={e.id} style={{ marginBottom: 12 }}>
                                        <div style={{ fontWeight: 700, fontSize: "12px", color: "#1a202c" }}>{e.school}</div>
                                        <div style={{ fontSize: "10.5px", color: "#718096", fontStyle: "italic", marginBottom: 2 }}>
                                            · {e.start}{e.start && e.end ? " - " : ""}{e.end}
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: "11px", color: "#2d3748" }}>{e.degree}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Skills */}
                        {d.skills.filter(Boolean).length > 0 && (
                            <div>
                                <h2 style={h2Style}>Skills</h2>
                                {d.skills.filter(Boolean).map((s, i) => (
                                    <div key={i} style={{ fontSize: "11.5px", color: "#2d3748", marginBottom: 6 }}>{s}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div style={{ paddingLeft: 8 }}>
                        {/* Experience */}
                        {d.experience.filter(e => e.title || e.company).length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <h2 style={h2Style}>Experience</h2>
                                {d.experience.filter(e => e.title || e.company).map((e) => (
                                    <div key={e.id} style={{ marginBottom: 16 }}>
                                        <h3 style={h3Style}>{e.title}{e.company ? ` - ${e.company}` : ""}</h3>
                                        <span style={dateStyle}>{e.start}{e.start && e.end ? " - " : ""}{e.end}</span>
                                        {renderNordicBullets(e.desc)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Projects */}
                        {d.projects.filter(pr => pr.name).length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <h2 style={h2Style}>Projects</h2>
                                {d.projects.filter(pr => pr.name).map((pr) => (
                                    <div key={pr.id} style={{ marginBottom: 16 }}>
                                        <h3 style={h3Style}>
                                            {pr.name}
                                            {pr.url && (
                                                <span style={{ fontSize: "10px", marginLeft: 8 }}>
                                                    <a href={pr.url.startsWith("http") ? pr.url : `https://${pr.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a56db", textDecoration: "none" }}>Link</a>
                                                </span>
                                            )}
                                        </h3>
                                        {pr.tech && <div style={{ fontSize: "10.5px", color: "#718096", fontStyle: "italic", marginBottom: 4 }}>{pr.tech}</div>}
                                        {renderNordicBullets(pr.desc)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Certifications */}
                        {d.certifications.filter(c => c.name).length > 0 && (
                            <div>
                                <h2 style={h2Style}>Certifications and Licenses</h2>
                                {d.certifications.filter(c => c.name).map((c) => (
                                    <div key={c.id} style={{ marginBottom: 12, fontSize: "11.5px", lineHeight: 1.4 }}>
                                        <span style={{ fontWeight: 700, color: "#1a202c" }}>{c.name}</span>
                                        {c.issuer && <span> · {c.issuer}</span>}
                                        {(c.date || c.expiry) && (
                                            <span> · {c.date}{c.date && c.expiry ? " - " : ""}{c.expiry}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (template === "ats_premium") {
        const premiumBaseStyle = {
            fontFamily: "Arial, Calibri, sans-serif",
            fontSize: "11pt",
            lineHeight: 1.4,
            color: "#000000",
            background: "#ffffff",
            minHeight: "297mm",
            padding: "36px 44px",
            boxSizing: "border-box"
        };
        const h1Style = { fontSize: "22pt", fontWeight: 700, color: "#000000", marginBottom: 2 };
        const subtitleStyle = { fontSize: "11pt", fontWeight: 600, color: "#222222", marginBottom: 6 };
        const contactLineStyle = { fontSize: "10pt", color: "#222222", marginBottom: 4 };
        const h2Style = {
            fontSize: "10.5pt",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#000000",
            borderBottom: "1.5px solid #000000",
            paddingBottom: 3,
            margin: "18px 0 10px"
        };
        const h3Style = { fontSize: "11pt", fontWeight: 700, color: "#000000" };
        const dateStyle = { fontSize: "10pt", color: "#444444", fontWeight: 400, whiteSpace: "nowrap" };
        const companyStyle = { fontSize: "10.5pt", color: "#333333", marginBottom: 4 };
        const ulStyle = { listStyleType: "disc", paddingLeft: 20, marginTop: 4 };
        const liStyle = { marginBottom: 3, fontSize: "10.5pt", color: "#111111" };
        const skillRowStyle = { display: "flex", gap: 0, marginBottom: 5, fontSize: "10.5pt" };
        const skillLabelStyle = { fontWeight: 700, minWidth: 130, color: "#000000", flexShrink: 0 };
        const skillValStyle = { color: "#111111" };
        const projStackStyle = { fontSize: "10pt", color: "#444444", marginBottom: 4, fontStyle: "italic" };

        const renderPremiumBullets = (descText) => {
            if (!descText) return null;
            const bullets = descText.split("\n").map(line => line.replace(/^[•\-\*\s]+/, "").trim()).filter(Boolean);
            if (bullets.length === 0) return null;
            return (
                <ul style={ulStyle}>
                    {bullets.map((b, idx) => <li key={idx} style={liStyle}>{b}</li>)}
                </ul>
            );
        };

        const renderSectionContent = (key) => {
            switch (key) {
                case "summary":
                    if (!d.summary) return null;
                    return (
                        <div key="summary">
                            <h2 style={h2Style}>Professional Summary</h2>
                            <p style={{ fontSize: "10.5pt", color: "#111111", lineHeight: 1.55, marginBottom: 6 }}>
                                {d.summary}
                            </p>
                        </div>
                    );
                case "skills":
                    if (!d.skills || d.skills.filter(Boolean).length === 0) return null;
                    return (
                        <div key="skills">
                            <h2 style={h2Style}>Technical Skills</h2>
                            <div style={skillRowStyle}>
                                <span style={skillLabelStyle}>Skills:</span>
                                <span style={skillValStyle}>{d.skills.filter(Boolean).join(", ")}</span>
                            </div>
                        </div>
                    );
                case "experience":
                    const exps = d.experience.filter((e) => e.title || e.company);
                    if (exps.length === 0) return null;
                    return (
                        <div key="experience">
                            <h2 style={h2Style}>Work Experience</h2>
                            {exps.map((e) => (
                                <div key={e.id} style={{ marginBottom: 14 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", marginBottom: 2 }}>
                                        <h3 style={h3Style}>{e.title}</h3>
                                        <span style={dateStyle}>{e.start}{e.start && e.end ? " – " : ""}{e.end}</span>
                                    </div>
                                    <p style={companyStyle}>{e.company}{e.location ? ` \u00a0\u2013\u00a0 ${e.location}` : ""}</p>
                                    {renderPremiumBullets(e.desc)}
                                </div>
                            ))}
                        </div>
                    );
                case "education":
                    const edus = d.education.filter((e) => e.degree || e.school);
                    if (edus.length === 0) return null;
                    return (
                        <div key="education">
                            <h2 style={h2Style}>Education</h2>
                            {edus.map((e) => (
                                <div key={e.id} style={{ marginBottom: 8 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", marginBottom: 2 }}>
                                        <h3 style={h3Style}>{e.degree}</h3>
                                        <span style={dateStyle}>{e.start}{e.start && e.end ? " – " : ""}{e.end}</span>
                                    </div>
                                    <p style={companyStyle}>
                                        {e.school}{e.location ? ` \u00a0|\u00a0 ${e.location}` : ""}
                                        {(e.gpa || e.honors) && ` \u00a0|\u00a0 ${e.honors}${e.gpa ? ` (GPA: ${e.gpa})` : ""}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    );
                case "projects":
                    const projs = d.projects.filter((pr) => pr.name);
                    if (projs.length === 0) return null;
                    return (
                        <div key="projects">
                            <h2 style={h2Style}>Projects</h2>
                            {projs.map((pr) => (
                                <div key={pr.id} style={{ marginBottom: 12 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", marginBottom: 2 }}>
                                        <h3 style={h3Style}>{pr.name}</h3>
                                        {pr.url && <span style={{ fontSize: "10pt" }}><a href={pr.url.startsWith("http") ? pr.url : `https://${pr.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a56db", textDecoration: "none" }}>Link</a></span>}
                                    </div>
                                    {pr.tech && <p style={projStackStyle}>{pr.tech}</p>}
                                    {renderPremiumBullets(pr.desc)}
                                </div>
                            ))}
                        </div>
                    );
                case "certifications":
                    const certs = d.certifications.filter((c) => c.name);
                    if (certs.length === 0) return null;
                    return (
                        <div key="certifications">
                            <h2 style={h2Style}>Certifications</h2>
                            {certs.map((c) => (
                                <div key={c.id} style={{ marginBottom: 8 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", marginBottom: 2 }}>
                                        <h3 style={h3Style}>{c.name}</h3>
                                        <span style={dateStyle}>{c.date}{c.date && c.expiry ? ` \u2013 ` : ""}{c.expiry}</span>
                                    </div>
                                    <p style={companyStyle}>{c.issuer}</p>
                                </div>
                            ))}
                        </div>
                    );
                default:
                    return null;
            }
        };

        return (
            <div style={premiumBaseStyle}>
                <header>
                    <h1 style={h1Style}>{p.name || "Your Name"}</h1>
                    <p style={subtitleStyle}>{p.title}</p>
                    <div style={contactLineStyle}>
                        {p.phone && <>Phone: <a href={`tel:${p.phone}`} style={{ color: "#1a56db" }}>{p.phone}</a></>}
                        {p.phone && p.email && " \u00a0\u00a0|\u00a0\u00a0 "}
                        {p.email && <>Email: <a href={`mailto:${p.email}`} style={{ color: "#1a56db" }}>{p.email}</a></>}
                        {(p.phone || p.email) && p.location && " \u00a0\u00a0|\u00a0\u00a0 "}
                        {p.location && <>Location: {p.location}</>}
                    </div>
                    {(p.github || p.linkedin || p.website) && (
                        <div style={contactLineStyle}>
                            {p.github && <>GitHub: <a href={p.github.startsWith("http") ? p.github : `https://${p.github}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a56db" }}>{p.github}</a></>}
                            {p.github && p.linkedin && " \u00a0\u00a0|\u00a0\u00a0 "}
                            {p.linkedin && <>LinkedIn: <a href={p.linkedin.startsWith("http") ? p.linkedin : `https://${p.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a56db" }}>{p.linkedin}</a></>}
                            {(p.github || p.linkedin) && p.website && " \u00a0\u00a0|\u00a0\u00a0 "}
                            {p.website && <>Portfolio: <a href={p.website.startsWith("http") ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a56db" }}>{p.website}</a></>}
                        </div>
                    )}
                </header>

                <div style={{ marginTop: 10 }}>
                    {(d.sectionOrder || []).map((key) => renderSectionContent(key))}
                </div>
            </div>
        );
    }

    if (template === "golden_elegance") {
        const baseStyle = {
            fontFamily: "'Open Sans', sans-serif",
            fontSize: "12px",
            lineHeight: 1.4,
            color: "#4a5568",
            background: "#ffffff",
            minHeight: "297mm",
            boxSizing: "border-box",
            display: "flex",
            width: "210mm",
            margin: "0 auto"
        };
        const sidebarStyle = {
            width: "262px",
            flexShrink: 0,
            background: "#1a2744",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
        };
        const mainStyle = {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            boxSizing: "border-box",
        };
        const sidebarPhotoStyle = {
            padding: "34px 24px 22px",
            display: "flex",
            justifyContent: "center"
        };
        const circleStyle = {
            width: "130px",
            height: "130px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "4px solid #c9a84c",
            background: "#2d3f6e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        };
        const sidebarSectionStyle = {
            padding: "0 22px 20px"
        };
        const sidebarTitleStyle = {
            fontFamily: "'Raleway', sans-serif",
            fontSize: "12.5px",
            fontWeight: 800,
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: "#c9a84c",
            marginBottom: "10px",
            paddingBottom: "6px",
            borderBottom: "2px solid #c9a84c"
        };
        const contactItemStyle = {
            display: "flex",
            alignItems: "flex-start",
            gap: "9px",
            marginBottom: "10px"
        };
        const contactSpanStyle = {
            fontSize: "11.5px",
            color: "#cdd5e0",
            lineHeight: "1.5"
        };
        const skillItemStyle = {
            display: "flex",
            alignItems: "center",
            gap: "9px",
            marginBottom: "7px",
            fontSize: "12px",
            color: "#cdd5e0"
        };
        const skillDotStyle = {
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#c9a84c",
            flexShrink: 0
        };
        const refNameStyle = {
            fontSize: "13px",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "2px"
        };
        const refRoleStyle = {
            fontSize: "11.5px",
            color: "#a0aec0",
            marginBottom: "5px"
        };

        // Main elements
        const mainHeaderStyle = {
            background: "#2c3e5c",
            padding: "32px 36px 28px 36px",
            position: "relative",
            borderBottom: "4px solid #c9a84c"
        };
        const nameStyle = {
            fontFamily: "'Raleway', sans-serif",
            fontSize: "32px",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "3px",
            textTransform: "uppercase",
            lineHeight: 1
        };
        const jobTitleStyle = {
            fontFamily: "'Raleway', sans-serif",
            fontSize: "12.5px",
            fontWeight: 500,
            color: "#c9a84c",
            letterSpacing: "4px",
            textTransform: "uppercase",
            marginTop: "7px"
        };
        const mainBodyStyle = {
            padding: "24px 36px 32px",
            flex: 1,
            boxSizing: "border-box"
        };

        // Section Header
        const sectionHeadingStyle = {
            display: "flex",
            alignItems: "center",
            gap: "11px",
            marginBottom: "12px"
        };
        const iconCircleStyle = {
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#1a2744",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(26,39,68,0.25)"
        };
        const sectionTitleStyle = {
            fontFamily: "'Raleway', sans-serif",
            fontSize: "14.5px",
            fontWeight: 800,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#1a2744"
        };
        const sectionLineStyle = {
            flex: 1,
            height: "2px",
            background: "linear-gradient(90deg,#1a2744,#c9a84c)",
            marginLeft: "4px"
        };
        const profileTextStyle = {
            fontSize: "12.5px",
            color: "#4a5568",
            lineHeight: "1.75",
            textAlign: "justify",
            paddingLeft: "22px"
        };

        // Timeline elements
        const timelineStyle = {
            position: "relative",
            paddingLeft: "22px",
            marginTop: "4px"
        };
        const timelineLineStyle = {
            position: "absolute",
            left: "4px",
            top: "6px",
            bottom: "6px",
            width: "2px",
            background: "linear-gradient(180deg, #1a2744 0%, #c9a84c 100%)"
        };
        const timelineEntryStyle = {
            position: "relative",
            marginBottom: "18px"
        };
        const tlDotStyle = (filled) => ({
            position: "absolute",
            left: "-21px",
            top: "5px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            border: "2px solid #1a2744",
            background: filled ? "#c9a84c" : "white",
            zIndex: 1,
            boxShadow: filled ? "0 0 0 2px rgba(201,168,76,0.3)" : "none"
        });
        const jobRowStyle = {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline"
        };
        const jobNameStyle = {
            fontSize: "13px",
            fontWeight: 700,
            color: "#1a2744"
        };
        const jobDateStyle = {
            fontSize: "11px",
            color: "#fff",
            background: "#1a2744",
            padding: "1px 8px",
            borderRadius: "10px",
            whiteSpace: "nowrap",
            marginLeft: "8px"
        };
        const workTitleStyle = {
            fontSize: "12px",
            color: "#718096",
            marginBottom: "6px",
            marginTop: "1px",
            fontStyle: "italic"
        };
        const eduGpaStyle = {
            fontSize: "12px",
            color: "#4a5568",
            marginTop: "3px"
        };

        const renderGoldenBullets = (descText) => {
            if (!descText) return null;
            const bullets = descText.split("\n").map(line => line.replace(/^[•\-\*\s]+/, "").trim()).filter(Boolean);
            if (bullets.length === 0) return null;
            return (
                <ul style={{ marginTop: "4px", listStyleType: "none", padding: 0, margin: 0 }}>
                    {bullets.map((b, idx) => (
                        <li key={idx} style={{
                            fontSize: "12px",
                            color: "#4a5568",
                            paddingLeft: "14px",
                            position: "relative",
                            marginBottom: "4px",
                            lineHeight: "1.6",
                            textAlign: "justify"
                        }}>
                            <span style={{ position: "absolute", left: 0, color: "#c9a84c", fontSize: "14px", lineHeight: "1.3" }}>•</span>
                            {b}
                        </li>
                    ))}
                </ul>
            );
        };

        return (
            <div style={baseStyle}>
                {/* ── SIDEBAR ── */}
                <div style={sidebarStyle}>
                    {/* Photo */}
                    <div style={sidebarPhotoStyle}>
                        <div style={circleStyle}>
                            {p.photo ? (
                                <img src={p.photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="profile" />
                            ) : (
                                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100px", height: "100px" }}>
                                    <circle cx="50" cy="36" r="22" fill="#4a5e8a"/>
                                    <ellipse cx="50" cy="88" rx="34" ry="22" fill="#4a5e8a"/>
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Contact */}
                    <div style={sidebarSectionStyle}>
                        <div style={sidebarTitleStyle}>Contact</div>
                        {p.phone && (
                            <div style={contactItemStyle}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="#c9a84c"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
                                <span style={contactSpanStyle}>{p.phone}</span>
                            </div>
                        )}
                        {p.email && (
                            <div style={contactItemStyle}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="#c9a84c"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                <span style={contactSpanStyle}>{p.email}</span>
                            </div>
                        )}
                        {p.location && (
                            <div style={contactItemStyle}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                <span style={contactSpanStyle}>{p.location}</span>
                            </div>
                        )}
                        {p.website && (
                            <div style={contactItemStyle}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93V18c0-.55.45-1 1-1s1 .45 1 1v1.93C10.39 19.47 8.28 17.36 7.81 14.74H9c.55 0 1-.45 1-1s-.45-1-1-1H7.07C7.54 10.11 9.64 8 12 7.07V9c0 .55.45 1 1 1s1-.45 1-1V7.07c2.36.93 4.46 3.04 4.93 5.67H17c-.55 0-1 .45-1 1s-.45 1-1 1h1.19c-.47 2.62-2.57 4.73-4.93 5.66V18c0-.55-.45-1-1-1s-1 .45-1 1v.93z"/></svg>
                                <span style={contactSpanStyle}>{p.website}</span>
                            </div>
                        )}
                        {p.linkedin && (
                            <div style={contactItemStyle}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="#c9a84c" className="w-3 h-3"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                <span style={contactSpanStyle}>{p.linkedin}</span>
                            </div>
                        )}
                        {p.github && (
                            <div style={contactItemStyle}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="#c9a84c" className="w-3 h-3"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                <span style={contactSpanStyle}>{p.github}</span>
                            </div>
                        )}
                    </div>

                    {d.skills && d.skills.filter(Boolean).length > 0 && (
                        <>
                            <div style={{ height: "1px", background: "rgba(201,168,76,0.25)", margin: "20px 22px" }} />
                            <div style={sidebarSectionStyle}>
                                <div style={sidebarTitleStyle}>Skills</div>
                                {d.skills.filter(Boolean).map((s, idx) => (
                                    <div key={idx} style={skillItemStyle}>
                                        <span style={skillDotStyle}></span>
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {d.certifications && d.certifications.filter(c => c.name).length > 0 && (
                        <>
                            <div style={{ height: "1px", background: "rgba(201,168,76,0.25)", margin: "20px 22px" }} />
                            <div style={sidebarSectionStyle}>
                                <div style={sidebarTitleStyle}>Certifications</div>
                                {d.certifications.filter(c => c.name).map((c, idx) => (
                                    <div key={idx} style={{ marginBottom: 10 }}>
                                        <p style={refNameStyle}>{c.name}</p>
                                        <p style={refRoleStyle}>{c.issuer}</p>
                                        {(c.date || c.expiry) && (
                                            <p style={{ fontSize: "11px", color: "#cdd5e0" }}>
                                                {c.date}{c.date && c.expiry ? " – " : ""}{c.expiry}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* ── MAIN CONTENT ── */}
                <div style={mainStyle}>
                    {/* Header */}
                    <div style={mainHeaderStyle}>
                        <h1 style={nameStyle}>{p.name || "Your Name"}</h1>
                        {p.title && <p style={jobTitleStyle}>{p.title}</p>}
                    </div>

                    {/* Body */}
                    <div style={mainBodyStyle}>
                        {/* Profile Summary */}
                        {d.summary && (
                            <div style={{ marginBottom: "22px" }}>
                                <div style={sectionHeadingStyle}>
                                    <div style={iconCircleStyle}>
                                        <svg viewBox="0 0 24 24" style={{ width: "15px", height: "15px", fill: "#c9a84c" }}><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                                    </div>
                                    <span style={sectionTitleStyle}>Profile</span>
                                    <div style={sectionLineStyle}></div>
                                </div>
                                <p style={profileTextStyle}>{d.summary}</p>
                            </div>
                        )}

                        {/* Experience */}
                        {d.experience && d.experience.filter(e => e.title || e.company).length > 0 && (
                            <div style={{ marginBottom: "22px" }}>
                                <div style={sectionHeadingStyle}>
                                    <div style={iconCircleStyle}>
                                        <svg viewBox="0 0 24 24" style={{ width: "15px", height: "15px", fill: "#c9a84c" }}><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.29 15.71 0 13 0c-.96 0-1.86.28-2.61.76L9 2.38C8.15 1.52 7 1 5.73 1 3.1 1 1 3.07 1 5.64c0 .48.08.92.18 1.36H0v14h24V6h-4zm-7-4.27c.36-.22.77-.34 1.18-.34 1.25 0 2.27 1.01 2.27 2.27 0 .37-.12.77-.32 1.34H13V2.09c.01-.22.19-.34.32-.36zM5.73 2.91c.74 0 1.44.29 1.96.81.22.19.31.49.31.78v2.09H5.03c-.2-.57-.32-.97-.32-1.34 0-1.26 1.02-2.34 2.02-2.34zM22 18H2V8h20v10z"/></svg>
                                    </div>
                                    <span style={sectionTitleStyle}>Work Experience</span>
                                    <div style={sectionLineStyle}></div>
                                </div>

                                <div style={timelineStyle}>
                                    <div style={timelineLineStyle}></div>
                                    {d.experience.filter(e => e.title || e.company).map((e, idx) => (
                                        <div key={e.id} style={timelineEntryStyle}>
                                            <div style={tlDotStyle(idx === 0)}></div>
                                            <div style={jobRowStyle}>
                                                <span style={jobNameStyle}>{e.company}{e.location ? `, ${e.location}` : ""}</span>
                                                <span style={jobDateStyle}>{e.start}{e.start && e.end ? " – " : ""}{e.end}</span>
                                            </div>
                                            <p style={workTitleStyle}>{e.title}</p>
                                            {renderGoldenBullets(e.desc)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {d.projects && d.projects.filter(pr => pr.name).length > 0 && (
                            <div style={{ marginBottom: "22px" }}>
                                <div style={sectionHeadingStyle}>
                                    <div style={iconCircleStyle}>
                                        <svg viewBox="0 0 24 24" style={{ width: "15px", height: "15px", fill: "#c9a84c" }}><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
                                    </div>
                                    <span style={sectionTitleStyle}>Projects</span>
                                    <div style={sectionLineStyle}></div>
                                </div>

                                <div style={timelineStyle}>
                                    <div style={timelineLineStyle}></div>
                                    {d.projects.filter(pr => pr.name).map((pr, idx) => (
                                        <div key={pr.id} style={timelineEntryStyle}>
                                            <div style={tlDotStyle(idx === 0)}></div>
                                            <div style={jobRowStyle}>
                                                <span style={jobNameStyle}>{pr.name}</span>
                                                {pr.url && (
                                                    <span style={{ fontSize: "10px" }}>
                                                        <a href={pr.url.startsWith("http") ? pr.url : `https://${pr.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a56db", textDecoration: "none" }}>Link</a>
                                                    </span>
                                                )}
                                            </div>
                                            {pr.tech && <p style={workTitleStyle}>{pr.tech}</p>}
                                            {renderGoldenBullets(pr.desc)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {d.education && d.education.filter(edu => edu.school || edu.degree).length > 0 && (
                            <div>
                                <div style={sectionHeadingStyle}>
                                    <div style={iconCircleStyle}>
                                        <svg viewBox="0 0 24 24" style={{ width: "15px", height: "15px", fill: "#c9a84c" }}><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-1 12.99L5.13 13 4 13.61V17c0 1.1 3.58 3 8 3s8-1.9 8-3v-3.39l-1.13-.61L13 15.99l-1-.54-.01.54H11z"/></svg>
                                    </div>
                                    <span style={sectionTitleStyle}>Education</span>
                                    <div style={sectionLineStyle}></div>
                                </div>

                                <div style={timelineStyle}>
                                    <div style={timelineLineStyle}></div>
                                    {d.education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                                        <div key={edu.id} style={timelineEntryStyle}>
                                            <div style={tlDotStyle(idx === 0)}></div>
                                            <div style={jobRowStyle}>
                                                <span style={jobNameStyle}>{edu.degree}</span>
                                                <span style={jobDateStyle}>{edu.start}{edu.start && edu.end ? " – " : ""}{edu.end}</span>
                                            </div>
                                            <p style={workTitleStyle}>{edu.school}{edu.location ? `, ${edu.location}` : ""}</p>
                                            {(edu.gpa || edu.honors) && (
                                                <p style={eduGpaStyle}>
                                                    <strong>GPA:</strong> {edu.gpa} {edu.honors ? `(${edu.honors})` : ""}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (template === "tech_minimal") {
        const baseStyle = {
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            lineHeight: "1.6",
            color: "#1e293b",
            background: "#ffffff",
            minHeight: "297mm",
            padding: "36px 44px",
            boxSizing: "border-box"
        };
        const headerStyle = {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px"
        };
        const nameStyle = {
            fontSize: "26px",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.03em",
            lineHeight: "1.1"
        };
        const titleStyle = {
            fontSize: "13px",
            color: "#64748b",
            marginTop: "4px",
            fontFamily: "'Roboto Mono', monospace",
            fontWeight: 500
        };
        const contactBoxStyle = {
            textAlign: "right",
            fontSize: "11px",
            color: "#475569"
        };
        const lineDividerStyle = {
            height: "1px",
            background: "#cbd5e1",
            margin: "16px 0 24px"
        };
        const secHeadingStyle = {
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
            marginBottom: "12px",
            marginTop: "18px"
        };
        const secNumStyle = {
            fontFamily: "'Roboto Mono', monospace",
            fontSize: "11px",
            fontWeight: 600,
            color: "#3b82f6"
        };
        const secTitleStyle = {
            fontSize: "12.5px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#0f172a"
        };
        const techSkillsGridStyle = {
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginTop: "6px"
        };
        const skillBadgeStyle = {
            fontFamily: "'Roboto Mono', monospace",
            fontSize: "10.5px",
            background: "#f1f5f9",
            color: "#334155",
            padding: "3px 8px",
            borderRadius: "4px",
            border: "1px solid #e2e8f0"
        };
        const renderBullets = (descText) => {
            if (!descText) return null;
            const bullets = descText.split("\n").map(line => line.replace(/^[•\-\*\s]+/, "").trim()).filter(Boolean);
            return (
                <ul style={{ listStyleType: "disc", paddingLeft: "18px", marginTop: "4px" }}>
                    {bullets.map((b, idx) => (
                        <li key={idx} style={{ fontSize: "11.5px", color: "#334155", marginBottom: "3px" }}>{b}</li>
                    ))}
                </ul>
            );
        };

        const renderSection = (key) => {
            switch(key) {
                case "summary":
                    if (!d.summary) return null;
                    return (
                        <div key="summary" style={{ marginBottom: "16px" }}>
                            <div style={secHeadingStyle}>
                                <span style={secNumStyle}>// 01</span>
                                <span style={secTitleStyle}>Professional Summary</span>
                            </div>
                            <p style={{ fontSize: "11.5px", color: "#334155", lineHeight: "1.6" }}>{d.summary}</p>
                        </div>
                    );
                case "skills":
                    if (!d.skills || d.skills.filter(Boolean).length === 0) return null;
                    return (
                        <div key="skills" style={{ marginBottom: "16px" }}>
                            <div style={secHeadingStyle}>
                                <span style={secNumStyle}>// 02</span>
                                <span style={secTitleStyle}>Technical Skills</span>
                            </div>
                            <div style={techSkillsGridStyle}>
                                {d.skills.filter(Boolean).map((s, idx) => <span key={idx} style={skillBadgeStyle}>{s}</span>)}
                            </div>
                        </div>
                    );
                case "experience":
                    const exps = d.experience.filter(e => e.title || e.company);
                    if (exps.length === 0) return null;
                    return (
                        <div key="experience" style={{ marginBottom: "16px" }}>
                            <div style={secHeadingStyle}>
                                <span style={secNumStyle}>// 03</span>
                                <span style={secTitleStyle}>Work Experience</span>
                            </div>
                            {exps.map((e) => (
                                <div key={e.id} style={{ marginBottom: "12px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <span style={{ fontWeight: 700, fontSize: "12px", color: "#0f172a" }}>{e.title}</span>
                                        <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: "10px", color: "#64748b" }}>{e.start} – {e.end}</span>
                                    </div>
                                    <div style={{ fontFamily: "'Roboto Mono', monospace", fontSize: "10.5px", color: "#475569", marginTop: "1px" }}>
                                        {e.company}{e.location ? ` | ${e.location}` : ""}
                                    </div>
                                    {renderBullets(e.desc)}
                                </div>
                            ))}
                        </div>
                    );
                case "projects":
                    const projs = d.projects.filter(pr => pr.name);
                    if (projs.length === 0) return null;
                    return (
                        <div key="projects" style={{ marginBottom: "16px" }}>
                            <div style={secHeadingStyle}>
                                <span style={secNumStyle}>// 04</span>
                                <span style={secTitleStyle}>Selected Projects</span>
                            </div>
                            {projs.map((pr) => (
                                <div key={pr.id} style={{ marginBottom: "12px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <span style={{ fontWeight: 700, fontSize: "12px", color: "#0f172a" }}>{pr.name}</span>
                                        {pr.url && <span style={{ fontSize: "10.5px" }}><a href={pr.url.startsWith("http") ? pr.url : `https://${pr.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none", fontFamily: "'Roboto Mono', monospace" }}>{pr.url}</a></span>}
                                    </div>
                                    {pr.tech && <div style={{ fontSize: "10.5px", color: "#64748b", fontStyle: "italic" }}>Tech: {pr.tech}</div>}
                                    {renderBullets(pr.desc)}
                                </div>
                            ))}
                        </div>
                    );
                case "education":
                    const edus = d.education.filter(e => e.school || e.degree);
                    if (edus.length === 0) return null;
                    return (
                        <div key="education" style={{ marginBottom: "16px" }}>
                            <div style={secHeadingStyle}>
                                <span style={secNumStyle}>// 05</span>
                                <span style={secTitleStyle}>Education</span>
                            </div>
                            {edus.map((edu) => (
                                <div key={edu.id} style={{ marginBottom: "8px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <span style={{ fontWeight: 700, fontSize: "12px", color: "#0f172a" }}>{edu.degree}</span>
                                        <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: "10px", color: "#64748b" }}>{edu.start} – {edu.end}</span>
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#475569" }}>
                                        {edu.school}{edu.location ? `, ${edu.location}` : ""}{edu.gpa ? ` (GPA: ${edu.gpa})` : ""}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                case "certifications":
                    const certs = d.certifications.filter(c => c.name);
                    if (certs.length === 0) return null;
                    return (
                        <div key="certifications" style={{ marginBottom: "16px" }}>
                            <div style={secHeadingStyle}>
                                <span style={secNumStyle}>// 06</span>
                                <span style={secTitleStyle}>Certifications</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                {certs.map((c) => (
                                    <div key={c.id} style={{ fontSize: "11px", color: "#334155" }}>
                                        <strong>{c.name}</strong> – <span style={{ color: "#64748b" }}>{c.issuer}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                default: return null;
            }
        };

        return (
            <div style={baseStyle}>
                <div style={headerStyle}>
                    <div>
                        <h1 style={nameStyle}>{p.name || "Your Name"}</h1>
                        {p.title && <div style={titleStyle}>{p.title}</div>}
                    </div>
                    <div style={contactBoxStyle}>
                        {p.email && <div>{p.email}</div>}
                        {p.phone && <div>{p.phone}</div>}
                        {p.location && <div>{p.location}</div>}
                        {p.linkedin && <div>linkedin: {p.linkedin}</div>}
                        {p.github && <div>github: {p.github}</div>}
                    </div>
                </div>
                <div style={lineDividerStyle}></div>
                <div>{(d.sectionOrder || []).map(key => renderSection(key))}</div>
            </div>
        );
    }

    if (template === "creative_teal") {
        const baseStyle = {
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            lineHeight: "1.5",
            color: "#334155",
            background: "#ffffff",
            minHeight: "297mm",
            padding: "36px 40px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            borderLeft: "6px solid #0f766e"
        };
        const headerStyle = {
            marginBottom: "20px"
        };
        const nameStyle = {
            fontSize: "30px",
            fontWeight: 800,
            color: "#0f766e",
            letterSpacing: "-0.02em"
        };
        const titleStyle = {
            fontSize: "14px",
            color: "#475569",
            fontWeight: 500,
            letterSpacing: "1px",
            textTransform: "uppercase"
        };
        const contactRow = {
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "10.5px",
            color: "#64748b",
            marginTop: "8px"
        };
        const layoutStyle = {
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "28px",
            flex: 1
        };
        const headingStyle = {
            fontSize: "12px",
            fontWeight: 700,
            color: "#0f766e",
            textTransform: "uppercase",
            letterSpacing: "1px",
            borderBottom: "1.5px solid #ccfbf1",
            paddingBottom: "4px",
            marginBottom: "10px",
            marginTop: "16px"
        };
        const listBullets = (descText) => {
            if (!descText) return null;
            const bullets = descText.split("\n").map(line => line.replace(/^[•\-\*\s]+/, "").trim()).filter(Boolean);
            return (
                <ul style={{ listStyleType: "none", padding: 0, margin: "4px 0 0" }}>
                    {bullets.map((b, idx) => (
                        <li key={idx} style={{
                            fontSize: "11px",
                            color: "#475569",
                            position: "relative",
                            paddingLeft: "12px",
                            marginBottom: "3px"
                        }}>
                            <span style={{ position: "absolute", left: 0, color: "#14b8a6" }}>›</span>
                            {b}
                        </li>
                    ))}
                </ul>
            );
        };

        const renderLeft = () => (
            <div>
                {d.summary && (
                    <div style={{ marginBottom: "16px" }}>
                        <div style={headingStyle}>Profile</div>
                        <p style={{ fontSize: "11px", color: "#475569", lineHeight: "1.6" }}>{d.summary}</p>
                    </div>
                )}
                {d.skills && d.skills.filter(Boolean).length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                        <div style={headingStyle}>Skills</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {d.skills.filter(Boolean).map((s, idx) => (
                                <span key={idx} style={{
                                    fontSize: "10px",
                                    background: "#f0fdfa",
                                    color: "#0f766e",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccfbf1",
                                    fontWeight: 500
                                }}>{s}</span>
                            ))}
                        </div>
                    </div>
                )}
                {d.certifications && d.certifications.filter(c => c.name).length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                        <div style={headingStyle}>Certifications</div>
                        {d.certifications.filter(c => c.name).map((c) => (
                            <div key={c.id} style={{ marginBottom: "6px", fontSize: "10.5px" }}>
                                <div style={{ fontWeight: 600, color: "#334155" }}>{c.name}</div>
                                <div style={{ color: "#64748b" }}>{c.issuer}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );

        const renderRight = () => (
            <div>
                {d.experience && d.experience.filter(e => e.title || e.company).length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                        <div style={headingStyle}>Experience</div>
                        {d.experience.filter(e => e.title || e.company).map((e) => (
                            <div key={e.id} style={{ marginBottom: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                    <span style={{ fontWeight: 700, fontSize: "12px", color: "#1e293b" }}>{e.title}</span>
                                    <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 500 }}>{e.start} – {e.end}</span>
                                </div>
                                <div style={{ fontSize: "11px", color: "#0f766e", fontWeight: 500 }}>{e.company}{e.location ? ` | ${e.location}` : ""}</div>
                                {listBullets(e.desc)}
                            </div>
                        ))}
                    </div>
                )}
                {d.projects && d.projects.filter(pr => pr.name).length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                        <div style={headingStyle}>Projects</div>
                        {d.projects.filter(pr => pr.name).map((pr) => (
                            <div key={pr.id} style={{ marginBottom: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                    <span style={{ fontWeight: 700, fontSize: "12px", color: "#1e293b" }}>{pr.name}</span>
                                    {pr.url && <span style={{ fontSize: "10px" }}><a href={pr.url.startsWith("http") ? pr.url : `https://${pr.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "#14b8a6", textDecoration: "none" }}>Link</a></span>}
                                </div>
                                {pr.tech && <div style={{ fontSize: "10px", color: "#64748b", fontStyle: "italic" }}>{pr.tech}</div>}
                                {listBullets(pr.desc)}
                            </div>
                        ))}
                    </div>
                )}
                {d.education && d.education.filter(edu => edu.school || edu.degree).length > 0 && (
                    <div>
                        <div style={headingStyle}>Education</div>
                        {d.education.filter(edu => edu.school || edu.degree).map((edu) => (
                            <div key={edu.id} style={{ marginBottom: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                    <span style={{ fontWeight: 700, fontSize: "11.5px", color: "#1e293b" }}>{edu.degree}</span>
                                    <span style={{ fontSize: "10px", color: "#64748b" }}>{edu.start} – {edu.end}</span>
                                </div>
                                <div style={{ fontSize: "11px", color: "#475569" }}>{edu.school}{edu.location ? `, ${edu.location}` : ""}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );

        return (
            <div style={baseStyle}>
                <div style={headerStyle}>
                    <h1 style={nameStyle}>{p.name || "Your Name"}</h1>
                    {p.title && <div style={titleStyle}>{p.title}</div>}
                    <div style={contactRow}>
                        {p.email && <span>{p.email}</span>}
                        {p.phone && <span>· {p.phone}</span>}
                        {p.location && <span>· {p.location}</span>}
                        {p.linkedin && <span>· linkedin.com/in/{p.linkedin}</span>}
                        {p.github && <span>· github.com/{p.github}</span>}
                    </div>
                </div>
                <div style={layoutStyle}>
                    {renderLeft()}
                    {renderRight()}
                </div>
            </div>
        );
    }

    if (template === "classic_pro") {
        const baseStyle = {
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            lineHeight: "1.55",
            color: "#111111",
            background: "#ffffff",
            minHeight: "297mm",
            padding: "44px 48px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column"
        };
        const headerStyle = {
            textAlign: "center",
            marginBottom: "24px"
        };
        const nameStyle = {
            fontFamily: "'Playfair Display', serif",
            fontSize: "30px",
            fontWeight: 700,
            color: "#111827"
        };
        const titleStyle = {
            fontSize: "12px",
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginTop: "4px"
        };
        const contactStyle = {
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "10.5px",
            color: "#4b5563",
            marginTop: "10px"
        };
        const secHeaderStyle = {
            fontFamily: "'Playfair Display', serif",
            fontSize: "14px",
            fontWeight: 700,
            color: "#1f2937",
            textTransform: "uppercase",
            letterSpacing: "1px",
            borderBottom: "1.5px solid #1f2937",
            paddingBottom: "3px",
            marginTop: "18px",
            marginBottom: "10px"
        };
        const bulletsRenderer = (descText) => {
            if (!descText) return null;
            const bullets = descText.split("\n").map(line => line.replace(/^[•\-\*\s]+/, "").trim()).filter(Boolean);
            return (
                <ul style={{ listStyleType: "square", paddingLeft: "20px", marginTop: "3px" }}>
                    {bullets.map((b, idx) => (
                        <li key={idx} style={{ fontSize: "11.5px", color: "#374151", marginBottom: "2px" }}>{b}</li>
                    ))}
                </ul>
            );
        };

        const renderSection = (key) => {
            switch(key) {
                case "summary":
                    if (!d.summary) return null;
                    return (
                        <div key="summary" style={{ marginBottom: "14px" }}>
                            <div style={secHeaderStyle}>Profile Summary</div>
                            <p style={{ fontSize: "11.5px", color: "#374151", textAlign: "justify" }}>{d.summary}</p>
                        </div>
                    );
                case "skills":
                    if (!d.skills || d.skills.filter(Boolean).length === 0) return null;
                    return (
                        <div key="skills" style={{ marginBottom: "14px" }}>
                            <div style={secHeaderStyle}>Core Competencies</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                                {d.skills.filter(Boolean).map((s, idx) => (
                                    <div key={idx} style={{ fontSize: "11.5px", color: "#374151" }}>• {s}</div>
                                ))}
                            </div>
                        </div>
                    );
                case "experience":
                    const exps = d.experience.filter(e => e.title || e.company);
                    if (exps.length === 0) return null;
                    return (
                        <div key="experience" style={{ marginBottom: "14px" }}>
                            <div style={secHeaderStyle}>Professional Experience</div>
                            {exps.map((e) => (
                                <div key={e.id} style={{ marginBottom: "10px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "12px", color: "#1f2937" }}>
                                        <span>{e.title}</span>
                                        <span>{e.start} – {e.end}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontStyle: "italic", fontSize: "11px", color: "#4b5563" }}>
                                        <span>{e.company}</span>
                                        <span>{e.location}</span>
                                    </div>
                                    {bulletsRenderer(e.desc)}
                                </div>
                            ))}
                        </div>
                    );
                case "projects":
                    const projs = d.projects.filter(pr => pr.name);
                    if (projs.length === 0) return null;
                    return (
                        <div key="projects" style={{ marginBottom: "14px" }}>
                            <div style={secHeaderStyle}>Key Projects</div>
                            {projs.map((pr) => (
                                <div key={pr.id} style={{ marginBottom: "10px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "12px", color: "#1f2937" }}>
                                        <span>{pr.name}</span>
                                        {pr.url && <span style={{ fontStyle: "normal" }}><a href={pr.url.startsWith("http") ? pr.url : `https://${pr.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>{pr.url}</a></span>}
                                    </div>
                                    {pr.tech && <div style={{ fontSize: "10.5px", color: "#4b5563", fontStyle: "italic" }}>{pr.tech}</div>}
                                    {bulletsRenderer(pr.desc)}
                                </div>
                            ))}
                        </div>
                    );
                case "education":
                    const edus = d.education.filter(e => e.school || e.degree);
                    if (edus.length === 0) return null;
                    return (
                        <div key="education" style={{ marginBottom: "14px" }}>
                            <div style={secHeaderStyle}>Education</div>
                            {edus.map((edu) => (
                                <div key={edu.id} style={{ marginBottom: "6px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "11.5px", color: "#1f2937" }}>
                                        <span>{edu.degree}</span>
                                        <span>{edu.start} – {edu.end}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#4b5563" }}>
                                        <span>{edu.school}{edu.location ? `, ${edu.location}` : ""}</span>
                                        {edu.gpa && <span>GPA: {edu.gpa}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                case "certifications":
                    const certs = d.certifications.filter(c => c.name);
                    if (certs.length === 0) return null;
                    return (
                        <div key="certifications" style={{ marginBottom: "14px" }}>
                            <div style={secHeaderStyle}>Certifications</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11.5px", color: "#374151" }}>
                                {certs.map((c) => (
                                    <div key={c.id}>• <strong>{c.name}</strong> – {c.issuer}</div>
                                ))}
                            </div>
                        </div>
                    );
                default: return null;
            }
        };

        return (
            <div style={baseStyle}>
                <div style={headerStyle}>
                    <h1 style={nameStyle}>{p.name || "Your Name"}</h1>
                    {p.title && <div style={titleStyle}>{p.title}</div>}
                    <div style={contactStyle}>
                        {p.email && <span>{p.email}</span>}
                        {p.phone && <span>| {p.phone}</span>}
                        {p.location && <span>| {p.location}</span>}
                        {p.website && <span>| <a href={p.website.startsWith("http") ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{p.website}</a></span>}
                    </div>
                </div>
                <div>{(d.sectionOrder || []).map(key => renderSection(key))}</div>
            </div>
        );
    }

    if (template === "slate_grid") {
        const baseStyle = {
            fontFamily: "'Inter', sans-serif",
            fontSize: "11.5px",
            lineHeight: "1.5",
            color: "#374151",
            background: "#ffffff",
            minHeight: "297mm",
            padding: "36px 40px",
            boxSizing: "border-box"
        };
        const gridContainerStyle = {
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            gap: "36px",
            height: "100%"
        };
        const leftColStyle = {
            borderRight: "1px solid #e2e8f0",
            paddingRight: "28px"
        };
        const rightColStyle = {
            paddingLeft: "4px"
        };
        const sidebarTitleStyle = {
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#64748b",
            letterSpacing: "1.5px",
            marginBottom: "8px",
            marginTop: "18px"
        };
        const titleStyle = {
            fontSize: "24px",
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: "1.1"
        };
        const subtitleStyle = {
            fontSize: "12px",
            fontWeight: 500,
            color: "#334155",
            marginTop: "4px"
        };
        const secHeadingStyle = {
            fontSize: "12.5px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#334155",
            borderBottom: "2px solid #cbd5e1",
            paddingBottom: "4px",
            marginBottom: "12px",
            marginTop: "18px"
        };
        const renderBullets = (descText) => {
            if (!descText) return null;
            const bullets = descText.split("\n").map(line => line.replace(/^[•\-\*\s]+/, "").trim()).filter(Boolean);
            return (
                <ul style={{ listStyleType: "circle", paddingLeft: "16px", marginTop: "4px" }}>
                    {bullets.map((b, idx) => (
                        <li key={idx} style={{ fontSize: "11px", color: "#4b5563", marginBottom: "2px" }}>{b}</li>
                    ))}
                </ul>
            );
        };

        return (
            <div style={baseStyle}>
                <div style={gridContainerStyle}>
                    {/* Left Column */}
                    <div style={leftColStyle}>
                        <h1 style={titleStyle}>{p.name || "Your Name"}</h1>
                        <p style={subtitleStyle}>{p.title}</p>
                        
                        <div style={{ marginTop: "16px" }}>
                            <div style={sidebarTitleStyle}>Contact</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "10.5px", color: "#475569" }}>
                                {p.email && <div>{p.email}</div>}
                                {p.phone && <div>{p.phone}</div>}
                                {p.location && <div>{p.location}</div>}
                                {p.linkedin && <div style={{ wordBreak: "break-all" }}>{p.linkedin}</div>}
                                {p.github && <div style={{ wordBreak: "break-all" }}>{p.github}</div>}
                            </div>
                        </div>

                        {d.summary && (
                            <div style={{ marginTop: "16px" }}>
                                <div style={sidebarTitleStyle}>Profile Summary</div>
                                <p style={{ fontSize: "10.5px", color: "#475569", lineHeight: "1.5" }}>{d.summary}</p>
                            </div>
                        )}

                        {d.skills && d.skills.filter(Boolean).length > 0 && (
                            <div style={{ marginTop: "16px" }}>
                                <div style={sidebarTitleStyle}>Core Skills</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                    {d.skills.filter(Boolean).map((s, idx) => (
                                        <span key={idx} style={{
                                            fontSize: "9.5px",
                                            background: "#f8fafc",
                                            border: "1px solid #e2e8f0",
                                            padding: "2px 5px",
                                            borderRadius: "3px",
                                            color: "#475569"
                                        }}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div style={rightColStyle}>
                        {d.experience && d.experience.filter(e => e.title || e.company).length > 0 && (
                            <div style={{ marginBottom: "18px" }}>
                                <div style={secHeadingStyle}>Work Experience</div>
                                {d.experience.filter(e => e.title || e.company).map((e) => (
                                    <div key={e.id} style={{ marginBottom: "12px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 700 }}>
                                            <span style={{ fontSize: "11.5px", color: "#1e293b" }}>{e.title}</span>
                                            <span style={{ fontSize: "10px", color: "#64748b" }}>{e.start} – {e.end}</span>
                                        </div>
                                        <div style={{ fontSize: "11px", color: "#475569", fontWeight: 500 }}>{e.company}{e.location ? ` | ${e.location}` : ""}</div>
                                        {renderBullets(e.desc)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {d.projects && d.projects.filter(pr => pr.name).length > 0 && (
                            <div style={{ marginBottom: "18px" }}>
                                <div style={secHeadingStyle}>Projects</div>
                                {d.projects.filter(pr => pr.name).map((pr) => (
                                    <div key={pr.id} style={{ marginBottom: "12px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 700 }}>
                                            <span style={{ fontSize: "11.5px", color: "#1e293b" }}>{pr.name}</span>
                                            {pr.url && <span style={{ fontSize: "10px" }}><a href={pr.url.startsWith("http") ? pr.url : `https://${pr.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>Link</a></span>}
                                        </div>
                                        {pr.tech && <div style={{ fontSize: "10px", color: "#64748b", fontStyle: "italic" }}>{pr.tech}</div>}
                                        {renderBullets(pr.desc)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {d.education && d.education.filter(edu => edu.school || edu.degree).length > 0 && (
                            <div style={{ marginBottom: "18px" }}>
                                <div style={secHeadingStyle}>Education</div>
                                {d.education.filter(edu => edu.school || edu.degree).map((edu) => (
                                    <div key={edu.id} style={{ marginBottom: "8px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 700 }}>
                                            <span style={{ fontSize: "11px", color: "#1e293b" }}>{edu.degree}</span>
                                            <span style={{ fontSize: "10px", color: "#64748b" }}>{edu.start} – {edu.end}</span>
                                        </div>
                                        <div style={{ fontSize: "10.5px", color: "#475569" }}>{edu.school}{edu.location ? `, ${edu.location}` : ""}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {d.certifications && d.certifications.filter(c => c.name).length > 0 && (
                            <div>
                                <div style={secHeadingStyle}>Certifications</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                    {d.certifications.filter(c => c.name).map((c) => (
                                        <div key={c.id} style={{ fontSize: "10.5px", color: "#475569" }}>
                                            • <strong>{c.name}</strong> <span style={{ fontSize: "9.5px", color: "#64748b" }}>({c.issuer})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (template === "editorial_chic") {
        const baseStyle = {
            fontFamily: "'Inter', sans-serif",
            fontSize: "11.5px",
            lineHeight: "1.6",
            color: "#292524",
            background: "#ffffff",
            minHeight: "297mm",
            padding: "44px 50px",
            boxSizing: "border-box"
        };
        const headerStyle = {
            borderBottom: "1.5px solid #d6d3d1",
            paddingBottom: "24px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end"
        };
        const nameStyle = {
            fontFamily: "'Playfair Display', serif",
            fontSize: "34px",
            fontWeight: 800,
            color: "#1c1917",
            lineHeight: "1.0",
            letterSpacing: "-0.02em"
        };
        const titleStyle = {
            fontSize: "12px",
            color: "#78716c",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "3px",
            marginTop: "6px"
        };
        const contactStyle = {
            textAlign: "right",
            fontSize: "10.5px",
            color: "#57534e",
            lineHeight: "1.5"
        };
        const secTitleStyle = {
            fontFamily: "'Playfair Display', serif",
            fontSize: "15px",
            fontWeight: 700,
            color: "#1c1917",
            letterSpacing: "0.5px",
            marginBottom: "12px",
            marginTop: "20px",
            display: "flex",
            alignItems: "center"
        };
        const secLineStyle = {
            flex: 1,
            height: "1px",
            background: "#e7e5e4",
            marginLeft: "12px"
        };
        const bulletStyle = {
            listStyleType: "circle",
            paddingLeft: "16px",
            marginTop: "4px"
        };
        const renderBullets = (descText) => {
            if (!descText) return null;
            const bullets = descText.split("\n").map(line => line.replace(/^[•\-\*\s]+/, "").trim()).filter(Boolean);
            return (
                <ul style={bulletStyle}>
                    {bullets.map((b, idx) => (
                        <li key={idx} style={{ fontSize: "11px", color: "#44403c", marginBottom: "2px" }}>{b}</li>
                    ))}
                </ul>
            );
        };

        const renderSection = (key) => {
            switch(key) {
                case "summary":
                    if (!d.summary) return null;
                    return (
                        <div key="summary" style={{ marginBottom: "16px" }}>
                            <div style={secTitleStyle}>Profile<span style={secLineStyle} /></div>
                            <p style={{ fontSize: "11px", color: "#44403c", textAlign: "justify" }}>{d.summary}</p>
                        </div>
                    );
                case "skills":
                    if (!d.skills || d.skills.filter(Boolean).length === 0) return null;
                    return (
                        <div key="skills" style={{ marginBottom: "16px" }}>
                            <div style={secTitleStyle}>Core Competencies<span style={secLineStyle} /></div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {d.skills.filter(Boolean).map((s, idx) => (
                                    <span key={idx} style={{
                                        fontSize: "10px",
                                        background: "#fafaf9",
                                        border: "1px solid #e7e5e4",
                                        padding: "3px 8px",
                                        borderRadius: "2px",
                                        color: "#57534e",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    );
                case "experience":
                    const exps = d.experience.filter(e => e.title || e.company);
                    if (exps.length === 0) return null;
                    return (
                        <div key="experience" style={{ marginBottom: "16px" }}>
                            <div style={secTitleStyle}>Experience History<span style={secLineStyle} /></div>
                            {exps.map((e) => (
                                <div key={e.id} style={{ marginBottom: "12px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <span style={{ fontWeight: 700, fontSize: "12px", color: "#1c1917" }}>{e.title}</span>
                                        <span style={{ fontSize: "10.5px", color: "#78716c", fontWeight: 500 }}>{e.start} – {e.end}</span>
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#a8a29e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginTop: "1px" }}>
                                        {e.company}{e.location ? ` / ${e.location}` : ""}
                                    </div>
                                    {renderBullets(e.desc)}
                                </div>
                            ))}
                        </div>
                    );
                case "projects":
                    const projs = d.projects.filter(pr => pr.name);
                    if (projs.length === 0) return null;
                    return (
                        <div key="projects" style={{ marginBottom: "16px" }}>
                            <div style={secTitleStyle}>Selected Projects<span style={secLineStyle} /></div>
                            {projs.map((pr) => (
                                <div key={pr.id} style={{ marginBottom: "12px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <span style={{ fontWeight: 700, fontSize: "12px", color: "#1c1917" }}>{pr.name}</span>
                                        {pr.url && <span style={{ fontSize: "10.5px" }}><a href={pr.url.startsWith("http") ? pr.url : `https://${pr.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "#78716c", textDecoration: "underline" }}>Link</a></span>}
                                    </div>
                                    {pr.tech && <div style={{ fontSize: "10.5px", color: "#78716c", fontStyle: "italic" }}>{pr.tech}</div>}
                                    {renderBullets(pr.desc)}
                                </div>
                            ))}
                        </div>
                    );
                case "education":
                    const edus = d.education.filter(e => e.school || e.degree);
                    if (edus.length === 0) return null;
                    return (
                        <div key="education" style={{ marginBottom: "16px" }}>
                            <div style={secTitleStyle}>Academic Credentials<span style={secLineStyle} /></div>
                            {edus.map((edu) => (
                                <div key={edu.id} style={{ marginBottom: "8px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <span style={{ fontWeight: 700, fontSize: "11.5px", color: "#1c1917" }}>{edu.degree}</span>
                                        <span style={{ fontSize: "10.5px", color: "#78716c" }}>{edu.start} – {edu.end}</span>
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#78716c" }}>{edu.school}{edu.location ? `, ${edu.location}` : ""}</div>
                                </div>
                            ))}
                        </div>
                    );
                case "certifications":
                    const certs = d.certifications.filter(c => c.name);
                    if (certs.length === 0) return null;
                    return (
                        <div key="certifications" style={{ marginBottom: "16px" }}>
                            <div style={secTitleStyle}>Certifications<span style={secLineStyle} /></div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                {certs.map((c) => (
                                    <div key={c.id} style={{ fontSize: "11px", color: "#44403c" }}>
                                        • <strong>{c.name}</strong> – <span style={{ color: "#78716c" }}>{c.issuer}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                default: return null;
            }
        };

        const renderWrappedSection = (key) => {
            const el = renderSection(key);
            if (!el) return null;
            return (
                <SelectableWrapper elementKey={key}>
                    <div className={`element-${key}`}>
                        {el}
                    </div>
                </SelectableWrapper>
            );
        };

        return (
            <div style={baseStyle}>
                <SelectableWrapper elementKey="personal">
                    <div className="element-personal" style={headerStyle}>
                        <div>
                            <h1 style={nameStyle}>
                                <EditableText value={p.name} path="personal.name" placeholder="Your Name" />
                            </h1>
                            {p.title !== undefined && (
                                <p style={titleStyle}>
                                    <EditableText value={p.title} path="personal.title" placeholder="Job Title" />
                                </p>
                            )}
                        </div>
                        <div style={contactStyle}>
                            {p.email !== undefined && (
                                <div>
                                    <EditableText value={p.email} path="personal.email" placeholder="Email" />
                                </div>
                            )}
                            {p.phone !== undefined && (
                                <div>
                                    <EditableText value={p.phone} path="personal.phone" placeholder="Phone" />
                                </div>
                            )}
                            {p.location !== undefined && (
                                <div>
                                    <EditableText value={p.location} path="personal.location" placeholder="Location" />
                                </div>
                            )}
                        </div>
                    </div>
                </SelectableWrapper>
                <div>{(d.sectionOrder || []).map(key => renderWrappedSection(key))}</div>
            </div>
        );
    }

    if (template === "modern") return (
        <div style={{ ...baseStyle, minHeight: "297mm", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            <SelectableWrapper elementKey="personal">
                <div className="element-personal" style={{ background: "linear-gradient(135deg,#1e3a5f,#2563eb)", color: "#fff", padding: "36px 40px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                        {p.photo && <img src={p.photo} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,.3)" }} alt="" />}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Georgia',serif", fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
                                <EditableText value={p.name} path="personal.name" placeholder="Your Name" />
                            </div>
                            <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>
                                <EditableText value={p.title} path="personal.title" placeholder="Job Title" />
                            </div>
                            <div style={{ ...contactRowStyle, opacity: 0.9 }}>
                                <ContactItem icon="mail" text={<EditableText value={p.email} path="personal.email" placeholder="Email" />} />
                                <ContactItem icon="phone" text={<EditableText value={p.phone} path="personal.phone" placeholder="Phone" />} />
                                <ContactItem icon="user" text={<EditableText value={p.location} path="personal.location" placeholder="Location" />} />
                                <ContactItem icon="link" text={<EditableText value={p.linkedin} path="personal.linkedin" placeholder="LinkedIn" />} />
                            </div>
                        </div>
                    </div>
                </div>
            </SelectableWrapper>
            <div style={{ padding: "28px 40px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 32, flex: 1 }}>
                <div>{sections.filter(s => ["summary", "experience", "projects"].includes(s.key)).map(s => <div key={s.key}>{s.render()}</div>)}</div>
                <div>{sections.filter(s => ["skills", "education", "certifications"].includes(s.key)).map(s => <div key={s.key}>{s.render()}</div>)}</div>
            </div>
        </div>
    );

    if (template === "sidebar") return (
        <div style={{ ...baseStyle, minHeight: "297mm", display: "flex", boxSizing: "border-box" }}>
            <div style={{ width: 200, background: "linear-gradient(180deg,#1e293b,#0f172a)", color: "#fff", padding: "28px 20px", flexShrink: 0 }}>
                <SelectableWrapper elementKey="personal">
                    <div className="element-personal">
                        {p.photo && <img src={p.photo} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", marginBottom: 16 }} alt="" />}
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.2 }}>
                            <EditableText value={p.name} path="personal.name" placeholder="Your Name" />
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>
                            <EditableText value={p.title} path="personal.title" placeholder="Job Title" />
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", marginBottom: 8 }}>Contact</div>
                        <div style={{ fontSize: 10, color: "#cbd5e1", marginBottom: 4, wordBreak: "break-all" }}>
                            <EditableText value={p.email} path="personal.email" placeholder="Email" />
                        </div>
                        <div style={{ fontSize: 10, color: "#cbd5e1", marginBottom: 4 }}>
                            <EditableText value={p.phone} path="personal.phone" placeholder="Phone" />
                        </div>
                        <div style={{ fontSize: 10, color: "#cbd5e1", marginBottom: 4 }}>
                            <EditableText value={p.location} path="personal.location" placeholder="Location" />
                        </div>
                    </div>
                </SelectableWrapper>
                {d.skills.filter(Boolean).length > 0 && <>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", marginBottom: 8, marginTop: 16 }}>Skills</div>
                    <div>{d.skills.filter(Boolean).map((s, i) => <span key={i} style={skillBadgeStyle.sidebar}>{s}</span>)}</div>
                </>}
            </div>
            <div style={{ flex: 1, padding: "28px 28px" }}>
                {sections.filter(s => !["skills", "certifications"].includes(s.key)).map(s => <div key={s.key}>{s.render()}</div>)}
            </div>
        </div>
    );

    if (template === "executive") return (
        <div style={{ ...baseStyle, minHeight: "297mm", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            <SelectableWrapper elementKey="personal">
                <div className="element-personal" style={{ background: "#1a1a2e", color: "#fff", padding: "36px 44px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, background: "rgba(250,204,21,.08)", borderRadius: "50%" }} />
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 20, position: "relative", zIndex: 1 }}>
                        {p.photo && <img src={p.photo} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} alt="" />}
                        <div>
                            <div style={{ fontFamily: "'Georgia',serif", fontSize: 34, fontWeight: 700, marginBottom: 4 }}>
                                <EditableText value={p.name} path="personal.name" placeholder="Your Name" />
                            </div>
                            <div style={{ fontSize: 13, color: "#fbbf24", marginBottom: 16, textTransform: "uppercase", letterSpacing: 2 }}>
                                <EditableText value={p.title} path="personal.title" placeholder="Job Title" />
                            </div>
                            <div style={{ ...contactRowStyle, color: "#94a3b8" }}>
                                <ContactItem icon="mail" text={<EditableText value={p.email} path="personal.email" placeholder="Email" />} />
                                <ContactItem icon="phone" text={<EditableText value={p.phone} path="personal.phone" placeholder="Phone" />} />
                                <ContactItem icon="user" text={<EditableText value={p.location} path="personal.location" placeholder="Location" />} />
                            </div>
                        </div>
                    </div>
                </div>
            </SelectableWrapper>
            <div style={{ padding: "28px 44px", flex: 1 }}>{sections.map(s => <div key={s.key}>{s.render()}</div>)}</div>
        </div>
    );

    if (template === "minimal") return (
        <div style={{ ...baseStyle, minHeight: "297mm", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            <SelectableWrapper elementKey="personal">
                <div className="element-personal" style={{ padding: "40px 48px 24px", borderBottom: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                        {p.photo && <img src={p.photo} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} alt="" />}
                        <div>
                            <div style={{ fontFamily: "'Georgia',serif", fontSize: 36, fontWeight: 600, color: "#111", marginBottom: 4 }}>
                                <EditableText value={p.name} path="personal.name" placeholder="Your Name" />
                            </div>
                            {p.title && (
                                <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
                                    <EditableText value={p.title} path="personal.title" placeholder="Job Title" />
                                </div>
                            )}
                            <div style={{ ...contactRowStyle, color: "#9ca3af" }}>
                                <ContactItem icon="mail" text={<EditableText value={p.email} path="personal.email" placeholder="Email" />} />
                                <ContactItem icon="phone" text={<EditableText value={p.phone} path="personal.phone" placeholder="Phone" />} />
                                <ContactItem icon="user" text={<EditableText value={p.location} path="personal.location" placeholder="Location" />} />
                            </div>
                        </div>
                    </div>
                </div>
            </SelectableWrapper>
            <div style={{ padding: "24px 48px", flex: 1 }}>{sections.map(s => <div key={s.key}>{s.render()}</div>)}</div>
        </div>
    );

    // ATS (default)
    return (
        <div style={{ ...baseStyle, minHeight: "297mm", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            <SelectableWrapper elementKey="personal">
                <div className="element-personal" style={{ background: "#f8fafc", padding: "28px 40px", borderBottom: "2px solid #334155" }}>
                    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                        {p.photo && <img src={p.photo} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} alt="" />}
                        <div>
                            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 28, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                                <EditableText value={p.name} path="personal.name" placeholder="Your Name" />
                            </div>
                            {p.title && (
                                <div style={{ fontSize: 13, color: "#475569", marginBottom: 8 }}>
                                    <EditableText value={p.title} path="personal.title" placeholder="Job Title" />
                                </div>
                            )}
                            <div style={{ ...contactRowStyle, color: "#475569" }}>
                                <ContactItem icon="mail" text={<EditableText value={p.email} path="personal.email" placeholder="Email" />} />
                                <ContactItem icon="phone" text={<EditableText value={p.phone} path="personal.phone" placeholder="Phone" />} />
                                <ContactItem icon="user" text={<EditableText value={p.location} path="personal.location" placeholder="Location" />} />
                                <ContactItem icon="link" text={<EditableText value={p.linkedin} path="personal.linkedin" placeholder="LinkedIn" />} />
                            </div>
                        </div>
                    </div>
                </div>
            </SelectableWrapper>
            <div style={{ padding: "24px 40px", flex: 1 }}>{sections.map(s => <div key={s.key}>{s.render()}</div>)}</div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// LEFT PANEL (full form)
// ═══════════════════════════════════════════════════════════════════

/**
 * FormPanel — the entire left-side editor panel
 */
export function FormPanel({ data, onUpdate, onAIGenerate, aiLoading }) {
    const up = (path, v) => {
        onUpdate(path, v);
    };
    const upP = (k) => (e) => up(`personal.${k}`, e.target.value);

    const addExp = () => onUpdate("experience", [...data.experience, { id: genId(), title: "", company: "", location: "", start: "", end: "", desc: "" }]);
    const removeExp = (id) => onUpdate("experience", data.experience.filter(e => e.id !== id));
    const updateExp = (id, k, v) => onUpdate("experience", data.experience.map(e => e.id === id ? { ...e, [k]: v } : e));

    const addEdu = () => onUpdate("education", [...data.education, { id: genId(), degree: "", school: "", location: "", start: "", end: "", gpa: "", honors: "" }]);
    const removeEdu = (id) => onUpdate("education", data.education.filter(e => e.id !== id));
    const updateEdu = (id, k, v) => onUpdate("education", data.education.map(e => e.id === id ? { ...e, [k]: v } : e));

    const addProj = () => onUpdate("projects", [...data.projects, { id: genId(), name: "", tech: "", desc: "", url: "" }]);
    const removeProj = (id) => onUpdate("projects", data.projects.filter(p => p.id !== id));
    const updateProj = (id, k, v) => onUpdate("projects", data.projects.map(p => p.id === id ? { ...p, [k]: v } : p));

    const addCert = () => onUpdate("certifications", [...data.certifications, { id: genId(), name: "", issuer: "", date: "", expiry: "" }]);
    const removeCert = (id) => onUpdate("certifications", data.certifications.filter(c => c.id !== id));
    const updateCert = (id, k, v) => onUpdate("certifications", data.certifications.map(c => c.id === id ? { ...c, [k]: v } : c));

    const moveSection = (key, dir) => {
        const order = [...data.sectionOrder];
        const i = order.indexOf(key);
        if (dir === "up" && i > 0) { [order[i - 1], order[i]] = [order[i], order[i - 1]]; }
        if (dir === "down" && i < order.length - 1) { [order[i], order[i + 1]] = [order[i + 1], order[i]]; }
        onUpdate("sectionOrder", order);
    };

    return (
        <div className="overflow-y-auto bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 h-full">
            {/* Personal Info */}
            <FormSection icon={<Icon name="user" />} title="Personal Information">
                <div className="flex items-start gap-3 mb-4">
                    <PhotoUpload
                        src={data.personal.photo}
                        onChange={(v) => up("personal.photo", v)}
                    />
                    <Field label="Full Name" className="flex-1">
                        <TextInput value={data.personal.name} onChange={upP("name")} placeholder="Alex Johnson" />
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <Field label="Job Title"><TextInput value={data.personal.title || ""} onChange={upP("title")} placeholder="Software Engineer" /></Field>
                    <Field label="Location"><TextInput value={data.personal.location} onChange={upP("location")} placeholder="San Francisco, CA" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <Field label="Email"><TextInput type="email" value={data.personal.email} onChange={upP("email")} placeholder="you@email.com" /></Field>
                    <Field label="Phone"><TextInput value={data.personal.phone} onChange={upP("phone")} placeholder="+1 (555) 000-0000" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="LinkedIn"><TextInput value={data.personal.linkedin} onChange={upP("linkedin")} placeholder="linkedin.com/in/you" /></Field>
                    <Field label="GitHub"><TextInput value={data.personal.github} onChange={upP("github")} placeholder="github.com/you" /></Field>
                </div>
            </FormSection>

            {/* Summary */}
            <FormSection icon={<Icon name="zap" />} title="Professional Summary">
                <div className="flex justify-end mb-3">
                    <Button variant="ai" onClick={onAIGenerate} disabled={aiLoading} className="text-xs">
                        {aiLoading ? <><Spinner /> Generating…</> : <><Icon name="sparkles" /> AI Generate</>}
                    </Button>
                </div>
                <TextArea
                    value={data.summary}
                    onChange={(e) => up("summary", e.target.value)}
                    placeholder="Write 2–3 sentences about your expertise and impact…"
                    rows={4}
                />
            </FormSection>

            {/* Skills */}
            <FormSection icon={<Icon name="code" />} title="Skills" badge={data.skills.filter(Boolean).length}>
                <SkillsEditorInput
                    skills={data.skills}
                    onChange={(v) => onUpdate("skills", v)}
                />
            </FormSection>

            {/* Experience */}
            <FormSection icon={<Icon name="briefcase" />} title="Experience" badge={data.experience.length}>
                {data.experience.map((exp, i) => (
                    <ExperienceEntry
                        key={exp.id}
                        exp={exp}
                        index={i}
                        onChange={(id, k, v) => updateExp(id, k, v)}
                        onRemove={() => removeExp(exp.id)}
                    />
                ))}
                <Button variant="success" onClick={addExp} className="w-full justify-center">
                    <Icon name="plus" /> Add Experience
                </Button>
            </FormSection>

            {/* Education */}
            <FormSection icon={<Icon name="book" />} title="Education" badge={data.education.length}>
                {data.education.map((edu, i) => (
                    <EducationEntry
                        key={edu.id}
                        edu={edu}
                        index={i}
                        onChange={(id, k, v) => updateEdu(id, k, v)}
                        onRemove={() => removeEdu(edu.id)}
                    />
                ))}
                <Button variant="success" onClick={addEdu} className="w-full justify-center">
                    <Icon name="plus" /> Add Education
                </Button>
            </FormSection>

            {/* Projects */}
            <FormSection icon={<Icon name="code" />} title="Projects" badge={data.projects.length}>
                {data.projects.map((proj, i) => (
                    <ProjectEntry
                        key={proj.id}
                        proj={proj}
                        index={i}
                        onChange={(id, k, v) => updateProj(id, k, v)}
                        onRemove={() => removeProj(proj.id)}
                    />
                ))}
                <Button variant="success" onClick={addProj} className="w-full justify-center">
                    <Icon name="plus" /> Add Project
                </Button>
            </FormSection>

            {/* Certifications */}
            <FormSection icon={<Icon name="award" />} title="Certifications" badge={data.certifications.length}>
                {data.certifications.map((cert, i) => (
                    <CertificationEntry
                        key={cert.id}
                        cert={cert}
                        index={i}
                        onChange={(id, k, v) => updateCert(id, k, v)}
                        onRemove={() => removeCert(cert.id)}
                    />
                ))}
                <Button variant="success" onClick={addCert} className="w-full justify-center">
                    <Icon name="plus" /> Add Certification
                </Button>
            </FormSection>

            {/* Section Order */}
            <FormSection icon={<Icon name="settings" />} title="Section Order">
                <SectionOrderEditor order={data.sectionOrder} onMove={moveSection} />
            </FormSection>

            <div className="h-10" />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// PREVIEW PANEL (right side)
// ═══════════════════════════════════════════════════════════════════

/**
 * PreviewPanel — the right-side resume preview pane
 */
export function PreviewPanel({ 
    data, 
    template, 
    previewRef, 
    design, 
    onDesignChange, 
    onAskAI, 
    aiLoading, 
    onReset, 
    isLocked, 
    onToggleLock,
    selectedElement,
    setSelectedElement,
    onUpdate
}) {
    const [zoom, setZoom] = useState(100);
    const accentColor = design?.accentColor || "#2563eb";
    const fontFamily = design?.fontFamily || "Inter";
    const fontSize = design?.fontSize || "12px";

    const overrides = design?.overrides || {};
    
    // Generate element-specific override CSS dynamically
    const overrideStyles = Object.entries(overrides).map(([key, style]) => {
        if (!style) return "";
        const fFamily = style.fontFamily ? `font-family: '${style.fontFamily}', sans-serif !important;` : "";
        const fSize = style.fontSize ? `font-size: ${style.fontSize} !important;` : "";
        const color = style.accentColor ? `color: ${style.accentColor} !important; border-color: ${style.accentColor} !important;` : "";
        const fWeight = style.bold !== undefined ? `font-weight: ${style.bold ? "bold" : "normal"} !important;` : "";
        const fStyle = style.italic !== undefined ? `font-style: ${style.italic ? "italic" : "normal"} !important;` : "";
        const textDec = style.underline !== undefined ? `text-decoration: ${style.underline ? "underline" : "none"} !important;` : "";
        const textTransform = style.uppercase !== undefined ? `text-transform: ${style.uppercase ? "uppercase" : "none"} !important;` : "";
        const textAlign = style.textAlignment ? `text-align: ${style.textAlignment} !important;` : "";

        return `
            .resume-preview-content .element-${key}, 
            .resume-preview-content .element-${key} * {
                ${fFamily}
                ${fWeight}
                ${fStyle}
                ${textDec}
                ${textTransform}
                ${textAlign}
            }
            .resume-preview-content .element-${key} {
                ${fSize}
            }
            /* Specific text tags overrides for headers */
            .resume-preview-content .element-${key} h1,
            .resume-preview-content .element-${key} h2,
            .resume-preview-content .element-${key} h3 {
                ${color}
            }
            /* Background selector overrides */
            .resume-preview-content .element-${key} [style*="background"],
            .resume-preview-content .element-${key} [style*="background-color"] {
                ${style.accentColor ? `background: ${style.accentColor} !important; background-color: ${style.accentColor} !important;` : ""}
            }
        `;
    }).join("\n");

    return (
        <div 
            onClick={() => setSelectedElement(null)}
            className="flex-1 overflow-auto flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-950/60 transition-colors duration-200"
        >
            {/* Global style overrides for templates */}
            <style>{`
                .resume-preview-content, .resume-preview-content * {
                    font-family: '${fontFamily}', sans-serif !important;
                }
                
                /* Typography sizing and styles */
                .resume-preview-content {
                    font-size: ${fontSize} !important;
                }
                .resume-preview-content h1 {
                    font-size: calc(${fontSize} * 2.2) !important;
                    font-weight: ${design.bold ? "bold" : "800"} !important;
                    font-style: ${design.italic ? "italic" : "normal"} !important;
                    text-decoration: ${design.underline ? "underline" : design.strikethrough ? "line-through" : "none"} !important;
                    text-transform: ${design.uppercase ? "uppercase" : "none"} !important;
                    text-align: ${design.textAlignment || "left"} !important;
                }
                .resume-preview-content h2, 
                .resume-preview-content .section-title {
                    font-size: calc(${fontSize} * 1.3) !important;
                    font-weight: ${design.bold ? "bold" : "700"} !important;
                    font-style: ${design.italic ? "italic" : "normal"} !important;
                    text-decoration: ${design.underline ? "underline" : design.strikethrough ? "line-through" : "none"} !important;
                    text-transform: ${design.uppercase ? "uppercase" : "none"} !important;
                    text-align: ${design.textAlignment || "left"} !important;
                }
                .resume-preview-content h3 {
                    font-size: calc(${fontSize} * 1.1) !important;
                    font-weight: ${design.bold ? "bold" : "600"} !important;
                    font-style: ${design.italic ? "italic" : "normal"} !important;
                    text-decoration: ${design.underline ? "underline" : design.strikethrough ? "line-through" : "none"} !important;
                    text-transform: ${design.uppercase ? "uppercase" : "none"} !important;
                }
                .resume-preview-content p, 
                .resume-preview-content span, 
                .resume-preview-content li, 
                .resume-preview-content div {
                    font-size: ${fontSize};
                }
                
                /* Nordic Slate accents */
                .resume-preview-content [style*="background: rgb(161, 185, 201)"],
                .resume-preview-content [style*="background-color: rgb(161, 185, 201)"] {
                    background: ${accentColor} !important;
                    background-color: ${accentColor} !important;
                }
                
                /* Creative Teal accents */
                .resume-preview-content [style*="color: rgb(15, 118, 110)"] {
                    color: ${accentColor} !important;
                }
                .resume-preview-content [style*="border-left: 6px solid rgb(15, 118, 110)"],
                .resume-preview-content [style*="border-left-color: rgb(15, 118, 110)"] {
                    border-left-color: ${accentColor} !important;
                }
                .resume-preview-content [style*="border-bottom: 1.5px solid rgb(204, 251, 241)"],
                .resume-preview-content [style*="border-bottom-color: rgb(204, 251, 241)"] {
                    border-bottom-color: ${accentColor}30 !important;
                }
                
                /* Tech Minimal accents */
                .resume-preview-content [style*="color: rgb(59, 130, 246)"] {
                    color: ${accentColor} !important;
                }
                
                /* Golden Elegance accents */
                .resume-preview-content [style*="color: rgb(201, 168, 76)"] {
                    color: ${accentColor} !important;
                }
                .resume-preview-content [style*="border-color: rgb(201, 168, 76)"],
                .resume-preview-content [style*="border-bottom: 2px solid rgb(201, 168, 76)"] {
                    border-color: ${accentColor} !important;
                    border-bottom-color: ${accentColor} !important;
                }
                .resume-preview-content [style*="fill: rgb(201, 168, 76)"] {
                    fill: ${accentColor} !important;
                }
                .resume-preview-content [style*="border: 4px solid rgb(201, 168, 76)"] {
                    border-color: ${accentColor} !important;
                }
                
                /* Modern header gradient */
                .resume-preview-content [style*="background: linear-gradient(135deg, rgb(30, 58, 95), rgb(37, 99, 235))"] {
                    background: linear-gradient(135deg, ${accentColor}, ${accentColor}dd) !important;
                }

                /* Element style overrides */
                ${overrideStyles}
            `}</style>

            {/* Contextual Canva format and floating action helper bar */}
            {selectedElement && (
                <CanvaToolbar
                    design={overrides[selectedElement] || {
                        fontFamily: design.fontFamily || "Inter",
                        fontSize: design.fontSize || "12px",
                        accentColor: design.accentColor || "#2563eb",
                    }}
                    onChange={(newElementDesign) => {
                        const nextOverrides = {
                            ...overrides,
                            [selectedElement]: newElementDesign
                        };
                        onDesignChange({ ...design, overrides: nextOverrides });
                    }}
                    onAskAI={onAskAI}
                    aiLoading={aiLoading}
                    onReset={onReset}
                    isLocked={isLocked}
                    onToggleLock={onToggleLock}
                />
            )}
            <div className="flex flex-wrap items-center justify-between w-full max-w-[850px] gap-3 mb-6 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Preview Canvas</span>
                    <Badge variant="blue">{TEMPLATES.find((t) => t.id === template)?.label}</Badge>
                </div>
                
                {/* Zoom Controls */}
                <div className="flex items-center gap-2 border border-slate-200/60 dark:border-slate-800/85 px-2 py-1 rounded-xl bg-slate-50/50 dark:bg-slate-950/30">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(50, z - 10)); }}
                        className="px-2 py-0.5 rounded text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                        title="Zoom Out"
                    >
                        －
                    </button>
                    <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-350 min-w-[36px] text-center">{zoom}%</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(150, z + 10)); }}
                        className="px-2 py-0.5 rounded text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                        title="Zoom In"
                    >
                        ＋
                    </button>
                    <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-800 mx-1" />
                    <button 
                        onClick={(e) => { e.stopPropagation(); setZoom(100); }}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded hover:bg-slate-250 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
                    >
                        Reset
                    </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    Auto-saved
                </div>
            </div>
            <div className="w-full flex-1 flex items-start justify-center overflow-auto py-2">
                <div
                    ref={previewRef}
                    className="resume-preview-content"
                    style={{ 
                        width: "210mm", 
                        minHeight: "297mm", 
                        background: "#fff", 
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", 
                        borderRadius: 12, 
                        margin: "0 auto",
                        zoom: zoom / 100,
                        transformOrigin: "top center"
                    }}
                >
                    <ResumePreview 
                        data={data} 
                        template={template} 
                        design={design} 
                        selectedElement={selectedElement}
                        setSelectedElement={setSelectedElement}
                        onUpdate={onUpdate}
                    />
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// CANVA STYLES & TEMPLATE SIDEBAR PANELS
// ═══════════════════════════════════════════════════════════════════

export function DesignPanel({ design, onChange }) {
    const customColorRef = useRef();
    const fonts = ["Inter", "Georgia", "Courier New"];
    const colors = [
        { name: "Executive Navy", value: "#1e3a8a" },
        { name: "Teal Dream", value: "#0f766e" },
        { name: "Sunset Crimson", value: "#be123c" },
        { name: "Slate Dark", value: "#334155" },
        { name: "Golden Elegance", value: "#c9a84c" },
        { name: "Emerald Mint", value: "#059669" },
        { name: "Royal Violet", value: "#7c3aed" },
        { name: "Warm Amber", value: "#d97706" },
        { name: "Hot Rose", value: "#db2777" },
        { name: "Classic Black", value: "#0f172a" },
    ];
    const spacings = [
        { label: "Compact", value: "compact" },
        { label: "Standard", value: "standard" },
        { label: "Spacious", value: "spacious" },
    ];

    const isPreset = colors.some(c => c.value === design.accentColor);

    return (
        <div className="p-5 space-y-6 overflow-y-auto h-full bg-slate-50 dark:bg-slate-950">
            {/* Customizer Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3.5">Accent Color</h3>
                <div className="grid grid-cols-5 gap-2.5">
                    {colors.map((c) => (
                        <button
                            key={c.value}
                            onClick={() => onChange({ ...design, accentColor: c.value })}
                            className={cn(
                                "w-8 h-8 rounded-full border-2 transition-transform hover:scale-105",
                                design.accentColor === c.value ? "border-blue-600 scale-110 shadow-md shadow-blue-500/20" : "border-transparent"
                            )}
                            style={{ backgroundColor: c.value }}
                            title={c.name}
                        />
                    ))}

                    {/* Custom Color Selector (Color Wheel Icon) */}
                    <button
                        onClick={() => customColorRef.current?.click()}
                        className={cn(
                            "w-8 h-8 rounded-full border-2 transition-transform hover:scale-105 flex items-center justify-center relative overflow-hidden",
                            !isPreset ? "border-blue-600 scale-110 shadow-md shadow-blue-500/20" : "border-transparent"
                        )}
                        style={{
                            background: !isPreset ? design.accentColor : "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)"
                        }}
                        title="Custom Color"
                    >
                        {!isPreset ? (
                            <span className="text-[10px] text-white font-bold drop-shadow-sm">✓</span>
                        ) : (
                            <span className="text-sm text-white font-extrabold mix-blend-difference">+</span>
                        )}
                    </button>
                    <input
                        ref={customColorRef}
                        type="color"
                        value={design.accentColor}
                        onChange={(e) => onChange({ ...design, accentColor: e.target.value })}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Typography Card */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Typography</h3>
                <div className="space-y-2">
                    {fonts.map((f) => (
                        <button
                            key={f}
                            onClick={() => onChange({ ...design, fontFamily: f })}
                            className={cn(
                                "w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200",
                                design.fontFamily === f
                                    ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350"
                            )}
                            style={{ fontFamily: f }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Page Spacing</h3>
                <div className="grid grid-cols-3 gap-2">
                    {spacings.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => onChange({ ...design, spacing: s.value })}
                            className={cn(
                                "px-3 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all duration-200",
                                design.spacing === s.value
                                    ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350"
                            )}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function TemplateDrawer({ current, onSelect, data }) {
    const getBadge = (id) => {
        if (id.includes("ats")) return { text: "ATS Friendly", variant: "green" };
        if (id.includes("creative") || id.includes("modern")) return { text: "Creative", variant: "blue" };
        if (id.includes("minimal")) return { text: "Minimalist", variant: "slate" };
        return { text: "Professional", variant: "blue" };
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Resume Templates</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Select a layout to format your document</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {TEMPLATES.map((t) => {
                    const badge = getBadge(t.id);
                    return (
                        <div
                            key={t.id}
                            onClick={() => onSelect(t.id)}
                            className={cn(
                                "group flex flex-col rounded-xl border bg-white dark:bg-slate-900 p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                                current === t.id
                                    ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/10 shadow-sm"
                                    : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {t.label}
                                </h4>
                                <Badge variant={badge.variant}>{badge.text}</Badge>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed">
                                {t.desc}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════

/**
 * ResumeBuilder — root application component.
 * Drop this anywhere in your app. Manages state, orchestrates panels.
 */
export default function ResumeBuilder() {
    const [data, setData] = useLocalStorage("resume-data-v3", defaultData);
    const [template, setTemplate] = useLocalStorage("resume-template", "modern");
    const [dark, setDark] = useLocalStorage("resume-dark", false);
    const [activeTab, setActiveTab] = useState("form");
    const [aiLoading, setAiLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [sidebarTab, setSidebarTab] = useState("content");
    const [design, setDesign] = useLocalStorage("resume-design-settings-v1", {
        fontFamily: "Inter",
        accentColor: "#2563eb",
        spacing: "standard",
        fontSize: "12px",
    });
    const previewRef = useRef();
    const [isLocked, setIsLocked] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);

    // Dark mode toggle
    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
    }, [dark]);

    // Generic deep-path updater
    const update = useCallback((path, value) => {
        setData((prev) => {
            const parts = typeof path === "string" ? path.split(".") : [path];
            if (parts.length === 1) return { ...prev, [parts[0]]: value };
            const next = { ...prev };
            let cur = next;
            for (let i = 0; i < parts.length - 1; i++) {
                cur[parts[i]] = Array.isArray(cur[parts[i]]) ? [...cur[parts[i]]] : { ...cur[parts[i]] };
                cur = cur[parts[i]];
            }
            cur[parts[parts.length - 1]] = value;
            return next;
        });
    }, [setData]);

    const generateAI = async () => {
        setAiLoading(true);
        try {
            const res = await generateAISummary(data.personal, data.experience);
            if (res.summary) {
                update("summary", res.summary);
            } else if (res.error) {
                console.error("AI Generation error:", res.error);
                throw new Error(res.error);
            }
        } catch (err) {
            console.error("AI Generation failed, falling back to static summary:", err);
            update("summary", `Dynamic ${data.personal.title || "professional"} with proven expertise in delivering high-impact results. Skilled at leading teams and building scalable solutions that drive business growth.`);
        }
        setAiLoading(false);
    };


    const downloadPDF = async () => {
        setDownloading(true);
        try {
            const el = previewRef.current;
            if (!el) return;
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const w = pdf.internal.pageSize.getWidth();
            const h = (canvas.height * w) / canvas.width;
            let y = 0;
            const pageH = pdf.internal.pageSize.getHeight();
            while (y < h) {
                if (y > 0) pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, -y, w, h);
                y += pageH;
            }
            const resumeName = `${data.personal.name || "Untitled"} Resume (${new Date().toLocaleDateString()})`;
            pdf.save(`${data.personal.name || "resume"}_resume.pdf`);

            // Auto-save to user profile database if logged in
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    await saveUserResume({
                        name: resumeName,
                        templateId: template,
                        resumeData: data
                    });
                } catch (saveErr) {
                    console.error("Failed to auto-save resume to database:", saveErr);
                }
            }
        } catch (err) {
            console.error(err);
        }
        setDownloading(false);
    };

    const resetData = () => {
        if (window.confirm("Reset all data to defaults?")) setData(defaultData);
    };

    return (
        <div className={cn("flex flex-col h-screen overflow-hidden font-sans", dark ? "dark" : "")}>
            <TopBar
                dark={dark}
                onToggleDark={() => setDark(!dark)}
                onDownload={downloadPDF}
                onReset={resetData}
                downloading={downloading}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onToggleTemplates={() => setSidebarTab(sidebarTab === "templates" ? "content" : "templates")}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Canva-style Vertical Tab Menu */}
                <div className={cn(
                    "w-[72px] bg-slate-900 text-slate-400 flex flex-col items-center py-4 gap-4 flex-shrink-0 z-10",
                    activeTab === "preview" ? "hidden md:flex" : "flex"
                )}>
                    {[
                        { id: "templates", label: "Templates", icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
                                <rect x="3" y="16" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" />
                            </svg>
                        )},
                        { id: "content", label: "Content", icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                        )},
                        { id: "styles", label: "Styles", icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                                <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                                <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                            </svg>
                        )},
                        { id: "reorder", label: "Reorder", icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        )},
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setSidebarTab(tab.id);
                                if (activeTab === "preview") setActiveTab("form");
                            }}
                            className={cn(
                                "flex flex-col items-center justify-center w-14 h-14 rounded-xl gap-1.5 text-[10px] font-semibold transition-all duration-150 relative",
                                sidebarTab === tab.id
                                    ? "bg-slate-800/80 text-blue-400 border border-slate-700/30 shadow-inner"
                                    : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {sidebarTab === tab.id && (
                                <span className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r bg-blue-500 shadow-[0_0_8px_rgb(59,130,246)]"></span>
                            )}
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Left panel — hidden on mobile when previewing */}
                <div className={cn(
                    "w-[380px] min-w-[340px] flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
                    activeTab === "preview" ? "hidden md:flex" : "flex"
                )}>
                    {sidebarTab === "content" && (
                        <FormPanel
                            data={data}
                            onUpdate={update}
                            onAIGenerate={generateAI}
                            aiLoading={aiLoading}
                        />
                    )}
                    {sidebarTab === "templates" && (
                        <TemplateDrawer
                            current={template}
                            onSelect={(t) => setTemplate(t)}
                            data={data}
                        />
                    )}
                    {sidebarTab === "styles" && (
                        <DesignPanel
                            design={design}
                            onChange={setDesign}
                        />
                    )}
                    {sidebarTab === "reorder" && (
                        <div className="p-5 space-y-4 overflow-y-auto h-full bg-slate-50 dark:bg-slate-950">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Section Order</h3>
                            <SectionOrderEditor order={data.sectionOrder} onMove={moveSection} />
                        </div>
                    )}
                </div>

                {/* Right panel — hidden on mobile when editing */}
                <div className={cn(
                    "flex-1 overflow-hidden",
                    "md:flex",
                    activeTab === "form" ? "hidden md:flex" : "flex"
                )}>
                    <PreviewPanel 
                        data={data} 
                        template={template} 
                        previewRef={previewRef} 
                        design={design} 
                        onDesignChange={(newDesign) => {
                            if (!isLocked) setDesign(newDesign);
                        }}
                        onAskAI={generateAI}
                        aiLoading={aiLoading}
                        onReset={resetData}
                        isLocked={isLocked}
                        onToggleLock={() => setIsLocked(!isLocked)}
                        selectedElement={selectedElement}
                        setSelectedElement={setSelectedElement}
                        onUpdate={update}
                    />
                </div>
            </div>
        </div>
    );
}