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
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "OR",
    zip: "",
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
            tier,
            cadence,
            customerName: `${form.firstName} ${form.lastName}`,
            customerEmail: form.email,
            customerPhone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            zip: form.zip,
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

  return (
    <div className="min-h-screen bg-cream font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-slate-500 hover:text-navy text-sm font-medium flex items-center gap-1">
            ← Back
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-xl font-black text-navy font-display">360°</span>
          <span className="text-xs text-gray-400">Delivered by Handy Pioneers</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Order summary */}
        <div>
          <h2 className="font-display text-2xl font-black text-navy mb-6">Order Summary</h2>
          <div className={`rounded-2xl border-2 p-6 bg-white ${tierData.borderColor}`}>
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mb-3 ${tierData.badgeBg} ${tierData.badgeText}`}>
              {tierData.name}
            </div>
            <div className="text-3xl font-black text-navy font-display mb-1">
              ${price}
              <span className="text-sm font-normal text-slate-500 ml-1">
                /{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
              </span>
            </div>
            <div className="text-xs text-slate-500 mb-4">
              Billed {CADENCE_LABELS[cadence].toLowerCase()} · Recurring subscription
            </div>
            <ul className="space-y-2">
              {tierData.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-gold mt-0.5 flex-shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {tierData.laborBankDollars > 0 && (
              <div className="mt-4 bg-gold/10 border border-gold/30 rounded-lg px-3 py-2 text-sm">
                <span className="font-bold text-gold-dark">${tierData.laborBankDollars}</span>
                <span className="text-slate-700"> labor bank credit added at enrollment</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Secure payment processed by Stripe. You will be redirected to complete payment.
            Cancel anytime from your member portal.
          </p>
        </div>

        {/* Contact form */}
        <div>
          <h2 className="font-display text-2xl font-black text-navy mb-6">Your Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">First Name *</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name *</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Service Address *</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                placeholder="123 Main St"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">City *</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
                >
                  <option value="OR">OR</option>
                  <option value="WA">WA</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ZIP *</label>
                <input
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy hover:bg-navy/90 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? "Redirecting to payment..." : `Continue to Payment — $${price}/${cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}`}
            </button>
            <p className="text-center text-xs text-gray-400">
              🔒 Secure checkout powered by Stripe
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
