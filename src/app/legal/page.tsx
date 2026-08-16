import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/legal/LegalShell";
import { commercialLegalReady, legalLastUpdated, legalOperator, legalValue, requiredCommercialLegalFields } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Legal & Consumer Information",
  description: "Legal, privacy, cookie, cancellation, refund, and consumer-rights information for AI Career OS.",
};

export default function LegalHubPage() {
  return (
    <LegalShell title="Legal & Consumer Information" intro={`Last updated: ${legalLastUpdated}. This section is designed for EU/Hungary-facing B2C operation and online payments.`}>
      <h2>Commercial operator</h2>
      <dl>
        <div><dt><strong>Trading name</strong></dt><dd>{legalOperator.tradingName}</dd></div>
        <div><dt><strong>Legal entity</strong></dt><dd>{legalValue(legalOperator.legalName)}</dd></div>
        <div><dt><strong>Registered address</strong></dt><dd>{legalValue(legalOperator.registeredAddress)}</dd></div>
        <div><dt><strong>Registration number</strong></dt><dd>{legalValue(legalOperator.registrationNumber)}</dd></div>
        <div><dt><strong>VAT / tax number</strong></dt><dd>{legalValue(legalOperator.vatNumber)}</dd></div>
        <div><dt><strong>Legal contact</strong></dt><dd>{legalValue(legalOperator.contactEmail)}</dd></div>
      </dl>

      {!commercialLegalReady ? (
        <div className="not-prose my-7 rounded-2xl border border-amber-300/25 bg-amber-300/[0.07] p-5 text-sm leading-6 text-amber-100">
          <strong>Paid sales readiness:</strong> incomplete. AI Career OS must not activate a paid checkout until the required operator fields below are populated with verified business data.
          <ul className="mt-3 list-disc pl-5 text-amber-100/80">
            {requiredCommercialLegalFields.filter(([, value]) => !value).map(([label]) => <li key={label}>{label}</li>)}
          </ul>
        </div>
      ) : null}

      <h2>Policies and consumer controls</h2>
      <ul>
        <li><Link href="/legal/terms">Terms of Service and paid-contract terms</Link></li>
        <li><Link href="/legal/privacy">Privacy Notice</Link></li>
        <li><Link href="/legal/cookies">Cookie Notice and consent choices</Link></li>
        <li><Link href="/legal/refunds">Refund, cancellation and 14-day withdrawal information</Link></li>
        <li><Link href="/legal/withdraw">Online contract-withdrawal function</Link></li>
      </ul>

      <h2>Important status</h2>
      <p>The public beta may be used without a paid purchase unless and until pricing and checkout are explicitly activated. When paid sales open, the checkout must show the product or service characteristics, total price including taxes and mandatory charges, billing period, renewal/termination terms where relevant, accepted payment methods, and an unambiguous payment-obligation button before the order is submitted.</p>
    </LegalShell>
  );
}
