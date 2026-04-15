// Design: HP brand — cream bg, dark green headings, serif display font
// Scope: 360° Method subscription program privacy policy

import { Link } from "wouter";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(97% 0.01 80)" }}>
      {/* Nav bar */}
      <header className="py-4 px-6 border-b" style={{ background: "#fff", borderColor: "oklch(88% 0.02 80)" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="font-black text-lg font-display" style={{ color: "oklch(22% 0.07 155)" }}>360°</span>
            <span className="text-sm hidden sm:inline" style={{ color: "oklch(50% 0.02 60)" }}>Delivered by Handy Pioneers</span>
          </Link>
          <Link href="/" className="text-sm font-semibold" style={{ color: "oklch(65% 0.15 72)" }}>
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="font-display text-4xl font-black mb-2" style={{ color: "oklch(22% 0.07 155)" }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-10" style={{ color: "oklch(55% 0.02 60)" }}>
          Last updated: April 15, 2026
        </p>

        <Section title="1. Introduction">
          <p>Handy Pioneers LLC ("we," "us," or "our") operates the 360° Method home maintenance subscription program at 360.handypioneers.com. This Privacy Policy explains how we collect, use, disclose, and protect information you provide when you enroll in the Program, request an estimate, make a payment, or communicate with us via phone, text message, email, or our website.</p>
          <p>By enrolling in the Program or submitting your information, you agree to the practices described in this policy. If you do not agree, please do not submit your information or use our services.</p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following categories of information:</p>
          <ul>
            <li><strong>Identity and Contact Information:</strong> Name, phone number, email address, and service address provided at enrollment or when contacting us.</li>
            <li><strong>Property Information:</strong> Property address(es), unit count, property type, and details about your home or rental portfolio provided during enrollment or service visits.</li>
            <li><strong>Payment Information:</strong> Billing name and address. Payment card numbers and financial account details are processed directly by Stripe, Inc. and are not stored on our systems. We receive only a payment confirmation token and last-four card digits.</li>
            <li><strong>Subscription Data:</strong> Your selected tier, billing cadence, enrollment date, labor bank balance, and visit history.</li>
            <li><strong>Communication Records:</strong> Records of phone calls, text messages, and emails exchanged between you and Handy Pioneers.</li>
            <li><strong>Visit Documentation:</strong> Photos, written findings, and condition notes generated during scheduled visits to your property.</li>
            <li><strong>Tenant Contact Information (Portfolio Plan only):</strong> Tenant names and contact details you provide for the purpose of scheduling entry notices. This information is used solely to fulfill your service agreement and is not used for any other purpose.</li>
            <li><strong>Website Usage Data:</strong> Pages visited, time spent on pages, browser type, and general geographic location (city/region), collected via standard web analytics tools.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use the information we collect solely for the following purposes:</p>
          <ul>
            <li>To process your enrollment and manage your subscription account.</li>
            <li>To schedule and perform seasonal visits and on-demand repair work.</li>
            <li>To issue tenant entry notices on your behalf (Portfolio Plan members).</li>
            <li>To communicate with you about your subscription, visit reports, billing, and service requests.</li>
            <li>To send transactional SMS messages related to your subscription (see Section 6).</li>
            <li>To process payments through our third-party payment processor (Stripe).</li>
            <li>To maintain visit documentation and service records for warranty and compliance purposes.</li>
            <li>To improve our services based on aggregate, anonymized usage data.</li>
            <li>To comply with applicable legal obligations.</li>
          </ul>
          <p><strong>We do not sell, rent, trade, or share your personal information with third parties for marketing purposes.</strong></p>
        </Section>

        <Section title="4. Information Sharing">
          <p>We do not share your personal information with third parties except in the following limited circumstances:</p>
          <ul>
            <li><strong>Payment Processing:</strong> We share billing information with Stripe, Inc. to process subscription payments. Stripe's privacy policy governs their handling of your payment data.</li>
            <li><strong>Service Providers:</strong> We may share information with trusted service providers (such as scheduling software, CRM platforms, or email delivery services) who assist us in operating our business. These providers are contractually prohibited from using your information for any purpose other than providing services to Handy Pioneers.</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or government authority.</li>
            <li><strong>Business Transfer:</strong> In the event of a merger, acquisition, or sale of business assets, your information may be transferred as part of that transaction, subject to the same privacy protections.</li>
          </ul>
          <p>Tenant contact information provided by Portfolio Plan members is used solely to issue required entry notices and is never shared with or sold to third parties.</p>
        </Section>

        <Section title="5. Payment Data and Stripe">
          <p>All payment processing is handled by Stripe, Inc. When you complete checkout, your payment card information is entered directly into Stripe's secure payment form and is never transmitted to or stored on Handy Pioneers' servers. We receive only a Stripe customer ID, subscription ID, and masked card details (last four digits and expiration month/year) for account management purposes.</p>
          <p>Stripe's privacy policy is available at <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "oklch(65% 0.15 72)" }}>stripe.com/privacy</a>.</p>
        </Section>

        <Section title="6. SMS / Text Message Communications">
          <p>If you provide your phone number at enrollment and consent to receive text messages, Handy Pioneers may send you SMS messages related to your subscription, including enrollment confirmations, visit scheduling, appointment reminders, visit reports, billing notifications, and responses to inquiries you initiate. Message frequency varies based on your subscription activity.</p>
          <p><strong>Message and data rates may apply.</strong> You may opt out of SMS communications at any time by replying <strong>STOP</strong> to any message. After opting out, you will receive one final confirmation message and no further SMS messages will be sent. To request help, reply <strong>HELP</strong> to any message or contact us at (360) 544-9858 or help@handypioneers.com.</p>
          <p>We do not share your phone number or SMS consent with third parties for marketing purposes. SMS opt-in data is not shared with any third party under any circumstances.</p>
        </Section>

        <Section title="7. Visit Documentation and Photos">
          <p>Photos and written findings collected during scheduled visits are stored securely and associated with your account. This documentation is shared with you in your visit report and retained for the duration of your subscription plus three years for warranty and service history purposes. Photos are not shared publicly or used for marketing without your explicit written consent.</p>
        </Section>

        <Section title="8. Cookies and Tracking Technologies">
          <p>Our website uses standard web analytics tools (such as Google Analytics) that collect anonymized data about website traffic and usage patterns. This data does not identify you personally and is used solely to improve our website. We also use Elfsight to display Google Reviews on our site; Elfsight's privacy policy governs their data practices. You may disable cookies in your browser settings, though this may affect some website functionality.</p>
        </Section>

        <Section title="9. Data Retention">
          <p>We retain your personal information for as long as necessary to fulfill the purposes described in this policy, or as required by applicable law. Subscription account data is retained for the duration of your active subscription. Upon cancellation, account data is retained for three years for warranty, billing dispute, and legal compliance purposes, then deleted or anonymized.</p>
        </Section>

        <Section title="10. Data Security">
          <p>We take reasonable measures to protect your personal information from unauthorized access, disclosure, or misuse, including encrypted data transmission (HTTPS), access controls, and secure third-party service providers. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.</p>
        </Section>

        <Section title="11. Children's Privacy">
          <p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a minor, please contact us immediately and we will delete it.</p>
        </Section>

        <Section title="12. Your Rights">
          <p>You have the right to request access to the personal information we hold about you, request correction of inaccurate information, or request deletion of your information, subject to legal retention requirements. To exercise these rights, contact us at help@handypioneers.com or (360) 544-9858.</p>
        </Section>

        <Section title="13. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date and communicated to active members via email. Continued use of our services after changes are posted constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="14. Contact Us">
          <p><strong>Handy Pioneers LLC</strong><br />
          Vancouver, WA (Clark County)<br />
          Phone: <a href="tel:3605449858" style={{ color: "oklch(65% 0.15 72)" }}>(360) 544-9858</a><br />
          Email: <a href="mailto:help@handypioneers.com" style={{ color: "oklch(65% 0.15 72)" }}>help@handypioneers.com</a><br />
          Website: <a href="https://360.handypioneers.com" style={{ color: "oklch(65% 0.15 72)" }}>360.handypioneers.com</a></p>
        </Section>

        <div className="mt-12 pt-6 border-t text-sm flex flex-wrap gap-4" style={{ borderColor: "oklch(88% 0.02 80)", color: "oklch(55% 0.02 60)" }}>
          <span>© {new Date().getFullYear()} Handy Pioneers LLC. All rights reserved.</span>
          <Link href="/terms" style={{ color: "oklch(65% 0.15 72)" }}>Terms &amp; Conditions</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-xl font-bold mb-3" style={{ color: "oklch(22% 0.07 155)" }}>
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "oklch(35% 0.03 255)" }}>
        {children}
      </div>
    </section>
  );
}
