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
  type: "sfh" | "duplex" | "triplex" | "fourplex" | "custom";
  interiorAddon: boolean;
  tier?: string;
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
  { id: "custom",   label: "5+ Units — Custom Quote", doors: 0 },
] as const;

// Monthly base prices — exterior + common area only (used when no tier is selected)
const BASE_MONTHLY: Record<string, number> = {
  sfh:      59,   // same as homeowner Essential
  duplex:   79,   // slight premium for 2 entries, shared systems
  triplex:  89,
  fourplex: 99,   // still close to SFH — exterior scope is similar
};

// Quarterly = monthly × 2.8 (≈7% off monthly rate)
// Annual = monthly × 10 (≈17% off monthly rate, same as homeowner side)
// If a tier is selected, tier pricing overrides property-type base pricing.
function getBasePrice(type: string, cadence: BillingCadence, tier?: string): number {
  // Use tier pricing if a tier is set, otherwise fall back to property-type base
  const mo = tier && TIER_MONTHLY[tier] ? TIER_MONTHLY[tier] : BASE_MONTHLY[type];
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
    const base = getBasePrice(p.type, cadence, p.tier);
    const interior = p.interiorAddon ? getInteriorAddonPrice(p.type, cadence) : 0;
    return sum + base + interior;
  }, 0);
}

function getSavingsVsMonthly(properties: PortfolioProperty[], cadence: BillingCadence): number {
  if (cadence === "monthly") return 0;
  const monthlyAnnualized = properties.reduce((sum, p) => {
    const moBase = p.tier && TIER_MONTHLY[p.tier] ? TIER_MONTHLY[p.tier] : BASE_MONTHLY[p.type];
    const interiorMo = p.interiorAddon ? getInteriorAddonPrice(p.type, "monthly") : 0;
    return sum + (moBase + interiorMo) * 12;
  }, 0);
  const cadenceAnnualized = cadence === "quarterly"
    ? properties.reduce((sum, p) => {
        const interiorQ = p.interiorAddon ? getInteriorAddonPrice(p.type, "quarterly") : 0;
        return sum + (getBasePrice(p.type, "quarterly", p.tier) + interiorQ) * 4;
      }, 0)
    : properties.reduce((sum, p) => {
        const interiorA = p.interiorAddon ? getInteriorAddonPrice(p.type, "annual") : 0;
        return sum + getBasePrice(p.type, "annual", p.tier) + interiorA;
      }, 0);
  return monthlyAnnualized - cadenceAnnualized;
}

// ─── MEMBER REPAIR DISCOUNTS ─────────────────────────────────────────────────
// Tier-based — matches homeowner FunnelPage discountBrackets exactly
const TIER_REPAIR_DISCOUNTS = [
  {
    tier: "Exterior Shield",
    accentColor: "oklch(65% 0.15 72)",
    brackets: [
      { label: "Jobs under $1,000",  pct: "5% off" },
      { label: "Jobs $1,000–$5,000", pct: "3% off" },
      { label: "Jobs over $5,000",   pct: "1.5% off" },
    ],
  },
  {
    tier: "Full Coverage",
    accentColor: "oklch(68% 0.04 220)",
    brackets: [
      { label: "Jobs under $1,000",  pct: "8% off" },
      { label: "Jobs $1,000–$5,000", pct: "5% off" },
      { label: "Jobs over $5,000",   pct: "2.5% off" },
    ],
  },
  {
    tier: "Portfolio Max",
    accentColor: "oklch(85% 0.04 80)",
    brackets: [
      { label: "Jobs under $1,000",  pct: "12% off" },
      { label: "Jobs $1,000–$5,000", pct: "8% off" },
      { label: "Jobs over $5,000",   pct: "4% off" },
    ],
  },
];

// ─── SEASONAL DATA — property-specific ────────────────────────────────────────

const PM_SEASONS = [
  {
    season: "Spring",
    emoji: "🌱",
    timing: "March–April",
    exterior: [
      "Scrub and treat moss colonies on walkable roof surfaces; flag lifted shingles and failed flashing for repair",
      "Flush gutters and downspouts at all units; clear Douglas Fir needle and moss buildup at every outlet",
      "Probe fascia and soffit for rot across all structures; mark moisture-wicking sections for replacement quote",
      "Clear foundation drains; regrade soil away from structure where clay saturation is found",
      "Walk all common area pathways; reset heaved concrete sections and clear drainage channels",
      "Cut out failed caulk at windows, doors, hose bibs, and exterior penetrations; apply new weatherproof bead",
    ],
    interior: [
      "Swap HVAC filters in all occupied units; log replacement date per door",
      "Check under-sink supply lines and drain connections in every unit; tighten fittings and flag slow leaks",
      "Test smoke and CO detectors in all units; replace batteries and document pass/fail per door",
      "Reapply caulk and grout at tub/shower surrounds in high-moisture units; prevent mold before it starts",
    ],
  },
  {
    season: "Summer",
    emoji: "☀️",
    timing: "June–July",
    exterior: [
      "Document paint and stain condition across all structures; apply touch-up coat or scope full repaint for quote",
      "Tighten loose deck boards and fence fasteners; probe for rot and flag structural damage for repair quote",
      "Start irrigation system; test backflow preventer and adjust coverage zones per property",
      "Clear blocked attic and crawl space vents; flag heat buildup or insulation gaps in shared spaces",
      "Replace failed bulbs in parking areas and common lighting; test all fixture connections",
      "Apply zinc-sulfate moss inhibitor to walkable roof surfaces during dry-season window",
    ],
    interior: [
      "Swap HVAC filters and test heat pump output per unit; flag efficiency drops for service",
      "Inspect water heater anode rods in older units; flag units due for replacement",
      "Test window and sliding door operation in all units; adjust tracks and replace worn hardware",
      "Clean dryer vent ducts in all units; remove lint buildup and confirm airflow at exterior termination",
    ],
  },
  {
    season: "Fall",
    emoji: "🍂",
    timing: "September–October",
    exterior: [
      "Clear gutters and downspouts at all units before PNW rain season; flush to confirm full drainage",
      "Replace worn weatherstripping at all exterior doors and windows across all units; test for drafts",
      "Apply zinc-sulfate moss inhibitor to walkable roof surfaces before wet season",
      "Replace worn door sweeps and thresholds at all unit entries; seal gaps at exterior door bottoms",
      "Shut off and drain all exterior hose bibs; install foam insulating covers at every bib",
      "Inspect and reapply caulk at all exterior penetrations before first rains; update common area lighting",
    ],
    interior: [
      "Replace weatherstripping at interior unit doors and windows; test for draft gaps per door",
      "Replace smoke and CO detector batteries in all units; document replacement per door",
      "Swap furnace and heat pump filters in all units ahead of heating season",
      "Test bathroom exhaust fans in all units; clean covers and confirm airflow for wet-season moisture control",
    ],
  },
  {
    season: "Winter",
    emoji: "❄️",
    timing: "December–January",
    exterior: [
      "Wrap exposed pipes in crawl space and exterior walls across all structures; flag uninsulated runs for repair",
      "Test sump pump operation; clear intake screen and confirm discharge line is unobstructed",
      "Walk common areas for slip hazards; flag drainage issues and uneven surfaces for repair",
      "Audit exterior and common area lighting; replace failed bulbs and test motion sensors for winter safety",
      "Inspect perimeter foundation drainage; clear debris from drain inlets and flag standing water",
      "Document any exterior damage from fall storms; photograph and queue repair estimates",
    ],
    interior: [
      "Inspect crawl space vapor barrier in all units; remove standing water and resecure barrier",
      "Swap HVAC filters at mid-season in all units; log replacement date per door",
      "Check mold-prone bathrooms and laundry areas in all units; treat surface mold and flag moisture source",
      "Check pipe freeze risk in units with exterior wall plumbing; wrap exposed runs and flag gaps",
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
    body: "The average cost to turn a rental unit — cleaning, paint, carpet, minor repairs, and vacancy loss — runs $3,800–$6,200 in the Portland metro. Properties with documented proactive maintenance see 23% lower turnover rates because tenants stay longer in well-maintained units and issues are caught before they become tenant complaints. Based on HP portfolio member data, 2023–2025 (n=31 properties, 2-year comparison). Full methodology available on request.",
    source: "Buildium Rental Industry Report, 2024; HP field data 2023–2025",
  },
  {
    icon: "⚖️",
    stat: "3-Layer",
    label: "compliance exposure: city, state & federal",
    title: "You're Legally Required to Maintain",
    body: "WA RCW 59.18 (Residential Landlord-Tenant Act) requires landlords to maintain fit and habitable premises — failure is grounds for rent withholding or lease termination. Clark County and Vancouver, WA enacted a Rental Registration Program (effective January 2026) requiring annual property registration and documented maintenance records. Portland's Rental Housing Registration Program requires annual registration and habitability compliance. A documented, third-party maintenance program is your strongest legal defense at all three levels.",
    source: "WA RCW 59.18; Clark County Rental Registration (2026); Portland Rental Housing Registration",
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
    laborBank: 300,
    features: [
      "Everything in Exterior Shield, plus:",
      "$300 labor bank credit per property — use on any repair between visits",
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
    laborBank: 600,
    features: [
      "Everything in Full Coverage, plus:",
      "$600 labor bank credit per property — you're ahead after month 5",
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
  const [cadence, setCadence] = useState<BillingCadence>("monthly");
  const [unitCount, setUnitCount] = useState(2);
  const [openStat, setOpenStat] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("full");

  // For the portfolio calculator (advanced path)
  const [properties, setProperties] = useState<PortfolioProperty[]>([
    { id: "1", address: "", type: "sfh", interiorAddon: false, tier: "essential" },
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

  const portfolioSavings = getSavingsVsMonthly(properties, cadence);
  const finalTotal = getPortfolioTotal(properties, cadence);
  const hasCustom = properties.some((p) => p.type === "custom");

  const [showCustomQuoteForm, setShowCustomQuoteForm] = useState(false);
  const [customQuoteName, setCustomQuoteName] = useState("");
  const [customQuoteEmail, setCustomQuoteEmail] = useState("");
  const [customQuotePhone, setCustomQuotePhone] = useState("");
  const [customQuoteSubmitted, setCustomQuoteSubmitted] = useState(false);

  const handleEnroll = () => {
    if (hasCustom) {
      setShowCustomQuoteForm(true);
      return;
    }
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

  const handleCustomQuoteSubmit = () => {
    if (!customQuoteName || !customQuoteEmail) return;
    const API = "https://pro.handypioneers.com/api/trpc";
    fetch(`${API}/threeSixty.portfolioAbandonedLead.capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        json: {
          customerName: customQuoteName,
          customerEmail: customQuoteEmail,
          customerPhone: customQuotePhone,
          properties,
          cadence,
          portfolioTotal: 0,
          source: "360-multifamily-custom-quote",
        },
      }),
      credentials: "include",
    }).catch(() => {});
    setCustomQuoteSubmitted(true);
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
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hp-360-logo_69b6cf24.png"
              alt="360° Home Method"
              className="w-10 h-10 flex-shrink-0 object-contain"
            />
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hp-full-logo_7d3d2c7d.jpg"
              alt="Handy Pioneers"
              className="hidden sm:block h-9 w-auto object-contain"
            />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onGoHome}
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
              🏠 Homeowners
            </button>

            <a href="#calculator" className="btn-hp-primary text-sm px-5 py-2.5">
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
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hp-360-logo_69b6cf24.png"
              alt="360°"
              className="w-5 h-5 object-contain"
            />
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

          {/* Homeowner redirect prompt — visible on all screen sizes */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 rounded-lg px-5 py-3 mx-auto max-w-sm sm:max-w-none" style={{ background: "oklch(100% 0 0 / 0.08)", border: "1px solid oklch(100% 0 0 / 0.15)" }}>
            <span className="text-sm text-center" style={{ color: "oklch(100% 0 0 / 0.65)" }}>🏠 Own your home personally, not as a rental?</span>
            <button
              onClick={onGoHome}
              className="text-sm font-bold transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer", color: "oklch(65% 0.15 72)", textDecoration: "underline", padding: 0, whiteSpace: "nowrap" }}
            >
              See the Homeowner Plan →
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm" style={{ color: "oklch(100% 0 0 / 0.6)" }}>
            {["Licensed & Insured", "Habitability-Compliant Documentation", "1-Year Labor Guarantee", "Priority Scheduling Available"].map((b) => (
              <span key={b} className="flex items-center gap-1.5">
                <span style={{ color: "oklch(65% 0.15 72)" }}>✓</span> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STAT BUBBLES ── */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-5xl mx-auto text-center">
          <div className="hp-overline">The Cost of Reactive Management</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PM_STATS.map((s, i) => (
              <button
                key={i}
                onClick={() => setOpenStat(openStat === i ? null : i)}
                className="hp-card text-center group"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
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
                body: "Every visit generates a written report with photos, findings, and repair estimates. This record satisfies habitability documentation requirements at the city, state, and federal level — supports insurance claims, local rental registration compliance, and is lender-ready for refinancing or sale.",
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PM_SEASONS.map((s, i) => (
              <div key={i} className="hp-card text-center">
                <div className="flex items-center justify-center gap-3 mb-4 pb-3" style={{ borderBottom: "1px solid oklch(88% 0.02 80)" }}>
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: "oklch(22% 0.07 155)" }}>{s.season} Visit</div>
                    <div className="text-xs" style={{ color: "oklch(65% 0.15 72)" }}>{s.timing}</div>
                  </div>
                </div>
                {/* Exterior tasks */}
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(22% 0.07 155)" }}>
                  Exterior &amp; Common Area
                </p>
                <ul className="space-y-2 mb-4 text-left">
                  {s.exterior.map((task, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs leading-snug" style={{ color: "oklch(35% 0.03 255)" }}>
                      <span style={{ color: "oklch(65% 0.15 72)", flexShrink: 0, marginTop: "2px" }}>✓</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
                {/* Interior add-on tasks */}
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(60% 0.15 250)" }}>
                  + Interior Add-On (per door)
                </p>
                <ul className="space-y-2 text-left">
                  {s.interior.map((task, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs leading-snug" style={{ color: "oklch(45% 0.03 255)" }}>
                      <span style={{ color: "oklch(60% 0.15 250)", flexShrink: 0, marginTop: "2px" }}>+</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-xs mt-4" style={{ color: "oklch(60% 0.02 60)" }}>
            Exterior Shield includes Spring + Fall. Full Coverage and Portfolio Max include all four seasons.
            Interior Add-On is annual only — $49/door/yr.
          </p>
          <p className="text-center text-xs mt-2" style={{ color: "oklch(60% 0.02 60)" }}>
            <em>Roof work is limited to walkable, low-slope surfaces. Steep-pitch and third-story work is referred to a licensed roofer.</em>
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
            Based on Handy Pioneers field data from 2023–2025 across 31 Portland metro rental properties (2-year comparison). Figures represent median outcomes; individual results vary by property age, condition, and tier.
          </p>
        </div>
      </section>

      {/* ── GOOGLE REVIEWS — above portfolio calculator ── */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-4xl mx-auto">
          <div className="hp-overline text-center" style={{ color: "oklch(65% 0.15 72)" }}>Verified Reviews</div>
          <h2 className="font-display text-3xl font-black text-center mb-8" style={{ color: "oklch(22% 0.07 155)" }}>
            What Property Owners Say
          </h2>
          {/* PM Testimonial */}
          <div className="hp-card mb-8 max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg" style={{ background: "oklch(22% 0.07 155)", color: "#fff" }}>B</div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: "oklch(65% 0.15 72)" }}>★</span>
                  ))}
                  <span className="text-xs ml-1" style={{ color: "oklch(55% 0.02 60)" }}>Google Review</span>
                </div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "oklch(35% 0.03 255)" }}>
                  &ldquo;My favorite handyman in Vancouver. Prompt quality work at a discount price. Marcin is skilled in many different trades and makes owning a rental property hands off and easy. I am no longer burdened with any repairs small or large and he has saved me a lot of time and headaches. 10/10&rdquo;
                </p>
                <div className="text-xs font-bold" style={{ color: "oklch(22% 0.07 155)" }}>Bryce — Vancouver, WA</div>
                <div className="text-xs" style={{ color: "oklch(55% 0.02 60)" }}>Rental property owner · Verified Google review</div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs mb-3" style={{ color: "oklch(55% 0.02 60)" }}>
            General member reviews — includes homeowner and rental property clients
          </p>
          <div className="elfsight-app-3439582a-5f81-4ddb-ab1a-54f99c9da7af" data-elfsight-app-lazy></div>
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
                  {c === "quarterly" && <span className="block text-xs font-bold" style={{ color: cadence === c ? "oklch(65% 0.15 72)" : "oklch(55% 0.12 145)" }}>Save ~7%</span>}
                  {c === "annual" && <span className="block text-xs font-bold" style={{ color: cadence === c ? "oklch(65% 0.15 72)" : "oklch(55% 0.12 145)" }}>Save ~17%</span>}
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

                  <div className="mb-1">
                    <span className="font-display text-4xl font-black" style={{ color: "oklch(22% 0.07 155)" }}>
                      ${cadence === "annual" ? Math.round(price / 12) : cadence === "quarterly" ? Math.round(price / 3) : price}
                    </span>
                    <span className="text-sm ml-1" style={{ color: "oklch(50% 0.02 60)" }}>/mo per property</span>
                  </div>
                  {cadence !== "monthly" && (
                    <p className="text-xs mb-1" style={{ color: "oklch(50% 0.02 60)" }}>
                      billed ${price.toLocaleString()}/{cadence === "quarterly" ? "qtr" : "yr"}
                    </p>
                  )}
                  {savings > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded mb-2" style={{ background: "oklch(40% 0.12 145 / 0.1)", border: "1px solid oklch(40% 0.12 145 / 0.25)" }}>
                      <span className="text-xs font-bold" style={{ color: "oklch(35% 0.12 145)" }}>
                        Save ${savings}/yr · {cadence === "quarterly" ? "7" : "17"}% off
                      </span>
                    </div>
                  )}
                  {unitCount > 1 && (
                    <p className="text-xs font-semibold mb-4 break-words" style={{ color: "oklch(22% 0.07 155)" }}>
                      Portfolio total: ${totalPortfolio.toLocaleString()}
                      /{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
                      {" "}&nbsp;({unitCount} properties)
                    </p>
                  )}

                  <div className="text-xs mb-4 flex gap-3" style={{ color: "oklch(50% 0.02 60)" }}>
                    <span>🗓 {tier.visitDesc}</span>
                  </div>
                  {tier.laborBank > 0 && (
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
                          <span style={{ color: "oklch(50% 0.02 60)" }}> — ${tier.laborBank}/property becomes available after your first 90 days. Switch to Quarterly or Annual to unlock the full credit on day one.</span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold" style={{ color: "oklch(55% 0.14 68)" }}>
                            ✅ ${tier.laborBank}/property labor bank credit — full credit, day one
                          </span>
                          <span style={{ color: "oklch(35% 0.03 255)" }}> — pre-paid cash per property for any repair between visits. Use-it-or-lose-it annually.</span>
                        </>
                      )}
                    </div>
                  )}

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

          {/* Member Repair Discounts — tier-based */}
          <div className="rounded-xl p-6 max-w-3xl mx-auto mb-6" style={{ background: "oklch(22% 0.07 155)" }}>
            <div className="hp-overline text-center mb-2" style={{ color: "oklch(65% 0.15 72)" }}>Member Repair Discounts</div>
            <p className="text-sm text-center mb-5" style={{ color: "oklch(100% 0 0 / 0.7)" }}>
              Discounts scale with your tier — and stack with the bigger the job, the more you save.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIER_REPAIR_DISCOUNTS.map((t) => (
                <div key={t.tier} className="rounded-lg p-4" style={{ background: "oklch(100% 0 0 / 0.07)" }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: t.accentColor }}>{t.tier}</div>
                  <div className="space-y-2">
                    {t.brackets.map((b) => (
                      <div key={b.label} className="text-center">
                        <div className="font-display text-lg font-black" style={{ color: t.accentColor }}>{b.pct}</div>
                        <div className="text-xs mt-0.5" style={{ color: "oklch(100% 0 0 / 0.5)" }}>{b.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interior add-on callout */}
          <div
            className="rounded-xl p-6 max-w-2xl mx-auto"
            style={{ background: "oklch(96% 0.015 80)", border: "1px solid oklch(85% 0.02 80)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">🚪</div>
              <div>
                <h3 className="font-display text-xl font-bold" style={{ color: "oklch(22% 0.07 155)" }}>
                  Interior Unit Add-On — $49/door/yr
                </h3>
                <p className="text-xs" style={{ color: "oklch(55% 0.02 60)" }}>2 visits per occupied unit per year — annual billing only</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Swap HVAC filter; log replacement date per unit",
                "Test smoke and CO detectors; replace batteries",
                "Check under-sink plumbing for active leaks or moisture",
                "Inspect weatherstripping on interior doors and windows",
                "Test GFCI outlets in kitchen and bathroom",
                "Check bathroom exhaust fan operation; clear lint buildup",
                "Inspect water heater for corrosion or sediment signs",
                "Flag any visible mold, pest evidence, or habitability issues",
              ].map((task, i) => (
                <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "oklch(35% 0.03 255)" }}>
                  <span style={{ color: "oklch(65% 0.15 72)", flexShrink: 0 }}>✓</span>
                  <span>{task}</span>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: "oklch(55% 0.02 60)" }}>
              Each interior visit generates a per-unit report with photos. Add it per property in the portfolio calculator below.
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
          {/* Cadence toggle — repeated above calculator for in-context switching */}
          <div className="flex justify-center mb-6">
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
                  {c === "quarterly" && <span className="block text-xs font-bold" style={{ color: cadence === c ? "oklch(65% 0.15 72)" : "oklch(55% 0.12 145)" }}>Save ~7%</span>}
                  {c === "annual" && <span className="block text-xs font-bold" style={{ color: cadence === c ? "oklch(65% 0.15 72)" : "oklch(55% 0.12 145)" }}>Save ~17%</span>}
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-xs mb-6" style={{ color: "oklch(55% 0.02 60)" }}>
            🔒 Addresses are used only to confirm service area — not stored until enrollment.
          </p>
          {/* Properties list */}
          <div className="space-y-3 mb-4">
            {properties.map((prop, idx) => (
              <div key={prop.id} className="hp-card">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-bold" style={{ color: "oklch(22% 0.07 155)", minWidth: "80px" }}>
                    Property {idx + 1}
                  </span>
                  {prop.type !== "custom" && (
                    <input
                      type="text"
                      placeholder="e.g. 123 Main St, Vancouver WA"
                      value={prop.address}
                      onChange={(e) => updateProperty(prop.id, { address: e.target.value })}
                      ref={(el) => attachAutocomplete(prop.id, el)}
                      className="flex-1 min-w-0 text-sm px-3 py-2 rounded-md border"
                      style={{ borderColor: "oklch(85% 0.02 80)", color: "oklch(22% 0.07 155)" }}
                      autoComplete="off"
                    />
                  )}
                  {prop.type === "custom" && (
                    <span className="flex-1 text-sm italic" style={{ color: "oklch(50% 0.02 60)" }}>
                      Custom quote — we'll contact you
                    </span>
                  )}
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
                  {prop.type !== "custom" && (
                    <>
                      <select
                        value={prop.tier ?? "essential"}
                        onChange={(e) => updateProperty(prop.id, { tier: e.target.value })}
                        className="text-xs px-2 py-2 rounded-md border"
                        style={{ borderColor: "oklch(85% 0.02 80)", color: "oklch(22% 0.07 155)" }}
                        title="Protection level for this property"
                      >
                        {PM_TIERS.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
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
                    </>
                  )}
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
                {prop.type !== "custom" && (
                  <div className="mt-2 flex justify-between text-xs" style={{ color: "oklch(50% 0.02 60)" }}>
                    <span>
                      Exterior: ${getBasePrice(prop.type, cadence, prop.tier).toLocaleString()}
                      {prop.interiorAddon && (
                        <span style={{ color: "oklch(60% 0.15 250)" }}>
                          {" "}· +Interior: ${getInteriorAddonPrice(prop.type, cadence).toLocaleString()}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold" style={{ color: "oklch(22% 0.07 155)" }}>
                      ${(getBasePrice(prop.type, cadence, prop.tier) + (prop.interiorAddon ? getInteriorAddonPrice(prop.type, cadence) : 0)).toLocaleString()}
                      /{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
                    </span>
                  </div>
                )}
                {prop.type === "custom" && (
                  <p className="mt-2 text-xs" style={{ color: "oklch(60% 0.15 72)" }}>
                    Pricing for 5+ unit buildings is tailored to scope. We'll reach out within 1 business day.
                  </p>
                )}
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
          {!showCustomQuoteForm ? (
            <div className="rounded-xl p-6 mb-6" style={{ background: "oklch(22% 0.07 155)" }}>
              {!hasCustom ? (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "oklch(65% 0.15 72)" }}>
                      Portfolio Total
                    </p>
                    <p className="text-sm" style={{ color: "oklch(100% 0 0 / 0.6)" }}>
                      {properties.filter(p => p.type !== "custom").length} {properties.filter(p => p.type !== "custom").length === 1 ? "property" : "properties"} · {CADENCE_LABELS[cadence]} billing
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-4xl font-black text-white">
                      ${finalTotal.toLocaleString()}
                    </span>
                    <span className="text-sm ml-1" style={{ color: "oklch(100% 0 0 / 0.6)" }}>
                      /{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "oklch(65% 0.15 72)" }}>Your Portfolio</p>
                  <p className="text-sm" style={{ color: "oklch(100% 0 0 / 0.6)" }}>
                    Includes {properties.filter(p => p.type === "custom").length} property requiring a custom quote — we'll reach out within 1 business day.
                  </p>
                </div>
              )}
              {portfolioSavings > 0 && !hasCustom && (
                <p className="text-sm mb-4" style={{ color: "oklch(65% 0.15 72)" }}>
                  ✓ Saving ${portfolioSavings.toLocaleString()} vs. monthly billing
                </p>
              )}
              {/* Member repair discount callout — tier-based */}
              <div className="rounded-lg p-3 mb-4" style={{ background: "oklch(100% 0 0 / 0.07)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "oklch(65% 0.15 72)" }}>Member Repair Discounts</p>
                <div className="grid grid-cols-3 gap-1 mb-1">
                  {TIER_REPAIR_DISCOUNTS.map((t) => (
                    <div key={t.tier} className="text-center">
                      <div className="text-xs font-bold mb-1" style={{ color: t.accentColor }}>{t.tier}</div>
                      {t.brackets.map((b) => (
                        <div key={b.label} className="text-xs" style={{ color: "oklch(100% 0 0 / 0.6)" }}>
                          <span className="font-bold" style={{ color: t.accentColor }}>{b.pct}</span>
                          <span className="block" style={{ fontSize: "0.6rem", color: "oklch(100% 0 0 / 0.4)" }}>{b.label}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleEnroll}
                className="w-full py-4 text-base font-bold rounded-lg transition-colors"
                style={{ background: "oklch(65% 0.15 72)", color: "#fff", border: "none", cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase" }}
              >
                {hasCustom ? "Request My Custom Quote →" : "Enroll My Portfolio →"}
              </button>
              <p className="text-xs text-center mt-3" style={{ color: "oklch(100% 0 0 / 0.4)" }}>
                {hasCustom ? "No commitment required · We'll build a custom plan for you" : "🔒 Secured by Stripe · No contracts · Cancel anytime"}
              </p>
            </div>
          ) : (
            /* Custom quote contact form */
            <div className="rounded-xl p-6 mb-6" style={{ background: "oklch(22% 0.07 155)" }}>
              {customQuoteSubmitted ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-3">✓</div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">Request Received</h3>
                  <p className="text-sm" style={{ color: "oklch(100% 0 0 / 0.7)" }}>
                    We'll review your portfolio and reach out within 1 business day with a custom plan and pricing.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "oklch(65% 0.15 72)" }}>Get Your Custom Quote</p>
                  <div className="space-y-3 mb-4">
                    <input
                      type="text"
                      placeholder="Your name *"
                      value={customQuoteName}
                      onChange={(e) => setCustomQuoteName(e.target.value)}
                      className="w-full text-sm px-3 py-2.5 rounded-md"
                      style={{ background: "oklch(100% 0 0 / 0.1)", border: "1px solid oklch(100% 0 0 / 0.2)", color: "#fff" }}
                    />
                    <input
                      type="email"
                      placeholder="Email address *"
                      value={customQuoteEmail}
                      onChange={(e) => setCustomQuoteEmail(e.target.value)}
                      className="w-full text-sm px-3 py-2.5 rounded-md"
                      style={{ background: "oklch(100% 0 0 / 0.1)", border: "1px solid oklch(100% 0 0 / 0.2)", color: "#fff" }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={customQuotePhone}
                      onChange={(e) => setCustomQuotePhone(e.target.value)}
                      className="w-full text-sm px-3 py-2.5 rounded-md"
                      style={{ background: "oklch(100% 0 0 / 0.1)", border: "1px solid oklch(100% 0 0 / 0.2)", color: "#fff" }}
                    />
                    <div className="text-xs rounded-md p-3" style={{ background: "oklch(100% 0 0 / 0.07)", color: "oklch(100% 0 0 / 0.6)" }}>
                      <strong className="text-white">Your portfolio:</strong>{" "}
                      {properties.map((p, i) => (
                        <span key={p.id}>{i > 0 ? ", " : ""}{PROPERTY_TYPES.find(t => t.id === p.type)?.label ?? p.type}{p.address ? ` (${p.address})` : ""}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleCustomQuoteSubmit}
                    disabled={!customQuoteName || !customQuoteEmail}
                    className="w-full py-4 text-base font-bold rounded-lg transition-colors"
                    style={{
                      background: customQuoteName && customQuoteEmail ? "oklch(65% 0.15 72)" : "oklch(100% 0 0 / 0.2)",
                      color: "#fff", border: "none",
                      cursor: customQuoteName && customQuoteEmail ? "pointer" : "not-allowed",
                      letterSpacing: "0.04em", textTransform: "uppercase",
                    }}
                  >
                    Send My Quote Request →
                  </button>
                  <button
                    onClick={() => setShowCustomQuoteForm(false)}
                    className="w-full text-xs mt-2"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "oklch(100% 0 0 / 0.4)" }}
                  >
                    ← Back to portfolio
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── TURNOVER CALLOUT ── */}
      <section className="py-16 px-4 section-green">
        <div className="max-w-4xl mx-auto">
          <div className="hp-overline text-center" style={{ color: "oklch(65% 0.15 72)" }}>On-Demand Service</div>
          <h2 className="font-display text-3xl font-black text-white text-center mb-4">
            Turnover &amp; Make-Ready Packages
          </h2>
          <p className="text-lg text-center max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "oklch(100% 0 0 / 0.75)" }}>
            When a tenant moves out, HP coordinates the full make-ready — we schedule and manage the cleaning crew,
            handle repairs and touch-up, and deliver a documented move-out condition report.
            Materials that remain in the unit (paint, blinds, hardware, filters) are billed at cost.
          </p>

          {/* Two-column layout: tasks + pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">

            {/* Standard tasks included */}
            <div className="rounded-xl p-6" style={{ background: "oklch(100% 0 0 / 0.07)" }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: "oklch(65% 0.15 72)" }}>Standard Make-Ready Tasks</div>
              <ul className="space-y-2.5">
                {[
                  "Schedule and manage professional cleaning crew",
                  "Clean all interior surfaces, appliances, and fixtures",
                  "Replace HVAC filter and test smoke/CO detectors",
                  "Patch nail holes and touch up paint (labor only — paint billed at cost)",
                  "Inspect and tighten all door hardware and cabinet hinges",
                  "Test all outlets, switches, and light fixtures; replace bulbs",
                  "Check and reseal caulk at tub, shower, and sink penetrations",
                  "Inspect under-sink areas for moisture or active leaks",
                  "Photograph every room and document unit condition",
                  "Deliver written move-out condition report for your records",
                ].map((task, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "oklch(100% 0 0 / 0.8)" }}>
                    <span style={{ color: "oklch(65% 0.15 72)", flexShrink: 0, marginTop: "2px" }}>✓</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs mt-4 pt-3" style={{ borderTop: "1px solid oklch(100% 0 0 / 0.12)", color: "oklch(100% 0 0 / 0.45)" }}>
                Materials that stay in the unit (paint, blinds, hardware, filters, bulbs) are billed at cost + 15% handling. Carpet replacement, full repaints, and appliance work quoted separately.
              </p>
            </div>

            {/* Pricing bubbles */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: "oklch(65% 0.15 72)" }}>Standard Make-Ready Pricing</div>
              <div className="space-y-3">
                {[
                  { size: "Studio / 1 BD · 1 BA",  member: "$549",  nonMember: "$689" },
                  { size: "2 BD · 1 BA",            member: "$649",  nonMember: "$819" },
                  { size: "2 BD · 2 BA",            member: "$749",  nonMember: "$939" },
                  { size: "3 BD · 2 BA",            member: "$899",  nonMember: "$1,124" },
                  { size: "4 BD · 2+ BA",           member: "$1,099", nonMember: "$1,374" },
                ].map((pkg, i) => (
                  <div key={i} className="rounded-lg px-4 py-3 flex items-center justify-between gap-3" style={{ background: "oklch(100% 0 0 / 0.07)" }}>
                    <span className="text-sm font-semibold text-white">{pkg.size}</span>
                    <div className="text-right flex-shrink-0">
                      <div className="font-display text-xl font-black" style={{ color: "oklch(65% 0.15 72)" }}>{pkg.member}</div>
                      <div className="text-xs" style={{ color: "oklch(100% 0 0 / 0.4)" }}>member</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg px-4 py-3 mt-3 text-center" style={{ background: "oklch(100% 0 0 / 0.07)" }}>
                <div className="font-display text-xl font-black text-white mb-0.5">Custom Quote</div>
                <div className="text-xs" style={{ color: "oklch(100% 0 0 / 0.55)" }}>Unit upgrade turnover — full repaint, carpet, appliances, or 5+ unit buildings</div>
              </div>

              {/* Member discount callout */}
              <div className="rounded-lg px-4 py-3 mt-4" style={{ background: "oklch(65% 0.15 72 / 0.15)", border: "1px solid oklch(65% 0.15 72 / 0.4)" }}>
                <p className="text-sm font-semibold text-center" style={{ color: "oklch(78% 0.13 78)" }}>
                  🏠 Portfolio members save 20% vs. non-member rates
                </p>
                <p className="text-xs text-center mt-1" style={{ color: "oklch(100% 0 0 / 0.5)" }}>
                  Priority scheduling — your unit goes first in the queue
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-center" style={{ color: "oklch(100% 0 0 / 0.45)" }}>
            Request a make-ready by calling (360) 544-9858. Non-member rates available on request.
          </p>
        </div>
      </section>



      {/* ── WORK PHOTOS — PM-relevant ── */}
      <section className="py-14 px-4 section-cream">
        <div className="max-w-5xl mx-auto">
          <div className="hp-overline text-center" style={{ color: "oklch(65% 0.15 72)" }}>Our Work</div>
          <h2 className="font-display text-3xl font-black text-center mb-8" style={{ color: "oklch(22% 0.07 155)" }}>
            Real Jobs. Real Results.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/gutter_cleaning_ea6257be.jpg", caption: "Gutter Cleaning — Multi-Unit" },
              { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/mailbox_post_repair_abaee034.jpg", caption: "Mailbox Post Repair" },
              { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/dryer_vent_cleaning_5bf10b71.jpg", caption: "Dryer Vent Cleaning" },
              { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/roof_cleaning_moss_treatment_603d6a1f.jpg", caption: "Roof Moss Treatment" },
              { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/Before_Afters(10)_81ded948.png", caption: "Pressure Washing — Common Area" },
              { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/exterior_light_fixture_replacement_ebcaac9c.jpg", caption: "Exterior Light Fixture Replacement" },
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

      {/* ── FAQ ── */}
      <section className="py-16 px-4 section-white">
        <div className="max-w-3xl mx-auto">
          <div className="hp-overline">Common Questions</div>
          <h2 className="font-display text-3xl font-black text-center mb-8" style={{ color: "oklch(22% 0.07 155)" }}>
            Landlord FAQ
          </h2>
          {[
            {
              q: "If your tech misses something during a visit, what is HP's liability?",
              a: "HP documents all findings visible and accessible during each visit. We are not liable for pre-existing conditions that were not visible, accessible, or detectable at the time of inspection — including issues inside walls, under slabs, or in areas with restricted access. If a tech flags an issue in writing and you decline the repair, HP's liability for that item ends at the point of disclosure. Our documentation protects you in tenant disputes; it does not replace a licensed home inspector or structural engineer for major assessments.",
            },
            {q: "Do you coordinate with tenants directly?",
              a: "Yes — and this is a key operational detail. Washington RCW 59.18.150 requires at least two days' written notice before entry for non-emergency maintenance. We issue that notice directly as your authorized agent, using the tenant contact information you provide at enrollment. We handle scheduling, access coordination, and rescheduling if a tenant is unavailable. If a tenant refuses access, we notify you immediately and document the refusal. Vacant units are scheduled directly with you. Post-visit, you receive a per-unit report with photos and findings.",
            },
            {
              q: "How does the labor bank work for a portfolio?",
              a: "Labor bank credit is available on Quarterly and Annual plans. Each property in your portfolio has its own credit balance, earned at the end of your first billing period and renewing annually. Use it on any handyman task between scheduled visits — a leaky faucet, a stuck door, a light fixture. Credits are per-property and do not transfer between properties. Monthly plans include all visits and member discounts but do not include a labor bank.",
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
            {
              q: "Does HP manage the cleaning crew for turnover packages?",
              a: "Yes. HP coordinates and pays the cleaning crew directly — that cost is already built into the turnover package price. You don't need to source or manage a separate cleaning vendor. We handle scheduling, access, and quality control. If a unit requires a specialty clean (e.g., biohazard, hoarding, or fire/smoke damage), we'll quote that separately.",
            },
            {
              q: "What materials are billed separately on a turnover?",
              a: "Materials that stay in the unit are billed separately at cost plus a standard markup. This includes paint, primer, caulk, grout, hardware, light fixtures, blinds, outlet covers, and similar consumables. Labor to install those materials is included in the package price. We provide an itemized materials receipt with every turnover invoice so you have documentation for your records.",
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

      {/* Footer */}
      <footer className="py-8 px-4" style={{ background: "oklch(16% 0.06 155)", color: "oklch(100% 0 0 / 0.6)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white font-display">360°</span>
            <span style={{ color: "oklch(100% 0 0 / 0.3)" }}>|</span>
            <span>Delivered by Handy Pioneers</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:help@handypioneers.com" className="transition-colors hover:text-white" style={{ color: "oklch(100% 0 0 / 0.6)" }}>help@handypioneers.com</a>
            <a href="tel:3605449858" className="transition-colors hover:text-white" style={{ color: "oklch(100% 0 0 / 0.6)" }}>(360) 544-9858</a>
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
