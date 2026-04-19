/**
 * HomeScoreAnimation
 * Design: HP forest green / amber gold palette
 * - Animated SVG arc gauge cycling through 5 visits (score 62 → 88)
 * - In-page modal showing the sample report contents (no PDF download)
 * - Works on both homeowner and portfolio pages
 */
import { useEffect, useRef, useState } from "react";

const HP_GREEN  = "oklch(22% 0.07 155)";
const HP_AMBER  = "#c8860a";
const HP_AMBER2 = "oklch(55% 0.13 72)";

const VISITS = [
  { label: "Baseline",  date: "Jan 2024", score: 62, hex: "#b45309", note: "Crawl space moisture, gutter overflow, deck wear" },
  { label: "Spring",    date: "Apr 2024", score: 70, hex: "#a16207", note: "Gutters cleared, vapor barrier secured" },
  { label: "Summer",    date: "Jul 2024", score: 77, hex: "#7c6a00", note: "Caulking resealed, HVAC filter replaced" },
  { label: "Fall",      date: "Oct 2024", score: 83, hex: "#4a7c59", note: "Weatherstripping replaced, fascia repaired" },
  { label: "18 Months", date: "Jul 2025", score: 88, hex: "#15803d", note: "All systems clear — home value protected" },
];

// ── SVG arc helpers ──────────────────────────────────────────────────────────
function polarXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarXY(cx, cy, r, startDeg);
  const e = polarXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`;
}

function ScoreArc({ score, color, size = 180, sw = 16 }: {
  score: number; color: string; size?: number; sw?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = (size - sw) / 2;
  const START = 150;
  const TOTAL = 240;
  const fillEnd = START + TOTAL * (Math.min(Math.max(score, 0), 100) / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Score: ${score} out of 100`}
    >
      {/* Track */}
      <path
        d={describeArc(cx, cy, r, START, START + TOTAL)}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {/* Filled arc */}
      <path
        d={describeArc(cx, cy, r, START, fillEnd)}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 8px ${color}99)` }}
      />
      {/* Score number */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: size * 0.24 }}
      >
        {score}
      </text>
      {/* /100 */}
      <text
        x={cx}
        y={cy + size * 0.16}
        textAnchor="middle"
        fill="rgba(255,255,255,0.45)"
        style={{ fontFamily: "sans-serif", fontSize: size * 0.09 }}
      >
        / 100
      </text>
    </svg>
  );
}

// ── Sample report modal ──────────────────────────────────────────────────────
const REPORT_SYSTEMS = [
  { name: "Roof & Gutters",         status: "clear",   sym: "✓", finding: "Shingles in good condition. NW gutter had debris — cleared on-site.", action: "None. Re-inspect at Spring visit." },
  { name: "Foundation & Crawl Space", status: "monitor", sym: "⚠", finding: "Vapor barrier partially displaced. Moisture reading 12% near NW pier.", action: "Resecure vapor barrier. Re-read moisture at Spring visit." },
  { name: "Exterior & Siding",      status: "clear",   sym: "✓", finding: "Hardiplank in good condition. Minor caulk shrinkage on south face — resealed.", action: "None required." },
  { name: "HVAC System",            status: "monitor", sym: "⚠", finding: "Filter at 70% capacity — replaced on-site. Minor duct dust accumulation.", action: "Schedule duct cleaning within 12 months." },
  { name: "Plumbing",               status: "clear",   sym: "✓", finding: "No active leaks. Water heater (2019) in good condition.", action: "Budget for water heater replacement ~2027." },
  { name: "Electrical Panel",       status: "clear",   sym: "✓", finding: "200A panel, no double-taps. GFCI outlets functional in all wet areas.", action: "None required." },
  { name: "Deck & Exterior Wood",   status: "action",  sym: "✗", finding: "Rear deck ledger board shows surface checking and minor rot at 2 fastener points.", action: "Repair within 6 months. Est. cost $350–500. Use labor bank." },
];

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  clear:   { bg: "#f0fdf4", border: "#16a34a", text: "#15803d" },
  monitor: { bg: "#fefce8", border: "#ca8a04", text: "#a16207" },
  action:  { bg: "#fef2f2", border: "#dc2626", text: "#b91c1c" },
};

function ReportModal({ onClose, variant }: { onClose: () => void; variant: "homeowner" | "portfolio" }) {
  const label = variant === "portfolio" ? "Property" : "Home";
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white", borderRadius: "16px", width: "100%", maxWidth: "640px",
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header */}
        <div style={{ background: HP_GREEN, borderRadius: "16px 16px 0 0", padding: "1.25rem 1.5rem", position: "sticky", top: 0, zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: HP_AMBER, marginBottom: "0.25rem" }}>
                Sample Report
              </div>
              <div style={{ color: "white", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.3 }}>
                Handy Pioneers — 360° {label} Scan Report
              </div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem", marginTop: "0.2rem" }}>
                1847 NE Evergreen Ave, Vancouver WA 98665 · Jan 14, 2025
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "white", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", fontSize: "1.1rem", flexShrink: 0, marginLeft: "1rem" }}
            >
              ✕
            </button>
          </div>
          {/* Score badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem" }}>
            <div style={{ background: HP_AMBER, borderRadius: "10px", padding: "0.4rem 0.9rem", textAlign: "center" }}>
              <div style={{ color: "white", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label} Score</div>
              <div style={{ color: "white", fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "1.6rem", lineHeight: 1 }}>91<span style={{ fontSize: "0.8rem", fontWeight: 400 }}>/100</span></div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", lineHeight: 1.5 }}>
              Technician: <strong style={{ color: "white" }}>M. Torres</strong><br />
              Visit Type: <strong style={{ color: "white" }}>Annual 360° Baseline Walkthrough</strong><br />
              Membership: <strong style={{ color: "white" }}>Full Coverage</strong>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "1.25rem 1.5rem" }}>
          {/* Score history */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: HP_GREEN, marginBottom: "0.6rem" }}>
              {label} Score History
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                <thead>
                  <tr style={{ background: HP_GREEN, color: "white" }}>
                    {["Visit", "Date", "Score", "Change", "Key Finding"].map(h => (
                      <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Baseline",      "Jan 2024", "62", "—",   "Crawl space moisture, gutter overflow"],
                    ["Spring Visit",  "Apr 2024", "70", "+8",  "Gutters cleared, vapor barrier secured"],
                    ["Summer Visit",  "Jul 2024", "77", "+7",  "Caulking resealed, HVAC filter replaced"],
                    ["Fall Visit",    "Oct 2024", "83", "+6",  "Weatherstripping replaced, fascia repaired"],
                    ["18-Month",      "Jul 2025", "88", "+5",  "All systems clear — home value protected"],
                  ].map(([visit, date, score, change, finding], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f9fafb" : "white" }}>
                      <td style={{ padding: "5px 10px", fontWeight: 600 }}>{visit}</td>
                      <td style={{ padding: "5px 10px", color: "#6b7280" }}>{date}</td>
                      <td style={{ padding: "5px 10px", fontWeight: 700, color: i === 4 ? "#15803d" : "#111" }}>{score}</td>
                      <td style={{ padding: "5px 10px", color: change === "—" ? "#9ca3af" : "#15803d", fontWeight: 600 }}>{change}</td>
                      <td style={{ padding: "5px 10px", color: "#374151" }}>{finding}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Seasonal visit checklists */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: HP_GREEN, marginBottom: "0.6rem" }}>
              Seasonal Visit Checklists
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {[
                {
                  season: "Baseline Walkthrough", date: "Jan 2024", icon: "🏠",
                  inspected: [
                    "Full roof & gutter inspection", "Foundation & crawl space moisture reading",
                    "Exterior siding & caulking audit", "HVAC filter check & airflow test",
                    "Plumbing shut-offs & water heater inspection", "Electrical panel & GFCI test",
                    "Attic insulation & ventilation", "Windows & door seal condition", "Deck & exterior wood assessment",
                  ],
                  completed: [
                    "NW gutter cleared of debris", "South-face window caulking resealed",
                    "HVAC filter replaced (was at 70%)", "Front door weatherstripping replaced",
                  ],
                },
                {
                  season: "Spring Visit", date: "Apr 2024", icon: "🌱",
                  inspected: [
                    "Post-winter roof & flashing check", "Gutter flow test after leaf season",
                    "Crawl space moisture re-read", "Exterior paint & wood condition",
                    "Irrigation system startup check", "Window & door operation",
                  ],
                  completed: [
                    "Crawl space vapor barrier resecured at NW pier", "Moisture reading confirmed at 9% (down from 12%)",
                    "Gutters flushed & downspout extensions checked", "Deck boards cleaned & surface checked",
                  ],
                },
                {
                  season: "Summer Visit", date: "Jul 2024", icon: "☀️",
                  inspected: [
                    "HVAC cooling performance & refrigerant check", "Attic temperature & ventilation",
                    "Exterior caulking & paint condition (heat expansion)", "Deck & fence fastener check",
                    "Hose bibs & irrigation backflow", "Smoke & CO detector test",
                  ],
                  completed: [
                    "HVAC filter replaced (quarterly schedule)", "Attic ridge vent cleared of wasp nest",
                    "Deck ledger fasteners re-torqued", "Two smoke detectors batteries replaced",
                  ],
                },
                {
                  season: "Fall Visit", date: "Oct 2024", icon: "🍂",
                  inspected: [
                    "Pre-winter roof & flashing integrity", "Gutters cleared post-leaf season",
                    "Furnace startup & heat exchanger check", "Weatherstripping & door seals",
                    "Exterior faucet winterization", "Crawl space vent covers", "Chimney & fireplace damper",
                  ],
                  completed: [
                    "Gutters fully cleared — 2 bags debris removed", "Furnace filter replaced, heat exchanger clean",
                    "All exterior hose bibs winterized", "Crawl space vents closed for winter",
                    "Front & back door weatherstripping replaced", "Minor fascia board re-nailed at NE corner",
                  ],
                },
              ].map((visit) => (
                <div key={visit.season} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ background: "#f9fafb", padding: "0.6rem 0.9rem", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.82rem", color: HP_GREEN }}>{visit.icon} {visit.season}</span>
                    <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>{visit.date}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                    <div style={{ padding: "0.65rem 0.9rem", borderRight: "1px solid #e5e7eb" }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: "0.4rem" }}>Inspected</div>
                      {visit.inspected.map((item) => (
                        <div key={item} style={{ display: "flex", gap: "0.35rem", fontSize: "0.73rem", color: "#374151", marginBottom: "0.2rem", lineHeight: 1.35 }}>
                          <span style={{ color: "#9ca3af", flexShrink: 0 }}>○</span>{item}
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "0.65rem 0.9rem", background: "#f0fdf4" }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#15803d", marginBottom: "0.4rem" }}>Completed On-Site</div>
                      {visit.completed.map((item) => (
                        <div key={item} style={{ display: "flex", gap: "0.35rem", fontSize: "0.73rem", color: "#166534", marginBottom: "0.2rem", lineHeight: 1.35 }}>
                          <span style={{ flexShrink: 0 }}>✓</span>{item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System results */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: HP_GREEN, marginBottom: "0.6rem" }}>
              System Inspection Results
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {REPORT_SYSTEMS.map((sys) => {
                const c = STATUS_COLORS[sys.status];
                return (
                  <div key={sys.name} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: "8px", padding: "0.65rem 0.9rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#111" }}>{sys.name}</span>
                      <span style={{ fontWeight: 700, fontSize: "0.78rem", color: c.text }}>{sys.sym} {sys.status === "clear" ? "Clear" : sys.status === "monitor" ? "Monitor" : "Action Required"}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#374151", marginBottom: "0.15rem" }}><strong style={{ color: "#92400e" }}>Finding:</strong> {sys.finding}</div>
                    <div style={{ fontSize: "0.75rem", color: "#374151" }}><strong style={{ color: "#92400e" }}>Action:</strong> {sys.action}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Repair list */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: HP_GREEN, marginBottom: "0.6rem" }}>
              Prioritized Repair List
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                <thead>
                  <tr style={{ background: HP_GREEN, color: "white" }}>
                    {["#", "Item", "Urgency", "Est. Cost", "Labor Bank"].map(h => (
                      <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["1", "Deck ledger board repair",           "High — 6 mo",    "$350–500",   "✓"],
                    ["2", "Crawl space vapor barrier resecure",  "Medium — Spring","$150–250",   "✓"],
                    ["3", "Window seal replacement (3 units)",   "Low — 24 mo",    "$600–900",   "✓"],
                    ["4", "Duct cleaning",                       "Low — 12 mo",    "$200–350",   "✓"],
                    ["5", "Water heater (budget)",               "Plan — ~2027",   "$1,200–1,800","✓"],
                  ].map(([num, item, urgency, cost, lb], i) => (
                    <tr key={i} style={{ background: i === 0 ? "#fef2f2" : i % 2 === 0 ? "#f9fafb" : "white" }}>
                      <td style={{ padding: "5px 10px", fontWeight: 700 }}>{num}</td>
                      <td style={{ padding: "5px 10px" }}>{item}</td>
                      <td style={{ padding: "5px 10px", color: i === 0 ? "#b91c1c" : "#374151", fontWeight: i === 0 ? 700 : 400 }}>{urgency}</td>
                      <td style={{ padding: "5px 10px", fontWeight: 600 }}>{cost}</td>
                      <td style={{ padding: "5px 10px", color: "#15803d", fontWeight: 700 }}>{lb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Technician note */}
          <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#374151", lineHeight: 1.6, marginBottom: "0.5rem" }}>
            <strong style={{ color: HP_GREEN }}>Technician Notes:</strong> Overall this home is well-maintained for its age. Primary concern is the deck ledger board — address before next rainy season. Crawl space moisture within acceptable range but warrants monitoring. All on-site work completed during this visit is documented in the service log.
          </div>
          <div style={{ fontSize: "0.7rem", color: "#9ca3af", textAlign: "center" }}>
            Sample report for illustration only · Actual reports stored securely in your member portal · © 2025 Handy Pioneers LLC
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export function HomeScoreAnimation({ variant = "homeowner" }: { variant?: "homeowner" | "portfolio" }) {
  const [activeIdx, setActiveIdx]   = useState(0);
  const [animScore, setAnimScore]   = useState(VISITS[0].score);
  const [showModal, setShowModal]   = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef  = useRef<HTMLDivElement>(null);

  // Start on scroll into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHasStarted(true); },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-advance visits
  useEffect(() => {
    if (!hasStarted) return;
    intervalRef.current = setInterval(() => {
      setActiveIdx((p) => (p + 1) % VISITS.length);
    }, 2800);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [hasStarted]);

  // Animate score counter
  useEffect(() => {
    const target = VISITS[activeIdx].score;
    const from   = animScore;
    const diff   = target - from;
    const steps  = 28;
    let step = 0;
    if (animRef.current) clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = from + diff * (1 - Math.pow(1 - t, 3));
      setAnimScore(step >= steps ? target : Math.round(eased));
      if (step >= steps && animRef.current) clearInterval(animRef.current);
    }, 16);
    return () => { if (animRef.current) clearInterval(animRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const active = VISITS[activeIdx];
  const scoreLabel = variant === "portfolio" ? "Property Score" : "Home Score";

  return (
    <>
      <div
        ref={sectionRef}
        style={{ background: HP_GREEN, borderRadius: "16px", padding: "1.75rem 1.5rem", color: "white" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: HP_AMBER, marginBottom: "0.3rem" }}>
            Before &amp; After — 18 Months
          </div>
          <h3 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.35rem", fontWeight: 900, margin: "0 0 0.3rem", color: "white" }}>
            Watch the {scoreLabel} climb
          </h3>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", margin: 0 }}>
            A real home · 5 visits · 18 months ·{" "}
            <strong style={{ color: "#fca5a5" }}>62</strong> → <strong style={{ color: "#86efac" }}>88</strong>
          </p>
        </div>

        {/* Arc gauge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
          <ScoreArc score={animScore} color={active.hex} size={180} sw={16} />
        </div>
        <div style={{ textAlign: "center", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", marginBottom: "1rem" }}>
          {scoreLabel}
        </div>

        {/* Visit detail card */}
        <div style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "10px",
          padding: "0.8rem 1rem",
          textAlign: "center",
          minHeight: "68px",
          marginBottom: "0.9rem",
          transition: "opacity 0.25s",
        }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: HP_AMBER, marginBottom: "0.2rem" }}>
            {active.label} Visit · {active.date}
          </div>
          <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.45 }}>
            {active.note}
          </div>
        </div>

        {/* Timeline dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.45rem", marginBottom: "1rem" }}>
          {VISITS.map((v, i) => (
            <button
              key={i}
              onClick={() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setActiveIdx(i);
              }}
              title={`${v.label}: ${v.score}/100`}
              style={{
                width: i === activeIdx ? "26px" : "10px",
                height: "10px",
                borderRadius: "5px",
                background: i === activeIdx ? HP_AMBER : "rgba(255,255,255,0.22)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Before / After / Value row */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", fontSize: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, color: "#fca5a5", fontSize: "1.15rem" }}>62</div>
            <div style={{ color: "rgba(255,255,255,0.45)" }}>Before</div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.25)", alignSelf: "center" }}>→</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, color: "#86efac", fontSize: "1.15rem" }}>88</div>
            <div style={{ color: "rgba(255,255,255,0.45)" }}>18 Months</div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.25)", alignSelf: "center" }}>→</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, color: HP_AMBER, fontSize: "1.15rem" }}>+$18k</div>
            <div style={{ color: "rgba(255,255,255,0.45)" }}>Est. Value</div>
          </div>
        </div>

        {/* CTA — open modal */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.1rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.65rem" }}>
            See exactly what you receive after every visit
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              background: HP_AMBER,
              color: "white",
              fontWeight: 700,
              fontSize: "0.85rem",
              padding: "0.6rem 1.4rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
              <line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
            View Sample Report
          </button>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "0.35rem" }}>
            Sample only · No personal data required
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && <ReportModal onClose={() => setShowModal(false)} variant={variant} />}
    </>
  );
}
