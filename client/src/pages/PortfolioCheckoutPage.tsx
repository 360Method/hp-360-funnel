/*
 * PortfolioCheckoutPage — 360° Portfolio Plan checkout
 * Design: matches handypioneers.com (same as CheckoutPage)
 */

import { useState } from "react";
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

// Tier monthly prices mirror MultifamilyPage TIER_MONTHLY
const TIER_MONTHLY_PRICES: Record<string, number> = {
  essential: 59,
  full:      99,
  maximum:   149,
};

// Base monthly prices (fallback when no tier is set)
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

function getPropertyMonthly(p: PortfolioProperty): number {
  return p.tier && TIER_MONTHLY_PRICES[p.tier]
    ? TIER_MONTHLY_PRICES[p.tier]
    : BASE_MONTHLY_PRICES[p.type] ?? 59;
}

function getPropertyPrice(p: PortfolioProperty, cadence: BillingCadence): number {
  const mo = getPropertyMonthly(p);
  if (cadence === "monthly")   return mo;
  if (cadence === "quarterly") return Math.round(mo * 2.8);
  return mo * 10; // annual
}

function getInteriorPrice(p: PortfolioProperty, cadence: BillingCadence): number {
  if (!p.interiorAddon) return 0;
  const doors = PROPERTY_DOORS[p.type] ?? 1;
  const annual = doors * INTERIOR_PER_DOOR_ANNUAL;
  if (cadence === "annual")    return annual;
  if (cadence === "quarterly") return Math.round(annual / 4);
  return Math.round(annual / 12);
}

function getPortfolioTotal(properties: PortfolioProperty[], cadence: BillingCadence): number {
  return properties.reduce((sum, p) => sum + getPropertyPrice(p, cadence) + getInteriorPrice(p, cadence), 0);
}

interface PortfolioCheckoutPageProps {
  properties: PortfolioProperty[];
  cadence: BillingCadence;
  onBack: () => void;
}

export default function PortfolioCheckoutPage({ properties, cadence, onBack }: PortfolioCheckoutPageProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "OR",
    zip: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const total = getPortfolioTotal(properties, cadence);
  const interiorDoors = properties.filter((p) => p.interiorAddon).length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const origin = window.location.origin;

    // Fire-and-forget cart abandonment capture
    try {
      await fetch("https://pro.handypioneers.com/api/trpc/threeSixty.portfolioAbandonedLead.capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          json: {
            cadence,
            properties,
            customerName: form.name,
            customerEmail: form.email,
            customerPhone: form.phone,
            billingAddress: form.address,
            billingCity: form.city,
            billingState: form.state,
            billingZip: form.zip,
          },
        }),
      });
    } catch {
      // Non-fatal
    }

    // Create Stripe checkout session
    try {
      const res = await fetch("https://pro.handypioneers.com/api/trpc/threeSixty.portfolioCheckout.createSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          json: {
            cadence,
            properties,
            customerName: form.name,
            customerEmail: form.email,
            customerPhone: form.phone,
            billingAddress: form.address,
            billingCity: form.city,
            billingState: form.state,
            billingZip: form.zip,
            origin,
          },
        }),
      });

      const data = await res.json();
      const url = data?.result?.data?.json?.url;

      if (!url) {
        const msg = data?.error?.json?.message ?? "Failed to create checkout session.";
        throw new Error(msg);
      }

      window.location.href = url;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#f5f0e8", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e8e0d0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <button
            onClick={onBack}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hp-360-logo_69b6cf24.png"
              alt="360°"
              style={{ width: "36px", height: "36px", objectFit: "contain", flexShrink: 0 }}
            />
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hp-full-logo_7d3d2c7d.jpg"
              alt="Handy Pioneers"
              style={{ height: "34px", width: "auto", objectFit: "contain" }}
              className="hidden sm:block"
            />
          </button>
          <button
            onClick={onBack}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            ← Back to Portfolio
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1rem" }} className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left: form */}
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.8rem", color: "#1a3a2a", marginBottom: "0.5rem" }}>
            Complete Enrollment
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "2rem", fontSize: "0.9rem" }}>
            You'll be redirected to Stripe to complete payment securely.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { name: "name",  label: "Full Name",    type: "text",  placeholder: "Jane Smith",            required: true },
              { name: "email", label: "Email",         type: "email", placeholder: "jane@example.com",      required: true },
              { name: "phone", label: "Phone",         type: "tel",   placeholder: "(503) 555-0100",        required: false },
              { name: "address", label: "Billing Address", type: "text", placeholder: "123 Main St",        required: false },
            ].map((field) => (
              <div key={field.name}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#374151", fontWeight: 600, marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {field.label}{field.required && <span style={{ color: "#c8922a" }}> *</span>}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={(form as any)[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #d1c9b8", borderRadius: "6px", fontSize: "0.9rem", background: "#fff", color: "#1f2937", boxSizing: "border-box" }}
                />
              </div>
            ))}

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#374151", fontWeight: 600, marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>City</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Portland" style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #d1c9b8", borderRadius: "6px", fontSize: "0.9rem", background: "#fff", color: "#1f2937", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#374151", fontWeight: 600, marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>State</label>
                <select name="state" value={form.state} onChange={handleChange} style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #d1c9b8", borderRadius: "6px", fontSize: "0.9rem", background: "#fff", color: "#1f2937", boxSizing: "border-box" }}>
                  <option value="OR">OR</option>
                  <option value="WA">WA</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#374151", fontWeight: 600, marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>ZIP</label>
                <input type="text" name="zip" value={form.zip} onChange={handleChange} placeholder="97201" style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #d1c9b8", borderRadius: "6px", fontSize: "0.9rem", background: "#fff", color: "#1f2937", boxSizing: "border-box" }} />
              </div>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "6px", padding: "0.75rem 1rem", color: "#991b1b", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ marginTop: "2px", flexShrink: 0, width: "16px", height: "16px", accentColor: "#c8922a" }}
              />
              <span style={{ fontSize: "0.78rem", color: "#6b7280", lineHeight: 1.5 }}>
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => window.open("/terms", "_blank", "width=800,height=600")}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#1a3a2a", fontWeight: 600, textDecoration: "underline", fontSize: "0.78rem" }}
                >
                  Terms &amp; Conditions
                </button>{" "}
                and authorize recurring subscription billing as described above. I understand I may cancel anytime from my member portal.
              </span>
            </label>
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              style={{
                background: loading || !agreedToTerms ? "#9ca3af" : "#c8922a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.875rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: loading || !agreedToTerms ? "not-allowed" : "pointer",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginTop: "0.5rem",
                transition: "background 0.15s",
              }}
            >
              {loading ? "Redirecting to Stripe…" : "Continue to Payment →"}
            </button>

            <p style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "center" }}>
              🔒 Secured by Stripe · No card stored on our servers
            </p>
          </form>
        </div>

        {/* Right: order summary */}
        <div>
          <div style={{ background: "#fff", border: "1px solid #e8e0d0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", position: "sticky", top: "80px" }}>
            <div style={{ background: "#1a3a2a", padding: "1.25rem 1.5rem" }}>
              <p style={{ color: "#a8c4b0", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "0.25rem" }}>
                Order Summary
              </p>
              <p style={{ color: "#f5f0e8", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.1rem" }}>
                360° Portfolio Plan · {CADENCE_LABELS[cadence]}
              </p>
            </div>
            <div style={{ padding: "1.25rem 1.5rem" }}>
              {properties.map((prop, idx) => {
                const propPrice = getPropertyPrice(prop, cadence);
                const intPrice  = getInteriorPrice(prop, cadence);
                const tierLabel = prop.tier ? TIER_LABELS[prop.tier] : null;
                return (
                  <div key={prop.id} style={{ padding: "0.6rem 0", borderBottom: "1px solid #f0ebe0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1a3a2a" }}>
                          {prop.address || `Property ${idx + 1}`}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          {PROPERTY_TYPE_LABELS[prop.type]}
                          {tierLabel ? ` · ${tierLabel}` : ""}
                        </p>
                      </div>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1a3a2a", marginLeft: "1rem", whiteSpace: "nowrap" }}>
                        ${propPrice.toLocaleString()}
                      </span>
                    </div>
                    {intPrice > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                        <p style={{ fontSize: "0.72rem", color: "#c8922a" }}>+ Interior add-on</p>
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#c8922a" }}>+${intPrice.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", marginTop: "0.25rem" }}>
                <span style={{ fontWeight: 700, color: "#1a3a2a", fontSize: "1rem" }}>Total</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: "#1a3a2a" }}>
                    ${total.toLocaleString()}
                  </span>
                  <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                    /{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
