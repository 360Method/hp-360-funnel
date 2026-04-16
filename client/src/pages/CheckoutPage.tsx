/*
 * CheckoutPage — 360° Method by Handy Pioneers
 * Design: HP design system — forest green / amber / cream
 *   - Cadence display with change link
 *   - Labor bank cadence gate in order summary
 *   - ZIP code service area validation
 *   - Quarterly upgrade nudge for monthly + labor bank tiers
 *   - Sticky mobile order summary bar
 *   - Spinner on submit
 *   - "What Happens Next" 3-step timeline
 */

import { useState } from "react";
import type { MemberTier, BillingCadence } from "../tiers";
import { TIERS, CADENCE_LABELS, getPrice } from "../tiers";

interface Props {
  tier: MemberTier;
  cadence: BillingCadence;
  onBack: () => void;
}

const PRO_API = "https://pro.handypioneers.com";

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

function Spinner() {
  return (
    <svg className="animate-spin inline-block mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function CheckoutPage({ tier, cadence, onBack }: Props) {
  const tierData = TIERS.find((t) => t.id === tier)!;
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [zipError, setZipError]     = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "WA", zip: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "zip") setZipError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ZIP validation
    const zip = form.zip.trim();
    if (zip && !SERVICE_AREA_ZIPS.has(zip)) {
      setZipError(
        "This ZIP code is outside our current service area (Clark County WA & Portland metro OR). Call us at (360) 544-9858 to discuss coverage."
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fire-and-forget cart abandonment capture
      fetch(`${PRO_API}/api/trpc/threeSixty.abandonedLead.capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            tier, cadence: activeCadence,
            customerName: `${form.firstName} ${form.lastName}`.trim(),
            customerEmail: form.email,
            customerPhone: form.phone,
            serviceAddress: form.address,
            serviceCity: form.city,
            serviceState: form.state,
            serviceZip: form.zip,
          },
        }),
      }).catch(() => null);

      const res = await fetch(`${PRO_API}/api/trpc/threeSixty.checkout.createSession`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          json: {
            tier, cadence: activeCadence,
            customerName: `${form.firstName} ${form.lastName}`.trim(),
            customerEmail: form.email,
            customerPhone: form.phone,
            serviceAddress: form.address,
            serviceCity: form.city,
            serviceState: form.state,
            serviceZip: form.zip,
            origin: window.location.origin,
          },
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error ${res.status}: ${errText.slice(0, 200)}`);
      }
      const data = await res.json();
      const url = data?.result?.data?.json?.url;
      if (url) {
        // Store purchase context in sessionStorage — survives Stripe redirect back
        sessionStorage.setItem("hp360_tier", tier);
        sessionStorage.setItem("hp360_cadence", activeCadence);
        window.location.href = url;
      } else {
        const msg = data?.error?.json?.message ?? data?.error?.message ?? "Failed to create checkout session";
        throw new Error(msg);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const G = "oklch(22% 0.07 155)";
  const A = "oklch(65% 0.15 72)";
  const B = "oklch(85% 0.02 80)";
  const M = "oklch(50% 0.02 60)";

  const inputStyle: React.CSSProperties = { border: `1px solid ${B}`, background: "oklch(100% 0 0)", color: "oklch(18% 0.03 60)" };
  const focusAmber = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = A);
  const blurReset = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = B);

  const [activeCadence, setActiveCadence] = useState<BillingCadence>(cadence);
  const price = getPrice(tierData, activeCadence);
  const cadenceLabel  = CADENCE_LABELS[activeCadence];
  const cadenceSuffix = activeCadence === "monthly" ? "mo" : activeCadence === "quarterly" ? "qtr" : "yr";
  const hasLaborBank  = tierData.laborBankDollars > 0;

  // Quarterly savings vs monthly
  const quarterlyPrice   = tierData.prices.quarterly;
  const monthlyAnnualized = tierData.prices.monthly * 12;
  const quarterlySavings  = monthlyAnnualized - quarterlyPrice * 4;

  return (
    <div className="min-h-screen font-sans" style={{ background: "oklch(96% 0.015 80)" }}>
      {/* Top bar */}
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
        <span>{tierData.name} · {cadenceLabel}</span>
        <span>${price}/{cadenceSuffix}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* ── LEFT: FORM ── */}
        <div>
          <h2 className="font-display text-2xl font-black mb-6" style={{ color: G }}>Your Information</h2>

          {/* Cadence inline switcher */}
          <div className="rounded-md px-4 py-3 mb-6" style={{ background: "oklch(22% 0.07 155 / 0.06)", border: `1px solid oklch(22% 0.07 155 / 0.15)` }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: M }}>Billing Frequency</p>
            <div className="flex gap-2">
              {(["monthly", "quarterly", "annual"] as BillingCadence[]).map((c) => {
                const cLabel = c === "monthly" ? "Monthly" : c === "quarterly" ? "Quarterly" : "Annual";
                const cPrice = getPrice(tierData, c);
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
                    <div className="font-black" style={{ fontSize: "0.9rem" }}>${cPrice}/{cSuffix}</div>
                    {c === "annual" && <div className="text-xs mt-0.5" style={{ color: isActive ? "oklch(75% 0.12 72)" : A }}>Best value</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Labor bank upgrade nudge — monthly only */}
          {activeCadence === "monthly" && hasLaborBank && (
            <div className="rounded-md px-4 py-3 mb-6 text-sm" style={{ background: "oklch(65% 0.15 72 / 0.08)", border: "1px solid oklch(65% 0.15 72 / 0.3)" }}>
              <span style={{ color: "oklch(45% 0.12 68)" }}>
                💡 <strong>Unlock ${tierData.laborBankDollars} in labor bank credit on day one</strong> — switch to Quarterly or Annual above.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {(["firstName", "lastName"] as const).map((n) => (
                <div key={n}>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>
                    {n === "firstName" ? "First Name" : "Last Name"} *
                  </label>
                  <input name={n} value={form[n]} onChange={handleChange} required
                    className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>Phone *</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} required
                className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>Service Address *</label>
              <input name="address" value={form.address} onChange={handleChange} required
                placeholder="Street address"
                className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>City *</label>
                <input name="city" value={form.city} onChange={handleChange} required
                  className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>State *</label>
                <select name="state" value={form.state} onChange={handleChange}
                  className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset}>
                  <option value="WA">WA</option>
                  <option value="OR">OR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: M }}>ZIP *</label>
                <input name="zip" value={form.zip} onChange={handleChange} required
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
                `Continue to Payment — $${price}/${cadenceSuffix}`
              )}
            </button>

            <p className="text-center text-xs" style={{ color: "oklch(60% 0.02 60)" }}>
              🔒 Secure checkout powered by Stripe · You'll confirm your address and get your first visit scheduled within 48 hours.
            </p>
          </form>
        </div>

        {/* ── RIGHT: ORDER SUMMARY ── */}
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-black mb-4" style={{ color: G }}>Order Summary</h2>
            <div className="rounded-lg border-2 bg-white overflow-hidden" style={{ borderColor: G }}>
              {/* Header — matches PortfolioCheckoutPage style */}
              <div className="px-5 py-4" style={{ background: G }}>
                <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: "oklch(65% 0.07 155)" }}>360° Method — {tierData.name}</p>
                <p className="font-display text-lg font-black" style={{ color: "oklch(100% 0 0)" }}>
                  {cadenceLabel} Billing
                </p>
              </div>
              {/* Line items — mirrors PortfolioCheckoutPage per-property style */}
              <div className="px-5 py-4 space-y-3">
                <div className="pb-3" style={{ borderBottom: `1px solid oklch(92% 0.01 80)` }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: G }}>{tierData.name} Plan</p>
                      <p className="text-xs mt-0.5" style={{ color: M }}>{cadenceLabel} membership · 4 seasonal visits/yr</p>
                      {hasLaborBank && (
                        <p className="text-xs mt-0.5 font-medium" style={{ color: activeCadence === "monthly" ? "oklch(55% 0.02 60)" : "oklch(55% 0.14 68)" }}>
                          {activeCadence === "monthly"
                            ? `⏳ $${tierData.laborBankDollars} labor bank — unlocks after 90 days`
                            : `✅ $${tierData.laborBankDollars} labor bank — day one`}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: G }}>${price}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {tierData.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: "oklch(45% 0.03 255)" }}>
                        <span style={{ color: A }} className="flex-shrink-0">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Total row */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-sm" style={{ color: G }}>Total</span>
                  <div className="text-right">
                    <span className="font-display text-2xl font-black" style={{ color: G }}>${price}</span>
                    <span className="text-sm ml-1" style={{ color: M }}>/{cadenceSuffix}</span>
                  </div>
                </div>
                <p className="text-xs" style={{ color: M }}>Billed {cadenceLabel.toLowerCase()} · Recurring subscription · Cancel anytime</p>
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
                { step: "2", title: "We contact you within 24 hrs", body: "Our team reaches out to confirm your address and schedule your Annual 360° Home Scan." },
                { step: "3", title: "First visit scheduled within 48 hrs", body: "Your first seasonal visit is queued. You'll receive a confirmation with your scheduled date." },
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
