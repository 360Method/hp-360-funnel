export default function ConfirmationPage() {
  const params = new URLSearchParams(window.location.search);
  const tier = params.get("tier") ?? "silver";
  const tierLabel = tier === "gold" ? "Maximum Protection" : tier === "silver" ? "Full Coverage" : "Essential";

  return (
    <div className="min-h-screen bg-navy text-white font-sans flex flex-col">
      {/* Nav */}
      <nav className="bg-white/5 border-b border-white/10 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <span className="text-xl font-black text-white font-display">360°</span>
          <span className="text-white/40 text-xs">Delivered by Handy Pioneers</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="font-display text-4xl font-black mb-4">
            You're in. Welcome to the<br />
            <span className="text-gold">360° Method.</span>
          </h1>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            Your <strong className="text-white">{tierLabel}</strong> membership is active.
            Here's what happens next.
          </p>

          <div className="bg-white/10 rounded-2xl p-6 text-left space-y-5 mb-8">
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
                      body: `Your labor bank credit has been added to your account. Use it on any handyman task — just call or message us.`,
                    },
                  ]
                : []),
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0">{step.icon}</div>
                <div>
                  <div className="font-bold text-white mb-1">{step.title}</div>
                  <div className="text-white/65 text-sm leading-relaxed">{step.body}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <a
              href="https://client.handypioneers.com/portal/home"
              className="block w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Access My Member Portal →
            </a>
            <a
              href="tel:3605449858"
              className="block w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-colors text-sm"
            >
              Questions? Call (360) 544-9858
            </a>
          </div>

          <p className="mt-8 text-white/40 text-xs">
            © {new Date().getFullYear()} Handy Pioneers LLC · 360° Method
          </p>
        </div>
      </div>
    </div>
  );
}
