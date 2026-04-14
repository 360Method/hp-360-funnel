import { useState, useEffect } from "react";
import FunnelPage from "./pages/FunnelPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import type { MemberTier, BillingCadence } from "./tiers";

type Page = "funnel" | "checkout" | "confirmation";

export interface CheckoutState {
  tier: MemberTier;
  cadence: BillingCadence;
}

export default function App() {
  const [page, setPage] = useState<Page>("funnel");
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    tier: "silver",
    cadence: "annual",
  });

  // Parse URL on load for deep-linking
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (path.startsWith("/confirmation") || path.startsWith("/360/confirmation")) {
      setPage("confirmation");
    } else if (path.startsWith("/checkout") || path.startsWith("/360/checkout")) {
      const tier = (params.get("tier") ?? "silver") as MemberTier;
      const cadence = (params.get("cadence") ?? "annual") as BillingCadence;
      setCheckoutState({ tier, cadence });
      setPage("checkout");
    }
  }, []);

  const goToCheckout = (tier: MemberTier, cadence: BillingCadence) => {
    setCheckoutState({ tier, cadence });
    setPage("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToFunnel = () => {
    setPage("funnel");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (page === "confirmation") return <ConfirmationPage />;
  if (page === "checkout")
    return (
      <CheckoutPage
        tier={checkoutState.tier}
        cadence={checkoutState.cadence}
        onBack={goToFunnel}
      />
    );
  return <FunnelPage onEnroll={goToCheckout} />;
}
