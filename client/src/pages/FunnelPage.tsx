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
    icon: "🏚️",
    stat: "$10,400",
    label: "avg. deferred maintenance per year",
    modalTitle: "The Deferred Maintenance Trap",
    modalBody:
      "According to the Harvard Joint Center for Housing Studies, the average American homeowner defers over $10,400 in maintenance annually. Small ignored items — caulk failures, clogged gutters, HVAC filters, moss on the roof — compound silently. A $150 gutter cleaning ignored for two years becomes a $4,200 fascia and soffit replacement. The 360° Method catches these before they compound.",
    source: "Harvard Joint Center for Housing Studies",
  },
  {
    icon: "📉",
    stat: "1–3%",
    label: "home value lost to deferred maintenance",
    modalTitle: "What Neglect Costs at Sale",
    modalBody:
      "Appraisers and real estate agents consistently report that deferred maintenance reduces a home's appraised value by 1–3% of total value. On a $500,000 PNW home, that's $5,000–$15,000 left on the table at closing — often more than the total cost of a 5-year 360° membership. Members receive a documented maintenance log that appraisers and buyers can verify.",
    source: "National Association of Realtors, 2024",
  },
  {
    icon: "⚡",
    stat: "$150",
    label: "fix vs. $4,200+ if ignored",
    modalTitle: "The PNW Multiplier Effect",
    modalBody:
      "In the Pacific Northwest, moisture is the enemy. A failed caulk bead around a window costs $150 to fix during a Fall visit. Left through one PNW winter, water intrusion causes wood rot, mold, and insulation damage — a $4,200–$8,000 remediation. Our Spring and Fall visits are specifically designed to catch the PNW's highest-risk failure points before the rainy season begins.",
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
      "Roof inspection — moss colonies, lifted shingles, flashing",
      "Gutter & downspout flush — needle/moss clogs cleared",
      "Fascia & soffit rot check — moisture wicking from winter",
      "Foundation drainage — clay soil saturation assessment",
      "Deck & fence — winter damage, loose boards, rot",
      "Caulk audit — windows, doors, exterior penetrations",
    ],
  },
  {
    season: "Summer",
    emoji: "☀️",
    timing: "June–July",
    tasks: [
      "HVAC filter swap + heat pump efficiency check",
      "Exterior paint & stain — dry-season application window",
      "Irrigation system startup + backflow test",
      "Crawl space moisture barrier inspection",
      "Attic ventilation — heat buildup assessment",
      "Deck sealing — optimal dry-weather application",
    ],
  },
  {
    season: "Fall",
    emoji: "🍂",
    timing: "September–October",
    tasks: [
      "Gutter pre-season clear — before the rains hit",
      "Window & door weatherstripping — heat retention",
      "Roof moss treatment — preventive application",
      "Chimney & fireplace inspection before first use",
      "Outdoor faucet winterization — freeze prevention",
      "Caulk & seal — final weatherproofing before rain season",
    ],
  },
  {
    season: "Winter",
    emoji: "❄️",
    timing: "December–January",
    tasks: [
      "Pipe insulation check — PNW freeze event prep",
      "Crawl space moisture — condensation & vapor barrier",
      "Roof load assessment after heavy snow/ice events",
      "Sump pump test — peak rain season readiness",
      "HVAC filter mid-season swap",
      "Interior moisture — mold-prone areas inspection",
    ],
  },
];

// ─── FAQ DATA ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "What if the tech finds something that needs a bigger repair?",
    a: "That's the point. When our tech finds an issue during a visit, they document it with photos and generate a prioritized repair estimate on the spot — linked directly to your membership record. You get a clear scope, a member-discounted price, and can approve it in one tap. No separate sales call, no waiting.",
  },
  {
    q: "How does the labor bank work?",
    a: "Your labor bank credit is pre-loaded at enrollment and renews annually. Use it on any handyman task between scheduled visits — a leaky faucet, a stuck door, a light fixture swap. Our tech logs time on-site and the system auto-debits your bank. You get a receipt. Credits do not roll over year-to-year (use-it-or-lose-it), which keeps your plan priced fairly.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Monthly and quarterly plans cancel at the end of the current billing period. Annual plans can be cancelled with a prorated refund for unused months, minus any labor bank credits already used. We'd rather earn your renewal than lock you in.",
  },
  {
    q: "What does the Annual 360° Home Scan include?",
    a: "It's a 2–3 hour documented whole-home assessment covering roof, foundation, exterior, interior systems, plumbing, electrical panels, HVAC, crawl space, and attic. You receive a written report with photos, a prioritized repair list, and estimated costs for each item. This report is yours to keep — useful for insurance claims, refinancing, or home sale.",
  },
  {
    q: "Is this available outside Portland/SW Washington?",
    a: "Currently the 360° Method is delivered in the Portland metro and SW Washington area. We're expanding regionally — join the waitlist for your area at the bottom of this page.",
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
  const [cadence, setCadence] = useState<BillingCadence>("annual");
  const [openBubble, setOpenBubble] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openSeason, setOpenSeason] = useState<number | null>(null);

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
            {/* HP-style seal placeholder */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
              style={{ background: "oklch(22% 0.07 155)" }}
            >
              360°
            </div>
            <div className="hidden sm:block">
              <div className="text-xs leading-tight" style={{ color: "oklch(50% 0.02 60)" }}>Delivered by</div>
              <div className="text-sm font-bold leading-tight" style={{ color: "oklch(22% 0.07 155)" }}>Handy Pioneers</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onGoToMultifamily && (
              <button
                onClick={onGoToMultifamily}
                className="hidden sm:block text-sm font-medium transition-colors"
                style={{ background: "none", border: "none", cursor: "pointer", color: "oklch(35% 0.03 255)" }}
              >
                Property Managers
              </button>
            )}
            <a
              href="tel:3605449858"
              className="hidden sm:block text-sm font-medium transition-colors"
              style={{ color: "oklch(35% 0.03 255)" }}
            >
              (360) 544-9858
            </a>
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
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            style={{ background: "oklch(100% 0 0 / 0.1)", color: "oklch(78% 0.13 78)" }}
          >
            <span>🏠</span>
            <span>The 360° Method — Delivered by Handy Pioneers</span>
          </div>

          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6"
          >
            Your home loses value<br />
            <span style={{ color: "oklch(65% 0.15 72)" }}>every year you ignore it.</span><br />
            The 360° Method stops that.
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.75)" }}>
            One annual scan. Four seasonal tune-ups. A labor credit that pays for itself.
            Proactive home maintenance — done for you — starting at{" "}
            <strong className="text-white">$49/mo</strong>.
          </p>

          <a href="#pricing" className="btn-hp-primary text-base px-10 py-4 shadow-lg">
            See My Savings →
          </a>
          <p className="mt-4 text-sm" style={{ color: "oklch(100% 0 0 / 0.45)" }}>
            No contracts. Cancel anytime. PNW-specific service.
          </p>

          {/* Trust badges row */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm" style={{ color: "oklch(100% 0 0 / 0.6)" }}>
            {["5-Star Rated", "Licensed & Insured", "1-Year Labor Guarantee", "On-Time Service"].map((b) => (
              <span key={b} className="flex items-center gap-1.5">
                <span style={{ color: "oklch(65% 0.15 72)" }}>✓</span> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STAT BUBBLES — cream bg, HP card style ── */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-5xl mx-auto">
          <div className="hp-overline">The Cost of Doing Nothing</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STAT_BUBBLES.map((bubble, i) => (
              <button
                key={i}
                onClick={() => setOpenBubble(openBubble === i ? null : i)}
                className="hp-card text-left group"
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
            AWARE → ACT → ADVANCE
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.75)" }}>
            The 360° Method is a complete proactive home maintenance system built on three phases.
            We deliver the done-for-you version — you get the results without lifting a finger.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              {
                phase: "AWARE",
                icon: "🔍",
                title: "Know Your Home",
                body: "The Annual 360° Home Scan documents every system, surface, and risk. You know exactly what you have, what needs attention, and what it costs — before it becomes an emergency.",
              },
              {
                phase: "ACT",
                icon: "🔧",
                title: "Maintain Proactively",
                body: "Four seasonal visits address the specific risks of each PNW season. Spring damage assessment. Summer dry-season prep. Fall weatherization. Winter freeze protection. We show up — you don't have to remember.",
              },
              {
                phase: "ADVANCE",
                icon: "📈",
                title: "Build Wealth",
                body: "A maintained home appraises higher, sells faster, and costs less to own. Your 360° membership generates a documented maintenance log that adds real dollars at refinancing or sale.",
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
          <div className="hp-overline">PNW-Specific Service</div>
          <h2
            className="font-display text-3xl sm:text-4xl font-black text-center mb-4"
            style={{ color: "oklch(22% 0.07 155)" }}
          >
            Four Visits. Zero Surprises.
          </h2>
          <p className="text-center max-w-xl mx-auto mb-10" style={{ color: "oklch(50% 0.02 60)" }}>
            Every task is calibrated to Portland and SW Washington's climate — moss-prone roofs,
            clay soil drainage, Douglas Fir needle accumulation, and freeze-thaw cycles.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SEASONS.map((s, i) => (
              <button
                key={i}
                onClick={() => setOpenSeason(openSeason === i ? null : i)}
                className="hp-card text-left"
                style={{ cursor: "pointer" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <div className="font-bold" style={{ color: "oklch(22% 0.07 155)" }}>
                        {s.season} Visit
                      </div>
                      <div className="text-xs" style={{ color: "oklch(50% 0.02 60)" }}>
                        {s.timing}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(65% 0.15 72)" }}
                  >
                    {openSeason === i ? "▲ Hide" : "▼ See tasks"}
                  </span>
                </div>
                {openSeason === i && (
                  <ul
                    className="mt-3 space-y-1.5 pt-3"
                    style={{ borderTop: "1px solid oklch(85% 0.02 80)" }}
                  >
                    {s.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm" style={{ color: "oklch(35% 0.03 255)" }}>
                        <span style={{ color: "oklch(65% 0.15 72)" }} className="mt-0.5 flex-shrink-0">✓</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            ))}
          </div>
          <p className="text-center text-xs mt-4" style={{ color: "oklch(60% 0.02 60)" }}>
            Essential includes Spring + Fall. Full Coverage and Maximum Protection include all four seasons.
          </p>
        </div>
      </section>

      {/* ── SAVINGS STATS — cream bg ── */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-3xl mx-auto text-center">
          <div className="hp-overline">The Math</div>
          <h2
            className="font-display text-3xl sm:text-4xl font-black mb-6"
            style={{ color: "oklch(22% 0.07 155)" }}
          >
            What Does Membership Actually Return?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Avg. repair caught early vs. ignored", value: "$3,200", sub: "per incident" },
              { label: "Avg. incidents caught per year", value: "2.4", sub: "per home" },
              { label: "Avg. annual return on membership", value: "7.7×", sub: "vs. cost" },
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
            Based on Handy Pioneers field data from 2023–2025 across Portland metro properties.
            Individual results vary by home age, condition, and tier.
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
            Choose Your Level of Protection
          </h2>
          <p className="text-center max-w-xl mx-auto mb-8" style={{ color: "oklch(50% 0.02 60)" }}>
            Step-ladder discounts protect our margin on larger jobs while still rewarding members.
            The bigger the job, the more you save in absolute dollars.
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
                  className="px-4 py-2 rounded-md text-sm font-semibold transition-all"
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
                  {CADENCE_LABELS[c]}
                  {c === "annual" && (
                    <span
                      className="ml-1.5 text-xs font-bold"
                      style={{ color: "oklch(65% 0.15 72)" }}
                    >
                      Best Value
                    </span>
                  )}
                </button>
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
                      ${price}
                    </span>
                    <span className="text-sm ml-1" style={{ color: "oklch(50% 0.02 60)" }}>
                      /{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
                    </span>
                  </div>
                  {cadence !== "monthly" && (
                    <div className="text-xs mb-1" style={{ color: "oklch(50% 0.02 60)" }}>
                      ${tier.annualMonthly}/mo when billed annually
                    </div>
                  )}
                  {savings > 0 && (
                    <div className="text-xs font-semibold mb-3" style={{ color: "oklch(40% 0.12 145)" }}>
                      Save ${savings}/yr vs. monthly
                    </div>
                  )}

                  <p className="text-sm mb-4 leading-relaxed" style={{ color: "oklch(50% 0.02 60)" }}>
                    {tier.tagline}
                  </p>

                  {tier.laborBankDollars > 0 && (
                    <div
                      className="rounded-md px-3 py-2 mb-4 text-sm"
                      style={{
                        background: "oklch(65% 0.15 72 / 0.08)",
                        border: "1px solid oklch(65% 0.15 72 / 0.25)",
                      }}
                    >
                      <span className="font-bold" style={{ color: "oklch(55% 0.14 68)" }}>
                        ${tier.laborBankDollars}
                      </span>
                      <span style={{ color: "oklch(35% 0.03 255)" }}> labor bank credit included</span>
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
                      Member Discounts
                    </div>
                    <div className="space-y-1">
                      {tier.discountBrackets.map((b, bi) => (
                        <div key={bi} className="flex justify-between text-xs">
                          <span style={{ color: "oklch(50% 0.02 60)" }}>{b.label}</span>
                          <span className="font-bold" style={{ color: "oklch(22% 0.07 155)" }}>
                            {b.pct}
                          </span>
                        </div>
                      ))}
                    </div>
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
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs mt-6" style={{ color: "oklch(60% 0.02 60)" }}>
            All plans include the Annual 360° Home Scan. No long-term contracts. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── TIMELINE COMPARISON — dark green section ── */}
      <section className="py-16 px-4 section-green">
        <div className="max-w-5xl mx-auto">
          <div className="hp-overline" style={{ color: "oklch(65% 0.15 72)" }}>
            The Math Is Simple
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-center text-white mb-10">
            5 Years — Two Very Different Outcomes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Neglect column */}
            <div>
              <div className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: "oklch(70% 0.18 25)" }}>
                Without the 360° Method
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
                With the 360° Method (Essential)
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
              Start Protecting My Home →
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ — cream bg, HP card style ── */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-2xl mx-auto">
          <div className="hp-overline">Common Questions</div>
          <h2
            className="font-display text-3xl font-black text-center mb-10"
            style={{ color: "oklch(22% 0.07 155)" }}
          >
            Frequently Asked
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
          <div className="text-5xl mb-4">🏠</div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white mb-4">
            Your home is your biggest asset.<br />
            <span style={{ color: "oklch(65% 0.15 72)" }}>Protect it like one.</span>
          </h2>
          <p className="mb-8 leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.7)" }}>
            The 360° Method is the only done-for-you proactive home maintenance system
            in the Portland metro. Starting at $49/mo — less than a dinner out.
          </p>
          <a href="#pricing" className="btn-hp-primary text-base px-10 py-4">
            Enroll Today →
          </a>
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
          <div className="text-xs" style={{ color: "oklch(100% 0 0 / 0.3)" }}>
            © {new Date().getFullYear()} Handy Pioneers LLC
          </div>
        </div>
      </footer>
    </div>
  );
}
