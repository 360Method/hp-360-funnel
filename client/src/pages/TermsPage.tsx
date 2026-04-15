// Design: HP brand — cream bg, dark green headings, serif display font
// Scope: 360° Method subscription plan terms, labor bank, service scope limitations

import { Link } from "wouter";

export default function TermsPage() {
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
          Terms &amp; Conditions
        </h1>
        <p className="text-sm mb-10" style={{ color: "oklch(55% 0.02 60)" }}>
          Last updated: April 15, 2026
        </p>

        <Section title="1. Agreement to Terms">
          <p>These Terms and Conditions ("Terms") govern your enrollment in and use of the 360° Method home maintenance subscription program ("Program") operated by Handy Pioneers LLC ("we," "us," or "our"), a licensed handyman and remodeling contractor serving Clark County, Washington and the Portland, Oregon metro area. By enrolling in the Program, completing checkout, or using our services, you agree to be bound by these Terms.</p>
          <p>Washington State Contractor License: HANDYP*761NH. Licensed and insured up to $1,000,000.</p>
        </Section>

        <Section title="2. The 360° Method Program">
          <p>The 360° Method is a recurring subscription maintenance program that provides scheduled seasonal visits, a documented annual home scan, member repair discounts, and (on qualifying tiers) a pre-loaded labor bank credit. The Program is available in three tiers for homeowners (Essential, Full Coverage, Maximum Protection) and three tiers for property managers (Exterior Shield, Full Coverage, Portfolio Max).</p>
          <p>Enrollment constitutes an agreement to the visit schedule, scope of services, and pricing associated with your selected tier and billing cadence (monthly, quarterly, or annual).</p>
        </Section>

        <Section title="3. Subscription Billing">
          <p>Subscription fees are billed in advance on a recurring basis according to your selected cadence (monthly, quarterly, or annual). By enrolling, you authorize Handy Pioneers to charge your payment method on file at the start of each billing period.</p>
          <p>Annual plans are billed as a single payment at enrollment. Quarterly plans are billed every three months. Monthly plans are billed each month on the enrollment anniversary date.</p>
          <p>Prices are subject to change with 30 days' written notice. Continued enrollment after a price change constitutes acceptance of the new rate.</p>
        </Section>

        <Section title="4. Cancellation Policy">
          <p>You may cancel your subscription at any time by contacting us at help@handypioneers.com or (360) 544-9858. Cancellation takes effect at the end of the current billing period. No refunds are issued for the current billing period upon cancellation.</p>
          <p>Annual plans cancelled after the first 30 days are non-refundable for the remainder of the annual term. Annual plans cancelled within 30 days of enrollment are eligible for a prorated refund minus the cost of any services already delivered.</p>
          <p>Labor bank credits expire upon cancellation and have no cash value.</p>
        </Section>

        <Section title="5. Labor Bank Credits">
          <p>Full Coverage and Maximum Protection tiers include a pre-loaded labor bank credit ($200 and $500 respectively) applied at enrollment. Labor bank credits may be applied to any handyman task performed by Handy Pioneers between scheduled visits. Credits are per-property, renew annually at the start of each subscription year, and do not carry over or accumulate. Credits have no cash value and are forfeited upon cancellation.</p>
          <p>For Portfolio Plan members, each enrolled property has its own labor bank credit. Credits do not transfer between properties.</p>
        </Section>

        <Section title="6. Scope of Services">
          <p>Scheduled visits include exterior and interior maintenance tasks as described in your tier's service schedule. All work is performed by Handy Pioneers technicians. The following are expressly excluded from the Program scope:</p>
          <ul>
            <li>Roof work on steep-pitch surfaces (greater than 4:12 pitch) or third-story rooftops</li>
            <li>Chimney cleaning, inspection, or repair</li>
            <li>Structural engineering assessments</li>
            <li>Plumbing or electrical work requiring a licensed plumber or electrician</li>
            <li>Hazardous material remediation (asbestos, lead paint)</li>
            <li>Work requiring a building permit unless separately contracted</li>
          </ul>
          <p>Issues identified during a visit that fall outside the Program scope will be documented and flagged in the visit report. Handy Pioneers may provide a separate estimate for out-of-scope work at member-discounted rates.</p>
          <p>Roof work is limited to walkable, low-slope surfaces. Steep pitch and third-story work will be referred to a licensed roofing contractor.</p>
        </Section>

        <Section title="7. Member Repair Discounts">
          <p>Active members receive tiered discounts on out-of-scope repair and handyman work performed by Handy Pioneers. Discount rates are applied to Handy Pioneers' standard labor and material pricing and vary by tier and job size as described on the enrollment page. Discounts apply only while the subscription is active and in good standing. Discounts do not apply to subcontracted work, permit fees, or specialty trade work.</p>
        </Section>

        <Section title="8. Scheduling and Access">
          <p>Scheduled visits are coordinated with you (or your designated tenant contact for Portfolio Plan members) in advance. We require reasonable access to the property to perform services. If access is denied or unavailable at the scheduled time, we will make one rescheduling attempt. If access cannot be arranged within 30 days of the scheduled visit, the visit may be forfeited for that season without refund.</p>
          <p>For Portfolio Plan members with occupied rental units, we issue required tenant entry notices (Washington RCW 59.18.150 — minimum 2 days' written notice for non-emergency entry) as your authorized agent, using tenant contact information you provide at enrollment.</p>
        </Section>

        <Section title="9. Documentation and Liability">
          <p>Each visit generates a written report documenting findings, photos, and recommended actions. Handy Pioneers documents all conditions visible and accessible at the time of inspection. We are not liable for pre-existing conditions that were not visible, accessible, or detectable during the visit, including issues inside walls, under slabs, or in areas with restricted access.</p>
          <p>If a finding is documented in writing and the member declines the recommended repair, Handy Pioneers' liability for that item ends at the point of written disclosure. Our documentation is intended to support your maintenance records and does not replace a licensed home inspector, structural engineer, or specialist for major assessments.</p>
          <p>To the maximum extent permitted by applicable law, Handy Pioneers' total liability for any claim arising from the Program shall not exceed the amount paid for the subscription in the 12 months preceding the claim.</p>
        </Section>

        <Section title="10. Turnover Package (Portfolio Plan)">
          <p>Make-ready turnover packages are available on-demand to Portfolio Plan members at member pricing. Turnover packages include standard labor tasks as described on the enrollment page. Materials (paint, hardware, blinds, fixtures, etc.) required to complete the turnover are billed separately at cost plus a 15% materials handling fee. HP coordinates and manages the cleaning crew as part of the turnover package; cleaning crew costs are included in the quoted package price.</p>
          <p>Custom upgrade turnovers (flooring replacement, full paint, appliance swap) are quoted separately. Contact us for a custom quote.</p>
        </Section>

        <Section title="11. SMS Messaging Program">
          <p><strong>Program Name:</strong> Handy Pioneers 360° Member Communications</p>
          <p><strong>Program Description:</strong> By providing your mobile phone number at enrollment, you consent to receive SMS messages from Handy Pioneers related to your subscription, including enrollment confirmations, visit scheduling, appointment reminders, visit reports, billing notifications, and responses to inquiries you initiate.</p>
          <p><strong>Message Frequency:</strong> Message frequency varies based on your subscription activity. You may receive up to 6 messages per service visit (scheduling, reminder, day-of confirmation, visit report, repair estimate if applicable, and follow-up).</p>
          <p><strong>Message and Data Rates:</strong> Message and data rates may apply. Check with your mobile carrier for details.</p>
          <p><strong>Opt-Out:</strong> Reply STOP to any message to opt out. You will receive one final confirmation and no further messages will be sent.</p>
          <p><strong>Help:</strong> Reply HELP or contact us at (360) 544-9858 or help@handypioneers.com.</p>
          <p>We do not share your phone number or SMS opt-in data with third parties for marketing purposes.</p>
        </Section>

        <Section title="12. Warranty">
          <p>Handy Pioneers provides a 1-year labor warranty on all repair and handyman work performed under the Program. This warranty covers defects in workmanship and does not cover damage caused by misuse, normal wear and tear, weather events, or pre-existing conditions. Manufacturer warranties on materials are governed by the respective manufacturer's terms.</p>
        </Section>

        <Section title="13. Intellectual Property">
          <p>The 360° Method name, framework, and all associated content on 360.handypioneers.com are the property of Handy Pioneers LLC and may not be reproduced, distributed, or used without written permission.</p>
        </Section>

        <Section title="14. Governing Law">
          <p>These Terms are governed by the laws of the State of Washington. Any disputes arising from these Terms or the Program shall be resolved in Clark County, Washington.</p>
        </Section>

        <Section title="15. Changes to These Terms">
          <p>We may update these Terms from time to time. Changes will be posted on this page with an updated "Last updated" date and communicated to active members via email. Continued enrollment after changes are posted constitutes acceptance of the updated Terms.</p>
        </Section>

        <Section title="16. Contact Us">
          <p><strong>Handy Pioneers LLC</strong><br />
          Vancouver, WA (Clark County)<br />
          Phone: <a href="tel:3605449858" style={{ color: "oklch(65% 0.15 72)" }}>(360) 544-9858</a><br />
          Email: <a href="mailto:help@handypioneers.com" style={{ color: "oklch(65% 0.15 72)" }}>help@handypioneers.com</a><br />
          Website: <a href="https://360.handypioneers.com" style={{ color: "oklch(65% 0.15 72)" }}>360.handypioneers.com</a></p>
        </Section>

        <div className="mt-12 pt-6 border-t text-sm flex flex-wrap gap-4" style={{ borderColor: "oklch(88% 0.02 80)", color: "oklch(55% 0.02 60)" }}>
          <span>© {new Date().getFullYear()} Handy Pioneers LLC. All rights reserved.</span>
          <Link href="/privacy-policy" style={{ color: "oklch(65% 0.15 72)" }}>Privacy Policy</Link>
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
