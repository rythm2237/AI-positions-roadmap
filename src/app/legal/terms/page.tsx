import LegalShell from "@/components/legal/LegalShell";
import { legalLastUpdated, legalOperator, legalValue } from "@/lib/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description: "Terms governing consumer use of AI Career OS and its paid digital services.",
  path: "/legal/terms",
});

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" intro={`Last updated: ${legalLastUpdated}. These terms govern consumer use of AI Career OS and any paid digital service offered through the platform.`}>
      <h2>1. Provider</h2>
      <p>The service is provided under the trading name <strong>{legalOperator.tradingName}</strong> by {legalValue(legalOperator.legalName)}. Registered address: {legalValue(legalOperator.registeredAddress)}. EVNY registration number: {legalValue(legalOperator.registrationNumber)}. Hungarian tax number: {legalValue(legalOperator.vatNumber)}. Legal/privacy contact: {legalOperator.contactEmail}. Customer support: {legalOperator.supportEmail}. Billing: {legalOperator.billingEmail}.</p>

      <h2>2. Service</h2>
      <p>AI Career OS provides career-planning software, structured learning roadmaps, projects, career intelligence, readiness tools and related digital functionality. Content is informational and educational; it is not a guarantee of employment, salary, promotion, immigration status, certification, admission, or any other outcome.</p>

      <h2>3. Accounts</h2>
      <p>You must provide accurate account information, keep credentials secure, and notify us if you reasonably believe your account has been compromised. You may not misuse the platform, interfere with its security, scrape protected content at scale, or use the service unlawfully.</p>

      <h2>4. Paid plans, progressive pricing and order formation</h2>
      <p>Where paid plans are offered, checkout will identify the service, the amount payable at that checkout, applicable taxes and mandatory charges, payment timing, billing frequency where relevant, renewal and termination terms, accepted payment methods, and any minimum commitment before you submit an order. A contract is formed only when your order is accepted and a confirmation is provided in a durable format such as email or your account.</p>
      <p>AI Career OS may use a progress-based commercial model in which an initial stage is purchased first and a later Application-Ready or comparable stage is offered separately after objective progress criteria are met. Unless the checkout expressly states otherwise, a later-stage price is not a debt created by the initial purchase: the consumer chooses whether to buy and unlock that later stage. Any displayed full-journey figure must not obscure the amount currently payable or imply a discount that does not exist.</p>
      <p>We will not rely on pre-ticked boxes to obtain consent for optional paid extras. Any order button that creates a payment obligation must make that obligation unambiguous.</p>

      <h2>5. Progress and readiness criteria</h2>
      <p>Where access to a later paid stage depends on progress, the relevant criteria will be described in the product interface. Criteria may include completion of mandatory roadmap milestones, required projects, portfolio evidence, assessments, and other stated prerequisites. Reaching a readiness state does not guarantee employment and does not itself trigger an automatic payment unless the checkout expressly and lawfully establishes such an obligation.</p>

      <h2>6. Subscriptions</h2>
      <p>If a subscription renews automatically, the renewal interval, recurring price and cancellation method will be shown before purchase. You may cancel future renewals using the account controls or the contact method shown on the site. Cancellation does not remove statutory rights that cannot lawfully be excluded.</p>

      <h2>7. Digital-service withdrawal rights</h2>
      <p>Consumers may have a statutory 14-day withdrawal right for distance contracts. Where you request immediate performance during the withdrawal period, the legal consequences will be explained before purchase. Where the law permits loss of the withdrawal right for digital content or a fully performed service, we will request any legally required express consent and acknowledgement before relying on that exception.</p>

      <h2>8. Refunds and complaints</h2>
      <p>Statutory cancellation, refund and conformity rights are described in the Refunds & Cancellation policy. Complaints may be sent to {legalOperator.supportEmail} or to {legalOperator.complaintAddress}.</p>

      <h2>9. Alternative dispute resolution</h2>
      <p>Consumers may contact {legalOperator.disputeResolutionBody}. Address: {legalOperator.disputeResolutionAddress}. Postal address: {legalOperator.disputeResolutionPostalAddress}. Email: {legalOperator.disputeResolutionEmail}. Phone: {legalOperator.disputeResolutionPhone}. Website: {legalOperator.disputeResolutionUrl}.</p>

      <h2>10. Intellectual property</h2>
      <p>The platform, original interface, software and original content are protected by applicable intellectual-property laws. Subject to these terms, consumers receive a personal, non-exclusive, non-transferable right to use the service for its intended purpose. Third-party resources remain subject to their own terms.</p>

      <h2>11. AI-generated and third-party information</h2>
      <p>Some features may use automated or AI-assisted processing. Outputs can be incomplete, outdated or incorrect and should be independently verified where decisions carry material consequences. Salary, job-market, learning-resource and career information may originate from third-party sources and can change.</p>

      <h2>12. Availability and changes</h2>
      <p>We may maintain, improve or modify the service. Material changes to a paid service that adversely affect consumers will be handled in accordance with mandatory consumer law. Nothing in these terms excludes liability or rights that cannot legally be excluded.</p>

      <h2>13. Governing law and consumer rights</h2>
      <p>These terms do not deprive EU consumers of mandatory protections available under the law of their habitual residence where those protections apply. Consumers may also use any competent consumer-protection authority, court, or applicable alternative dispute-resolution body.</p>
    </LegalShell>
  );
}
