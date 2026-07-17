import React, { useRef } from "react";
const cn = (...classes) => classes.filter(Boolean).join(" ");

export function CanvaToolbar({ design, onChange, onAskAI, aiLoading, onReset, isLocked, onToggleLock }) {
    const colorInputRef = useRef();

    const fonts = ["Inter", "Georgia", "Courier New", "Arial", "Times New Roman"];
    const currentSize = parseInt(design.fontSize) || 12;

    const handleSizeChange = (amount) => {
        const next = Math.min(18, Math.max(9, currentSize + amount));
        onChange({ ...design, fontSize: `${next}px` });
    };

    const toggleStyle = (key) => {
        onChange({ ...design, [key]: !design[key] });
    };

    const alignments = [
        { id: "left", path: "M4 6h16M4 12h10M4 18h14" },
        { id: "center", path: "M4 6h16M7 12h10M5 18h14" },
        { id: "right", path: "M4 6h16M10 12h10M6 18h14" },
        { id: "justify", path: "M4 6h16M4 12h16M4 18h16" }
    ];

    return (
        <div className="w-full flex flex-col items-center gap-3 mb-4 select-none">
            {/* Top Canva formatting bar */}
            <div className="w-full max-w-[850px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl px-4 py-2 flex flex-wrap items-center gap-3.5 shadow-sm overflow-x-auto scrollbar-none">
                {/* Font Dropdown */}
                <div className="flex items-center gap-1">
                    <select
                        value={design.fontFamily || "Inter"}
                        onChange={(e) => onChange({ ...design, fontFamily: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl outline-none text-slate-700 dark:text-slate-200 cursor-pointer min-w-[120px]"
                    >
                        {fonts.map((f) => (
                            <option key={f} value={f}>
                                {f}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800" />

                {/* Font Size Modifier */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/70 px-1 py-0.5 rounded-xl">
                    <button
                        onClick={() => handleSizeChange(-1)}
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Decrease Font Size"
                    >
                        －
                    </button>
                    <span className="text-[11px] font-bold font-mono text-slate-700 dark:text-slate-250 w-7 text-center">
                        {currentSize}
                    </span>
                    <button
                        onClick={() => handleSizeChange(1)}
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Increase Font Size"
                    >
                        ＋
                    </button>
                </div>

                <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800" />

                {/* Color Spectrum button */}
                <button
                    onClick={() => colorInputRef.current?.click()}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col items-center gap-0.5 relative transition-colors"
                    title="Text Accent Color"
                >
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200 font-mono">A</span>
                    <span
                        className="w-4 h-1 rounded-full"
                        style={{ backgroundColor: design.accentColor || "#2563eb" }}
                    />
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={design.accentColor || "#2563eb"}
                        onChange={(e) => onChange({ ...design, accentColor: e.target.value })}
                        className="hidden"
                    />
                </button>

                <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800" />

                {/* Typography formatting buttons */}
                <div className="flex items-center gap-1">
                    {[
                        { id: "bold", label: "B", styleClass: "font-extrabold text-sm" },
                        { id: "italic", label: "I", styleClass: "italic font-serif text-sm" },
                        { id: "underline", label: "U", styleClass: "underline text-xs" },
                        { id: "strikethrough", label: "strikethrough", labelNode: <span className="line-through text-xs">S</span> },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => toggleStyle(btn.id)}
                            className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                                design[btn.id]
                                    ? "bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400 font-bold"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            )}
                            title={btn.id.toUpperCase()}
                        >
                            {btn.labelNode || <span className={btn.styleClass}>{btn.label}</span>}
                        </button>
                    ))}

                    {/* Case switcher (aA) */}
                    <button
                        onClick={() => toggleStyle("uppercase")}
                        className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs font-semibold",
                            design.uppercase
                                ? "bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        )}
                        title="Toggle Uppercase Headers"
                    >
                        aA
                    </button>
                </div>

                <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800" />

                {/* Alignment Toggles */}
                <div className="flex items-center gap-1">
                    {alignments.map((align) => (
                        <button
                            key={align.id}
                            onClick={() => onChange({ ...design, textAlignment: align.id })}
                            className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                                (design.textAlignment || "left") === align.id
                                    ? "bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            )}
                            title={`Align ${align.id}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d={align.path} />
                            </svg>
                        </button>
                    ))}
                </div>

                <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800" />

                {/* Spacing buttons */}
                <button
                    onClick={() => {
                        const curSpacing = design.spacing || "standard";
                        const nextSpacing = curSpacing === "compact" ? "standard" : curSpacing === "standard" ? "spacious" : "compact";
                        onChange({ ...design, spacing: nextSpacing });
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    title={`Spacing: ${design.spacing || "standard"}`}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8l5-5 5 5M7 16l5 5 5-5M4 12h16" />
                    </svg>
                </button>
            </div>

            {/* Ask Canva Floating Pill context toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 px-3.5 py-1.5 rounded-full flex items-center gap-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-none animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Ask Canva AI trigger */}
                <button
                    onClick={onAskAI}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-full px-3.5 py-1 text-[11px] font-bold shadow-sm shadow-indigo-500/10 transition-all disabled:opacity-50"
                >
                    <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">✨</span>
                    {aiLoading ? "Thinking..." : "Ask Canva AI"}
                </button>

                <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800" />

                {/* Lock button */}
                <button
                    onClick={onToggleLock}
                    className={cn(
                        "p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                        isLocked ? "text-amber-500" : "text-slate-450"
                    )}
                    title={isLocked ? "Unlock template variables" : "Lock template variables"}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                        {isLocked ? (
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        ) : (
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        )}
                    </svg>
                </button>

                {/* Reset button */}
                <button
                    onClick={onReset}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 hover:text-red-500 transition-colors"
                    title="Reset Resume Data"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
