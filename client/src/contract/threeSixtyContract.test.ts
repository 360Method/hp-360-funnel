import { describe, expect, it } from "vitest";
import { TIERS } from "../tiers";
import { HOMEOWNER_TIERS, PORTFOLIO_TIERS, isPortfolioTier } from "./threeSixtyContract";

describe("funnel ↔ backend 360 contract", () => {
  it("the funnel's homeowner tiers match the backend homeowner vocabulary", () => {
    // What the funnel ships as selectable tiers must be exactly the tier keys
    // the backend's homeowner checkout (threeSixty.checkout.createSession) accepts.
    expect(TIERS.map((t) => t.id).sort()).toEqual([...HOMEOWNER_TIERS].sort());
  });

  it("no funnel homeowner tier leaks the portfolio vocabulary (the bug guard)", () => {
    // The original bug mapped bronze/silver/gold -> exterior_shield/full_coverage/max
    // before POSTing to the homeowner endpoint. Assert the homeowner tiers never
    // include a portfolio identifier.
    for (const t of TIERS) expect(isPortfolioTier(t.id)).toBe(false);
  });

  it("the two vocabularies stay disjoint", () => {
    for (const t of HOMEOWNER_TIERS) expect(PORTFOLIO_TIERS as readonly string[]).not.toContain(t);
  });
});
