/*
 * ConfirmationPage — 360° Method by Handy Pioneers
 * Design: HP design system — forest green / amber / cream
 *   - Parses tier, cadence, session_id from URL params
 *   - Shows correct tier name and billing cadence
 *   - Labor bank step only shown for quarterly/annual + labor bank tiers
 *   - Portal deep-link CTA
 *   - "What Happens Next" 3-step timeline
 *   - Polished hero band with checkmark animation
 */

import { useMemo } from "react";
import { TIERS, CADENCE_LABELS } from "../tiers";
import type { BillingCadence } from "../tiers";

const G = "oklch(22% 0.07 155)";
const A = "oklch(65% 0.15 72)";
const B = "oklch(85% 0.02 80)";
const M = "oklch(50% 0.02 60)";

export default function ConfirmationPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  // Support both old (tier=gold/silver/bronze) and new (tier=gold) param formats
  const tierParam   = params.get("tier") ?? "silver";
  const cadenceParam = (params.get("cadence") ?? "annual") as BillingCadence;
  const sessionId   = params.get("session_id") ?? null;

  const tierData = TIERS.find((t) => t.id === tierParam) ?? TIERS[1];
  const cadenceLabel = CADENCE_LABELS[cadenceParam];
  const hasLaborBank = tierData.laborBankDollars > 0;
  const laborBankActive = hasLaborBank && cadenceParam !== "monthly";

  // Portal URL — pass session_id if available for auto-login
  const portalUrl = sessionId
    ? `https://client.handypioneers.com/portal/home?session_id=${sessionId}`
    : "https://client.handypioneers.com/portal/home";

  const nextSteps = [
    {
      icon: "📧",
      title: "Check your email",
      body: `A welcome email with your membership details and receipt is on its way from help@handypioneers.com.`,
    },
    {
      icon: "📅",
      title: "We'll contact you within 24 hours",
      body: "Our team will reach out to confirm your address and schedule your Annual 360° Home Scan at a time that works for you.",
    },
    {
      icon: "🔧",
      title: "First seasonal visit queued within 48 hours",
      body: "Based on today's date, we'll schedule your next seasonal visit and send a reminder 2 weeks before.",
    },
    ...(laborBankActive
      ? [{
          icon: "💰",
          title: `$${tierData.laborBankDollars} labor bank is loaded`,
          body: "Your labor bank credit is available now. Use it on any handyman task — just call or message us and we'll apply it to your invoice.",
        }]
      : hasLaborBank && cadenceParam === "monthly"
      ? [{
          icon: "⏳",
          title: `$${tierData.laborBankDollars} labor bank — accruing`,
          body: "Your labor bank credit accrues over your first 90 days on the Monthly plan. It will be available in full after day 90.",
        }]
      : []),
  ];

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: "oklch(96% 0.015 80)" }}>

      {/* Top utility bar */}
      <div style={{ background: "oklch(16% 0.06 155)" }} className="text-white/80 text-xs py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <span>5-Star Rated · Licensed &amp; Insured · WA Lic. HANDYP*761NH</span>
          <a href="tel:3605449858" className="hover:text-white transition-colors font-medium">(360) 544-9858</a>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b shadow-sm" style={{ borderColor: B }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hp-360-logo_69b6cf24.png"
            alt="360°"
            className="w-8 h-8 object-contain flex-shrink-0"
          />
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663386531688/PdNJ394MjBP7Uu2hurkDFS/hp-full-logo_7d3d2c7d.jpg"
            alt="Handy Pioneers"
            className="h-8 w-auto object-contain hidden sm:block"
          />
        </div>
      </nav>

      {/* Hero confirmation band */}
      <div className="py-16 px-4 text-center text-white" style={{ background: G }}>
        {/* Animated checkmark */}
        <div className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "oklch(65% 0.15 72 / 0.2)", border: "2px solid oklch(65% 0.15 72 / 0.4)" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M7 16l7 7 11-11" stroke="oklch(75% 0.15 72)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display text-4xl font-black mb-3">
          You're in. Welcome to the<br />
          <span style={{ color: A }}>360° Method.</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-2" style={{ color: "oklch(100% 0 0 / 0.75)" }}>
          Your <strong className="text-white">{tierData.name}</strong> membership is active.
        </p>
        <p className="text-sm" style={{ color: "oklch(100% 0 0 / 0.5)" }}>
          Billing: {cadenceLabel}
          {sessionId && <span className="ml-2 text-xs">· Ref: {sessionId.slice(-8)}</span>}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-12">
        <div className="max-w-xl mx-auto">

          {/* What Happens Next */}
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: A }}>What Happens Next</p>
          <div className="space-y-4 mb-8">
            {nextSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-lg p-5" style={{ border: `1px solid ${B}` }}>
                <div className="text-2xl flex-shrink-0">{step.icon}</div>
                <div>
                  <div className="font-bold mb-1" style={{ color: G }}>{step.title}</div>
                  <div className="text-sm leading-relaxed" style={{ color: M }}>{step.body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <a
              href={portalUrl}
              className="block w-full text-center text-white font-bold py-3 rounded-md text-sm uppercase tracking-wide transition-all"
              style={{ background: A }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "oklch(55% 0.14 68)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = A)}
            >
              Access My Member Portal →
            </a>
            <a
              href="tel:3605449858"
              className="block w-full text-center font-medium py-3 rounded-md text-sm transition-all"
              style={{ background: "oklch(100% 0 0)", border: `1px solid ${B}`, color: G }}
            >
              Questions? Call (360) 544-9858
            </a>
          </div>

          {/* Guarantee reminder */}
          <div className="mt-8 rounded-lg p-4 text-center" style={{ background: "oklch(22% 0.07 155 / 0.05)", border: `1px solid oklch(22% 0.07 155 / 0.12)` }}>
            <p className="text-xs" style={{ color: M }}>
              <strong style={{ color: G }}>Remember:</strong> Every task we perform is backed by our 1-Year Labor Guarantee. If something we touched fails within 12 months, we come back and fix it — no service call fee.
            </p>
          </div>

          <p className="mt-8 text-center text-xs" style={{ color: "oklch(60% 0.02 60)" }}>
            © {new Date().getFullYear()} Handy Pioneers LLC · 360° Method
          </p>
        </div>
      </div>
    </div>
  );
}
