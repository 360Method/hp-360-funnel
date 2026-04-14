/*
 * MultifamilyPage — 360° Portfolio Plan by Handy Pioneers
 * Design: matches handypioneers.com (same as FunnelPage)
 *   - Forest green (#1a3a2a) dark sections
 *   - Warm cream (#f5f0e8) light sections
 *   - Amber/golden CTA buttons
 *   - Playfair Display headings, Inter body
 *   - HP overline labels (uppercase, tracked, amber, ruled)
 *   - HP card style (white bg, subtle border, hover lift)
 */

import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import type { BillingCadence } from "../tiers";
import { CADENCE_LABELS } from "../tiers";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type PropertyType = "sfh" | "duplex" | "triplex" | "fourplex";

interface PortfolioProperty {
  id: string;
  type: PropertyType;
  label: string;
  address: string;
  interiorAddon: boolean;
}

// ─── PRICING DATA ─────────────────────────────────────────────────────────────

const PROPERTY_TYPES: { id: PropertyType; label: string; units: string; description: string }[] = [
  { id: "sfh",      label: "Single-Family Rental", units: "1 unit",  description: "Detached rental home" },
  { id: "duplex",   label: "Duplex",               units: "2 units", description: "Two-unit building" },
  { id: "triplex",  label: "Triplex",              units: "3 units", description: "Three-unit building" },
  { id: "fourplex", label: "Fourplex",             units: "4 units", description: "Four-unit building" },
];

const MONTHLY_RATES: Record<PropertyType, number> = {
  sfh:      49,
  duplex:   99,
  triplex:  119,
  fourplex: 149,
};

const CADENCE_PRICES: Record<PropertyType, Record<BillingCadence, number>> = {
  sfh:      { monthly: 49,  quarterly: 139,  annual: 499  },
  duplex:   { monthly: 99,  quarterly: 279,  annual: 949  },
  triplex:  { monthly: 119, quarterly: 339,  annual: 1149 },
  fourplex: { monthly: 149, quarterly: 419,  annual: 1429 },
};

const INTERIOR_ADDON_ANNUAL = 58; // per door per year

function getPropertyPrice(type: PropertyType, cadence: BillingCadence): number {
  return CADENCE_PRICES[type][cadence];
}

function getPortfolioTotal(properties: PortfolioProperty[], cadence: BillingCadence): number {
  const base = properties.reduce((sum, p) => sum + getPropertyPrice(p.type, cadence), 0);
  const interiorDoors = properties.filter((p) => p.interiorAddon).length;
  const interiorCost = cadence === "annual" ? interiorDoors * INTERIOR_ADDON_ANNUAL : 0;
  return base + interiorCost;
}

function getSavingsVsMonthly(properties: PortfolioProperty[], cadence: BillingCadence): number {
  if (cadence === "monthly") return 0;
  const monthlyTotal = properties.reduce((sum, p) => sum + MONTHLY_RATES[p.type], 0);
  const cadenceTotal = getPortfolioTotal(properties, cadence);
  if (cadence === "quarterly") return monthlyTotal * 3 - cadenceTotal;
  return monthlyTotal * 12 - cadenceTotal;
}

// ─── HP OVERLINE ──────────────────────────────────────────────────────────────

function HPOverline({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-amber-400/60" />
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "0.7rem",
          letterSpacing: "0.18em",
          color: "#c8922a",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {children}
      </span>
      <div className="h-px flex-1 bg-amber-400/60" />
    </div>
  );
}

// ─── PORTFOLIO CALCULATOR ─────────────────────────────────────────────────────

interface PortfolioCalculatorProps {
  onEnroll: (properties: PortfolioProperty[], cadence: BillingCadence) => void;
}

function PortfolioCalculator({ onEnroll }: PortfolioCalculatorProps) {
  const [properties, setProperties] = useState<PortfolioProperty[]>([
    { id: nanoid(), type: "sfh", label: "", address: "", interiorAddon: false },
  ]);
  const [cadence, setCadence] = useState<BillingCadence>("annual");

  const addProperty = useCallback(() => {
    if (properties.length >= 20) return;
    setProperties((prev) => [
      ...prev,
      { id: nanoid(), type: "sfh", label: "", address: "", interiorAddon: false },
    ]);
  }, [properties.length]);

  const removeProperty = useCallback((id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateProperty = useCallback((id: string, updates: Partial<PortfolioProperty>) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const total = getPortfolioTotal(properties, cadence);
  const savings = getSavingsVsMonthly(properties, cadence);
  const interiorDoors = properties.filter((p) => p.interiorAddon).length;

  return (
    <div
      style={{ background: "#fff", border: "1px solid #e8e0d0", borderRadius: "12px" }}
      className="shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div style={{ background: "#1a3a2a", padding: "1.5rem 2rem" }}>
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.4rem",
            color: "#f5f0e8",
            marginBottom: "0.25rem",
          }}
        >
          Build Your Portfolio
        </h3>
        <p style={{ color: "#a8c4b0", fontSize: "0.875rem" }}>
          Add each property you want covered. Mix and match any combination.
        </p>
      </div>

      {/* Cadence selector */}
      <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid #f0ebe0", background: "#faf8f4" }}>
        <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
          Billing Cadence
        </p>
        <div className="flex gap-2 flex-wrap">
          {(["monthly", "quarterly", "annual"] as BillingCadence[]).map((c) => {
            const discountLabels: Record<BillingCadence, string> = {
              monthly: "",
              quarterly: "~5% off",
              annual: "~17% off",
            };
            return (
              <button
                key={c}
                onClick={() => setCadence(c)}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "6px",
                  border: cadence === c ? "2px solid #1a3a2a" : "2px solid #e8e0d0",
                  background: cadence === c ? "#1a3a2a" : "#fff",
                  color: cadence === c ? "#f5f0e8" : "#374151",
                  fontSize: "0.85rem",
                  fontWeight: cadence === c ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {CADENCE_LABELS[c]}
                {discountLabels[c] && (
                  <span
                    style={{
                      marginLeft: "0.4rem",
                      fontSize: "0.7rem",
                      color: cadence === c ? "#c8922a" : "#9ca3af",
                      fontWeight: 600,
                    }}
                  >
                    {discountLabels[c]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Property rows */}
      <div style={{ padding: "1.25rem 2rem" }}>
        <div className="space-y-3">
          {properties.map((prop, idx) => (
            <div
              key={prop.id}
              style={{
                background: "#faf8f4",
                border: "1px solid #e8e0d0",
                borderRadius: "8px",
                padding: "1rem",
              }}
            >
              <div className="flex items-start gap-3 flex-wrap">
                {/* Property number */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#1a3a2a",
                    color: "#f5f0e8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {idx + 1}
                </div>

                {/* Type selector */}
                <div className="flex-1 min-w-0" style={{ minWidth: "160px" }}>
                  <label style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    Property Type
                  </label>
                  <select
                    value={prop.type}
                    onChange={(e) => updateProperty(prop.id, { type: e.target.value as PropertyType })}
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: "0.25rem",
                      padding: "0.4rem 0.6rem",
                      border: "1px solid #d1c9b8",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      background: "#fff",
                      color: "#1f2937",
                    }}
                  >
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.label} ({pt.units})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Address / label */}
                <div className="flex-1 min-w-0" style={{ minWidth: "160px" }}>
                  <label style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    Address (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Oak Ave"
                    value={prop.address}
                    onChange={(e) => updateProperty(prop.id, { address: e.target.value })}
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: "0.25rem",
                      padding: "0.4rem 0.6rem",
                      border: "1px solid #d1c9b8",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      background: "#fff",
                      color: "#1f2937",
                    }}
                  />
                </div>

                {/* Price */}
                <div style={{ textAlign: "right", flexShrink: 0, paddingTop: "18px" }}>
                  <span style={{ fontWeight: 700, color: "#1a3a2a", fontSize: "1rem" }}>
                    ${getPropertyPrice(prop.type, cadence).toLocaleString()}
                  </span>
                  <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                    /{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
                  </span>
                </div>

                {/* Remove */}
                {properties.length > 1 && (
                  <button
                    onClick={() => removeProperty(prop.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9ca3af",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      padding: "18px 0 0 0",
                      flexShrink: 0,
                    }}
                    title="Remove property"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Interior add-on toggle */}
              <div className="flex items-center gap-2 mt-3" style={{ paddingLeft: "40px" }}>
                <input
                  type="checkbox"
                  id={`interior-${prop.id}`}
                  checked={prop.interiorAddon}
                  onChange={(e) => updateProperty(prop.id, { interiorAddon: e.target.checked })}
                  style={{ accentColor: "#1a3a2a", width: "14px", height: "14px" }}
                />
                <label
                  htmlFor={`interior-${prop.id}`}
                  style={{ fontSize: "0.8rem", color: "#4b5563", cursor: "pointer" }}
                >
                  Add Unit Interior Plan{" "}
                  <span style={{ color: "#c8922a", fontWeight: 600 }}>
                    +$58/door/yr
                  </span>
                  {" "}— 2 interior visits/year (annual billing only)
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Add property button */}
        {properties.length < 20 && (
          <button
            onClick={addProperty}
            style={{
              marginTop: "0.75rem",
              padding: "0.5rem 1rem",
              border: "2px dashed #c8922a",
              borderRadius: "8px",
              background: "transparent",
              color: "#c8922a",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fef3c7")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            + Add Another Property
          </button>
        )}
      </div>

      {/* Total + CTA */}
      <div
        style={{
          padding: "1.5rem 2rem",
          borderTop: "2px solid #e8e0d0",
          background: "#faf8f4",
        }}
      >
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "0.25rem" }}>
              Portfolio Total
            </p>
            <div className="flex items-baseline gap-2">
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "2.2rem",
                  fontWeight: 700,
                  color: "#1a3a2a",
                }}
              >
                ${total.toLocaleString()}
              </span>
              <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                /{cadence === "monthly" ? "mo" : cadence === "quarterly" ? "qtr" : "yr"}
              </span>
            </div>
            {savings > 0 && (
              <p style={{ color: "#c8922a", fontSize: "0.8rem", fontWeight: 600, marginTop: "0.25rem" }}>
                You save ${savings.toLocaleString()} vs. monthly billing
              </p>
            )}
            <p style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>
              {properties.length} propert{properties.length === 1 ? "y" : "ies"}
              {interiorDoors > 0 ? ` · ${interiorDoors} interior door${interiorDoors > 1 ? "s" : ""}` : ""}
            </p>
          </div>

          <button
            onClick={() => onEnroll(properties, cadence)}
            style={{
              background: "#c8922a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.875rem 2rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              transition: "background 0.15s, transform 0.1s",
              boxShadow: "0 4px 12px rgba(200,146,42,0.35)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#b07820";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#c8922a";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Enroll My Portfolio →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

interface MultifamilyPageProps {
  onEnrollPortfolio: (properties: PortfolioProperty[], cadence: BillingCadence) => void;
  onGoHome: () => void;
}

export default function MultifamilyPage({ onEnrollPortfolio, onGoHome }: MultifamilyPageProps) {
  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#f5f0e8", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav
        style={{
          background: "#fff",
          borderBottom: "1px solid #e8e0d0",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <button
            onClick={onGoHome}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#1a3a2a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#c8922a",
                fontWeight: 900,
                fontSize: "0.75rem",
                letterSpacing: "-0.02em",
              }}
            >
              HP
            </div>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem", color: "#1a3a2a", fontWeight: 700 }}>
              Handy Pioneers
            </span>
          </button>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <button
              onClick={onGoHome}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: "0.85rem", fontWeight: 500 }}
            >
              Homeowners
            </button>
            <span style={{ color: "#1a3a2a", fontSize: "0.85rem", fontWeight: 700, borderBottom: "2px solid #c8922a", paddingBottom: "2px" }}>
              Property Managers
            </span>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: "#1a3a2a", padding: "5rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
          <HPOverline>360° Portfolio Plan</HPOverline>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              color: "#f5f0e8",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
            }}
          >
            Your Rental Portfolio Deserves<br />
            <span style={{ color: "#c8922a" }}>Proactive Protection</span>
          </h1>
          <p style={{ color: "#a8c4b0", fontSize: "1.1rem", maxWidth: "620px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
            One plan covers every property you own — single-family rentals, duplexes, triplexes, and fourplexes. Seasonal exterior visits, optional unit interior care, and on-demand turnover packages. All under one membership.
          </p>
          <a
            href="#calculator"
            style={{
              display: "inline-block",
              background: "#c8922a",
              color: "#fff",
              padding: "0.875rem 2.5rem",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              boxShadow: "0 4px 16px rgba(200,146,42,0.4)",
              transition: "background 0.15s",
            }}
          >
            Build My Portfolio →
          </a>
        </div>
      </section>

      {/* ── PAIN SECTION ── */}
      <section style={{ background: "#f5f0e8", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <HPOverline>The Problem</HPOverline>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              color: "#1a3a2a",
              textAlign: "center",
              marginBottom: "2.5rem",
            }}
          >
            Deferred Maintenance Destroys NOI
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {[
              {
                icon: "🏚️",
                stat: "$350–$500",
                label: "avg. make-ready cost per unit",
                body: "Industry data shows routine R&M plus a unit turn runs $650–$900 per vacancy event when handled reactively. A proactive maintenance plan compresses that number significantly.",
              },
              {
                icon: "📅",
                stat: "14+ days",
                label: "avg. vacancy duration without a system",
                body: "Every day a unit sits vacant is lost rent. Owners without a maintenance system spend the first week discovering deferred issues before the make-ready even begins.",
              },
              {
                icon: "🔧",
                stat: "3× more",
                label: "expensive to fix reactively vs. proactively",
                body: "A $150 caulk repair ignored through a PNW winter becomes a $450–$900 wood rot repair. Seasonal visits catch these before the multiplier effect kicks in.",
              },
            ].map((item) => (
              <div
                key={item.stat}
                style={{
                  background: "#fff",
                  border: "1px solid #e8e0d0",
                  borderRadius: "10px",
                  padding: "1.75rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{item.icon}</div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "#1a3a2a",
                    marginBottom: "0.25rem",
                  }}
                >
                  {item.stat}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#c8922a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
                  {item.label}
                </div>
                <p style={{ fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE LAYERS ── */}
      <section style={{ background: "#fff", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <HPOverline>What's Included</HPOverline>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              color: "#1a3a2a",
              textAlign: "center",
              marginBottom: "2.5rem",
            }}
          >
            Three Layers of Protection
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {[
              {
                number: "01",
                title: "Exterior & Common Area",
                badge: "Included in all plans",
                badgeColor: "#1a3a2a",
                items: [
                  "4 seasonal visits per property",
                  "Roof, gutter, fascia & soffit inspection",
                  "Exterior caulk, paint touch-up, weatherstrip",
                  "Common entry, hallway & parking walk",
                  "Seasonal photo report to owner portal",
                  "Prioritized repair report with cost estimates",
                ],
              },
              {
                number: "02",
                title: "Unit Interior Add-On",
                badge: "+$58/door/yr",
                badgeColor: "#c8922a",
                items: [
                  "2 interior visits per door per year",
                  "HVAC filter swap & smoke/CO detector test",
                  "Water heater visual & under-sink leak check",
                  "HP handles tenant 24-hr notice (ORS 90.322)",
                  "Per-unit photo report to owner portal",
                  "Minimum 2 doors",
                ],
              },
              {
                number: "03",
                title: "Turnover Package",
                badge: "On-demand · Member 15% off",
                badgeColor: "#6b7280",
                items: [
                  "Full condition walk-through with photos",
                  "Deep clean + paint touch-up + patch & repair",
                  "HVAC filter, smoke/CO detector, fixture check",
                  "Final before/after photo report",
                  "5-business-day target completion",
                  "Flat rates: Studio $297 · 1BR $382 · 2BR $509",
                ],
              },
            ].map((layer) => (
              <div
                key={layer.number}
                style={{
                  background: "#faf8f4",
                  border: "1px solid #e8e0d0",
                  borderRadius: "10px",
                  padding: "1.75rem",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: "#e8e0d0",
                    position: "absolute",
                    top: "1rem",
                    right: "1.25rem",
                    lineHeight: 1,
                  }}
                >
                  {layer.number}
                </div>
                <span
                  style={{
                    display: "inline-block",
                    background: layer.badgeColor,
                    color: "#fff",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "4px",
                    marginBottom: "0.75rem",
                  }}
                >
                  {layer.badge}
                </span>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1.2rem",
                    color: "#1a3a2a",
                    marginBottom: "1rem",
                  }}
                >
                  {layer.title}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {layer.items.map((item) => (
                    <li
                      key={item}
                      style={{
                        fontSize: "0.85rem",
                        color: "#374151",
                        padding: "0.3rem 0",
                        borderBottom: "1px solid #f0ebe0",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ color: "#c8922a", fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TABLE ── */}
      <section style={{ background: "#f5f0e8", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <HPOverline>Pricing by Property Type</HPOverline>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              color: "#1a3a2a",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            Simple Per-Property Rates
          </h2>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e0d0",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                background: "#1a3a2a",
                padding: "0.75rem 1.5rem",
              }}
            >
              {["Property Type", "Monthly", "Quarterly", "Annual"].map((h) => (
                <div
                  key={h}
                  style={{
                    color: "#a8c4b0",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    textAlign: h === "Property Type" ? "left" : "center",
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
            {/* Rows */}
            {PROPERTY_TYPES.map((pt, idx) => (
              <div
                key={pt.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  padding: "1rem 1.5rem",
                  borderBottom: idx < PROPERTY_TYPES.length - 1 ? "1px solid #f0ebe0" : "none",
                  background: idx % 2 === 0 ? "#fff" : "#faf8f4",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "#1a3a2a", fontSize: "0.9rem" }}>{pt.label}</div>
                  <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{pt.units}</div>
                </div>
                {(["monthly", "quarterly", "annual"] as BillingCadence[]).map((c) => (
                  <div key={c} style={{ textAlign: "center" }}>
                    <span style={{ fontWeight: 700, color: "#1a3a2a", fontSize: "0.95rem" }}>
                      ${CADENCE_PRICES[pt.id][c].toLocaleString()}
                    </span>
                    <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                      /{c === "monthly" ? "mo" : c === "quarterly" ? "qtr" : "yr"}
                    </span>
                    {c !== "monthly" && (
                      <div style={{ fontSize: "0.7rem", color: "#c8922a", fontWeight: 600 }}>
                        save ${getSavingsVsMonthly([{ id: "x", type: pt.id, label: "", address: "", interiorAddon: false }], c).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
            {/* Interior add-on row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                padding: "1rem 1.5rem",
                background: "#fef3c7",
                borderTop: "2px solid #c8922a",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: "#92400e", fontSize: "0.9rem" }}>Unit Interior Add-On</div>
                <div style={{ color: "#b45309", fontSize: "0.75rem" }}>per door · annual only</div>
              </div>
              <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.8rem" }}>—</div>
              <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.8rem" }}>—</div>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontWeight: 700, color: "#92400e", fontSize: "0.95rem" }}>$58</span>
                <span style={{ color: "#b45309", fontSize: "0.75rem" }}>/door/yr</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section id="calculator" style={{ background: "#fff", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <HPOverline>Portfolio Calculator</HPOverline>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              color: "#1a3a2a",
              textAlign: "center",
              marginBottom: "0.75rem",
            }}
          >
            Price Your Entire Portfolio
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "2rem", fontSize: "0.95rem" }}>
            Add each property below. Mix any combination of property types.
          </p>
          <PortfolioCalculator onEnroll={onEnrollPortfolio} />
        </div>
      </section>

      {/* ── TENANT COORDINATION NOTE ── */}
      <section style={{ background: "#1a3a2a", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <HPOverline>Interior Visit Coordination</HPOverline>
          <h3
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.5rem",
              color: "#f5f0e8",
              marginBottom: "1rem",
            }}
          >
            We Handle Tenant Notice. You Handle Nothing.
          </h3>
          <p style={{ color: "#a8c4b0", lineHeight: 1.75, fontSize: "0.95rem" }}>
            Oregon law (ORS 90.322) requires 24-hour written notice before entering an occupied unit. Handy Pioneers acts as your authorized agent — we issue the notice directly to your tenant via text and email, confirm availability, and complete the visit. You receive a notification when the visit is scheduled and a photo report when it's done. Tenant contact information is collected at enrollment and stored securely in your owner portal.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#111c15", padding: "2rem 1.5rem", textAlign: "center" }}>
        <p style={{ color: "#4b7a5e", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} Handy Pioneers LLC · Portland Metro & SW Washington
        </p>
        <p style={{ color: "#2d4a38", fontSize: "0.75rem", marginTop: "0.25rem" }}>
          <a href="https://handypioneers.com" style={{ color: "#4b7a5e", textDecoration: "none" }}>handypioneers.com</a>
          {" · "}
          <a href="mailto:hello@handypioneers.com" style={{ color: "#4b7a5e", textDecoration: "none" }}>hello@handypioneers.com</a>
        </p>
      </footer>
    </div>
  );
}

export type { PortfolioProperty };
