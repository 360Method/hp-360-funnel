import { useState } from "react";
import type { MemberTier, BillingCadence } from "../tiers";
import { TIERS, CADENCE_LABELS, getPrice, getSavingsVsMonthly } from "../tiers";

// ─── STAT BUBBLE MODAL DATA ──────────────────────────────────────────────────

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
  color: string;
  tasks: string[];
}

const SEASONS: SeasonData[] = [
  {
    season: "Spring",
    emoji: "🌱",
    timing: "March–April",
    color: "bg-green-50 border-green-200",
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
    color: "bg-yellow-50 border-yellow-200",
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
    color: "bg-orange-50 border-orange-200",
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
    color: "bg-blue-50 border-blue-200",
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
}

export default function FunnelPage({ onEnroll }: Props) {
  const [cadence, setCadence] = useState<BillingCadence>("annual");
  const [openBubble, setOpenBubble] = useState<number | null>(null);
  const [openFeature, setOpenFeature] = useState<{ tier: MemberTier; idx: number } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openSeason, setOpenSeason] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-cream font-sans">
      {/* ── STICKY NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl font-black text-navy font-display">360°</span>
            <div className="hidden sm:block">
              <div className="text-xs text-gray-500 leading-tight">Delivered by</div>
              <div className="text-sm font-bold text-navy leading-tight">Handy Pioneers</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:3605449858" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-navy transition-colors">
              (360) 544-9858
            </a>
            <a
              href="#pricing"
              className="bg-gold text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-gold-dark transition-colors whitespace-nowrap"
            >
              Enroll Now
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-navy text-white pt-20 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium text-gold-light mb-6">
            <span>🏠</span>
            <span>The 360° Method — Delivered by Handy Pioneers</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            Your home loses value<br />
            <span className="text-gold">every year you ignore it.</span><br />
            The 360° Method stops that.
          </h1>
          <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
            One annual scan. Four seasonal tune-ups. A labor credit that pays for itself.
            Proactive home maintenance — done for you — starting at <strong className="text-white">$49/mo</strong>.
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors shadow-lg"
          >
            See My Savings →
          </a>
          <p className="mt-4 text-white/50 text-sm">No contracts. Cancel anytime. PNW-specific service.</p>
        </div>
      </section>

      {/* ── STAT BUBBLES ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-gold uppercase tracking-widest mb-10">
            The cost of doing nothing
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STAT_BUBBLES.map((bubble, i) => (
              <button
                key={i}
                onClick={() => setOpenBubble(openBubble === i ? null : i)}
                className="group text-left p-6 rounded-2xl border-2 border-gray-100 hover:border-gold hover:shadow-lg transition-all cursor-pointer bg-cream"
              >
                <div className="text-4xl mb-3">{bubble.icon}</div>
                <div className="text-3xl font-black text-navy font-display mb-1">{bubble.stat}</div>
                <div className="text-sm text-slate-600 mb-3">{bubble.label}</div>
                <div className="text-xs font-semibold text-gold group-hover:underline">
                  {openBubble === i ? "▲ Hide details" : "▼ Learn more"}
                </div>
                {openBubble === i && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-slate-700 leading-relaxed">
                    <p className="font-bold text-navy mb-2">{bubble.modalTitle}</p>
                    <p>{bubble.modalBody}</p>
                    <p className="mt-2 text-xs text-gray-400">Source: {bubble.source}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT IS THE 360° METHOD ── */}
      <section className="py-16 px-4 bg-navy text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">The Framework</p>
          <h2 className="font-display text-3xl sm:text-4xl font-black mb-6">
            AWARE → ACT → ADVANCE
          </h2>
          <p className="text-white/75 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
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
              <div key={p.phase} className="bg-white/10 rounded-xl p-6">
                <div className="text-3xl mb-3">{p.icon}</div>
                <div className="text-gold text-xs font-bold uppercase tracking-widest mb-1">{p.phase}</div>
                <div className="font-bold text-white text-lg mb-2">{p.title}</div>
                <p className="text-white/70 text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEASONAL VISITS ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gold text-sm font-semibold uppercase tracking-widest mb-4">PNW-Specific Service</p>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-navy text-center mb-4">
            Four Visits. Zero Surprises.
          </h2>
          <p className="text-center text-slate-600 max-w-xl mx-auto mb-10">
            Every task is calibrated to Portland and SW Washington's climate — moss-prone roofs,
            clay soil drainage, Douglas Fir needle accumulation, and freeze-thaw cycles.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SEASONS.map((s, i) => (
              <button
                key={i}
                onClick={() => setOpenSeason(openSeason === i ? null : i)}
                className={`text-left p-5 rounded-xl border-2 transition-all ${s.color} hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <div className="font-bold text-navy">{s.season} Visit</div>
                      <div className="text-xs text-slate-500">{s.timing}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gold">
                    {openSeason === i ? "▲ Hide" : "▼ See tasks"}
                  </span>
                </div>
                {openSeason === i && (
                  <ul className="mt-3 space-y-1.5 border-t border-gray-200 pt-3">
                    {s.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-gold mt-0.5">✓</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Bronze includes Spring + Fall. Silver and Gold include all four seasons.
          </p>
        </div>
      </section>

      {/* ── SAVINGS CALCULATOR ── */}
      <section className="py-16 px-4 bg-cream">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">The Math</p>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-navy mb-6">
            What Does Membership Actually Return?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Avg. repair caught early vs. ignored", value: "$3,200", sub: "per incident" },
              { label: "Avg. incidents caught per year", value: "2.4", sub: "per home" },
              { label: "Avg. annual return on membership", value: "7.7×", sub: "vs. cost" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-3xl font-black text-gold font-display">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.sub}</div>
                <div className="text-sm text-slate-700 mt-2 leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Based on Handy Pioneers field data from 2023–2025 across Portland metro properties.
            Individual results vary by home age, condition, and tier.
          </p>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gold text-sm font-semibold uppercase tracking-widest mb-4">Membership Tiers</p>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-navy text-center mb-3">
            Choose Your Level of Protection
          </h2>
          <p className="text-center text-slate-600 max-w-xl mx-auto mb-8">
            Step-ladder discounts protect our margin on larger jobs while still rewarding members.
            The bigger the job, the more you save in absolute dollars.
          </p>

          {/* Cadence toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
              {(["monthly", "quarterly", "annual"] as BillingCadence[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCadence(c)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    cadence === c
                      ? "bg-white text-navy shadow-sm"
                      : "text-slate-500 hover:text-navy"
                  }`}
                >
                  {CADENCE_LABELS[c]}
                  {c === "annual" && (
                    <span className="ml-1.5 text-xs text-gold font-bold">Best Value</span>
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
                  className={`relative rounded-2xl border-2 p-6 flex flex-col ${
                    tier.popular
                      ? "border-slate-400 shadow-xl scale-[1.02]"
                      : "border-gray-200 shadow-sm"
                  } bg-white`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                      Most Popular
                    </div>
                  )}
                  <div className={`inline-flex self-start px-3 py-1 rounded-full text-xs font-bold mb-4 ${tier.badgeBg} ${tier.badgeText}`}>
                    {tier.name}
                  </div>
                  <div className="mb-1">
                    <span className="text-4xl font-black text-navy font-display">${price}</span>
                    <span className="text-slate-500 text-sm ml-1">
                      /{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
                    </span>
                  </div>
                  {cadence !== "monthly" && (
                    <div className="text-xs text-slate-500 mb-1">
                      ${tier.annualMonthly}/mo when billed annually
                    </div>
                  )}
                  {savings > 0 && (
                    <div className="text-xs font-semibold text-green-600 mb-3">
                      Save ${savings}/yr vs. monthly
                    </div>
                  )}
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{tier.tagline}</p>

                  {tier.laborBankDollars > 0 && (
                    <div className="bg-gold/10 border border-gold/30 rounded-lg px-3 py-2 mb-4 text-sm">
                      <span className="font-bold text-gold-dark">${tier.laborBankDollars}</span>
                      <span className="text-slate-700"> labor bank credit included</span>
                    </div>
                  )}

                  {/* Features — clickable */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map((feature, fi) => (
                      <li
                        key={fi}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <span className="text-gold mt-0.5 flex-shrink-0">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Discount brackets */}
                  <div className="mb-5">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Member Discounts
                    </div>
                    <div className="space-y-1">
                      {tier.discountBrackets.map((b, bi) => (
                        <div key={bi} className="flex justify-between text-xs">
                          <span className="text-slate-600">{b.label}</span>
                          <span className="font-bold text-navy">{b.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onEnroll(tier.id, cadence)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      tier.popular
                        ? "bg-navy text-white hover:bg-navy/90"
                        : "bg-gold text-white hover:bg-gold-dark"
                    }`}
                  >
                    Enroll — ${price}/{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            All plans include the Annual 360° Home Scan. No long-term contracts. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── TIMELINE COMPARISON ── */}
      <section className="py-16 px-4 bg-navy text-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gold text-sm font-semibold uppercase tracking-widest mb-4">The Math Is Simple</p>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-center mb-10">
            5 Years — Two Very Different Outcomes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Neglect column */}
            <div>
              <div className="text-red-400 font-bold text-sm uppercase tracking-wide mb-4">Without the 360° Method</div>
              <div className="space-y-3">
                {NEGLECT_TIMELINE.map((row, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="bg-red-900/50 text-red-300 text-xs font-bold px-2 py-1 rounded whitespace-nowrap mt-0.5">
                      {row.year}
                    </div>
                    <div className="flex-1">
                      <div className="text-white/80 text-sm">{row.event}</div>
                      <div className="text-red-400 text-xs font-bold mt-0.5">{row.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-red-900/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-black text-red-400 font-display">$20,400+</div>
                <div className="text-xs text-white/60">total 5-year cost</div>
              </div>
            </div>
            {/* Member column */}
            <div>
              <div className="text-green-400 font-bold text-sm uppercase tracking-wide mb-4">With the 360° Method (Essential)</div>
              <div className="space-y-3">
                {MEMBER_TIMELINE.map((row, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="bg-green-900/50 text-green-300 text-xs font-bold px-2 py-1 rounded whitespace-nowrap mt-0.5">
                      {row.year}
                    </div>
                    <div className="flex-1">
                      <div className="text-white/80 text-sm">{row.event}</div>
                      <div className="text-green-400 text-xs font-bold mt-0.5">{row.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-green-900/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-black text-green-400 font-display">$2,940</div>
                <div className="text-xs text-white/60">total 5-year cost ($49/mo × 60)</div>
              </div>
            </div>
          </div>
          <div className="text-center mt-10">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors"
            >
              Start Protecting My Home →
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-black text-navy text-center mb-10">
            Common Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left p-5 rounded-xl border border-gray-200 hover:border-gold transition-colors bg-cream"
              >
                <div className="flex justify-between items-start gap-3">
                  <span className="font-semibold text-navy text-sm leading-snug">{faq.q}</span>
                  <span className="text-gold font-bold flex-shrink-0">{openFaq === i ? "−" : "+"}</span>
                </div>
                {openFaq === i && (
                  <p className="mt-3 text-sm text-slate-700 leading-relaxed border-t border-gray-200 pt-3">
                    {faq.a}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-4 bg-cream">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-navy mb-4">
            Your home is your biggest asset.<br />
            <span className="text-gold">Protect it like one.</span>
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            The 360° Method is the only done-for-you proactive home maintenance system
            in the Portland metro. Starting at $49/mo — less than a dinner out.
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-navy hover:bg-navy/90 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors"
          >
            Enroll Today →
          </a>
          <p className="mt-4 text-sm text-gray-400">
            Questions? Call us at{" "}
            <a href="tel:3605449858" className="text-gold hover:underline">(360) 544-9858</a>
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-navy text-white/60 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white font-display">360°</span>
            <span className="text-white/40">|</span>
            <span>Delivered by Handy Pioneers</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:help@handypioneers.com" className="hover:text-gold transition-colors">
              help@handypioneers.com
            </a>
            <a href="tel:3605449858" className="hover:text-gold transition-colors">
              (360) 544-9858
            </a>
          </div>
          <div className="text-xs text-white/30">
            © {new Date().getFullYear()} Handy Pioneers LLC
          </div>
        </div>
      </footer>
    </div>
  );
}
