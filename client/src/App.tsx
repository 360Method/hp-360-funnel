import { useState, useEffect } from "react";
import FunnelPage from "./pages/FunnelPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import MultifamilyPage from "./pages/MultifamilyPage";
import PortfolioCheckoutPage from "./pages/PortfolioCheckoutPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import type { MemberTier, BillingCadence } from "./tiers";
import type { PortfolioProperty } from "./pages/MultifamilyPage";

type Page = "funnel" | "checkout" | "confirmation" | "multifamily" | "portfolio-checkout" | "terms" | "privacy";

export interface CheckoutState {
  tier: MemberTier;
  cadence: BillingCadence;
}

export interface PortfolioCheckoutState {
  properties: PortfolioProperty[];
  cadence: BillingCadence;
}

export default function App() {
  const [page, setPage] = useState<Page>("funnel");
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    tier: "silver",
    cadence: "annual",
  });
  const [portfolioCheckoutState, setPortfolioCheckoutState] = useState<PortfolioCheckoutState>({
    properties: [],
    cadence: "annual",
  });

  // Parse URL on load for deep-linking
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Stripe redirects to the root URL with session_id in query params
    // Also handle explicit /confirmation path
    if (params.get("session_id") || path.startsWith("/confirmation") || path.startsWith("/360/confirmation")) {
      setPage("confirmation");
    } else if (path.startsWith("/checkout") || path.startsWith("/360/checkout")) {
      const tier = (params.get("tier") ?? "silver") as MemberTier;
      const cadence = (params.get("cadence") ?? "annual") as BillingCadence;
      setCheckoutState({ tier, cadence });
      setPage("checkout");
    } else if (path.startsWith("/multifamily")) {
      setPage("multifamily");
    } else if (path.startsWith("/terms")) {
      setPage("terms");
    } else if (path.startsWith("/privacy")) {
      setPage("privacy");
    }
  }, []);

  const goToCheckout = (tier: MemberTier, cadence: BillingCadence) => {
    setCheckoutState({ tier, cadence });
    setPage("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToFunnel = () => {
    setPage("funnel");
    window.history.pushState({}, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToMultifamily = () => {
    setPage("multifamily");
    window.history.pushState({}, "", "/multifamily");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPortfolioCheckout = (properties: PortfolioProperty[], cadence: BillingCadence) => {
    setPortfolioCheckoutState({ properties, cadence });
    setPage("portfolio-checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (page === "terms") return <TermsPage />;
  if (page === "privacy") return <PrivacyPage />;
  if (page === "confirmation") return <ConfirmationPage />;
  if (page === "checkout")
    return (
      <CheckoutPage
        tier={checkoutState.tier}
        cadence={checkoutState.cadence}
        onBack={goToFunnel}
      />
    );
  if (page === "multifamily")
    return (
      <MultifamilyPage
        onEnrollPortfolio={goToPortfolioCheckout}
        onGoHome={goToFunnel}
      />
    );
  if (page === "portfolio-checkout")
    return (
      <PortfolioCheckoutPage
        properties={portfolioCheckoutState.properties}
        cadence={portfolioCheckoutState.cadence}
        onBack={goToMultifamily}
      />
    );
  return <FunnelPage onEnroll={goToCheckout} onGoToMultifamily={goToMultifamily} />;
}
