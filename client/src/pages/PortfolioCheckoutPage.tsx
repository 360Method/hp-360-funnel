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
};

const CADENCE_PRICES: Record<string, Record<BillingCadence, number>> = {
  sfh:      { monthly: 49,  quarterly: 139,  annual: 499  },
  duplex:   { monthly: 99,  quarterly: 279,  annual: 949  },
  triplex:  { monthly: 119, quarterly: 339,  annual: 1149 },
  fourplex: { monthly: 149, quarterly: 419,  annual: 1429 },
};

const INTERIOR_ADDON_ANNUAL = 58;

function getPortfolioTotal(properties: PortfolioProperty[], cadence: BillingCadence): number {
  const base = properties.reduce((sum, p) => sum + CADENCE_PRICES[p.type][cadence], 0);
  const interiorDoors = properties.filter((p) => p.interiorAddon).length;
  const interiorCost = cadence === "annual" ? interiorDoors * INTERIOR_ADDON_ANNUAL : 0;
  return base + interiorCost;
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
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1a3a2a", display: "flex", alignItems: "center", justifyContent: "center", color: "#c8922a", fontWeight: 900, fontSize: "0.75rem" }}>
              HP
            </div>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem", color: "#1a3a2a", fontWeight: 700 }}>
              Handy Pioneers
            </span>
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
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "3rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

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

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#9ca3af" : "#c8922a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.875rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
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
              {properties.map((prop, idx) => (
                <div key={prop.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0.6rem 0", borderBottom: "1px solid #f0ebe0" }}>
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1a3a2a" }}>
                      {prop.address || `Property ${idx + 1}`}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      {PROPERTY_TYPE_LABELS[prop.type]}
                      {prop.interiorAddon ? " · +Interior" : ""}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1a3a2a" }}>
                    ${CADENCE_PRICES[prop.type][cadence].toLocaleString()}
                  </span>
                </div>
              ))}
              {interiorDoors > 0 && cadence === "annual" && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid #f0ebe0" }}>
                  <p style={{ fontSize: "0.875rem", color: "#c8922a", fontWeight: 600 }}>
                    Interior Add-On ({interiorDoors} door{interiorDoors > 1 ? "s" : ""})
                  </p>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#c8922a" }}>
                    +${(interiorDoors * INTERIOR_ADDON_ANNUAL).toLocaleString()}
                  </span>
                </div>
              )}
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
