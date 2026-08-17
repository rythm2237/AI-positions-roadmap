import Link from "next/link";
import LegalShell from "@/components/legal/LegalShell";
import { legalLastUpdated, legalOperator, legalValue } from "@/lib/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Refunds & Cancellation",
  description: "Refund, cancellation, conformity, and statutory withdrawal information for AI Career OS consumers.",
  path: "/legal/refunds",
});

export default function RefundsPage() {
  return (
    <LegalShell title="Refunds & Cancellation" intro={`Last updated: ${legalLastUpdated}. This policy is intended to preserve statutory EU consumer rights for distance contracts.`}>
      <h2>14-day withdrawal right</h2>
      <p>Where EU consumer law grants a right of withdrawal for a distance contract, you may normally withdraw within 14 days without giving a reason. For services, the period generally runs from conclusion of the contract. The checkout and order confirmation must state the applicable right and any lawful exception.</p>

      <h2>Immediate performance and digital content</h2>
      <p>If you ask us to begin performing a service during the withdrawal period, you may be required to pay a proportionate amount for service already supplied where the law allows it and the required request/information has been provided. For digital content not supplied on a tangible medium, loss of the withdrawal right will only be relied on where the legally required prior express consent and acknowledgement have been obtained.</p>

      <h2>Refund timing</h2>
      <p>Where a statutory withdrawal requires reimbursement, the refund will be made without undue delay and no later than the applicable legal deadline, generally 14 days after we are informed of the withdrawal, using the original payment method unless another method is expressly agreed and does not cause fees to the consumer.</p>

      <h2>Subscription cancellation</h2>
      <p>Cancellation of a subscription stops future renewals according to the billing terms shown at purchase. It is distinct from any statutory withdrawal, conformity, refund or complaint right. The applicable access period after cancellation will be stated in the checkout and account interface.</p>

      <h2>Faulty or non-conforming digital service</h2>
      <p>Nothing in this policy limits mandatory remedies for a digital service or digital content that does not conform to the contract. Depending on applicable law and the circumstances, consumers may have rights to have conformity restored, receive a price reduction, terminate the contract, or obtain another statutory remedy.</p>

      <h2>How to withdraw or complain</h2>
      <p>Use the <Link href="/legal/withdraw">online withdrawal function</Link> or contact {legalValue(legalOperator.supportEmail || legalOperator.contactEmail)}. Complaints may also be sent to {legalValue(legalOperator.complaintAddress || legalOperator.registeredAddress)}.</p>
    </LegalShell>
  );
}
