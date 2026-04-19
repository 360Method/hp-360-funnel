/*
 * FunnelPage — 360° Method by Handy Pioneers
 * Design: matches handypioneers.com
 *   - Forest green (#1a3a2a) dark sections
 *   - Warm cream (#f5f0e8) light sections
 *   - Amber/golden CTA buttons
 *   - Playfair Display headings, Inter body
 *   - HP overline labels (uppercase, tracked, amber, ruled)
 *   - HP card style (white bg, subtle border, hover lift)
 */

import { useState } from "react";
import type { MemberTier, BillingCadence } from "../tiers";
import { TIERS, CADENCE_LABELS, getPrice, getSavingsVsMonthly } from "../tiers";
import { HomeScoreAnimation } from "../components/HomeScoreAnimation";

// ─── STAT BUBBLE DATA ─────────────────────────────────────────────────────────

interface StatBubble {
  icon: string;
  stat: string;
  label: string;
  modalTitle: string;
  modalBody: string;
  source: string;
}

const STAT_BUBBLES: StatBubble[] = [
  {
    icon: "🏛️",
    stat: "$10,400",
    label: "in deferred maintenance the average homeowner carries",
    modalTitle: "The Hidden Liability on Your Balance Sheet",
    modalBody:
      "Harvard Joint Center for Housing Studies data shows the average homeowner carries over $10,400 in deferred maintenance at any given time — not because they don't care, but because no one is actively managing the asset. For a home worth $800,000–$1.5M, that deferred liability is a quiet drag on value. The 360° Method eliminates it systematically, visit by visit.",
    source: "Harvard Joint Center for Housing Studies",
  },
  {
    icon: "📊",
    stat: "1–3%",
    label: "of home value recovered with documented maintenance at sale",
    modalTitle: "Documentation Is a Financial Instrument",
    modalBody:
      "Appraisers and buyers consistently reward documented maintenance history. On a $900,000 home, a verified maintenance record can recover $9,000–$27,000 at closing — often more than the entire cost of a 5-year 360° membership. Every visit report, every repair record, every Home Score update is stored in your account and shareable in one click.",
    source: "National Association of Realtors, 2024",
  },
  {
    icon: "🔬",
    stat: "7.7×",
    label: "median return on membership vs. annual cost",
    modalTitle: "The ROI of Managed Maintenance",
    modalBody:
      "Across 47 Portland metro member homes tracked from 2023–2025, the median value of issues caught and resolved early — versus the cost of those same issues left unaddressed — was 7.7 times the annual membership fee. This is not a savings pitch. It is an asset management outcome.",
    source: "Handy Pioneers field data, 2023–2025",
  },
];

// ─── SEASONAL CHECKLIST DATA ──────────────────────────────────────────────────

interface SeasonData {
  season: string;
  emoji: string;
  timing: string;
  tasks: string[];
}

const SEASONS: SeasonData[] = [
  {
    season: "Spring",
    emoji: "🌱",
    timing: "March–April",
    tasks: [
      "Scrub and treat moss colonies on walkable roof surfaces; flag lifted shingles and failed flashing for repair",
      "Flush gutters and downspouts; clear Douglas Fir needle and moss buildup at all outlets",
      "Probe fascia and soffit for rot; mark moisture-wicking sections for replacement quote",
      "Clear foundation drains; regrade soil away from structure where clay saturation is found",
      "Tighten loose deck boards and fence fasteners; flag rot and structural damage for repair quote",
      "Cut out failed caulk at windows, doors, and exterior penetrations; apply new weatherproof bead",
    ],
  },
  {
    season: "Summer",
    emoji: "☀️",
    timing: "June–July",
    tasks: [
      "Swap HVAC filters; test heat pump output and flag any efficiency drop for service",
      "Document paint and stain condition; apply touch-up coat or scope full repaint for quote",
      "Start irrigation system; test backflow preventer and adjust coverage zones",
      "Inspect crawl space vapor barrier; resecure lifted sections and flag standing moisture",
      "Clear blocked attic vents; measure temperature differential and flag insulation gaps",
      "Clean deck surface and apply sealant during optimal dry-season application window",
    ],
  },
  {
    season: "Fall",
    emoji: "🍂",
    timing: "September–October",
    tasks: [
      "Clear gutters and downspouts before PNW rain season; flush to confirm full drainage",
      "Replace worn weatherstripping at all exterior doors and windows; test for drafts",
      "Apply zinc-sulfate moss inhibitor to walkable roof surfaces before wet season",
      "Replace worn door sweeps and thresholds; seal gaps at all exterior door bottoms",
      "Shut off and drain all exterior hose bibs; install foam insulating covers",
      "Inspect and reapply caulk at all exterior penetrations before first rains",
    ],
  },
  {
    season: "Winter",
    emoji: "❄️",
    timing: "December–January",
    tasks: [
      "Wrap exposed pipes in crawl space and exterior walls; flag uninsulated runs for repair",
      "Check vapor barrier condition in crawl space; remove standing water and resecure barrier",
      "Test sump pump operation; clear intake screen and confirm discharge line is unobstructed",
      "Swap HVAC filter at mid-season; log replacement date in member record",
      "Check mold-prone bathrooms and laundry areas; treat surface mold and flag moisture source",
      "Audit exterior lighting; replace failed bulbs and test motion sensors for winter safety",
    ],
  },
];

// ─── FAQ DATA ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "What happens when a visit identifies something that needs a larger repair?",
    a: "Your technician documents the finding with photos and generates a prioritized repair estimate on the spot — linked directly to your membership record. You receive a clear scope, a member rate, and can authorize the work in one step. No separate sales call, no sourcing a contractor, no waiting for a quote.",
  },
  {
    q: "How does the labor bank work?",
    a: "Labor bank credit is included in Quarterly and Annual memberships. Your credit is loaded at the end of your first billing period and renews annually. Apply it to any handyman task between scheduled visits — a fixture swap, a door adjustment, a caulk repair. Your technician logs time on-site and the system records the draw automatically. Credits do not carry over year-to-year, which keeps the membership priced accurately. Monthly memberships include all visits and member rates but do not include a labor bank.",
  },
  {
    q: "What does the baseline walkthrough cover?",
    a: "The baseline is a 2–3 hour documented whole-home assessment — roof, foundation, exterior envelope, interior systems, plumbing, electrical panels, HVAC, crawl space, and attic. You receive a written report with photos, a condition rating for each system, a prioritized findings list, and cost estimates. This report is stored permanently in your member account and is shareable with your agent, lender, or insurer.",
  },
  {
    q: "Is there a contract or minimum commitment?",
    a: "No contract. Monthly and quarterly memberships cancel at the end of the current billing period. Annual memberships can be cancelled with a prorated refund for unused months, net of any labor bank credits already applied. We expect to earn your renewal — not enforce it.",
  },
  {
    q: "Is this available outside Portland and SW Washington?",
    a: "Currently the 360° Method is delivered in the Portland metro and SW Washington area. We are expanding regionally — join the waitlist for your area at the bottom of this page.",
  },
  { q: "How do member rates apply to work beyond the scheduled visits?",
    a: "Member rates apply to all out-of-scope work billed separately — repairs that go beyond what your labor bank covers. On a larger repair, your labor bank credit applies first; member rates apply to any remaining balance. You are never billed at standard retail on either category.",
  },
  {
    q: "Is this a licensed home inspection?",
    a: "No — and that distinction actually works in your favor. The 360° Method is a proactive maintenance service, not a licensed home inspection. Think of it as what happens after the inspection: a licensed inspector tells you what’s wrong at a point in time, and we take it from there — completing the recommended work, maintaining the home season after season, and documenting every visit so your home’s condition is always on record. If you’ve recently had a home inspection, your inspection report is the perfect starting point for your 360° baseline. We work in tandem with home inspectors, not in place of them. Our documentation does not replace a licensed inspector, structural engineer, or specialist for major assessments, and we are not liable for pre-existing conditions not visible or accessible during a visit. Full scope is in our Terms & Conditions.",
  },
];

// ─── TIMELINE DATA ────────────────────────────────────────────────────────────

const NEGLECT_TIMELINE = [
  { year: "Year 1", event: "Gutters clog with Douglas Fir needles. Ignored.", cost: "$0 spent" },
  { year: "Year 2", event: "Water overflows, saturates fascia. Rot begins.", cost: "$0 spent" },
  { year: "Year 3", event: "Fascia and soffit visibly rotting. Mold starts.", cost: "$0 spent" },
  { year: "Year 4", event: "Contractor called. Scope has grown significantly.", cost: "$8,400 repair" },
  { year: "Year 5", event: "Mold remediation required. Insurance won't cover.", cost: "$12,000 total" },
];

const MEMBER_TIMELINE = [
  { year: "Year 1", event: "Spring visit: gutters cleared, fascia inspected. All clear.", cost: "$49/mo" },
  { year: "Year 2", event: "Fall visit: minor caulk failure caught. Fixed on-site.", cost: "$49/mo" },
  { year: "Year 3", event: "Spring visit: small moss patch treated. $0 damage.", cost: "$49/mo" },
  { year: "Year 4", event: "Home in perfect condition. Refinanced at full value.", cost: "$49/mo" },
  { year: "Year 5", event: "5-year maintenance log used at sale. $18K more at closing.", cost: "$49/mo" },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

interface Props {
  onEnroll: (tier: MemberTier, cadence: BillingCadence) => void;
  onGoToMultifamily?: () => void;
}

export default function FunnelPage({ onEnroll, onGoToMultifamily }: Props) {
  const [cadence, setCadence] = useState<BillingCadence>("monthly");
  const [openBubble, setOpenBubble] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen font-sans" style={{ background: "oklch(96% 0.015 80)" }}>

      {/* ── TOP UTILITY BAR — matches HP dark green bar ── */}
      <div style={{ background: "oklch(16% 0.06 155)" }} className="text-white/80 text-xs py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <span>5-Star Rated · Licensed &amp; Insured · WA Lic. HANDYP*761NH</span>
          <a href="tel:3605449858" className="hover:text-white transition-colors font-medium">
            (360) 544-9858
          </a>
        </div>
      </div>

      {/* ── STICKY NAV — matches HP white nav ── */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm" style={{ borderColor: "oklch(88% 0.01 80)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* 360° logo mark */}
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hp-360-logo_69b6cf24.png"
              alt="360° Home Method"
              className="w-10 h-10 flex-shrink-0 object-contain"
            />
            {/* HP full logo — hidden on mobile */}
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hp-full-logo_7d3d2c7d.jpg"
              alt="Handy Pioneers"
              className="hidden sm:block h-9 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-3">
            {onGoToMultifamily && (
              <button
                onClick={onGoToMultifamily}
                className="hidden sm:block text-sm font-semibold transition-all"
                style={{
                  background: "none",
                  border: "2px solid oklch(65% 0.15 72)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "oklch(65% 0.15 72)",
                  padding: "6px 14px",
                  letterSpacing: "0.03em",
                }}
              >
                🏢 Property Managers
              </button>
            )}
            <a href="#pricing" className="btn-hp-primary text-sm px-5 py-2.5">
              Enroll Now
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO — dark forest green, matches HP hero aesthetic ── */}
      <section
        className="text-white pt-20 pb-28 px-4"
        style={{ background: "oklch(22% 0.07 155)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge pill */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium mb-6"
            style={{ background: "oklch(100% 0 0 / 0.1)", color: "oklch(78% 0.13 78)" }}
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hp-360-logo_69b6cf24.png"
              alt="360°"
              className="w-5 h-5 object-contain"
            />
            <span>The 360° Method — Delivered by Handy Pioneers</span>
          </div>

          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6"
          >
            Most homes are maintained reactively.<br />
            <span style={{ color: "oklch(65% 0.15 72)" }}>Yours doesn't have to be.</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.75)" }}>
            Most homeowners have a financial advisor. Almost none have someone actively managing the physical asset.
            The 360° Method is a fully managed home stewardship program — quarterly visits, documented reports, and a named technician who knows your home. Membership from{" "}
            <strong className="text-white">$588/year</strong>{" "}
            <span style={{ fontSize: "0.85em", opacity: 0.7 }}>($49/mo on an Annual plan)</span>.
          </p>

          <a href="#pricing" className="btn-hp-primary text-base px-10 py-4 shadow-lg">
            See Plans & Pricing →
          </a>
          <p className="mt-4 text-sm" style={{ color: "oklch(100% 0 0 / 0.45)" }}>
            No contracts · Cancel anytime · Portland metro & SW Washington
          </p>

          {/* Landlord/PM redirect prompt — visible on all screen sizes */}
          {onGoToMultifamily && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 rounded-lg px-5 py-3 mx-auto max-w-sm sm:max-w-none" style={{ background: "oklch(100% 0 0 / 0.08)", border: "1px solid oklch(100% 0 0 / 0.15)" }}>
              <span className="text-sm text-center" style={{ color: "oklch(100% 0 0 / 0.65)" }}>Own investment properties or a rental portfolio?</span>
              <button
                onClick={onGoToMultifamily}
                className="text-sm font-bold transition-colors"
                style={{ background: "none", border: "none", cursor: "pointer", color: "oklch(65% 0.15 72)", textDecoration: "underline", padding: 0, whiteSpace: "nowrap" }}
              >
                See the Portfolio Plan →
              </button>
            </div>
          )}

          {/* Trust badges row */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm" style={{ color: "oklch(100% 0 0 / 0.6)" }}>
            {["5-Star Rated", "Licensed & Insured", "1-Year Labor Guarantee", "Dedicated Technician"].map((b) => (
              <span key={b} className="flex items-center gap-1.5">
                <span style={{ color: "oklch(65% 0.15 72)" }}>✓</span> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOME SCORE SECTION — cream bg ── */}
      <section className="py-20 px-4" style={{ background: "oklch(97% 0.01 80)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <div className="hp-overline">Your Transformation Starts Here</div>
              <h2 className="font-display text-3xl sm:text-4xl font-black mb-5" style={{ color: "oklch(22% 0.07 155)" }}>
                Visit 1: you see where your home stands.<br />
                <span style={{ color: "oklch(55% 0.13 72)" }}>Every visit after: it gets better.</span>
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: "oklch(38% 0.03 60)" }}>
                Your membership begins with a <strong>2–3 hour baseline walkthrough</strong> — a full documented assessment of every major system. We photograph every finding, rate every system, and give your home its first score. You leave knowing exactly where you stand.
              </p>
              <p className="text-base leading-relaxed mb-8" style={{ color: "oklch(38% 0.03 60)" }}>
                After each seasonal visit, your score updates. You watch your home improve — visit by visit, season by season — with a timestamped record that follows the asset for its entire life.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: "📋", label: "Day One: Baseline", desc: "You see every system, every risk, every finding" },
                  { icon: "📈", label: "Every Visit: Score Climbs", desc: "Your home improves — and you have proof" },
                  { icon: "📁", label: "Always: On Record", desc: "Timestamped PDF after every visit, stored permanently" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg p-4" style={{ background: "oklch(100% 0 0)", border: "1px solid oklch(88% 0.02 80)", boxShadow: "0 1px 4px oklch(0% 0 0 / 0.06)" }}>
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="font-bold text-sm mb-1" style={{ color: "oklch(22% 0.07 155)" }}>{item.label}</div>
                    <div className="text-xs" style={{ color: "oklch(50% 0.02 60)" }}>{item.desc}</div>
                  </div>
                ))}
              </div>
              {/* Urgency block */}
              <div className="rounded-lg px-5 py-4" style={{ background: "oklch(55% 0.13 72 / 0.1)", border: "1px solid oklch(55% 0.13 72 / 0.3)" }}>
                <p className="text-sm font-semibold mb-1" style={{ color: "oklch(38% 0.08 72)" }}>Your transformation starts within 48 hours of enrollment</p>
                <p className="text-sm" style={{ color: "oklch(38% 0.03 60)" }}>
                  The day you enroll, your baseline walkthrough goes on the calendar. Every month before that is a month of home history you can never recover. Members who start today have their first visit scheduled before the week is out.
                </p>
              </div>
            </div>
            {/* Right: animated score + PDF download */}
            <div className="flex justify-center lg:justify-end" style={{ width: "100%" }}>
              <div style={{ width: "100%", maxWidth: "400px" }}>
                <HomeScoreAnimation variant="homeowner" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT'S IN YOUR REPORT — white bg ── */}
      <section className="py-20 px-4 section-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: report mockup */}
            <div className="flex justify-center lg:justify-start">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/report-card-mockup-4AdTXSJrKZ4HDyTzWNLbPz.webp"
                alt="360° Home Scan Report showing Home Score 91/100 with photo documentation"
                className="rounded-2xl shadow-xl"
                style={{ maxWidth: "320px", width: "100%" }}
              />
            </div>
            {/* Right: what's in the report */}
            <div>
              <div className="hp-overline">What You Walk Away With</div>
              <h2 className="font-display text-3xl sm:text-4xl font-black mb-5" style={{ color: "oklch(22% 0.07 155)" }}>
                A record that grows<br />with your home.
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: "oklch(38% 0.03 60)" }}>
                After every visit, a written report lands in your account — photos, system ratings, findings, and your updated Home Score. Over time, this becomes the most complete record of your home's condition that has ever existed. Yours to share with an agent, lender, or insurer whenever you need it.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Baseline walkthrough with photos", why: "You know exactly what you own — before anything else" },
                  { label: "Prioritized findings with cost estimates", why: "You know what to address and what it costs — no surprises" },
                  { label: "Home Score updated each visit", why: "You watch your home improve — in a number you can track" },
                  { label: "Seasonal visit reports", why: "You have proof of every visit, every system, every season" },
                  { label: "Shareable PDF record", why: "You walk into any conversation with your agent or lender prepared" },
                ].map((row) => (
                  <div key={row.label} className="flex gap-3 rounded-lg px-4 py-3" style={{ background: "oklch(97% 0.01 80)", border: "1px solid oklch(88% 0.02 80)" }}>
                    <span style={{ color: "oklch(45% 0.12 155)", flexShrink: 0, marginTop: "2px" }}>✓</span>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "oklch(22% 0.07 155)" }}>{row.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "oklch(50% 0.02 60)" }}>{row.why}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STAT BUBBLES — cream bg, HP card style ── */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-5xl mx-auto text-center">
          <div className="hp-overline">Why It Matters</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STAT_BUBBLES.map((bubble, i) => (
              <button
                key={i}
                onClick={() => setOpenBubble(openBubble === i ? null : i)}
                className="hp-card text-center group"
                style={{ cursor: "pointer" }}
              >
                <div className="text-4xl mb-3">{bubble.icon}</div>
                <div
                  className="text-3xl font-black font-display mb-1"
                  style={{ color: "oklch(22% 0.07 155)" }}
                >
                  {bubble.stat}
                </div>
                <div className="text-sm mb-3" style={{ color: "oklch(50% 0.02 60)" }}>
                  {bubble.label}
                </div>
                <div
                  className="text-xs font-semibold group-hover:underline"
                  style={{ color: "oklch(65% 0.15 72)" }}
                >
                  {openBubble === i ? "▲ Hide details" : "▼ Learn more"}
                </div>
                {openBubble === i && (
                  <div
                    className="mt-4 pt-4 text-sm leading-relaxed"
                    style={{ borderTop: "1px solid oklch(85% 0.02 80)", color: "oklch(35% 0.03 255)" }}
                  >
                    <p className="font-bold mb-2" style={{ color: "oklch(22% 0.07 155)" }}>
                      {bubble.modalTitle}
                    </p>
                    <p>{bubble.modalBody}</p>
                    <p className="mt-2 text-xs" style={{ color: "oklch(60% 0.02 60)" }}>
                      Source: {bubble.source}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FRAMEWORK — dark forest green section ── */}
      <section className="py-16 px-4 section-green">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hp-overline" style={{ color: "oklch(65% 0.15 72)" }}>
            The Framework
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white mb-6">
            KNOW → MAINTAIN → ADVANCE
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.75)" }}>
            Three phases. One continuous arc. You go from not knowing what you own, to having it maintained by someone who does, to watching its condition — and its value — improve over time. We are the guide. You are the one who arrives.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              {
                phase: "KNOW",
                icon: "🔍",
                title: "You See Everything",
                body: "Before the 360° Method, most homeowners are guessing. After your baseline walkthrough, you are not. Every system is rated, every risk is photographed, and your home has a score. You know exactly what you own.",
              },
              {
                phase: "MAINTAIN",
                icon: "🔧",
                title: "We Handle It",
                body: "Four seasonal visits address the specific demands of the Pacific Northwest climate. Your technician shows up, executes, and documents. You receive the report. Nothing falls through the cracks — because we are watching.",
              },
              {
                phase: "ADVANCE",
                icon: "📈",
                title: "Your Home Improves",
                body: "Visit by visit, your score climbs and your record grows. The home you have in five years — documented, maintained, with a verifiable condition history — is a fundamentally different asset than the one you have today.",
              },
            ].map((p) => (
              <div
                key={p.phase}
                className="rounded-lg p-6"
                style={{ background: "oklch(100% 0 0 / 0.08)" }}
              >
                <div className="text-3xl mb-3">{p.icon}</div>
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: "oklch(65% 0.15 72)" }}
                >
                  {p.phase}
                </div>
                <div className="font-bold text-white text-lg mb-2">{p.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.7)" }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEASONAL VISITS — white bg, HP card style ── */}
      <section className="py-16 px-4 section-white">
        <div className="max-w-5xl mx-auto">
          <div className="hp-overline">Your Year, Managed</div>
          <h2
            className="font-display text-3xl sm:text-4xl font-black text-center mb-4"
            style={{ color: "oklch(22% 0.07 155)" }}
          >
            Four times a year,<br />your home gets better.
          </h2>
          <p className="text-center max-w-xl mx-auto mb-10" style={{ color: "oklch(50% 0.02 60)" }}>
            Right now, your home is accumulating the specific wear patterns of the Pacific Northwest — moss on the roof, debris in the gutters, freeze-thaw stress on the foundation. Your technician knows exactly what to address each season. You receive the report.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SEASONS.map((s, i) => (
              <div
                key={i}
                className="hp-card"
              >
                <div className="flex items-center justify-center gap-3 mb-4 pb-3" style={{ borderBottom: "1px solid oklch(88% 0.02 80)" }}>
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: "oklch(22% 0.07 155)" }}>
                      {s.season} Visit
                    </div>
                    <div className="text-xs" style={{ color: "oklch(65% 0.15 72)" }}>
                      {s.timing}
                    </div>
                  </div>
                </div>
                <ul className="space-y-2.5 text-left">
                  {s.tasks.map((task, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs leading-snug" style={{ color: "oklch(35% 0.03 255)" }}>
                      <span style={{ color: "oklch(65% 0.15 72)", flexShrink: 0, marginTop: "2px" }}>✓</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-xs mt-4" style={{ color: "oklch(60% 0.02 60)" }}>
            Essential includes Spring + Fall. Full Coverage and Maximum Protection include all four seasons.
          </p>
          <p className="text-center text-xs mt-2" style={{ color: "oklch(60% 0.02 60)" }}>
            <em>Roof work is limited to walkable, low-slope surfaces. Steep-pitch and third-story work is referred to a licensed roofer.</em>
          </p>
        </div>
      </section>

      {/* ── SAVINGS STATS — cream bg ── */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-3xl mx-auto text-center">
          <div className="hp-overline">The Difference It Makes</div>
          <h2
            className="font-display text-3xl sm:text-4xl font-black mb-6"
            style={{ color: "oklch(22% 0.07 155)" }}
          >
            What changes when your home is managed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Median value of issues resolved before escalation", value: "$3,200", sub: "per incident" },
              { label: "Median incidents identified per year", value: "2.4", sub: "per home" },
              { label: "Median annual return on membership", value: "7.7×", sub: "vs. annual fee" },
            ].map((stat, i) => (
              <div key={i} className="hp-card text-center">
                <div
                  className="text-3xl font-black font-display"
                  style={{ color: "oklch(65% 0.15 72)" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs mt-1" style={{ color: "oklch(60% 0.02 60)" }}>{stat.sub}</div>
                <div className="text-sm mt-2 leading-snug" style={{ color: "oklch(35% 0.03 255)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm max-w-xl mx-auto" style={{ color: "oklch(50% 0.02 60)" }}>
            Based on Handy Pioneers field data from 2023–2025 across 47 Portland metro member homes.
            Figures represent median outcomes; individual results vary by home age, condition, and tier.
          </p>
        </div>
      </section>

      {/* ── PRICING — white bg ── */}
      <section id="pricing" className="py-20 px-4 section-white">
        <div className="max-w-5xl mx-auto">
          <div className="hp-overline">Membership Tiers</div>
          <h2
            className="font-display text-3xl sm:text-4xl font-black text-center mb-3"
            style={{ color: "oklch(22% 0.07 155)" }}
          >
            Select Your Level of Stewardship
          </h2>
          <p className="text-center max-w-xl mx-auto mb-8" style={{ color: "oklch(50% 0.02 60)" }}>
            Each tier is a retainer, not a subscription. Member rates apply to all work beyond the scheduled visits — the higher the tier, the more comprehensive the coverage.
          </p>

          {/* Cadence toggle */}
          <div className="flex justify-center mb-10">
            <div
              className="inline-flex rounded-lg p-1 gap-1"
              style={{ background: "oklch(92% 0.02 78)" }}
            >
              {(["monthly", "quarterly", "annual"] as BillingCadence[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCadence(c)}
                  className="px-4 py-2 rounded-md text-sm font-semibold transition-all flex flex-col items-center leading-tight"
                  style={
                    cadence === c
                      ? {
                          background: "oklch(100% 0 0)",
                          color: "oklch(22% 0.07 155)",
                          boxShadow: "0 1px 4px oklch(0% 0 0 / 0.1)",
                        }
                      : { color: "oklch(50% 0.02 60)" }
                  }
                >
                  <span>{CADENCE_LABELS[c]}</span>
                  {c === "quarterly" && (
                    <span className="text-xs font-bold" style={{ color: cadence === c ? "oklch(40% 0.12 145)" : "oklch(55% 0.12 145)" }}>Save ~5%</span>
                  )}
                  {c === "annual" && (
                    <span className="text-xs font-bold" style={{ color: cadence === c ? "oklch(40% 0.12 145)" : "oklch(55% 0.12 145)" }}>Save ~17%</span>
                  )}                </button>
              ))}
            </div>
          </div>

          {/* Tier cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => {
              const price = getPrice(tier, cadence);
              const savings = getSavingsVsMonthly(tier, cadence);
              return (
                <div
                  key={tier.id}
                  className="relative rounded-lg border-2 p-6 flex flex-col bg-white transition-shadow hover:shadow-lg"
                  style={{
                    borderColor: tier.popular
                      ? "oklch(22% 0.07 155)"
                      : "oklch(85% 0.02 80)",
                    transform: tier.popular ? "scale(1.02)" : undefined,
                  }}
                >
                  {tier.popular && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
                      style={{ background: "oklch(22% 0.07 155)" }}
                    >
                      Most Popular
                    </div>
                  )}

                  {/* Tier badge */}
                  <div
                    className="inline-flex self-start px-3 py-1 rounded-full text-xs font-bold mb-4"
                    style={{
                      background: tier.popular
                        ? "oklch(22% 0.07 155 / 0.1)"
                        : "oklch(65% 0.15 72 / 0.12)",
                      color: tier.popular
                        ? "oklch(22% 0.07 155)"
                        : "oklch(55% 0.14 68)",
                    }}
                  >
                    {tier.name}
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    <span
                      className="text-4xl font-black font-display"
                      style={{ color: "oklch(22% 0.07 155)" }}
                    >
                      ${cadence === "annual" ? tier.annualMonthly : cadence === "quarterly" ? Math.round(price * 4 / 12) : price}
                    </span>
                    <span className="text-sm ml-1" style={{ color: "oklch(50% 0.02 60)" }}>/mo</span>
                  </div>
                  {cadence !== "monthly" && (
                    <div className="text-xs mb-1" style={{ color: "oklch(50% 0.02 60)" }}>
                      billed ${price}/{cadence === "quarterly" ? "qtr" : "yr"}
                    </div>
                  )}
                  {savings > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded mb-3" style={{ background: "oklch(40% 0.12 145 / 0.1)", border: "1px solid oklch(40% 0.12 145 / 0.25)" }}>
                      <span className="text-xs font-bold" style={{ color: "oklch(35% 0.12 145)" }}>
                        Save ${savings}/yr · {cadence === "quarterly" ? "5" : "17"}% off
                      </span>
                    </div>
                  )}

                  <p className="text-sm mb-4 leading-relaxed" style={{ color: "oklch(50% 0.02 60)" }}>
                    {tier.tagline}
                  </p>

                  {/* Visit count badge */}
                  <div className="text-xs font-semibold mb-3 inline-flex items-center gap-1 px-2 py-1 rounded" style={{ background: "oklch(22% 0.07 155 / 0.07)", color: "oklch(22% 0.07 155)" }}>
                    📅 {tier.visits} visit{tier.visits > 1 ? 's' : ''}/yr — {tier.visitDescription}
                  </div>
                  {tier.laborBankDollars > 0 && (
                    <div
                      className="rounded-md px-3 py-2 mb-4 text-sm"
                      style={{
                        background: cadence === "monthly" ? "oklch(94% 0.01 60)" : "oklch(65% 0.15 72 / 0.08)",
                        border: `1px solid ${cadence === "monthly" ? "oklch(80% 0.02 60)" : "oklch(65% 0.15 72 / 0.25)"}`,
                      }}
                    >
                      {cadence === "monthly" ? (
                        <>
                          <span className="font-bold" style={{ color: "oklch(50% 0.02 60)" }}>
                            ⏳ Labor bank credit — accrues after 90 days on Monthly
                          </span>
                          <span style={{ color: "oklch(50% 0.02 60)" }}> — ${tier.laborBankDollars} becomes available after your first 90 days. Switch to Quarterly or Annual to unlock the full credit on day one.</span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold" style={{ color: "oklch(55% 0.14 68)" }}>
                            ✅ ${tier.laborBankDollars} labor bank credit — full credit, day one
                          </span>
                          <span style={{ color: "oklch(35% 0.03 255)" }}> — pre-paid cash for any handyman task between visits (leaky faucet, stuck door, fixture swap). Use-it-or-lose-it annually.</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm" style={{ color: "oklch(35% 0.03 255)" }}>
                        <span style={{ color: "oklch(65% 0.15 72)" }} className="mt-0.5 flex-shrink-0">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Discount brackets */}
                  <div className="mb-5">
                    <div
                      className="text-xs font-bold uppercase tracking-wide mb-2"
                      style={{ color: "oklch(60% 0.02 60)" }}
                    >
                      Member Repair Discounts
                    </div>
                    <div className="space-y-1 mb-2">
                      {tier.discountBrackets.map((b, bi) => (
                        <div key={bi} className="flex justify-between text-xs">
                          <span style={{ color: "oklch(50% 0.02 60)" }}>{b.label}</span>
                          <span className="font-bold" style={{ color: "oklch(22% 0.07 155)" }}>
                            {b.pct}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs leading-snug" style={{ color: "oklch(55% 0.02 60)" }}>
                      Larger jobs already include negotiated sub-contractor pricing — your total cost is lower either way.
                    </p>
                  </div>

                  <button
                    onClick={() => onEnroll(tier.id, cadence)}
                    className="w-full py-3 rounded-md font-bold text-sm uppercase tracking-wide transition-all text-white"
                    style={{
                      background: tier.popular
                        ? "oklch(22% 0.07 155)"
                        : "oklch(65% 0.15 72)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = tier.popular
                        ? "oklch(30% 0.08 155)"
                        : "oklch(55% 0.14 68)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = tier.popular
                        ? "oklch(22% 0.07 155)"
                        : "oklch(65% 0.15 72)";
                    }}
                  >
                    Enroll — ${price}/{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
                  </button>
                  <p className="text-center text-xs mt-2" style={{ color: "oklch(60% 0.02 60)" }}>
                    You'll confirm your address, select billing frequency, and get your first visit scheduled within 48 hours.
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs mt-6" style={{ color: "oklch(60% 0.02 60)" }}>
            All plans include the Annual 360° Home Scan. No long-term contracts. Cancel anytime.
          </p>
          {/* Landlord prompt below pricing */}
          {onGoToMultifamily && (
            <div className="mt-6 rounded-xl p-5 text-center max-w-xl mx-auto" style={{ background: "oklch(96% 0.015 80)", border: "1px solid oklch(85% 0.02 80)" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "oklch(22% 0.07 155)" }}>
                🏢 Own rental properties or a multifamily building?
              </p>
              <p className="text-xs mb-3" style={{ color: "oklch(50% 0.02 60)" }}>
                The 360° Portfolio Plan is built for landlords — priced per property, not per unit, with bulk discounts and a separate interior add-on.
              </p>
              <button
                onClick={onGoToMultifamily}
                className="text-sm font-bold px-5 py-2 rounded-md transition-colors"
                style={{ background: "oklch(22% 0.07 155)", color: "#fff", border: "none", cursor: "pointer" }}
              >
                View the Portfolio Plan →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 1-YEAR LABOR GUARANTEE ── */}
      <section className="py-16 px-4" style={{ background: "oklch(22% 0.07 155)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="hp-overline text-center mb-3" style={{ color: "oklch(65% 0.15 72)" }}>Our Commitment to You</div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-center mb-4" style={{ color: "oklch(100% 0 0)" }}>
            You are in good hands. We guarantee it.
          </h2>
          <p className="text-center text-base mb-10 max-w-2xl mx-auto" style={{ color: "oklch(100% 0 0 / 0.7)" }}>
            Every task your technician performs is backed by a full one-year labor guarantee. If something we completed fails due to workmanship, we return and correct it — no service call fee, no back-and-forth. That is what a guide owes the people they lead.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: "🔧",
                title: "Workmanship Covered",
                body: "If any task we performed fails within 12 months due to workmanship, we return and correct it. No service call fee, no back-and-forth.",
              },
              {
                icon: "📋",
                title: "Everything on Record",
                body: "Every visit is timestamped and documented with photos. If a question arises — from you, your insurer, or a buyer — the record is already in your account.",
              },
              {
                icon: "🔐",
                title: "Straightforward Terms",
                body: "If we completed it, it is covered for a year. We do not carve out exceptions for tasks we just performed. That is the complete policy.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-6 flex flex-col items-center text-center" style={{ background: "oklch(100% 0 0 / 0.06)", border: "1px solid oklch(100% 0 0 / 0.12)" }}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-base mb-2" style={{ color: "oklch(100% 0 0)" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.65)" }}>{item.body}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl px-6 py-5 max-w-2xl mx-auto text-center" style={{ background: "oklch(65% 0.15 72 / 0.12)", border: "1px solid oklch(65% 0.15 72 / 0.3)" }}>
            <p className="text-sm" style={{ color: "oklch(100% 0 0 / 0.8)" }}>
              <strong style={{ color: "oklch(75% 0.15 72)" }}>What's not covered:</strong> Material failures from manufacturer defects, damage caused by third parties or acts of nature, or tasks outside the original scope of work. If we didn't do it, we don't guarantee it — but we'll tell you who should.
            </p>
          </div>
        </div>
      </section>

      {/* ── GOOGLE REVIEWS — anchored below pricing ── */}
      <section className="py-14 px-4 section-white">
        <div className="max-w-4xl mx-auto">
          <div className="hp-overline text-center" style={{ color: "oklch(65% 0.15 72)" }}>From Members</div>
          <h2 className="font-display text-3xl font-black text-center mb-8" style={{ color: "oklch(22% 0.07 155)" }}>
            People who made the same decision you’re considering
          </h2>
          <div className="elfsight-app-3439582a-5f81-4ddb-ab1a-54f99c9da7af" data-elfsight-app-lazy></div>
        </div>
      </section>

      {/* ── TIMELINE COMPARISON — dark green section ── */}
      <section className="py-16 px-4 section-green">
        <div className="max-w-5xl mx-auto">
           <div className="hp-overline" style={{ color: "oklch(65% 0.15 72)" }}>
            Two Paths. Five Years.
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-center text-white mb-10">
            Where your home ends up depends on what you do today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Neglect column */}
            <div>
              <div className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: "oklch(70% 0.18 25)" }}>
                Unmanaged Home
              </div>
              <div className="space-y-3">
                {NEGLECT_TIMELINE.map((row, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div
                      className="text-xs font-bold px-2 py-1 rounded whitespace-nowrap mt-0.5"
                      style={{ background: "oklch(70% 0.18 25 / 0.2)", color: "oklch(75% 0.15 25)" }}
                    >
                      {row.year}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm" style={{ color: "oklch(100% 0 0 / 0.8)" }}>{row.event}</div>
                      <div className="text-xs font-bold mt-0.5" style={{ color: "oklch(70% 0.18 25)" }}>{row.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="mt-4 rounded-lg p-3 text-center"
                style={{ background: "oklch(70% 0.18 25 / 0.15)" }}
              >
                <div className="text-2xl font-black font-display" style={{ color: "oklch(70% 0.18 25)" }}>
                  $20,400+
                </div>
                <div className="text-xs" style={{ color: "oklch(100% 0 0 / 0.6)" }}>total 5-year cost</div>
              </div>
            </div>

            {/* Member column */}
            <div>
              <div className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: "oklch(65% 0.15 72)" }}>
                360° Method — Essential Tier
              </div>
              <div className="space-y-3">
                {MEMBER_TIMELINE.map((row, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div
                      className="text-xs font-bold px-2 py-1 rounded whitespace-nowrap mt-0.5"
                      style={{ background: "oklch(65% 0.15 72 / 0.2)", color: "oklch(70% 0.14 75)" }}
                    >
                      {row.year}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm" style={{ color: "oklch(100% 0 0 / 0.8)" }}>{row.event}</div>
                      <div className="text-xs font-bold mt-0.5" style={{ color: "oklch(65% 0.15 72)" }}>{row.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="mt-4 rounded-lg p-3 text-center"
                style={{ background: "oklch(65% 0.15 72 / 0.15)" }}
              >
                <div className="text-2xl font-black font-display" style={{ color: "oklch(65% 0.15 72)" }}>
                  $2,940
                </div>
                <div className="text-xs" style={{ color: "oklch(100% 0 0 / 0.6)" }}>
                  total 5-year cost ($49/mo × 60)
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <a href="#pricing" className="btn-hp-primary text-base px-10 py-4">
              View Membership Options →
            </a>
          </div>
        </div>
      </section>



      {/* ── WORK PHOTOS — cream bg ── */}
      <section className="py-14 px-4 section-cream">
        <div className="max-w-5xl mx-auto">
          <div className="hp-overline text-center" style={{ color: "oklch(65% 0.15 72)" }}>The Work We Do</div>
          <h2 className="font-display text-3xl font-black text-center mb-8" style={{ color: "oklch(22% 0.07 155)" }}>
            This is what your home looks like after a visit.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/roof_moss_cleaning_8ec59cf6.jpg", caption: "Roof Moss Cleaning" },
              { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/gutter_cleaning_ea6257be.jpg", caption: "Gutter Cleaning" },
              { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hose_bib_covering_cd7cd768.jpg", caption: "Hose Bib Winterization" },
              { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/exterior_light_fixture_replacement_ebcaac9c.jpg", caption: "Exterior Light Fixture Replacement" },
              { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/rotted_stair_repair_7a04b221.jpg", caption: "Rotted Stair Repair" },
              { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/Before_Afters(10)_81ded948.png", caption: "Pressure Washing — Driveway" },
            ].map((photo, i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow-sm">
                <img src={photo.src} alt={photo.caption} className="w-full h-52 object-cover" loading="lazy" />
                <div className="px-3 py-2 bg-white">
                  <p className="text-xs font-medium" style={{ color: "oklch(45% 0.02 60)" }}>{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ — cream bg, HP card style ── */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-2xl mx-auto">
          <div className="hp-overline">Before You Enroll</div>
          <h2
            className="font-display text-3xl font-black text-center mb-10"
            style={{ color: "oklch(22% 0.07 155)" }}
          >
            Questions from people exactly where you are now
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left p-5 rounded-lg bg-white transition-all hover:shadow-md"
                style={{
                  border: `1px solid ${openFaq === i ? "oklch(65% 0.15 72)" : "oklch(85% 0.02 80)"}`,
                }}
              >
                <div className="flex justify-between items-start gap-3">
                  <span className="font-semibold text-sm leading-snug" style={{ color: "oklch(22% 0.07 155)" }}>
                    {faq.q}
                  </span>
                  <span className="font-bold flex-shrink-0" style={{ color: "oklch(65% 0.15 72)" }}>
                    {openFaq === i ? "−" : "+"}
                  </span>
                </div>
                {openFaq === i && (
                  <p
                    className="mt-3 text-sm leading-relaxed pt-3"
                    style={{
                      borderTop: "1px solid oklch(85% 0.02 80)",
                      color: "oklch(35% 0.03 255)",
                    }}
                  >
                    {faq.a}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — dark green ── */}
      <section className="py-20 px-4 section-green">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white mb-4">
            Right now, your home has no guide.<br />
            <span style={{ color: "oklch(65% 0.15 72)" }}>That changes the day you enroll.</span>
          </h2>
          <p className="mb-8 leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.7)" }}>
            Your baseline walkthrough is on the calendar within 48 hours. From that day forward, your technician knows your home, tracks its condition, and handles what needs handling — season by season — while your score climbs and your record grows. Annual membership from $588.
          </p>
          <a href="#pricing" className="btn-hp-primary text-base px-10 py-4">
            Start My Home’s Transformation →
          </a>
          <p className="mt-4 text-xs max-w-sm mx-auto" style={{ color: "oklch(100% 0 0 / 0.38)", lineHeight: 1.55 }}>
            The 360° Method is a proactive maintenance service — not a licensed home inspection. We work in tandem with home inspectors: they identify, we maintain and document. Reports do not replace a licensed inspector or structural engineer.{" "}
            <a href="/terms" className="underline hover:text-white transition-colors" style={{ color: "oklch(100% 0 0 / 0.45)" }}>Full terms apply.</a>
          </p>
          {onGoToMultifamily && (
            <div className="mt-6">
              <button
                onClick={onGoToMultifamily}
                className="text-sm font-semibold transition-colors"
                style={{ background: "none", border: "none", cursor: "pointer", color: "oklch(65% 0.15 72)", textDecoration: "underline" }}
              >
                Own investment properties or a rental portfolio? See the Portfolio Plan →
              </button>
            </div>
          )}
          <p className="mt-4 text-sm" style={{ color: "oklch(100% 0 0 / 0.5)" }}>
            Questions? Call us at{" "}
            <a
              href="tel:3605449858"
              className="hover:underline"
              style={{ color: "oklch(65% 0.15 72)" }}
            >
              (360) 544-9858
            </a>
          </p>
        </div>
      </section>

      {/* ── FOOTER — darkest green ── */}
      <footer className="py-8 px-4" style={{ background: "oklch(16% 0.06 155)", color: "oklch(100% 0 0 / 0.6)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white font-display">360°</span>
            <span style={{ color: "oklch(100% 0 0 / 0.3)" }}>|</span>
            <span>Delivered by Handy Pioneers</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:help@handypioneers.com"
              className="transition-colors hover:text-white"
              style={{ color: "oklch(100% 0 0 / 0.6)" }}
            >
              help@handypioneers.com
            </a>
            <a
              href="tel:3605449858"
              className="transition-colors hover:text-white"
              style={{ color: "oklch(100% 0 0 / 0.6)" }}
            >
              (360) 544-9858
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs" style={{ color: "oklch(100% 0 0 / 0.4)" }}>
            <span>© {new Date().getFullYear()} Handy Pioneers LLC</span>
            <span style={{ color: "oklch(100% 0 0 / 0.2)" }}>·</span>
            <button onClick={() => { window.history.pushState({}, "", "/terms"); window.location.reload(); }} className="hover:text-white transition-colors underline underline-offset-2" style={{ color: "oklch(100% 0 0 / 0.4)" }}>Terms &amp; Conditions</button>
            <span style={{ color: "oklch(100% 0 0 / 0.2)" }}>·</span>
            <button onClick={() => { window.history.pushState({}, "", "/privacy"); window.location.reload(); }} className="hover:text-white transition-colors underline underline-offset-2" style={{ color: "oklch(100% 0 0 / 0.4)" }}>Privacy Policy</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
