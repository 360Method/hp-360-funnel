/*
 * CheckoutPage — 360° Method by Handy Pioneers
 * Design: matches handypioneers.com
 *   - Warm cream background, white cards, HP nav
 *   - Forest green headings, amber accents
 *   - HP button styles, clean form inputs
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

export default function CheckoutPage({ tier, cadence, onBack }: Props) {
  const tierData = TIERS.find((t) => t.id === tier)!;
  const price = getPrice(tierData, cadence);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "OR", zip: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${PRO_API}/api/trpc/threeSixty.createCheckoutSession`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            tier, cadence,
            customerName: `${form.firstName} ${form.lastName}`,
            customerEmail: form.email, customerPhone: form.phone,
            address: form.address, city: form.city, state: form.state, zip: form.zip,
            origin: window.location.origin,
          },
        }),
      });
      const data = await res.json();
      if (data?.result?.data?.json?.url) {
        window.location.href = data.result.data.json.url;
      } else {
        throw new Error(data?.error?.message ?? "Failed to create checkout session");
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

  const inputStyle = { border: `1px solid ${B}`, background: "oklch(100% 0 0)", color: "oklch(18% 0.03 60)" };
  const focusAmber = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = A);
  const blurReset = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = B);

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
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs flex-shrink-0" style={{ background: G }}>
            360°
          </div>
          <span className="text-sm font-bold" style={{ color: G }}>Handy Pioneers</span>
          <span className="text-xs ml-1" style={{ color: M }}>· Secure Checkout</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Order Summary */}
        <div>
          <h2 className="font-display text-2xl font-black mb-6" style={{ color: G }}>Order Summary</h2>
          <div className="rounded-lg border-2 p-6 bg-white" style={{ borderColor: G }}>
            <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: "oklch(22% 0.07 155 / 0.1)", color: G }}>
              {tierData.name}
            </div>
            <div className="font-black font-display mb-1" style={{ fontSize: "1.875rem", color: G }}>
              ${price}
              <span className="text-sm font-normal ml-1" style={{ color: M }}>/{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}</span>
            </div>
            <div className="text-xs mb-4" style={{ color: M }}>Billed {CADENCE_LABELS[cadence].toLowerCase()} · Recurring subscription</div>
            <ul className="space-y-2">
              {tierData.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "oklch(35% 0.03 255)" }}>
                  <span style={{ color: A }} className="mt-0.5 flex-shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {tierData.laborBankDollars > 0 && (
              <div className="mt-4 rounded-md px-3 py-2 text-sm" style={{ background: "oklch(65% 0.15 72 / 0.08)", border: "1px solid oklch(65% 0.15 72 / 0.25)" }}>
                <span className="font-bold" style={{ color: "oklch(55% 0.14 68)" }}>${tierData.laborBankDollars}</span>
                <span style={{ color: "oklch(35% 0.03 255)" }}> labor bank credit added at enrollment</span>
              </div>
            )}
          </div>
          <p className="text-xs mt-4" style={{ color: "oklch(60% 0.02 60)" }}>
            Secure payment processed by Stripe. Cancel anytime from your member portal.
          </p>
          <div className="mt-6 rounded-lg p-4 text-sm space-y-2 bg-white" style={{ border: `1px solid ${B}` }}>
            {["🔒 256-bit SSL encryption", "✓ Licensed & Insured — WA Lic. HANDYP*761NH", "✓ Cancel anytime, no long-term contracts", "✓ 1-Year Labor Guarantee on all work"].map((t) => (
              <div key={t} className="text-xs" style={{ color: "oklch(40% 0.03 60)" }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div>
          <h2 className="font-display text-2xl font-black mb-6" style={{ color: G }}>Your Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {(["firstName", "lastName"] as const).map((n) => (
                <div key={n}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: M }}>{n === "firstName" ? "First Name" : "Last Name"} *</label>
                  <input name={n} value={form[n]} onChange={handleChange} required className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: M }}>Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: M }}>Phone *</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} required className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: M }}>Service Address *</label>
              <input name="address" value={form.address} onChange={handleChange} required placeholder="Street address" className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-semibold mb-1" style={{ color: M }}>City *</label>
                <input name="city" value={form.city} onChange={handleChange} required className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: M }}>State *</label>
                <select name="state" value={form.state} onChange={handleChange} className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset}>
                  <option value="OR">OR</option>
                  <option value="WA">WA</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: M }}>ZIP *</label>
                <input name="zip" value={form.zip} onChange={handleChange} required className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={inputStyle} onFocus={focusAmber} onBlur={blurReset} />
              </div>
            </div>
            {error && (
              <div className="rounded-md px-4 py-3 text-sm" style={{ background: "oklch(95% 0.02 25)", border: "1px solid oklch(70% 0.18 25)", color: "oklch(35% 0.15 25)" }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-3 rounded-md transition-all text-sm uppercase tracking-wide disabled:opacity-60"
              style={{ background: G }}
              onMouseEnter={(e) => !loading && ((e.currentTarget as HTMLButtonElement).style.background = "oklch(30% 0.08 155)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = G)}
            >
              {loading ? "Redirecting to payment..." : `Continue to Payment — $${price}/${cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}`}
            </button>
            <p className="text-center text-xs" style={{ color: "oklch(60% 0.02 60)" }}>🔒 Secure checkout powered by Stripe</p>
          </form>
        </div>
      </div>
    </div>
  );
}
