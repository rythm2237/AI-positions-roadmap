import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import { legalLastUpdated, legalOperator, legalValue } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" intro={`Last updated: ${legalLastUpdated}. These terms govern consumer use of AI Career OS and any paid digital service offered through the platform.`}>
      <h2>1. Provider</h2>
      <p>The service is provided under the trading name <strong>{legalOperator.tradingName}</strong> by {legalValue(legalOperator.legalName)}. Registered address: {legalValue(legalOperator.registeredAddress)}. Registration number: {legalValue(legalOperator.registrationNumber)}. VAT/tax number: {legalValue(legalOperator.vatNumber)}. Contact: {legalValue(legalOperator.contactEmail)}.</p>

      <h2>2. Service</h2>
      <p>AI Career OS provides career-planning software, structured learning roadmaps, projects, career intelligence, readiness tools and related digital functionality. Content is informational and educational; it is not a guarantee of employment, salary, promotion, immigration status, certification, admission, or any other outcome.</p>

      <h2>3. Accounts</h2>
      <p>You must provide accurate account information, keep credentials secure, and notify us if you reasonably believe your account has been compromised. You may not misuse the platform, interfere with its security, scrape protected content at scale, or use the service unlawfully.</p>

      <h2>4. Paid plans and order formation</h2>
      <p>Where paid plans are offered, the checkout will identify the service, total price including applicable taxes and mandatory charges, billing frequency, renewal and termination terms, accepted payment methods, and any minimum commitment before you submit an order. A contract is formed only when your order is accepted and a confirmation is provided in a durable format such as email or your account.</p>
      <p>We will not rely on pre-ticked boxes to obtain consent for optional paid extras. Any order button that creates a payment obligation must make that obligation unambiguous.</p>

      <h2>5. Subscriptions</h2>
      <p>If a subscription renews automatically, the renewal interval, recurring price and cancellation method will be shown before purchase. You may cancel future renewals using the account controls or the contact method shown on the site. Cancellation does not remove statutory rights that cannot lawfully be excluded.</p>

      <h2>6. Digital-service withdrawal rights</h2>
      <p>Consumers may have a statutory 14-day withdrawal right for distance contracts. Where you request immediate performance during the withdrawal period, the legal consequences will be explained before purchase. Where the law permits loss of the withdrawal right for digital content or a fully performed service, we will request any legally required express consent and acknowledgement before relying on that exception.</p>

      <h2>7. Refunds and complaints</h2>
      <p>Statutory cancellation, refund and conformity rights are described in the Refunds & Cancellation policy. Complaints may be sent to {legalValue(legalOperator.supportEmail || legalOperator.contactEmail)} or to {legalValue(legalOperator.complaintAddress || legalOperator.registeredAddress)}.</p>

      <h2>8. Intellectual property</h2>
      <p>The platform, original interface, software and original content are protected by applicable intellectual-property laws. Subject to these terms, consumers receive a personal, non-exclusive, non-transferable right to use the service for its intended purpose. Third-party resources remain subject to their own terms.</p>

      <h2>9. AI-generated and third-party information</h2>
      <p>Some features may use automated or AI-assisted processing. Outputs can be incomplete, outdated or incorrect and should be independently verified where decisions carry material consequences. Salary, job-market, learning-resource and career information may originate from third-party sources and can change.</p>

      <h2>10. Availability and changes</h2>
      <p>We may maintain, improve or modify the service. Material changes to a paid service that adversely affect consumers will be handled in accordance with mandatory consumer law. Nothing in these terms excludes liability or rights that cannot legally be excluded.</p>

      <h2>11. Governing law and consumer rights</h2>
      <p>These terms do not deprive EU consumers of mandatory protections available under the law of their habitual residence where those protections apply. Consumers may also use any competent consumer-protection authority, court, or applicable alternative dispute-resolution body.</p>
    </LegalShell>
  );
}
