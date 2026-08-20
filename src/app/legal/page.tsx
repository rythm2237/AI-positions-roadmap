import Link from "next/link";
import LegalShell from "@/components/legal/LegalShell";
import {
  legalIdentityReady,
  legalLastUpdated,
  legalOperator,
  legalValue,
  paidCheckoutReady,
  paidCheckoutReleaseGate,
  requiredLegalIdentityFields,
} from "@/lib/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Legal & Consumer Information",
  description: "Legal, privacy, cookie, cancellation, refund, and consumer-rights information for AI Role Path.",
  path: "/legal",
});

export default function LegalHubPage() {
  const pendingCheckoutItems = [
    ["Business activity verified for this digital service", paidCheckoutReleaseGate.businessActivityVerified],
    ["Tax, VAT/OSS and invoicing treatment verified", paidCheckoutReleaseGate.taxAndInvoicingVerified],
    ["Pricing and payment terms finalized", paidCheckoutReleaseGate.pricingAndPaymentTermsFinal],
    ["Compliant paid checkout implemented and tested", paidCheckoutReleaseGate.checkoutComplianceImplemented],
  ] as const;

  return (
    <LegalShell title="Legal & Consumer Information" intro={`Last updated: ${legalLastUpdated}. This section is designed for EU/Hungary-facing B2C operation and online payments.`}>
      <h2>Commercial operator</h2>
      <dl>
        <div><dt><strong>Trading name</strong></dt><dd>{legalOperator.tradingName}</dd></div>
        <div><dt><strong>Legal provider</strong></dt><dd>{legalValue(legalOperator.legalName)}</dd></div>
        <div><dt><strong>Registered address</strong></dt><dd>{legalValue(legalOperator.registeredAddress)}</dd></div>
        <div><dt><strong>EVNY registration number</strong></dt><dd>{legalValue(legalOperator.registrationNumber)}</dd></div>
        <div><dt><strong>Hungarian tax number (adószám)</strong></dt><dd>{legalValue(legalOperator.vatNumber)}</dd></div>
        <div><dt><strong>Legal / privacy contact</strong></dt><dd><a href={`mailto:${legalOperator.contactEmail}`}>{legalOperator.contactEmail}</a></dd></div>
        <div><dt><strong>Customer support</strong></dt><dd><a href={`mailto:${legalOperator.supportEmail}`}>{legalOperator.supportEmail}</a></dd></div>
        <div><dt><strong>Billing contact</strong></dt><dd><a href={`mailto:${legalOperator.billingEmail}`}>{legalOperator.billingEmail}</a></dd></div>
      </dl>

      <div className={`not-prose my-7 rounded-2xl border p-5 text-sm leading-6 ${legalIdentityReady ? "border-emerald-300/25 bg-emerald-300/[0.07] text-emerald-100" : "border-amber-300/25 bg-amber-300/[0.07] text-amber-100"}`}>
        <strong>Legal identity readiness:</strong> {legalIdentityReady ? "complete." : "incomplete."}
        {!legalIdentityReady ? (
          <ul className="mt-3 list-disc pl-5">
            {requiredLegalIdentityFields.filter(([, value]) => !value).map(([label]) => <li key={label}>{label}</li>)}
          </ul>
        ) : null}
      </div>

      <h2>Complaints and alternative dispute resolution</h2>
      <p>Complaints may be sent to <a href={`mailto:${legalOperator.supportEmail}`}>{legalOperator.supportEmail}</a> or to the registered address above. Consumers may also contact the competent alternative dispute-resolution body:</p>
      <dl>
        <div><dt><strong>Body</strong></dt><dd>{legalOperator.disputeResolutionBody}</dd></div>
        <div><dt><strong>Address</strong></dt><dd>{legalOperator.disputeResolutionAddress}</dd></div>
        <div><dt><strong>Postal address</strong></dt><dd>{legalOperator.disputeResolutionPostalAddress}</dd></div>
        <div><dt><strong>Email</strong></dt><dd>{legalOperator.disputeResolutionEmail}</dd></div>
        <div><dt><strong>Phone</strong></dt><dd>{legalOperator.disputeResolutionPhone}</dd></div>
        <div><dt><strong>Website</strong></dt><dd><a href={legalOperator.disputeResolutionUrl} target="_blank" rel="noreferrer">Budapest Conciliation Board contact page</a></dd></div>
      </dl>
      <p>The former EU Online Dispute Resolution (ODR) platform is not presented as a dispute channel because it has been discontinued.</p>

      <h2>Policies and consumer controls</h2>
      <ul>
        <li><Link href="/legal/terms">Terms of Service and paid-contract terms</Link></li>
        <li><Link href="/legal/privacy">Privacy Notice</Link></li>
        <li><Link href="/legal/cookies">Cookie Notice and consent choices</Link></li>
        <li><Link href="/legal/refunds">Refund, cancellation and 14-day withdrawal information</Link></li>
        <li><Link href="/data-requests">Personal-data request guidance</Link></li>
        <li><Link href="/legal/withdraw">Online contract-withdrawal function</Link></li>
      </ul>

      <h2>Paid checkout release gate</h2>
      <p>Legal identity and consumer-policy foundations can be complete before paid sales are enabled. Paid checkout remains blocked until the commercial and tax configuration below is finalized.</p>
      <div className={`not-prose my-7 rounded-2xl border p-5 text-sm leading-6 ${paidCheckoutReady ? "border-emerald-300/25 bg-emerald-300/[0.07] text-emerald-100" : "border-amber-300/25 bg-amber-300/[0.07] text-amber-100"}`}>
        <strong>Paid checkout readiness:</strong> {paidCheckoutReady ? "ready." : "not yet ready."}
        <ul className="mt-3 list-disc pl-5">
          {pendingCheckoutItems.map(([label, complete]) => <li key={label}>{complete ? "Complete — " : "Pending — "}{label}</li>)}
        </ul>
      </div>

      <p>When paid sales open, checkout must show the main characteristics of the service, total payable price including applicable taxes and mandatory charges, payment timing, any later optional stage price, billing/renewal terms where relevant, accepted payment methods, withdrawal information, and an unambiguous payment-obligation button before the order is submitted.</p>
    </LegalShell>
  );
}
