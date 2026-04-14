export type MemberTier = "bronze" | "silver" | "gold";
export type BillingCadence = "monthly" | "quarterly" | "annual";

export interface TierData {
  id: MemberTier;
  name: string;
  tagline: string;
  color: string;
  borderColor: string;
  bgColor: string;
  badgeBg: string;
  badgeText: string;
  /** Price in dollars per cadence */
  prices: Record<BillingCadence, number>;
  /** Annual equivalent per month */
  annualMonthly: number;
  laborBankDollars: number;
  visits: number;
  visitDescription: string;
  discountBrackets: { label: string; pct: string }[];
  features: string[];
  popular?: boolean;
}

export const TIERS: TierData[] = [
  {
    id: "bronze",
    name: "Essential",
    tagline: "Protect the basics. Catch problems early.",
    color: "#c8922a",
    borderColor: "border-amber-400",
    bgColor: "bg-amber-50",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
    prices: { monthly: 59, quarterly: 169, annual: 588 },
    annualMonthly: 49,
    laborBankDollars: 0,
    visits: 2,
    visitDescription: "Spring + Fall",
    discountBrackets: [
      { label: "Jobs under $1,000", pct: "5% off" },
      { label: "Jobs $1,000–$5,000", pct: "3% off" },
      { label: "Jobs over $5,000", pct: "1.5% off" },
    ],
    features: [
      "Annual 360° Home Scan (2–3 hr documented assessment)",
      "Spring visit — post-rain damage assessment + moss/gutter service",
      "Fall visit — rain-season prep + weatherization",
      "Prioritized repair report with cost estimates",
      "Member discount on all out-of-scope jobs",
      "HP direct line — no hold queues",
    ],
  },
  {
    id: "silver",
    name: "Full Coverage",
    tagline: "Four seasons of protection + pre-paid labor.",
    color: "#6b7280",
    borderColor: "border-slate-400",
    bgColor: "bg-slate-50",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-800",
    prices: { monthly: 99, quarterly: 279, annual: 948 },
    annualMonthly: 79,
    laborBankDollars: 200,
    visits: 4,
    visitDescription: "All 4 Seasons",
    popular: true,
    discountBrackets: [
      { label: "Jobs under $1,000", pct: "8% off" },
      { label: "Jobs $1,000–$5,000", pct: "5% off" },
      { label: "Jobs over $5,000", pct: "2.5% off" },
    ],
    features: [
      "Everything in Essential, plus:",
      "$200 labor bank credit (use on any handyman task)",
      "Summer visit — dry-season exterior + HVAC prep",
      "Winter visit — freeze protection + moisture inspection",
      "Upsell-to-estimate in one tap — findings become quotes instantly",
      "Annual maintenance report for home equity documentation",
    ],
  },
  {
    id: "gold",
    name: "Maximum Protection",
    tagline: "The full system. Priority access. Maximum savings.",
    color: "#0f1f3d",
    borderColor: "border-navy",
    bgColor: "bg-blue-50",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-900",
    prices: { monthly: 149, quarterly: 419, annual: 1428 },
    annualMonthly: 119,
    laborBankDollars: 500,
    visits: 4,
    visitDescription: "All 4 Seasons + Priority",
    discountBrackets: [
      { label: "Jobs under $1,000", pct: "12% off" },
      { label: "Jobs $1,000–$5,000", pct: "8% off" },
      { label: "Jobs over $5,000", pct: "4% off" },
    ],
    features: [
      "Everything in Full Coverage, plus:",
      "$500 labor bank credit — you're ahead after month 5",
      "Priority scheduling — your calls go first",
      "Dedicated HP account manager",
      "Pre-negotiated sub-contractor rates on major work",
      "Home equity maintenance log for refinancing or sale",
    ],
  },
];

export function getPrice(tier: TierData, cadence: BillingCadence): number {
  return tier.prices[cadence];
}

export function getSavingsVsMonthly(tier: TierData, cadence: BillingCadence): number {
  if (cadence === "monthly") return 0;
  const monthlyTotal = tier.prices.monthly * 12;
  const cadenceTotal =
    cadence === "quarterly" ? tier.prices.quarterly * 4 : tier.prices.annual;
  return monthlyTotal - cadenceTotal;
}

export const CADENCE_LABELS: Record<BillingCadence, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};
