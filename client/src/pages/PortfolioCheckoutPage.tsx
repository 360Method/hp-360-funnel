/*
 * PortfolioCheckoutPage — 360° Portfolio Plan checkout
 * Design: HP design system — forest green / amber / cream
 *   - Matches CheckoutPage visual language exactly
 *   - First/Last name split
 *   - Cadence display with change link
 *   - Labor bank cadence gate
 *   - Trust signals panel
 *   - "What Happens Next" 3-step timeline
 *   - Quarterly upgrade nudge for monthly + labor bank tiers
 *   - Sticky mobile order summary bar
 *   - Spinner on submit
 *   - Clark County / Portland metro ZIP validation
 */

import { useState, useMemo } from "react";
import type { BillingCadence } from "../tiers";
import { CADENCE_LABELS } from "../tiers";
import type { PortfolioProperty } from "./MultifamilyPage";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  sfh:      "Single-Family Rental",
  duplex:   "Duplex",
  triplex:  "Triplex",
  fourplex: "Fourplex",
  custom:   "Custom (5+ Units)",
};

const TIER_LABELS: Record<string, string> = {
  essential: "Exterior Shield",
  full:      "Full Coverage",
  maximum:   "Portfolio Max",
};

const TIER_LABOR_BANK: Record<string, number> = {
  essential: 0,
  full:      300,
  maximum:   600,
};

const TIER_MONTHLY_PRICES: Record<string, number> = {
  essential: 59,
  full:      99,
  maximum:   149,
};

const BASE_MONTHLY_PRICES: Record<string, number> = {
  sfh:      59,
  duplex:   79,
  triplex:  89,
  fourplex: 99,
  custom:   0,
};

const INTERIOR_PER_DOOR_ANNUAL = 49;

const PROPERTY_DOORS: Record<string, number> = {
  sfh: 1, duplex: 2, triplex: 3, fourplex: 4, custom: 0,
};

// Clark County WA + Portland metro OR ZIP codes
const SERVICE_AREA_ZIPS = new Set([
  // Clark County WA
  "98660","98661","98662","98663","98664","98665","98666","98667","98668",
  "98671","98672","98673","98674","98675","98682","98683","98684","98685",
  "98686","98687","98604","98606","98607","98629","98642","98629","98674",
  // Portland metro OR
  "97201","97202","97203","97204","97205","97206","97207","97208","97209",
  "97210","97211","97212","97213","97214","97215","97216","97217","97218",
  "97219","97220","97221","97222","97223","97224","97225","97227","97229",
  "97230","97231","97232","97233","97236","97239","97240","97242","97258",
  "97266","97267","97268","97269","97271","97272","97280","97281","97282",
  "97283","97286","97290","97291","97292","97293","97294","97296","97298",
  "97301","97302","97303","97304","97305","97306","97307","97308","97309",
  "97310","97311","97312","97313","97314","97317","97321","97325","97330",
  "97331","97333","97338","97351","97352","97361","97362","97371","97374",
  "97375","97376","97377","97378","97381","97383","97384","97385","97386",
]);

function getPropertyMonthly(p: PortfolioProperty): number {
  const tier = p.tier ?? "essential";
  return TIER_MONTHLY_PRICES[tier] ?? BASE_MONTHLY_PRICES[p.type] ?? 59;
}

function getPropertyPrice(p: PortfolioProperty, cadence: BillingCadence): number {
  const mo = getPropertyMonthly(p);
  if (cadence === "monthly")   return mo;
  if (cadence === "quarterly") return Math.round(mo * 2.8);
  return mo * 10;
}

function getInteriorPrice(p: PortfolioProperty, cadence: BillingCadence): number {
  if (!p.interiorAddon) return 0;
  const doors = PROPERTY_DOORS[p.type] ?? 1;
  const annual = doors * INTERIOR_PER_DOOR_ANNUAL;
  if (cadence === "annual")    return annual;
  if (cadence === "quarterly") return Math.round(annual / 4);
  return Math.round(annual / 12);
}

function getPortfolioTotal(props: PortfolioProperty[], cadence: BillingCadence): number {
  return props.reduce((sum: number, p: PortfolioProperty) => sum + getPropertyPrice(p, cadence) + getInteriorPrice(p, cadence), 0);
}

interface PortfolioCheckoutPageProps {
  properties: PortfolioProperty[];
  cadence: BillingCadence;
  onBack: () => void;
}

const G  = "oklch(22% 0.07 155)";
const A  = "oklch(65% 0.15 72)";
const B  = "oklch(85% 0.02 80)";
const M  = "oklch(50% 0.02 60)";

const inputStyle: React.CSSProperties = {
  border: `1px solid ${B}`,
  background: "oklch(100% 0 0)",
  color: "oklch(18% 0.03 60)",
};

function Spinner() {
  return (
    <svg className="animate-spin inline-block mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const PROPERTY_TYPE_OPTIONS = [
  { value: "sfh",      label: "Single-Family Rental" },
  { value: "duplex",   label: "Duplex" },
  { value: "triplex",  label: "Triplex" },
  { value: "fourplex", label: "Fourplex" },
];
const TIER_OPTIONS = [
  { value: "essential", label: "Exterior Shield",  mo: 59,  laborBank: 0,   desc: "2 visits/yr · 5% discount" },
  { value: "full",      label: "Full Coverage",   mo: 99,  laborBank: 300, desc: "4 visits/yr · 8% discount" },
  { value: "maximum",   label: "Portfolio Max",   mo: 149, laborBank: 600, desc: "4 visits/yr · 12% discount" },
];
function newProperty(): PortfolioProperty {
  return { id: Math.random().toString(36).slice(2), address: "", type: "sfh", tier: "essential", interiorAddon: false };
}
export default function PortfolioCheckoutPage({ properties: initialProperties, cadence, onBack }: PortfolioCheckoutPageProps) {
  const [editableProperties, setEditableProperties] = useState<PortfolioProperty[]>(
    initialProperties.length > 0 ? initialProperties : [newProperty()]
  );
  const updateProperty = (id: string, patch: Partial<PortfolioProperty>) =>
    setEditableProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const removeProperty = (id: string) =>
    setEditableProperties((prev) => prev.filter((p) => p.id !== id));
  const addProperty = () =>
    setEditableProperties((prev) => [...prev, newProperty()]);
  const [form, setForm] = useState({
    firstName: "", lastName: "",
    email: "", phone: "",
    address: "", city: "", state: "WA", zip: "",
  });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [zipError, setZipError]     = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [activeCadence, setActiveCadence] = useState<BillingCadence>(cadence);
  const total = useMemo(() => getPortfolioTotal(editableProperties, activeCadence), [editableProperties, activeCadence]);

  // Determine if any property has a labor bank tier
  const hasLaborBank = editableProperties.some(
    (p) => p.tier && TIER_LABOR_BANK[p.tier] > 0
  );
  const totalLaborBank = editableProperties.reduce(
    (sum, p) => sum + (p.tier ? (TIER_LABOR_BANK[p.tier] ?? 0) : 0),
    0
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "zip") setZipError(null);
  };

  const focusAmber = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = A);
  const blurReset = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = B);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) { setError("Please agree to the terms."); return; }

    // ZIP validation
    const zip = form.zip.trim();
    if (zip && !SERVICE_AREA_ZIPS.has(zip)) {
      setZipError(
        "This ZIP code is outside our current service area (Clark County WA & Portland metro OR). Call us at (360) 544-9858 to discuss coverage."
      );
      return;
    }

    setError(null);
    setLoading(true);

    const TIER_API_MAP: Record<string, string> = {
      essential: "exterior_shield",
      full:      "full_coverage",
      maximum:   "max",
    };
    const mappedProperties = editableProperties.map((p) => ({
      ...p,
      tier: TIER_API_MAP[p.tier ?? "essential"] ?? "exterior_shield",
    }));
    const customer = {
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
    };
    const API = "https://pro.handypioneers.com";

    fetch(`${API}/api/360/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "checkout_started",
        type: "portfolio",
        data: { cadence: activeCadence, properties: mappedProperties, ...customer,
          serviceAddress: form.address, serviceCity: form.city,
          serviceState: form.state, serviceZip: form.zip },
      }),
    }).catch(() => {});

    try {
      const res = await fetch(`${API}/api/360/portfolio-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "portfolio", cadence: activeCadence,
          properties: mappedProperties, customer,
          origin: window.location.origin,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text.slice(0, 200)}`);
      }
      const json = await res.json();
      const url = json?.url;
      if (!url) throw new Error(json?.error ?? "Checkout failed");
      sessionStorage.setItem("hp360_cadence", activeCadence);
      sessionStorage.setItem("hp360_type", "portfolio");
      window.location.href = url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const cadenceLabel = CADENCE_LABELS[activeCadence];
  const cadenceSuffix = activeCadence === "monthly" ? "mo" : activeCadence === "quarterly" ? "qtr" : "yr";

  return (
    <div className="min-h-screen font-sans" style={{ background: "oklch(96% 0.015 80)" }}>

      {/* Top utility bar */}
      <div style={{ background: "oklch(16% 0.06 155)" }} className="text-white/80 text-xs py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <span>5-Star Rated · Licensed &amp; Insured · WA Lic. HANDYP*761NH</span>
          <a href="tel:3605449858" className="hover:text-white transition-colors font-medium">(360) 544-9858</a>
        </div>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm" style={{ borderColor: B }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-sm font-medium flex items-center gap-1 transition-colors hover:opacity-70" style={{ color: M }}>
            ← Back
          </button>
          <span style={{ color: B }}>|</span>
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hp-360-logo_69b6cf24.png"
            alt="360°"
            className="w-8 h-8 flex-shrink-0 object-contain"
          />
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hp-full-logo_7d3d2c7d.jpg"
            alt="Handy Pioneers"
            className="h-8 w-auto object-contain hidden sm:block"
          />
          <span className="text-xs ml-1" style={{ color: M }}>· Secure Checkout</span>
        </div>
      </nav>

      {/* Sticky mobile order bar */}
      <div className="md:hidden sticky top-[52px] z-40 px-4 py-2 flex items-center justify-between text-sm font-semibold shadow-sm" style={{ background: G, color: "oklch(100% 0 0)" }}>
        <span>360° Portfolio Plan · {cadenceLabel}</span>
        <span>${total.toLocaleString()}/{cadenceSuffix}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* ── LEFT: FORM ── */}
        <div>
          {/* ── EDITABLE PORTFOLIO BUILDER ── */}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-black mb-1" style={{ color: G }}>Your Properties</h2>
            <p className="text-sm mb-4" style={{ color: M }}>Review and edit your portfolio below. Add or remove properties before completing enrollment.</p>
            <div className="space-y-4">
              {editableProperties.map((prop, idx) => (
                <div key={prop.id} className="rounded-lg p-4 bg-white" style={{ border: `1px solid ${B}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: G }}>Property {idx + 1}</span>
                    {editableProperties.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProperty(prop.id)}
                        className="text-xs font-semibold transition-opacity hover:opacity-60"
                        style={{ color: "oklch(50% 0.18 25)" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>Address</label>
                      <input
                        value={prop.address}
                        onChange={(e) => updateProperty(prop.id, { address: e.target.value })}
                        placeholder="e.g. 123 Main St, Vancouver WA"
                        className="w-full rounded-md px-3 py-2 text-sm focus:outline-none"
                        style={inputStyle}
                        onFocus={focusAmber} onBlur={blurReset}
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>Property Type</label>
                        <select
                          value={prop.type}
                          onChange={(e) => updateProperty(prop.id, { type: e.target.value as PortfolioProperty["type"] })}
                          className="w-full rounded-md px-3 py-2 text-sm focus:outline-none"
                          style={inputStyle}
                          onFocus={focusAmber} onBlur={blurReset}
                        >
                          {PROPERTY_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: M }}>Plan Tier — select to set price</label>
                        <div className="grid grid-cols-3 gap-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                          {TIER_OPTIONS.map((o) => {
                            const isActive = (prop.tier ?? "essential") === o.value;
                            const tierPrice = activeCadence === "monthly" ? o.mo
                              : activeCadence === "quarterly" ? Math.round(o.mo * 2.8)
                              : o.mo * 10;
                            const tierSuffix = activeCadence === "monthly" ? "mo" : activeCadence === "quarterly" ? "qtr" : "yr";
                            return (
                              <button
                                key={o.value}
                                type="button"
                                onClick={() => updateProperty(prop.id, { tier: o.value })}
                                className="rounded-md py-2 px-2 text-xs font-semibold transition-all border-2 text-left"
                                style={{
                                  background: isActive ? G : "oklch(100% 0 0)",
                                  color: isActive ? "oklch(100% 0 0)" : G,
                                  borderColor: isActive ? G : "oklch(80% 0.02 80)",
                                }}
                              >
                                <div className="font-bold">{o.label}</div>
                                <div className="font-black mt-0.5" style={{ fontSize: "0.85rem", color: isActive ? "oklch(85% 0.12 72)" : A }}>${tierPrice}/{tierSuffix}</div>
                                <div className="text-xs mt-0.5 opacity-80">{o.desc}</div>
                                {o.laborBank > 0 && (
                                  <div className="text-xs mt-0.5" style={{ color: isActive ? "oklch(80% 0.12 72)" : "oklch(55% 0.14 68)" }}>
                                    {activeCadence === "monthly" ? `⏳ $${o.laborBank} bank` : `✅ $${o.laborBank} bank`}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: M }}>
                      <input
                        type="checkbox"
                        checked={prop.interiorAddon}
                        onChange={(e) => updateProperty(prop.id, { interiorAddon: e.target.checked })}
                        className="w-4 h-4 rounded accent-amber-600"
                      />
                      Add Interior Maintenance add-on
                      <span className="text-xs" style={{ color: A }}>(+${getInteriorPrice(prop, activeCadence)}/{activeCadence === "monthly" ? "mo" : activeCadence === "quarterly" ? "qtr" : "yr"})</span>
                    </label>
                  </div>
                  <div className="mt-3 pt-3 flex justify-between items-center" style={{ borderTop: `1px solid ${B}` }}>
                    <span className="text-xs" style={{ color: M }}>Property subtotal</span>
                    <span className="text-sm font-bold" style={{ color: G }}>
                      ${(getPropertyPrice(prop, activeCadence) + getInteriorPrice(prop, activeCadence)).toLocaleString()}/{activeCadence === "monthly" ? "mo" : activeCadence === "quarterly" ? "qtr" : "yr"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addProperty}
              className="mt-3 w-full rounded-md py-2 text-sm font-semibold border-2 border-dashed transition-all hover:opacity-70"
              style={{ borderColor: G, color: G, background: "transparent" }}
            >
              + Add Another Property
            </button>
          </div>
          <h2 className="font-display text-2xl font-black mb-1" style={{ color: G }}>Complete Enrollment</h2>
          <p className="text-sm mb-6" style={{ color: M }}>You'll be redirected to Stripe to complete payment securely.</p>

          {/* Cadence inline switcher */}
          <div className="rounded-md px-4 py-3 mb-5" style={{ background: "oklch(22% 0.07 155 / 0.06)", border: `1px solid oklch(22% 0.07 155 / 0.15)` }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: M }}>Billing Frequency</p>
            <div className="flex gap-2">
              {(["monthly", "quarterly", "annual"] as BillingCadence[]).map((c) => {
                const cLabel = c === "monthly" ? "Monthly" : c === "quarterly" ? "Quarterly" : "Annual";
                const cTotal = getPortfolioTotal(editableProperties, c);
                const cSuffix = c === "monthly" ? "mo" : c === "quarterly" ? "qtr" : "yr";
                const isActive = activeCadence === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCadence(c)}
                    className="flex-1 rounded-md py-2 px-2 text-xs font-semibold transition-all border-2"
                    style={{
                      background: isActive ? G : "oklch(100% 0 0)",
                      color: isActive ? "oklch(100% 0 0)" : G,
                      borderColor: isActive ? G : "oklch(80% 0.02 80)",
                    }}
                  >
                    <div>{cLabel}</div>
                    <div className="font-black" style={{ fontSize: "0.9rem" }}>${cTotal.toLocaleString()}/{cSuffix}</div>
                    {c === "annual" && <div className="text-xs mt-0.5" style={{ color: isActive ? "oklch(75% 0.12 72)" : A }}>Best value</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Labor bank nudge — no navigation, just context */}
          {activeCadence === "monthly" && hasLaborBank && (
            <div className="rounded-md px-4 py-3 mb-6 text-sm" style={{ background: "oklch(65% 0.15 72 / 0.08)", border: "1px solid oklch(65% 0.15 72 / 0.3)" }}>
              <span style={{ color: "oklch(45% 0.12 68)" }}>
                💡 <strong>Unlock ${totalLaborBank.toLocaleString()} in portfolio labor bank credit on day one</strong> — switch to Quarterly or Annual above.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First / Last */}
            <div className="grid grid-cols-2 gap-4">
              {(["firstName", "lastName"] as const).map((n) => (
                <div key={n}>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>
                    {n === "firstName" ? "First Name" : "Last Name"} *
                  </label>
                  <input
                    name={n}
                    value={form[n]}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md px-3 py-2 text-sm focus:outline-none"
                    style={inputStyle}
                    onFocus={focusAmber}
                    onBlur={blurReset}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>Phone</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                placeholder="(360) 555-0100"
                className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>Billing Address</label>
              <input name="address" value={form.address} onChange={handleChange}
                placeholder="123 Main St"
                className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>City</label>
                <input name="city" value={form.city} onChange={handleChange}
                  placeholder="Vancouver"
                  className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>State</label>
                <select name="state" value={form.state} onChange={handleChange}
                  className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset}>
                  <option value="WA">WA</option>
                  <option value="OR">OR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>ZIP</label>
                <input name="zip" value={form.zip} onChange={handleChange}
                  placeholder="98660"
                  className="w-full rounded-md px-3 py-2 text-sm focus:outline-none"
                  style={{ ...inputStyle, borderColor: zipError ? "oklch(55% 0.18 25)" : undefined }}
                  onFocus={focusAmber} onBlur={blurReset} />
              </div>
            </div>

            {zipError && (
              <div className="rounded-md px-4 py-3 text-sm" style={{ background: "oklch(95% 0.02 25)", border: "1px solid oklch(70% 0.18 25)", color: "oklch(35% 0.15 25)" }}>
                {zipError}
              </div>
            )}

            {error && (
              <div className="rounded-md px-4 py-3 text-sm" style={{ background: "oklch(95% 0.02 25)", border: "1px solid oklch(70% 0.18 25)", color: "oklch(35% 0.15 25)" }}>
                {error}
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 flex-shrink-0 w-4 h-4 rounded accent-amber-600"
              />
              <span className="text-xs leading-relaxed" style={{ color: M }}>
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => window.open("/terms", "_blank", "width=800,height=600")}
                  className="underline underline-offset-2 font-semibold transition-colors hover:opacity-70"
                  style={{ color: G }}
                >
                  Terms &amp; Conditions
                </button>{" "}
                and authorize recurring subscription billing as described above. I understand I may cancel anytime from my member portal.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full text-white font-bold py-3 rounded-md transition-all text-sm uppercase tracking-wide disabled:opacity-60"
              style={{ background: G }}
              onMouseEnter={(e) => !loading && agreedToTerms && ((e.currentTarget as HTMLButtonElement).style.background = "oklch(30% 0.08 155)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = G)}
            >
              {loading ? (
                <><Spinner />Redirecting to payment...</>
              ) : (
                `Continue to Payment — $${total.toLocaleString()}/${cadenceSuffix}`
              )}
            </button>

            <p className="text-center text-xs" style={{ color: "oklch(60% 0.02 60)" }}>
              🔒 Secure checkout powered by Stripe · You'll confirm your properties and get your first visit scheduled within 48 hours.
            </p>
          </form>
        </div>

        {/* ── RIGHT: ORDER SUMMARY ── */}
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-black mb-4" style={{ color: G }}>Order Summary</h2>
            <div className="rounded-lg border-2 bg-white overflow-hidden" style={{ borderColor: G }}>
              {/* Header */}
              <div className="px-5 py-4" style={{ background: G }}>
                <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: "oklch(65% 0.07 155)" }}>360° Portfolio Plan</p>
                <p className="font-display text-lg font-black" style={{ color: "oklch(100% 0 0)" }}>
                  {cadenceLabel} Billing
                </p>
              </div>

              {/* Per-property line items */}
              <div className="px-5 py-4 space-y-3">
                {editableProperties.map((prop, idx) => {
                  const propPrice = getPropertyPrice(prop, cadence);
                  const intPrice  = getInteriorPrice(prop, cadence);
                  const tierLabel = prop.tier ? TIER_LABELS[prop.tier] : null;
                  const laborBank = prop.tier ? (TIER_LABOR_BANK[prop.tier] ?? 0) : 0;
                  return (
                    <div key={prop.id} className="pb-3" style={{ borderBottom: "1px solid oklch(92% 0.01 80)" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: G }}>
                            {prop.address || `Property ${idx + 1}`}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: M }}>
                            {PROPERTY_TYPE_LABELS[prop.type]}
                            {tierLabel ? ` · ${tierLabel}` : ""}
                          </p>
                          {laborBank > 0 && (
                            <p className="text-xs mt-0.5 font-medium" style={{ color: cadence === "monthly" ? "oklch(55% 0.02 60)" : "oklch(55% 0.14 68)" }}>
                              {cadence === "monthly"
                                ? `⏳ $${laborBank} labor bank — unlocks after 90 days`
                                : `✅ $${laborBank} labor bank — day one`}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: G }}>
                          ${propPrice.toLocaleString()}
                        </span>
                      </div>
                      {intPrice > 0 && (
                        <div className="flex justify-between mt-1">
                          <p className="text-xs" style={{ color: A }}>+ Interior add-on</p>
                          <span className="text-xs font-semibold" style={{ color: A }}>+${intPrice.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Total */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-sm" style={{ color: G }}>Total</span>
                  <div className="text-right">
                    <span className="font-display text-2xl font-black" style={{ color: G }}>
                      ${total.toLocaleString()}
                    </span>
                    <span className="text-sm ml-1" style={{ color: M }}>/{cadenceSuffix}</span>
                  </div>
                </div>
                <p className="text-xs" style={{ color: M }}>
                  Billed {cadenceLabel.toLowerCase()} · Recurring subscription · Cancel anytime
                </p>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="rounded-lg p-4 space-y-2 bg-white" style={{ border: `1px solid ${B}` }}>
            {[
              "🔒 256-bit SSL encryption",
              "✓ Licensed & Insured — WA Lic. HANDYP*761NH",
              "✓ Cancel anytime, no long-term contracts",
              "✓ 1-Year Labor Guarantee on all work",
              "✓ Habitability-compliant documentation on every visit",
            ].map((t) => (
              <div key={t} className="text-xs" style={{ color: "oklch(40% 0.03 60)" }}>{t}</div>
            ))}
          </div>

          {/* What Happens Next */}
          <div className="rounded-lg p-5 bg-white" style={{ border: `1px solid ${B}` }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: A }}>What Happens Next</p>
            <div className="space-y-4">
              {[
                { step: "1", title: "Payment confirmed", body: "You'll receive a receipt and welcome email from help@handypioneers.com within minutes." },
                { step: "2", title: "We contact you within 24 hrs", body: "Our team reviews your portfolio and reaches out to confirm property details and scheduling preferences." },
                { step: "3", title: "First visits scheduled within 48 hrs", body: "We queue all properties for their first seasonal visit and send you a schedule confirmation." },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 text-white" style={{ background: G }}>
                    {s.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: G }}>{s.title}</p>
                    <p className="text-xs leading-relaxed mt-0.5" style={{ color: M }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
