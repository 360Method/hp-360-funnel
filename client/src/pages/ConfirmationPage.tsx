export default function ConfirmationPage() {
  const params = new URLSearchParams(window.location.search);
  const tier = params.get("tier") ?? "silver";
  const tierLabel = tier === "gold" ? "Maximum Protection" : tier === "silver" ? "Full Coverage" : "Essential";

  const G = "oklch(22% 0.07 155)";
  const A = "oklch(65% 0.15 72)";

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
      <nav className="bg-white border-b shadow-sm" style={{ borderColor: "oklch(85% 0.02 80)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs flex-shrink-0" style={{ background: G }}>360°</div>
          <span className="text-sm font-bold" style={{ color: G }}>Handy Pioneers</span>
        </div>
      </nav>

      {/* Hero confirmation band */}
      <div className="py-16 px-4 text-center text-white" style={{ background: G }}>
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="font-display text-4xl font-black mb-3">
          You're in. Welcome to the<br />
          <span style={{ color: A }}>360° Method.</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "oklch(100% 0 0 / 0.75)" }}>
          Your <strong className="text-white">{tierLabel}</strong> membership is active.
        </p>
      </div>

      {/* Next steps */}
      <div className="flex-1 px-4 py-12">
        <div className="max-w-xl mx-auto">
          <div className="hp-overline">What Happens Next</div>
          <div className="space-y-4 mb-8">
            {[
              {
                icon: "📧",
                title: "Check your email",
                body: "A welcome email with your membership details and receipt is on its way from help@handypioneers.com.",
              },
              {
                icon: "📅",
                title: "We'll schedule your Annual 360° Home Scan",
                body: "Our team will reach out within 48 hours to schedule your first whole-home assessment at a time that works for you.",
              },
              {
                icon: "🔧",
                title: "Your first seasonal visit is queued",
                body: "Based on today's date, we'll schedule your next seasonal visit. You'll receive a reminder 2 weeks before.",
              },
              ...(tier !== "bronze"
                ? [
                    {
                      icon: "💰",
                      title: "Your labor bank is loaded",
                      body: "Your labor bank credit has been added to your account. Use it on any handyman task — just call or message us.",
                    },
                  ]
                : []),
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-lg p-5" style={{ border: "1px solid oklch(85% 0.02 80)" }}>
                <div className="text-2xl flex-shrink-0">{step.icon}</div>
                <div>
                  <div className="font-bold mb-1" style={{ color: G }}>{step.title}</div>
                  <div className="text-sm leading-relaxed" style={{ color: "oklch(50% 0.02 60)" }}>{step.body}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <a
              href="https://client.handypioneers.com/portal/home"
              className="block w-full text-center text-white font-bold py-3 rounded-md text-sm uppercase tracking-wide transition-all"
              style={{ background: A }}
            >
              Access My Member Portal →
            </a>
            <a
              href="tel:3605449858"
              className="block w-full text-center font-medium py-3 rounded-md text-sm transition-all"
              style={{ background: "oklch(100% 0 0)", border: "1px solid oklch(85% 0.02 80)", color: G }}
            >
              Questions? Call (360) 544-9858
            </a>
          </div>

          <p className="mt-8 text-center text-xs" style={{ color: "oklch(60% 0.02 60)" }}>
            © {new Date().getFullYear()} Handy Pioneers LLC · 360° Method
          </p>
        </div>
      </div>
    </div>
  );
}
