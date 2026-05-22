import { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { generateAISummary, saveUserResume } from "../services/api";

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
 * TemplateSelector — strip of template buttons
 */
export function TemplateSelector({ current, onSelect }) {
    return (
        <div className="flex items-center gap-2 flex-wrap px-5 py-3
                    bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">Template</span>
            {TEMPLATES.map((t) => (
                <button
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    title={t.desc}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150",
                        current === t.id
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-transparent text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600"
                    )}
                >
                    {t.label}
                </button>
            ))}
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
        <header className="h-14 flex items-center gap-3 px-5 bg-white dark:bg-slate-900
                       border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-20 shadow-sm">
            <span className="font-black text-lg bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent tracking-tight">
                ✦
            </span>
            <div className="flex-1" />

            {/* Mobile tab switcher */}
            <div className="flex md:hidden gap-1">
                {["form", "preview"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                            activeTab === tab
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-transparent text-slate-500 border-slate-200 dark:border-slate-700"
                        )}
                    >
                        {tab === "form" ? "Edit" : "Preview"}
                    </button>
                ))}
            </div>

            <Button variant="ghost" onClick={onToggleTemplates} className="hidden md:inline-flex text-xs py-1.5">
                <Icon name="settings" /> Templates
            </Button>

            <Button variant="primary" onClick={onDownload} disabled={downloading} className="text-xs py-1.5">
                {downloading ? <><Spinner /> Exporting…</> : <><Icon name="download" /> Download PDF</>}
            </Button>

            <Button variant="ghost" onClick={onToggleDark} className="px-2.5 py-1.5">
                <Icon name={dark ? "sun" : "moon"} />
            </Button>

            <Button variant="ghost" onClick={onReset} className="px-2.5 py-1.5" title="Reset to defaults">
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
export function ResumePreview({ data, template }) {
    const d = data;
    const p = d.personal;

    const orderMap = {};
    (d.sectionOrder || []).forEach((s, i) => (orderMap[s] = i));

    const renderExp = () =>
        d.experience.filter((e) => e.title || e.company).map((e) => (
            <div key={e.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{e.title}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                        {e.start}{e.start && e.end ? " – " : ""}{e.end}
                    </span>
                </div>
                <div style={{ fontSize: 12, color: "#4a5568" }}>
                    {e.company}{e.location ? `, ${e.location}` : ""}
                </div>
                {e.desc && (
                    <div style={{ fontSize: 11.5, color: "#374151", marginTop: 4, whiteSpace: "pre-wrap" }}>
                        {e.desc}
                    </div>
                )}
            </div>
        ));

    const renderEdu = () =>
        d.education.filter((e) => e.degree || e.school).map((e) => (
            <div key={e.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{e.degree}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                        {e.start}{e.start && e.end ? " – " : ""}{e.end}
                    </span>
                </div>
                <div style={{ fontSize: 12, color: "#4a5568" }}>
                    {e.school}{e.location ? `, ${e.location}` : ""}
                </div>
                {(e.gpa || e.honors) && (
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                        {e.honors}{e.gpa ? ` | GPA: ${e.gpa}` : ""}
                    </div>
                )}
            </div>
        ));

    const renderProjects = () =>
        d.projects.filter((pr) => pr.name).map((pr) => (
            <div key={pr.id} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{pr.name}</div>
                {pr.tech && <div style={{ fontSize: 11, color: "#6b7280" }}>{pr.tech}</div>}
                {pr.desc && <div style={{ fontSize: 11.5, color: "#374151" }}>{pr.desc}</div>}
                {pr.url && <div style={{ fontSize: 10, color: "#6366f1", marginTop: 2 }}>{pr.url}</div>}
            </div>
        ));

    const renderCerts = () =>
        d.certifications.filter((c) => c.name).map((c) => (
            <div key={c.id} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontWeight: 500, fontSize: 12 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{c.issuer}</div>
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "right" }}>
                    {c.date}{c.expiry ? ` – ${c.expiry}` : ""}
                </div>
            </div>
        ));

    // Template-specific section title styles
    const sectionTitleStyle = {
        modern: { fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#2563eb", borderBottom: "2px solid #2563eb", paddingBottom: 4, marginBottom: 14 },
        ats: { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#334155", borderBottom: "1.5px solid #cbd5e1", paddingBottom: 3, marginBottom: 12, marginTop: 20 },
        minimal: { fontFamily: "'Georgia', serif", fontSize: 18, fontWeight: 600, color: "#111", marginBottom: 12, marginTop: 20 },
        sidebar: { fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: "#1e293b", borderLeft: "3px solid #6366f1", paddingLeft: 10, marginBottom: 12, marginTop: 18 },
        executive: { fontFamily: "'Georgia', serif", fontSize: 16, color: "#1a1a2e", marginBottom: 12, marginTop: 20, paddingBottom: 6, borderBottom: "2px solid #fbbf24" },
    };

    const skillBadgeStyle = {
        modern: { background: "#dbeafe", color: "#1d4ed8", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500, display: "inline-block", margin: 2 },
        ats: { background: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: 4, fontSize: 11, display: "inline-block", margin: 2, border: "1px solid #cbd5e1" },
        minimal: { background: "transparent", color: "#374151", fontSize: 12, display: "inline-block", margin: "2px 8px 2px 0" },
        sidebar: { background: "#334155", color: "#e2e8f0", padding: "3px 8px", borderRadius: 4, fontSize: 10, display: "inline-block", margin: 2 },
        executive: { background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: 4, fontSize: 11, display: "inline-block", margin: 2, border: "1px solid #fde68a" },
    };

    const SectionTitle = ({ children }) => (
        <div style={sectionTitleStyle[template] || sectionTitleStyle.ats}>{children}</div>
    );
    const SkillBadge = ({ s }) => (
        <span style={skillBadgeStyle[template] || skillBadgeStyle.ats}>{s}</span>
    );

    const sections = [
        { key: "summary", render: () => d.summary ? <><SectionTitle>Professional Summary</SectionTitle><p style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{d.summary}</p></> : null },
        { key: "skills", render: () => d.skills.filter(Boolean).length ? <><SectionTitle>Skills</SectionTitle><div style={{ lineHeight: 2 }}>{d.skills.filter(Boolean).map((s, i) => <SkillBadge key={i} s={s} />)}</div></> : null },
        { key: "experience", render: () => d.experience.filter(e => e.title).length ? <><SectionTitle>Experience</SectionTitle>{renderExp()}</> : null },
        { key: "education", render: () => d.education.filter(e => e.degree).length ? <><SectionTitle>Education</SectionTitle>{renderEdu()}</> : null },
        { key: "projects", render: () => d.projects.filter(pr => pr.name).length ? <><SectionTitle>Projects</SectionTitle>{renderProjects()}</> : null },
        { key: "certifications", render: () => d.certifications.filter(c => c.name).length ? <><SectionTitle>Certifications</SectionTitle>{renderCerts()}</> : null },
    ].sort((a, b) => (orderMap[a.key] ?? 99) - (orderMap[b.key] ?? 99));

    const contactRowStyle = { display: "flex", flexWrap: "wrap", gap: 16, fontSize: 11 };
    const baseStyle = { fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.5, color: "#1a1a1a", background: "#fff" };

    if (template === "modern") return (
        <div style={baseStyle}>
            <div style={{ background: "linear-gradient(135deg,#1e3a5f,#2563eb)", color: "#fff", padding: "36px 40px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                    {p.photo && <img src={p.photo} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,.3)" }} alt="" />}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Georgia',serif", fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{p.name || "Your Name"}</div>
                        <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>{p.title}</div>
                        <div style={{ ...contactRowStyle, opacity: 0.9 }}>
                            <ContactItem icon="mail" text={p.email} />
                            <ContactItem icon="phone" text={p.phone} />
                            <ContactItem icon="user" text={p.location} />
                            <ContactItem icon="link" text={p.linkedin} />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ padding: "28px 40px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 32 }}>
                <div>{sections.filter(s => ["summary", "experience", "projects"].includes(s.key)).map(s => <div key={s.key}>{s.render()}</div>)}</div>
                <div>{sections.filter(s => ["skills", "education", "certifications"].includes(s.key)).map(s => <div key={s.key}>{s.render()}</div>)}</div>
            </div>
        </div>
    );

    if (template === "sidebar") return (
        <div style={baseStyle}>
            <div style={{ display: "flex", minHeight: "297mm" }}>
                <div style={{ width: 200, background: "linear-gradient(180deg,#1e293b,#0f172a)", color: "#fff", padding: "28px 20px", flexShrink: 0 }}>
                    {p.photo && <img src={p.photo} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", marginBottom: 16 }} alt="" />}
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.2 }}>{p.name || "Your Name"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>{p.title}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", marginBottom: 8 }}>Contact</div>
                    {p.email && <div style={{ fontSize: 10, color: "#cbd5e1", marginBottom: 4, wordBreak: "break-all" }}>{p.email}</div>}
                    {p.phone && <div style={{ fontSize: 10, color: "#cbd5e1", marginBottom: 4 }}>{p.phone}</div>}
                    {p.location && <div style={{ fontSize: 10, color: "#cbd5e1", marginBottom: 4 }}>{p.location}</div>}
                    {d.skills.filter(Boolean).length > 0 && <>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", marginBottom: 8, marginTop: 16 }}>Skills</div>
                        <div>{d.skills.filter(Boolean).map((s, i) => <span key={i} style={skillBadgeStyle.sidebar}>{s}</span>)}</div>
                    </>}
                </div>
                <div style={{ flex: 1, padding: "28px 28px" }}>
                    {sections.filter(s => !["skills", "certifications"].includes(s.key)).map(s => <div key={s.key}>{s.render()}</div>)}
                </div>
            </div>
        </div>
    );

    if (template === "executive") return (
        <div style={baseStyle}>
            <div style={{ background: "#1a1a2e", color: "#fff", padding: "36px 44px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, background: "rgba(250,204,21,.08)", borderRadius: "50%" }} />
                <div style={{ display: "flex", alignItems: "flex-start", gap: 20, position: "relative", zIndex: 1 }}>
                    {p.photo && <img src={p.photo} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} alt="" />}
                    <div>
                        <div style={{ fontFamily: "'Georgia',serif", fontSize: 34, fontWeight: 700, marginBottom: 4 }}>{p.name || "Your Name"}</div>
                        <div style={{ fontSize: 13, color: "#fbbf24", marginBottom: 16, textTransform: "uppercase", letterSpacing: 2 }}>{p.title}</div>
                        <div style={{ ...contactRowStyle, color: "#94a3b8" }}>
                            <ContactItem icon="mail" text={p.email} />
                            <ContactItem icon="phone" text={p.phone} />
                            <ContactItem icon="user" text={p.location} />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ padding: "28px 44px" }}>{sections.map(s => <div key={s.key}>{s.render()}</div>)}</div>
        </div>
    );

    if (template === "minimal") return (
        <div style={baseStyle}>
            <div style={{ padding: "40px 48px 24px", borderBottom: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    {p.photo && <img src={p.photo} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} alt="" />}
                    <div>
                        <div style={{ fontFamily: "'Georgia',serif", fontSize: 36, fontWeight: 600, color: "#111", marginBottom: 4 }}>{p.name || "Your Name"}</div>
                        {p.title && <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>{p.title}</div>}
                        <div style={{ ...contactRowStyle, color: "#9ca3af" }}>
                            <ContactItem icon="mail" text={p.email} />
                            <ContactItem icon="phone" text={p.phone} />
                            <ContactItem icon="user" text={p.location} />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ padding: "24px 48px" }}>{sections.map(s => <div key={s.key}>{s.render()}</div>)}</div>
        </div>
    );

    // ATS (default)
    return (
        <div style={baseStyle}>
            <div style={{ background: "#f8fafc", padding: "28px 40px", borderBottom: "2px solid #334155" }}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    {p.photo && <img src={p.photo} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} alt="" />}
                    <div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 28, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{p.name || "Your Name"}</div>
                        {p.title && <div style={{ fontSize: 13, color: "#475569", marginBottom: 8 }}>{p.title}</div>}
                        <div style={{ ...contactRowStyle, color: "#475569" }}>
                            <ContactItem icon="mail" text={p.email} />
                            <ContactItem icon="phone" text={p.phone} />
                            <ContactItem icon="user" text={p.location} />
                            <ContactItem icon="link" text={p.linkedin} />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ padding: "24px 40px" }}>{sections.map(s => <div key={s.key}>{s.render()}</div>)}</div>
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
export function PreviewPanel({ data, template, previewRef }) {
    return (
        <div className="flex-1 overflow-auto flex flex-col items-center p-6 bg-slate-100 dark:bg-slate-950">
            <div className="flex items-center justify-between w-full max-w-[850px] mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Preview</span>
                    <Badge variant="blue">{TEMPLATES.find((t) => t.id === template)?.label}</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    Auto-saved
                </div>
            </div>
            <div className="w-full max-w-[850px] overflow-x-auto">
                <div
                    ref={previewRef}
                    style={{ width: "210mm", minHeight: "297mm", background: "#fff", boxShadow: "0 4px 40px rgba(0,0,0,.15)", borderRadius: 4, margin: "0 auto" }}
                >
                    <ResumePreview data={data} template={template} />
                </div>
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
    const previewRef = useRef();

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
                onToggleTemplates={() => setShowTemplates(!showTemplates)}
            />

            {showTemplates && (
                <TemplateSelector current={template} onSelect={(t) => { setTemplate(t); setShowTemplates(false); }} />
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Left panel — hidden on mobile when previewing */}
                <div className={cn(
                    "w-[420px] min-w-[380px] flex-shrink-0 flex flex-col",
                    "md:flex",
                    activeTab === "preview" ? "hidden" : "flex"
                )}>
                    <FormPanel
                        data={data}
                        onUpdate={update}
                        onAIGenerate={generateAI}
                        aiLoading={aiLoading}
                    />
                </div>

                {/* Right panel — hidden on mobile when editing */}
                <div className={cn(
                    "flex-1 overflow-hidden",
                    "md:flex",
                    activeTab === "form" ? "hidden md:flex" : "flex"
                )}>
                    <PreviewPanel data={data} template={template} previewRef={previewRef} />
                </div>
            </div>
        </div>
    );
}