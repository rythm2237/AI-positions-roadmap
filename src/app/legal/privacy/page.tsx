import LegalShell from "@/components/legal/LegalShell";
import { legalLastUpdated, legalOperator } from "@/lib/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Notice",
  description: "Privacy notice explaining how AI Role Path processes personal data.",
  path: "/legal/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Notice" intro={`Last updated: ${legalLastUpdated}. This notice explains how personal data may be processed when you use AI Role Path.`}>
      <h2>1. Controller</h2>
      <p>Data controller: {legalOperator.legalName}, trading as {legalOperator.tradingName}. Registered address: {legalOperator.registeredAddress}. EVNY registration number: {legalOperator.registrationNumber}. Hungarian tax number: {legalOperator.vatNumber}. Privacy contact: <a href={`mailto:${legalOperator.contactEmail}`}>{legalOperator.contactEmail}</a>.</p>

      <h2>2. Data we may process</h2>
      <ul>
        <li>Account and identity data, such as name, email address, authentication identifiers and account settings.</li>
        <li>Career-profile and product-use data, including selected careers, progress, projects, preferences and saved activity.</li>
        <li>Transaction and billing metadata when paid services are activated. Full payment-card details should be handled by the payment provider rather than stored by AI Role Path.</li>
        <li>Support, complaint and withdrawal-request communications.</li>
        <li>Security and technical data such as IP address, device/browser information, logs and fraud-prevention signals.</li>
        <li>Optional analytics data only where the required consent has been given.</li>
      </ul>

      <h2>3. Purposes and legal bases</h2>
      <ul>
        <li><strong>Contract:</strong> create accounts, provide the service, preserve progress, process purchases and provide customer support.</li>
        <li><strong>Legal obligation:</strong> accounting, tax, consumer-rights, complaint-handling and other statutory recordkeeping.</li>
        <li><strong>Legitimate interests:</strong> service security, abuse prevention, reliability and limited operational analytics where permitted and balanced against user rights.</li>
        <li><strong>Consent:</strong> non-essential cookies/analytics and any marketing activity that legally requires consent. Consent may be withdrawn without affecting prior lawful processing.</li>
      </ul>

      <h2>4. Processors and recipients</h2>
      <p>Personal data may be processed by service providers required to operate the platform, such as hosting/infrastructure providers, authentication and database providers, email providers, payment processors once enabled, analytics providers where consented to, and AI/service providers where a feature requires them. Access should be limited to what is necessary for the relevant service.</p>

      <h2>5. International transfers</h2>
      <p>Where personal data is transferred outside the EEA, the transfer must rely on a valid legal mechanism such as an adequacy decision, Standard Contractual Clauses, or another mechanism permitted by applicable data-protection law, together with supplementary safeguards where required.</p>

      <h2>6. Retention</h2>
      <p>Data is retained only for as long as necessary for the purpose for which it was collected, including the lifetime of an account, applicable limitation periods, security needs, and statutory tax/accounting or consumer-protection retention duties. Retention periods should be documented internally and reviewed when paid sales are activated.</p>

      <h2>7. Your rights</h2>
      <p>Depending on the circumstances, you may have rights of access, rectification, erasure, restriction, portability, objection, and withdrawal of consent. Requests can be sent to <a href={`mailto:${legalOperator.contactEmail}`}>{legalOperator.contactEmail}</a>. Identity verification may be requested where reasonably necessary to protect account data.</p>

      <h2>8. Supervisory authority</h2>
      <p>You may lodge a complaint with the Hungarian supervisory authority: Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH), 1055 Budapest, Falk Miksa utca 9-11; postal address 1363 Budapest, Pf. 9; email ugyfelszolgalat@naih.hu; telephone +36 1 391 1400.</p>

      <h2>9. Automated processing and AI</h2>
      <p>AI Role Path may use automation to generate recommendations, summaries or career guidance. Unless explicitly stated otherwise for a specific feature, the service is not intended to make solely automated decisions producing legal or similarly significant effects about a user.</p>

      <h2>10. Children</h2>
      <p>The paid consumer service is not intended to be marketed to children without an appropriate age and consent framework. Before intentionally offering services to minors, age-assurance, parental-consent and child-privacy requirements must be separately implemented.</p>

      <h2>11. Security and breaches</h2>
      <p>Reasonable technical and organisational safeguards are used to protect personal data. No internet service can guarantee absolute security. Personal-data breaches are assessed and, where required, reported to the competent authority and affected individuals within the deadlines set by applicable law.</p>
    </LegalShell>
  );
}
