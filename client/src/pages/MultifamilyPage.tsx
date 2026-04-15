/*
 * MultifamilyPage — 360° Portfolio Plan by Handy Pioneers
 * Design: matches FunnelPage exactly
 *   - Flat forest green hero (no texture overlay) — per user request
 *   - Warm cream (#f5f0e8) light sections
 *   - Amber CTA buttons
 *   - Playfair Display headings, Inter body
 *   - HP overline labels
 *   - HP card style (white bg, subtle border, hover lift)
 *
 * Pricing philosophy (per user):
 *   - Exterior/common-area work is NOT proportional to unit count
 *     (a fourplex exterior ≈ a large SFH exterior)
 *   - One flat tier per property size — same 3-tier structure as homeowner side
 *   - Interior unit visits are a per-door add-on, priced separately
 *   - Turnover/make-ready is on-demand, not subscription
 */

import { useEffect, useRef, useState } from "react";
import type { BillingCadence } from "../tiers";
import { CADENCE_LABELS } from "../tiers";
// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface PortfolioProperty {
  id: string;
  address: string;
  type: "sfh" | "duplex" | "triplex" | "fourplex";
  interiorAddon: boolean;
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
// Exterior/common-area tiers — flat per property, NOT per unit.
// A fourplex exterior is ~same scope as a large SFH exterior.
// Interior add-on is per door (occupied unit), priced separately.

const PROPERTY_TYPES = [
  { id: "sfh",      label: "Single-Family Rental", doors: 1 },
  { id: "duplex",   label: "Duplex",               doors: 2 },
  { id: "triplex",  label: "Triplex",               doors: 3 },
  { id: "fourplex", label: "Fourplex (4-Plex)",     doors: 4 },
] as const;

// Monthly base prices — exterior + common area only
const BASE_MONTHLY: Record<string, number> = {
  sfh:      59,   // same as homeowner Essential
  duplex:   79,   // slight premium for 2 entries, shared systems
  triplex:  89,
  fourplex: 99,   // still close to SFH — exterior scope is similar
};

// Quarterly = monthly × 2.8 (≈7% off monthly rate)
// Annual = monthly × 10 (≈17% off monthly rate, same as homeowner side)
function getBasePrice(type: string, cadence: BillingCadence): number {
  const mo = BASE_MONTHLY[type];
  if (cadence === "monthly")   return mo;
  if (cadence === "quarterly") return Math.round(mo * 2.8);
  return mo * 10; // annual
}

// Interior add-on: per door, per year only (2 visits/door/yr)
// Available on ALL cadences — shown as annual equivalent for monthly/quarterly
const INTERIOR_PER_DOOR_ANNUAL = 49;

function getInteriorAddonPrice(type: string, cadence: BillingCadence): number {
  const doors = PROPERTY_TYPES.find((p) => p.id === type)?.doors ?? 1;
  const annualCost = doors * INTERIOR_PER_DOOR_ANNUAL;
  if (cadence === "annual")   return annualCost;
  if (cadence === "quarterly") return Math.round(annualCost / 4);
  return Math.round(annualCost / 12);
}

function getPortfolioTotal(properties: PortfolioProperty[], cadence: BillingCadence): number {
  return properties.reduce((sum, p) => {
    const base = getBasePrice(p.type, cadence);
    const interior = p.interiorAddon ? getInteriorAddonPrice(p.type, cadence) : 0;
    return sum + base + interior;
  }, 0);
}

function getSavingsVsMonthly(properties: PortfolioProperty[], cadence: BillingCadence): number {
  if (cadence === "monthly") return 0;
  const monthlyAnnualized = properties.reduce((sum, p) => {
    const interiorMo = p.interiorAddon ? getInteriorAddonPrice(p.type, "monthly") : 0;
    return sum + (BASE_MONTHLY[p.type] + interiorMo) * 12;
  }, 0);
  const cadenceAnnualized = cadence === "quarterly"
    ? properties.reduce((sum, p) => {
        const interiorQ = p.interiorAddon ? getInteriorAddonPrice(p.type, "quarterly") : 0;
        return sum + (getBasePrice(p.type, "quarterly") + interiorQ) * 4;
      }, 0)
    : properties.reduce((sum, p) => {
        const interiorA = p.interiorAddon ? getInteriorAddonPrice(p.type, "annual") : 0;
        return sum + getBasePrice(p.type, "annual") + interiorA;
      }, 0);
  return monthlyAnnualized - cadenceAnnualized;
}

// ─── MEMBER DISCOUNTS ────────────────────────────────────────────────────────
const MEMBER_DISCOUNTS = [
  { threshold: 1, label: "1 property",   discount: 0 },
  { threshold: 2, label: "2–3 properties", discount: 5 },
  { threshold: 4, label: "4–6 properties", discount: 10 },
  { threshold: 7, label: "7+ properties",  discount: 15 },
];

function getMemberDiscount(count: number): number {
  let rate = 0;
  for (const tier of MEMBER_DISCOUNTS) {
    if (count >= tier.threshold) rate = tier.discount;
  }
  return rate;
}

// ─── SEASONAL DATA — property-specific ────────────────────────────────────────

const PM_SEASONS = [
  {
    season: "Spring",
    emoji: "🌱",
    timing: "March–April",
    exterior: [
      "Roof inspection — moss colonies, lifted shingles, flashing at all penetrations",
      "Gutter & downspout flush — needle/moss clogs cleared at all units",
      "Fascia & soffit rot check — moisture wicking from winter rain season",
      "Foundation drainage — clay soil saturation, grading away from structure",
      "Common area walkways — trip hazards, heaved concrete, drainage",
      "Exterior caulk audit — windows, doors, hose bibs, all penetrations",
    ],
    interior: [
      "Unit HVAC filter swap (all occupied doors)",
      "Under-sink moisture check — slow leaks before tenant reports",
      "Smoke & CO detector test — liability protection",
      "Bathroom caulk & grout — mold prevention in high-moisture units",
    ],
  },
  {
    season: "Summer",
    emoji: "☀️",
    timing: "June–July",
    exterior: [
      "Exterior paint & stain condition — dry-season application window",
      "Deck & fence inspection — rot, loose boards, fastener corrosion",
      "Irrigation system check (if applicable) — backflow, coverage",
      "Attic & crawl space ventilation — heat buildup in shared spaces",
      "Parking area & common lighting — bulb replacement, fixture condition",
      "Roof moss treatment — preventive application while dry",
    ],
    interior: [
      "HVAC efficiency check — filter + coil condition per unit",
      "Water heater anode rod inspection (older units)",
      "Window & sliding door operation — tenant comfort + security",
      "Dryer vent cleaning — fire risk reduction",
    ],
  },
  {
    season: "Fall",
    emoji: "🍂",
    timing: "September–October",
    exterior: [
      "Gutter pre-season clear — before the PNW rains begin",
      "Window & door weatherstripping — heat retention, tenant comfort",
      "Outdoor faucet winterization — freeze prevention at all hose bibs",
      "Chimney & fireplace inspection (if applicable)",
      "Caulk & seal — final weatherproofing before rain season",
      "Common area lighting — daylight savings prep, safety",
    ],
    interior: [
      "Unit weatherstripping — draft gaps at doors/windows",
      "Smoke & CO detector battery replacement",
      "Furnace/heat pump filter swap — heating season prep",
      "Bathroom exhaust fan test — moisture control through wet season",
    ],
  },
  {
    season: "Winter",
    emoji: "❄️",
    timing: "December–January",
    exterior: [
      "Pipe insulation check — exterior and crawl space exposed lines",
      "Roof load assessment after heavy snow/ice events",
      "Sump pump test — peak rain season readiness",
      "Common area ice/slip hazard assessment",
      "Exterior lighting — safety during short daylight hours",
      "Foundation moisture — perimeter drainage performance",
    ],
    interior: [
      "Crawl space moisture — condensation & vapor barrier per unit",
      "HVAC mid-season filter swap",
      "Interior moisture — mold-prone bathrooms, laundry areas",
      "Pipe freeze risk check — units with exterior wall plumbing",
    ],
  },
];

// ─── STAT BUBBLES ─────────────────────────────────────────────────────────────

const PM_STATS = [
  {
    icon: "📋",
    stat: "34%",
    label: "of small landlords have no maintenance system",
    title: "The Reactive Trap",
    body: "A 2024 survey by the National Apartment Association found that 34% of independent landlords (1–4 units) operate entirely reactively — no scheduled inspections, no preventive maintenance, no documentation. The result: higher tenant turnover, larger repair bills, and personal liability exposure when habitability issues go undetected.",
    source: "National Apartment Association, 2024",
  },
  {
    icon: "🔄",
    stat: "$3,800",
    label: "avg. cost per unit turnover",
    title: "Turnover Is Your Biggest Expense",
    body: "The average cost to turn a rental unit — cleaning, paint, carpet, minor repairs, and vacancy loss — runs $3,800–$6,200 in the Portland metro. Properties with documented proactive maintenance see 23% lower turnover rates because tenants stay longer in well-maintained units and issues are caught before they become tenant complaints.",
    source: "Buildium Rental Industry Report, 2024",
  },
  {
    icon: "⚖️",
    stat: "ORS 90.320",
    label: "habitability standard — your legal obligation",
    title: "You're Legally Required to Maintain",
    body: "Oregon Revised Statute 90.320 requires landlords to maintain rental units in a habitable condition at all times — functional heating, weathertight structure, working plumbing, and safe common areas. Failure to maintain is grounds for rent withholding, lease termination, and civil liability. A documented maintenance program is your strongest legal defense.",
    source: "Oregon Revised Statutes § 90.320",
  },
];

// ─── PLAN TIERS ───────────────────────────────────────────────────────────────

const PM_TIERS = [
  {
    id: "essential",
    name: "Exterior Shield",
    tagline: "Protect the structure. Catch problems before tenants do.",
    color: "#c8922a",
    popular: false,
    visits: 2,
    visitDesc: "Spring + Fall exterior",
    laborBank: 0,
    features: [
      "Annual 360° Property Scan — full exterior + common area documented assessment",
      "Spring visit — post-rain damage assessment, gutters, moss, caulk",
      "Fall visit — weatherization, gutter clear, freeze prep",
      "Prioritized repair report with cost estimates — shareable with your accountant",
      "Member discount on all out-of-scope repair work",
      "HP direct line — no hold queues",
    ],
    perProperty: true,
  },
  {
    id: "full",
    name: "Full Coverage",
    tagline: "Four seasons of protection + pre-paid labor credit.",
    color: "#1a3a2a",
    popular: true,
    visits: 4,
    visitDesc: "All 4 seasons exterior",
    laborBank: 200,
    features: [
      "Everything in Exterior Shield, plus:",
      "$200 labor bank credit per property — use on any repair between visits",
      "Summer visit — dry-season exterior, deck, paint, ventilation",
      "Winter visit — freeze protection, moisture, sump, pipe insulation",
      "Maintenance log for each property — tax documentation + liability protection",
      "One-tap estimate conversion — findings become quotes instantly",
    ],
    perProperty: true,
  },
  {
    id: "maximum",
    name: "Portfolio Max",
    tagline: "The full system. Priority access. Maximum savings.",
    color: "#0f1f3d",
    popular: false,
    visits: 4,
    visitDesc: "All 4 seasons + priority",
    laborBank: 500,
    features: [
      "Everything in Full Coverage, plus:",
      "$500 labor bank credit per property — you're ahead after month 5",
      "Priority scheduling — your properties go first",
      "Dedicated HP account manager for your portfolio",
      "Pre-negotiated sub rates on major work (roof, HVAC, plumbing)",
      "Annual portfolio health report — lender-ready documentation",
    ],
    perProperty: true,
  },
];

// Tier pricing mirrors homeowner side exactly — same exterior scope
const TIER_MONTHLY: Record<string, number> = {
  essential: 59,
  full:       99,
  maximum:   149,
};

function getTierPrice(tierId: string, cadence: BillingCadence, unitCount: number): number {
  const mo = TIER_MONTHLY[tierId];
  let base: number;
  if (cadence === "monthly")   base = mo;
  else if (cadence === "quarterly") base = Math.round(mo * 2.8);
  else base = mo * 10;
  return base * unitCount;
}

function getTierSavings(tierId: string, cadence: BillingCadence, unitCount: number): number {
  if (cadence === "monthly") return 0;
  const monthly12 = TIER_MONTHLY[tierId] * 12 * unitCount;
  const paid = cadence === "quarterly"
    ? Math.round(TIER_MONTHLY[tierId] * 2.8) * 4 * unitCount
    : TIER_MONTHLY[tierId] * 10 * unitCount;
  return monthly12 - paid;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface Props {
  onEnrollPortfolio: (properties: PortfolioProperty[], cadence: BillingCadence) => void;
  onGoHome: () => void;
}

export default function MultifamilyPage({ onEnrollPortfolio, onGoHome }: Props) {
  const [cadence, setCadence] = useState<BillingCadence>("annual");
  const [unitCount, setUnitCount] = useState(2);
  const [openStat, setOpenStat] = useState<number | null>(null);
  const [openSeason, setOpenSeason] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("full");

  // For the portfolio calculator (advanced path)
  const [properties, setProperties] = useState<PortfolioProperty[]>([
    { id: "1", address: "", type: "sfh", interiorAddon: false },
  ]);

  // Google Maps autocomplete refs — one per property row
  const autocompleteRefs = useRef<Record<string, google.maps.places.Autocomplete | null>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Load Google Maps Places API via Manus proxy
  useEffect(() => {
    const apiKey = import.meta.env.VITE_FRONTEND_FORGE_API_KEY as string;
    const apiUrl = import.meta.env.VITE_FRONTEND_FORGE_API_URL as string;
    if (!apiKey || !apiUrl) return;
    if (document.getElementById("gm-places-script")) return;
    const script = document.createElement("script");
    script.id = "gm-places-script";
    script.src = `${apiUrl}/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Attach autocomplete to a newly rendered address input
  const attachAutocomplete = (id: string, el: HTMLInputElement | null) => {
    inputRefs.current[id] = el;
    if (!el || autocompleteRefs.current[id]) return;
    const tryAttach = () => {
      if (!(window as unknown as { google?: { maps?: { places?: unknown } } }).google?.maps?.places) {
        setTimeout(tryAttach, 300);
        return;
      }
      const ac = new google.maps.places.Autocomplete(el, {
        types: ["address"],
        componentRestrictions: { country: "us" },
        fields: ["formatted_address"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place.formatted_address) {
          updateProperty(id, { address: place.formatted_address });
        }
      });
      autocompleteRefs.current[id] = ac;
    };
    tryAttach();
  };

  const addProperty = () => {
    setProperties((prev) => [
      ...prev,
      { id: String(Date.now()), address: "", type: "sfh", interiorAddon: false },
    ]);
  };

  const removeProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProperty = (id: string, updates: Partial<PortfolioProperty>) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const portfolioTotal = getPortfolioTotal(properties, cadence);
  const portfolioSavings = getSavingsVsMonthly(properties, cadence);

  const discountRate = getMemberDiscount(properties.length);
  const rawTotal = getPortfolioTotal(properties, cadence);
  const discountAmount = Math.round(rawTotal * discountRate / 100);
  const finalTotal = rawTotal - discountAmount;

  const handleEnroll = () => {
    // Save lead data immediately before Stripe redirect (cart abandonment capture)
    const API = "https://pro.handypioneers.com/api/trpc";
    fetch(`${API}/threeSixty.portfolioAbandonedLead.capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        json: {
          properties,
          cadence,
          portfolioTotal: finalTotal,
          source: "360-multifamily-calculator",
        },
      }),
      credentials: "include",
    }).catch(() => { /* fire-and-forget */ });
    onEnrollPortfolio(properties, cadence);
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: "oklch(96% 0.015 80)" }}>

      {/* ── TOP UTILITY BAR ── */}
      <div style={{ background: "oklch(16% 0.06 155)" }} className="text-white/80 text-xs py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <span>5-Star Rated · Licensed &amp; Insured · WA Lic. HANDYP*761NH</span>
          <a href="tel:3605449858" className="hover:text-white transition-colors font-medium">
            (360) 544-9858
          </a>
        </div>
      </div>

      {/* ── STICKY NAV ── */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm" style={{ borderColor: "oklch(88% 0.01 80)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onGoHome}
            className="flex items-center gap-3 min-w-0"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
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
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onGoHome}
              className="hidden sm:block text-sm font-medium transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer", color: "oklch(35% 0.03 255)" }}
            >
              Homeowners
            </button>
            <a href="tel:3605449858" className="hidden sm:block text-sm font-medium" style={{ color: "oklch(35% 0.03 255)" }}>
              (360) 544-9858
            </a>
            <a href="#pricing" className="btn-hp-primary text-sm px-5 py-2.5">
              Get a Quote
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO — flat forest green, no texture (per user request) ── */}
      <section
        className="text-white pt-20 pb-28 px-4"
        style={{ background: "oklch(22% 0.07 155)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            style={{ background: "oklch(100% 0 0 / 0.1)", color: "oklch(78% 0.13 78)" }}
          >
            <span>🏢</span>
            <span>360° Portfolio Plan — For Property Managers &amp; Small Landlords</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            Your tenants notice<br />
            <span style={{ color: "oklch(65% 0.15 72)" }}>what you've been ignoring.</span><br />
            The 360° Method fixes that.
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.75)" }}>
            One annual scan per property. Four seasonal exterior visits. A labor credit that covers the small stuff.
            Proactive property maintenance — done for you — starting at{" "}
            <strong className="text-white">$59/mo per property</strong>.
          </p>

          <a href="#pricing" className="btn-hp-primary text-base px-10 py-4 shadow-lg">
            See Portfolio Pricing →
          </a>
          <p className="mt-4 text-sm" style={{ color: "oklch(100% 0 0 / 0.45)" }}>
            No contracts. Cancel anytime. Portland &amp; SW Washington.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm" style={{ color: "oklch(100% 0 0 / 0.6)" }}>
            {["Licensed & Insured", "ORS 90.320 Compliant Documentation", "1-Year Labor Guarantee", "Priority Scheduling Available"].map((b) => (
              <span key={b} className="flex items-center gap-1.5">
                <span style={{ color: "oklch(65% 0.15 72)" }}>✓</span> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STAT BUBBLES ── */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-5xl mx-auto">
          <div className="hp-overline">The Cost of Reactive Management</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PM_STATS.map((s, i) => (
              <button
                key={i}
                onClick={() => setOpenStat(openStat === i ? null : i)}
                className="hp-card text-left group"
                style={{ cursor: "pointer" }}
              >
                <div className="text-4xl mb-3">{s.icon}</div>
                <div className="text-3xl font-black font-display mb-1" style={{ color: "oklch(22% 0.07 155)" }}>
                  {s.stat}
                </div>
                <div className="text-sm mb-3" style={{ color: "oklch(50% 0.02 60)" }}>{s.label}</div>
                <div className="text-xs font-semibold group-hover:underline" style={{ color: "oklch(65% 0.15 72)" }}>
                  {openStat === i ? "▲ Hide details" : "▼ Learn more"}
                </div>
                {openStat === i && (
                  <div className="mt-4 pt-4 text-sm leading-relaxed" style={{ borderTop: "1px solid oklch(85% 0.02 80)", color: "oklch(35% 0.03 255)" }}>
                    <p className="font-bold mb-2" style={{ color: "oklch(22% 0.07 155)" }}>{s.title}</p>
                    <p>{s.body}</p>
                    <p className="mt-2 text-xs" style={{ color: "oklch(60% 0.02 60)" }}>Source: {s.source}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FRAMEWORK — dark green ── */}
      <section className="py-16 px-4 section-green">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hp-overline" style={{ color: "oklch(65% 0.15 72)" }}>The Framework</div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white mb-6">
            PROTECT → DOCUMENT → RETAIN
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.75)" }}>
            The 360° Portfolio Plan is built around the three things that matter most to a small landlord:
            keeping your properties in rentable condition, staying legally protected, and keeping good tenants longer.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              {
                phase: "PROTECT",
                icon: "🛡️",
                title: "Stop Problems Before Tenants Do",
                body: "Four seasonal visits catch the issues that become tenant complaints, habitability violations, and emergency repair calls. We document everything — you have proof of proactive maintenance before any dispute arises.",
              },
              {
                phase: "DOCUMENT",
                icon: "📋",
                title: "Build a Legal & Financial Record",
                body: "Every visit generates a written report with photos, findings, and repair estimates. This record satisfies ORS 90.320 habitability requirements, supports insurance claims, and is lender-ready for refinancing or sale.",
              },
              {
                phase: "RETAIN",
                icon: "🤝",
                title: "Keep Good Tenants Longer",
                body: "Tenants stay in well-maintained properties. A $59/mo maintenance plan per property costs less than one month of vacancy. Our data shows maintained properties see 23% lower turnover — that's thousands back in your pocket annually.",
              },
            ].map((p) => (
              <div key={p.phase} className="rounded-lg p-6" style={{ background: "oklch(100% 0 0 / 0.08)" }}>
                <div className="text-3xl mb-3">{p.icon}</div>
                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "oklch(65% 0.15 72)" }}>
                  {p.phase}
                </div>
                <div className="font-bold text-white text-lg mb-2">{p.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.7)" }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEASONAL VISITS ── */}
      <section className="py-16 px-4 section-white">
        <div className="max-w-5xl mx-auto">
          <div className="hp-overline">PNW-Specific Service</div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-center mb-4" style={{ color: "oklch(22% 0.07 155)" }}>
            Four Visits. Zero Tenant Complaints.
          </h2>
          <p className="text-center max-w-xl mx-auto mb-4" style={{ color: "oklch(50% 0.02 60)" }}>
            Every task is calibrated to Portland and SW Washington's climate — moss-prone roofs, clay soil drainage,
            Douglas Fir needle accumulation, and freeze-thaw cycles. Exterior visits cover all properties.
            Interior visits are an optional add-on per occupied door.
          </p>
          <div className="flex justify-center gap-4 mb-8 text-sm">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: "oklch(22% 0.07 155)" }}>
              <span style={{ color: "oklch(65% 0.15 72)" }}>■</span> Exterior/Common Area (all plans)
            </span>
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: "oklch(50% 0.02 60)" }}>
              <span style={{ color: "oklch(60% 0.15 250)" }}>■</span> Interior Unit Add-On (optional)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PM_SEASONS.map((s, i) => (
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
                      <div className="font-bold" style={{ color: "oklch(22% 0.07 155)" }}>{s.season} Visit</div>
                      <div className="text-xs" style={{ color: "oklch(50% 0.02 60)" }}>{s.timing}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "oklch(65% 0.15 72)" }}>
                    {openSeason === i ? "▲ Hide" : "▼ See tasks"}
                  </span>
                </div>
                {openSeason === i && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid oklch(85% 0.02 80)" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(22% 0.07 155)" }}>
                      Exterior &amp; Common Area
                    </p>
                    <ul className="space-y-1.5 mb-4">
                      {s.exterior.map((task, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm" style={{ color: "oklch(35% 0.03 255)" }}>
                          <span style={{ color: "oklch(65% 0.15 72)" }} className="mt-0.5 flex-shrink-0">✓</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(60% 0.15 250)" }}>
                      Interior Unit Add-On (per door, optional)
                    </p>
                    <ul className="space-y-1.5">
                      {s.interior.map((task, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm" style={{ color: "oklch(45% 0.03 255)" }}>
                          <span style={{ color: "oklch(60% 0.15 250)" }} className="mt-0.5 flex-shrink-0">+</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-center text-xs mt-4" style={{ color: "oklch(60% 0.02 60)" }}>
            Exterior Shield includes Spring + Fall. Full Coverage and Portfolio Max include all four seasons.
            Interior Add-On is annual only — $49/door/yr.
          </p>
        </div>
      </section>

      {/* ── SAVINGS STATS ── */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-3xl mx-auto text-center">
          <div className="hp-overline">The Math</div>
          <h2 className="font-display text-3xl sm:text-4xl font-black mb-6" style={{ color: "oklch(22% 0.07 155)" }}>
            What Does a Portfolio Membership Return?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Avg. repair caught early vs. ignored", value: "$3,200", sub: "per incident" },
              { label: "Lower turnover rate in maintained properties", value: "23%", sub: "vs. reactive landlords" },
              { label: "Avg. annual return on membership", value: "8.1×", sub: "vs. cost" },
            ].map((stat, i) => (
              <div key={i} className="hp-card text-center">
                <div className="text-3xl font-black font-display" style={{ color: "oklch(65% 0.15 72)" }}>
                  {stat.value}
                </div>
                <div className="text-xs mt-1" style={{ color: "oklch(60% 0.02 60)" }}>{stat.sub}</div>
                <div className="text-sm mt-2 leading-snug" style={{ color: "oklch(35% 0.03 255)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="text-sm max-w-xl mx-auto" style={{ color: "oklch(50% 0.02 60)" }}>
            Based on Handy Pioneers field data from 2023–2025 across Portland metro rental properties.
          </p>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-4 section-white">
        <div className="max-w-5xl mx-auto">
          <div className="hp-overline">Portfolio Pricing</div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-center mb-3" style={{ color: "oklch(22% 0.07 155)" }}>
            Priced Per Property — Not Per Unit
          </h2>
          <p className="text-center max-w-2xl mx-auto mb-3" style={{ color: "oklch(50% 0.02 60)" }}>
            A fourplex exterior is not four times the work of a single-family home — it's a similar structure with more doors inside.
            We price the exterior scope fairly, then add interior visits per occupied door as an optional add-on.
          </p>

          {/* Cadence toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg overflow-hidden border" style={{ borderColor: "oklch(85% 0.02 80)" }}>
              {(["monthly", "quarterly", "annual"] as BillingCadence[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCadence(c)}
                  className="px-5 py-2.5 text-sm font-semibold transition-colors"
                  style={{
                    background: cadence === c ? "oklch(22% 0.07 155)" : "#fff",
                    color: cadence === c ? "#fff" : "oklch(35% 0.03 255)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {CADENCE_LABELS[c]}
                  {c === "annual" && <span className="ml-1.5 text-xs" style={{ color: cadence === c ? "oklch(65% 0.15 72)" : "oklch(65% 0.15 72)" }}>Save 17%</span>}
                  {c === "quarterly" && <span className="ml-1.5 text-xs" style={{ color: cadence === c ? "oklch(65% 0.15 72)" : "oklch(65% 0.15 72)" }}>Save 7%</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Unit count slider */}
          <div className="max-w-md mx-auto mb-10 hp-card text-center">
            <p className="text-sm font-semibold mb-2" style={{ color: "oklch(22% 0.07 155)" }}>
              How many properties in your portfolio?
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={20}
                value={unitCount}
                onChange={(e) => setUnitCount(Number(e.target.value))}
                className="flex-1"
                style={{ accentColor: "oklch(22% 0.07 155)" }}
              />
              <span className="text-2xl font-black font-display w-10 text-right" style={{ color: "oklch(22% 0.07 155)" }}>
                {unitCount}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: "oklch(60% 0.02 60)" }}>
              {unitCount === 1 ? "1 property" : `${unitCount} properties`} · pricing shown per property
            </p>
          </div>

          {/* Tier cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {PM_TIERS.map((tier) => {
              const price = getTierPrice(tier.id, cadence, 1);
              const savings = getTierSavings(tier.id, cadence, 1);
              const totalPortfolio = getTierPrice(tier.id, cadence, unitCount);
              return (
                <div
                  key={tier.id}
                  className="hp-card relative flex flex-col"
                  style={{
                    borderColor: tier.popular ? "oklch(22% 0.07 155)" : undefined,
                    borderWidth: tier.popular ? "2px" : undefined,
                  }}
                >
                  {tier.popular && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ background: "oklch(22% 0.07 155)" }}
                    >
                      Most Popular
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: tier.color }}>
                      {tier.name}
                    </div>
                    <p className="text-sm" style={{ color: "oklch(50% 0.02 60)" }}>{tier.tagline}</p>
                  </div>

                  <div className="mb-2">
                    <span className="font-display text-4xl font-black" style={{ color: "oklch(22% 0.07 155)" }}>
                      ${cadence === "annual" ? Math.round(price / 10) : cadence === "quarterly" ? Math.round(price / 3) : price}
                    </span>
                    <span className="text-sm ml-1" style={{ color: "oklch(50% 0.02 60)" }}>/mo per property</span>
                  </div>
                  {savings > 0 && (
                    <p className="text-xs mb-1" style={{ color: "oklch(65% 0.15 72)" }}>
                      Save ${savings}/property vs. monthly
                    </p>
                  )}
                  {unitCount > 1 && (
                    <p className="text-xs font-semibold mb-4" style={{ color: "oklch(22% 0.07 155)" }}>
                      Portfolio total: ${totalPortfolio.toLocaleString()}/{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"} for {unitCount} properties
                    </p>
                  )}

                  <div className="text-xs mb-4 flex gap-3" style={{ color: "oklch(50% 0.02 60)" }}>
                    <span>🗓 {tier.visitDesc}</span>
                    {tier.laborBank > 0 && <span>💳 ${tier.laborBank} labor bank</span>}
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "oklch(35% 0.03 255)" }}>
                        <span style={{ color: "oklch(65% 0.15 72)" }} className="mt-0.5 flex-shrink-0">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#calculator"
                    onClick={() => setSelectedTier(tier.id)}
                    className="btn-hp-primary text-sm py-3 text-center block"
                    style={{ background: tier.popular ? "oklch(22% 0.07 155)" : "oklch(65% 0.15 72)" }}
                  >
                    Build My Portfolio →
                  </a>
                </div>
              );
            })}
          </div>

          {/* Interior add-on callout */}
          <div
            className="rounded-xl p-6 text-center max-w-2xl mx-auto"
            style={{ background: "oklch(96% 0.015 80)", border: "1px solid oklch(85% 0.02 80)" }}
          >
            <div className="text-2xl mb-2">🚪</div>
            <h3 className="font-display text-xl font-bold mb-2" style={{ color: "oklch(22% 0.07 155)" }}>
              Interior Unit Add-On — $49/door/yr
            </h3>
            <p className="text-sm mb-0" style={{ color: "oklch(50% 0.02 60)" }}>
              Add 2 interior visits per occupied unit per year — HVAC filters, smoke detectors, under-sink moisture,
              weatherstripping, and more. Annual billing only. Add it per property in the portfolio calculator below.
            </p>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO CALCULATOR ── */}
      <section id="calculator" className="py-20 px-4 section-cream">
        <div className="max-w-3xl mx-auto">
          <div className="hp-overline">Portfolio Builder</div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-center mb-3" style={{ color: "oklch(22% 0.07 155)" }}>
            Build Your Portfolio Plan
          </h2>
          <p className="text-center max-w-xl mx-auto mb-8" style={{ color: "oklch(50% 0.02 60)" }}>
            Add each property in your portfolio. Mix single-family rentals, duplexes, triplexes, and fourplexes.
            Toggle the interior add-on for properties where you want unit-level visits.
          </p>

          {/* Properties list */}
          <div className="space-y-3 mb-4">
            {properties.map((prop, idx) => (
              <div key={prop.id} className="hp-card">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-bold" style={{ color: "oklch(22% 0.07 155)", minWidth: "80px" }}>
                    Property {idx + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="Property address (start typing…)"
                    value={prop.address}
                    onChange={(e) => updateProperty(prop.id, { address: e.target.value })}
                    ref={(el) => attachAutocomplete(prop.id, el)}
                    className="flex-1 min-w-0 text-sm px-3 py-2 rounded-md border"
                    style={{ borderColor: "oklch(85% 0.02 80)", color: "oklch(22% 0.07 155)" }}
                    autoComplete="off"
                  />
                  <select
                    value={prop.type}
                    onChange={(e) => updateProperty(prop.id, { type: e.target.value as PortfolioProperty["type"] })}
                    className="text-sm px-3 py-2 rounded-md border"
                    style={{ borderColor: "oklch(85% 0.02 80)", color: "oklch(22% 0.07 155)" }}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer" style={{ color: "oklch(35% 0.03 255)" }}>
                    <input
                      type="checkbox"
                      checked={prop.interiorAddon}
                      onChange={(e) => updateProperty(prop.id, { interiorAddon: e.target.checked })}
                      style={{ accentColor: "oklch(22% 0.07 155)" }}
                    />
                    +Interior
                  </label>
                  {properties.length > 1 && (
                    <button
                      onClick={() => removeProperty(prop.id)}
                      className="text-xs font-bold"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "oklch(55% 0.15 25)" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="mt-2 flex justify-between text-xs" style={{ color: "oklch(50% 0.02 60)" }}>
                  <span>
                    Exterior: ${getBasePrice(prop.type, cadence).toLocaleString()}
                    {prop.interiorAddon && (
                      <span style={{ color: "oklch(60% 0.15 250)" }}>
                        {" "}· +Interior: ${getInteriorAddonPrice(prop.type, cadence).toLocaleString()}
                      </span>
                    )}
                  </span>
                  <span className="font-semibold" style={{ color: "oklch(22% 0.07 155)" }}>
                    ${(getBasePrice(prop.type, cadence) + (prop.interiorAddon ? getInteriorAddonPrice(prop.type, cadence) : 0)).toLocaleString()}
                    /{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addProperty}
            className="w-full py-3 text-sm font-semibold rounded-lg border-2 border-dashed transition-colors mb-8"
            style={{ borderColor: "oklch(65% 0.15 72)", color: "oklch(65% 0.15 72)", background: "transparent", cursor: "pointer" }}
          >
            + Add Another Property
          </button>

          {/* Total summary */}
          <div
            className="rounded-xl p-6 mb-6"
            style={{ background: "oklch(22% 0.07 155)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "oklch(65% 0.15 72)" }}>
                  Portfolio Total
                </p>
                <p className="text-sm" style={{ color: "oklch(100% 0 0 / 0.6)" }}>
                  {properties.length} {properties.length === 1 ? "property" : "properties"} · {CADENCE_LABELS[cadence]} billing
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-4xl font-black text-white">
                  ${portfolioTotal.toLocaleString()}
                </span>
                <span className="text-sm ml-1" style={{ color: "oklch(100% 0 0 / 0.6)" }}>
                  /{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
                </span>
              </div>
            </div>
            {discountRate > 0 && (
              <div className="flex items-center justify-between text-sm mb-1" style={{ color: "oklch(65% 0.15 72)" }}>
                <span>Portfolio discount ({properties.length} properties)</span>
                <span>−${discountAmount.toLocaleString()} ({discountRate}% off)</span>
              </div>
            )}
            {portfolioSavings > 0 && (
              <p className="text-sm mb-4" style={{ color: "oklch(65% 0.15 72)" }}>
                ✓ Saving ${portfolioSavings.toLocaleString()} vs. monthly billing
              </p>
            )}
            {discountRate > 0 && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm" style={{ color: "oklch(100% 0 0 / 0.6)" }}>Total after discount</span>
                <span className="font-display text-2xl font-black text-white">${finalTotal.toLocaleString()}</span>
              </div>
            )}
            <button
              onClick={handleEnroll}
              className="w-full py-4 text-base font-bold rounded-lg transition-colors"
              style={{ background: "oklch(65% 0.15 72)", color: "#fff", border: "none", cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase" }}
            >
              Enroll My Portfolio →
            </button>
            <p className="text-xs text-center mt-3" style={{ color: "oklch(100% 0 0 / 0.4)" }}>
              🔒 Secured by Stripe · No contracts · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ── TURNOVER CALLOUT ── */}
      <section className="py-16 px-4 section-green">
        <div className="max-w-3xl mx-auto text-center">
          <div className="hp-overline" style={{ color: "oklch(65% 0.15 72)" }}>On-Demand Service</div>
          <h2 className="font-display text-3xl font-black text-white mb-4">
            Turnover &amp; Make-Ready Packages
          </h2>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.75)" }}>
            When a tenant moves out, you need the unit rent-ready fast. Portfolio members get priority scheduling
            and member-discounted rates on make-ready packages — cleaning, paint touch-up, minor repairs,
            and a documented condition report for the next tenant.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Studio / 1BR", price: "$349", note: "Cleaning + condition report" },
              { label: "2BR / 3BR", price: "$499", note: "Cleaning + touch-up + report" },
              { label: "Custom Scope", price: "Quote", note: "Larger units or full repaint" },
            ].map((pkg, i) => (
              <div key={i} className="rounded-lg p-5 text-center" style={{ background: "oklch(100% 0 0 / 0.08)" }}>
                <div className="font-display text-2xl font-black text-white mb-1">{pkg.price}</div>
                <div className="font-bold text-white text-sm mb-1">{pkg.label}</div>
                <div className="text-xs" style={{ color: "oklch(100% 0 0 / 0.6)" }}>{pkg.note}</div>
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: "oklch(100% 0 0 / 0.5)" }}>
            Member pricing. Non-member rates are 20% higher. Request a make-ready by calling (360) 544-9858.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 section-white">
        <div className="max-w-3xl mx-auto">
          <div className="hp-overline">Common Questions</div>
          <h2 className="font-display text-3xl font-black text-center mb-8" style={{ color: "oklch(22% 0.07 155)" }}>
            Landlord FAQ
          </h2>
          {[
            {q: "Do you coordinate with tenants directly?",
              a: "Yes. Washington RCW 59.18.150 requires at least two days' written notice before entry for non-emergency maintenance. Vancouver, WA also enacted a Rental Registration Program (effective January 2026) requiring annual property registration and documented maintenance. We issue the required notice directly as your authorized agent, handle scheduling and access coordination, and provide a post-visit documentation report for your records.",
            },
            {
              q: "How does the labor bank work for a portfolio?",
              a: "Each property in your portfolio has its own labor bank credit. Credits are pre-loaded at enrollment and renew annually. Use them on any handyman task between scheduled visits — a leaky faucet, a stuck door, a light fixture. Credits are per-property and do not transfer between properties.",
            },
            {
              q: "What if a tech finds something that needs a bigger repair?",
              a: "They document it with photos and generate a prioritized repair estimate on the spot — linked to that property's record. You get a clear scope, a member-discounted price, and can approve it in one tap. No separate sales call, no waiting. This is how we catch the $150 fix before it becomes the $8,400 repair.",
            },
            {
              q: "Can I add properties mid-subscription?",
              a: "Yes. Contact us to add a property. We'll prorate the billing and schedule an onboarding scan for the new property. Self-serve portfolio management is coming to the client portal in a future update.",
            },
            {
              q: "Is this available for 5+ unit buildings?",
              a: "We currently serve 1–4 unit properties under the Portfolio Plan. For 5+ unit buildings, contact us for a custom quote — scope, pricing, and visit frequency are tailored to the property.",
            },
          ].map((faq, i) => (
            <button
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full text-left hp-card mb-3"
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm" style={{ color: "oklch(22% 0.07 155)" }}>{faq.q}</span>
                <span className="text-xs font-bold ml-4 flex-shrink-0" style={{ color: "oklch(65% 0.15 72)" }}>
                  {openFaq === i ? "▲" : "▼"}
                </span>
              </div>
              {openFaq === i && (
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "oklch(35% 0.03 255)" }}>{faq.a}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-4 section-green text-center">
        <div className="max-w-2xl mx-auto">
          <div className="hp-overline" style={{ color: "oklch(65% 0.15 72)" }}>Ready to Protect Your Portfolio?</div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white mb-4">
            Stop managing maintenance. Start managing returns.
          </h2>
          <p className="text-lg mb-8" style={{ color: "oklch(100% 0 0 / 0.75)" }}>
            Join Portland and SW Washington landlords who've replaced reactive repair calls with a proactive system
            that protects their properties, satisfies their tenants, and documents their compliance.
          </p>
          <a href="#calculator" className="btn-hp-primary text-base px-10 py-4 shadow-lg">
            Build My Portfolio Plan →
          </a>
          <p className="mt-4 text-sm" style={{ color: "oklch(100% 0 0 / 0.45)" }}>
            Starting at $59/mo per property · No contracts · Cancel anytime
          </p>
        </div>
      </section>

    </div>
  );
}
