/**
 * 360° checkout wire contract — COPY of the canonical source of truth in the
 * backend repo (HP-Estimator-app/shared/threeSixtyContract.ts). Keep byte-for-
 * byte in sync; both repos' contract tests pin these values so drift in either
 * repo fails CI. This is what prevents a recurrence of the homeowner-checkout
 * bug where the funnel sent the portfolio vocabulary to the homeowner endpoint.
 */

/** Homeowner (single-property) 360 membership tiers. */
export const HOMEOWNER_TIERS = ["bronze", "silver", "gold"] as const;
export type HomeownerTier = (typeof HOMEOWNER_TIERS)[number];

/** Portfolio (multi-property) coverage tiers — a DIFFERENT vocabulary. */
export const PORTFOLIO_TIERS = ["exterior_shield", "full_coverage", "max"] as const;
export type PortfolioTier = (typeof PORTFOLIO_TIERS)[number];

/** Billing cadences (shared by both checkout flows). */
export const BILLING_CADENCES = ["monthly", "quarterly", "annual"] as const;
export type Cadence = (typeof BILLING_CADENCES)[number];

export function isHomeownerTier(v: string): v is HomeownerTier {
  return (HOMEOWNER_TIERS as readonly string[]).includes(v);
}
export function isPortfolioTier(v: string): v is PortfolioTier {
  return (PORTFOLIO_TIERS as readonly string[]).includes(v);
}
