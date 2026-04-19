/**
 * HomeScoreAnimation
 * Design: HP forest green / amber gold palette
 * Shows an animated arc gauge going from "before" score (62, deferred maintenance)
 * to "after" score (88, after 18 months), with a timeline of 5 visits below.
 * Also renders a "Download Sample Report" button linking to the PDF.
 */
import { useEffect, useRef, useState } from "react";

const HP_GREEN = "oklch(22% 0.07 155)";
const HP_AMBER = "oklch(55% 0.13 72)";
const HP_AMBER_LIGHT = "oklch(92% 0.05 80)";
const HP_MID = "oklch(38% 0.03 60)";
const HP_LGRAY = "oklch(96% 0.01 80)";

const VISITS = [
  { label: "Baseline",  date: "Jan 2024", score: 62, color: "#b45309", note: "Crawl space moisture, gutter overflow, deck wear" },
  { label: "Spring",    date: "Apr 2024", score: 70, color: "#a16207", note: "Gutters cleared, vapor barrier secured" },
  { label: "Summer",    date: "Jul 2024", score: 77, color: "#7c6a00", note: "Caulking resealed, HVAC filter replaced" },
  { label: "Fall",      date: "Oct 2024", score: 83, color: "#4a7c59", note: "Weatherstripping replaced, fascia repaired" },
  { label: "18 Months", date: "Jul 2025", score: 88, color: "#15803d", note: "All systems clear — home value protected" },
];

function ScoreArc({ score, maxScore = 100, size = 160, strokeWidth = 14, color = "#c8860a" }: {
  score: number; maxScore?: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  // Arc spans 220 degrees (from 160° to 380°, i.e. -200° to 20° in standard coords)
  const startAngle = 160;
  const totalDeg = 220;
  const pct = score / maxScore;
  const fillDeg = totalDeg * pct;

  function polarToXY(angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(fromDeg: number, toDeg: number) {
    const s = polarToXY(fromDeg);
    const e = polarToXY(toDeg);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const trackPath = arcPath(startAngle, startAngle + totalDeg);
  const fillPath  = arcPath(startAngle, startAngle + fillDeg);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {/* Track */}
      <path d={trackPath} fill="none" stroke="oklch(88% 0.02 80)" strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Fill */}
      <path d={fillPath}  fill="none" stroke={color}              strokeWidth={strokeWidth} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color}66)` }} />
      {/* Score number */}
      <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: size * 0.22, fill: "oklch(22% 0.07 155)" }}>
        {score}
      </text>
      <text x={cx} y={cy + size * 0.14} textAnchor="middle"
        style={{ fontFamily: "Helvetica, sans-serif", fontSize: size * 0.09, fill: "oklch(50% 0.02 60)" }}>
        / 100
      </text>
    </svg>
  );
}

export function HomeScoreAnimation({ variant = "homeowner" }: { variant?: "homeowner" | "portfolio" }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [animScore, setAnimScore] = useState(VISITS[0].score);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Intersection observer to start animation when in view
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [hasStarted]);

  // Auto-advance through visits
  useEffect(() => {
    if (!hasStarted) return;
    intervalRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % VISITS.length);
    }, 2800);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [hasStarted]);

  // Animate score number when activeIdx changes
  useEffect(() => {
    const target = VISITS[activeIdx].score;
    const start = animScore;
    const diff = target - start;
    const steps = 30;
    let step = 0;
    if (animRef.current) clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      step++;
      const eased = start + diff * (1 - Math.pow(1 - step / steps, 3));
      setAnimScore(Math.round(eased));
      if (step >= steps) {
        setAnimScore(target);
        if (animRef.current) clearInterval(animRef.current);
      }
    }, 16);
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [activeIdx]);

  const active = VISITS[activeIdx];

  const label = variant === "portfolio" ? "Property Score" : "Home Score";

  return (
    <div ref={sectionRef} style={{ background: HP_GREEN, borderRadius: "16px", padding: "2rem", color: "white" }}>
      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: HP_AMBER, marginBottom: "0.4rem" }}>
          Before & After — 18 Months
        </div>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", fontWeight: 900, margin: 0, color: "white" }}>
          Watch the {label} climb
        </h3>
        <p style={{ fontSize: "0.82rem", color: "oklch(100% 0 0 / 0.65)", marginTop: "0.4rem", maxWidth: "380px", margin: "0.4rem auto 0" }}>
          A real home, 5 visits, 18 months. Score went from <strong style={{ color: HP_AMBER }}>62</strong> to <strong style={{ color: "#86efac" }}>88</strong>.
        </p>
      </div>

      {/* Arc + visit detail */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem" }}>
        {/* Arc gauge */}
        <div style={{ position: "relative" }}>
          <ScoreArc score={animScore} color={active.color} size={180} strokeWidth={16} />
          {/* Label below arc */}
          <div style={{ textAlign: "center", marginTop: "-0.5rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "oklch(100% 0 0 / 0.5)" }}>
              {label}
            </div>
          </div>
        </div>

        {/* Active visit detail card */}
        <div style={{
          background: "oklch(100% 0 0 / 0.08)",
          border: "1px solid oklch(100% 0 0 / 0.15)",
          borderRadius: "10px",
          padding: "0.85rem 1.1rem",
          width: "100%",
          maxWidth: "340px",
          textAlign: "center",
          minHeight: "72px",
          transition: "all 0.3s ease",
        }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: HP_AMBER, marginBottom: "0.25rem" }}>
            {active.label} Visit · {active.date}
          </div>
          <div style={{ fontSize: "0.82rem", color: "oklch(100% 0 0 / 0.75)", lineHeight: 1.4 }}>
            {active.note}
          </div>
        </div>

        {/* Visit timeline dots */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {VISITS.map((v, i) => (
            <button
              key={i}
              onClick={() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setActiveIdx(i);
              }}
              title={`${v.label}: ${v.score}/100`}
              style={{
                width: i === activeIdx ? "28px" : "10px",
                height: "10px",
                borderRadius: "5px",
                background: i === activeIdx ? HP_AMBER : "oklch(100% 0 0 / 0.25)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Score labels row */}
        <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, color: "#fca5a5", fontSize: "1.1rem" }}>62</div>
            <div style={{ color: "oklch(100% 0 0 / 0.5)" }}>Before</div>
          </div>
          <div style={{ color: "oklch(100% 0 0 / 0.3)", alignSelf: "center", fontSize: "1rem" }}>→</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, color: "#86efac", fontSize: "1.1rem" }}>88</div>
            <div style={{ color: "oklch(100% 0 0 / 0.5)" }}>18 Months</div>
          </div>
          <div style={{ color: "oklch(100% 0 0 / 0.3)", alignSelf: "center", fontSize: "1rem" }}>→</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, color: HP_AMBER, fontSize: "1.1rem" }}>+$18k</div>
            <div style={{ color: "oklch(100% 0 0 / 0.5)" }}>Est. Value</div>
          </div>
        </div>
      </div>

      {/* PDF download CTA */}
      <div style={{ marginTop: "1.5rem", borderTop: "1px solid oklch(100% 0 0 / 0.12)", paddingTop: "1.2rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.8rem", color: "oklch(100% 0 0 / 0.55)", marginBottom: "0.75rem" }}>
          See exactly what you receive after every visit
        </p>
        <a
          href="/manus-storage/360-home-scan-sample-report_b623fc94.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: HP_AMBER,
            color: "white",
            fontWeight: 700,
            fontSize: "0.85rem",
            padding: "0.6rem 1.4rem",
            borderRadius: "8px",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
          </svg>
          Download Sample Report (PDF)
        </a>
        <div style={{ fontSize: "0.72rem", color: "oklch(100% 0 0 / 0.35)", marginTop: "0.4rem" }}>
          Sample only · No personal data required
        </div>
      </div>
    </div>
  );
}
