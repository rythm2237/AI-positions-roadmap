const VERIFIED_LEGAL_ENTITY_NAME = "Tayyebialashti Yaser e.v.";
const VERIFIED_REGISTERED_ADDRESS = "1143 Budapest, Gizella út 35, Hungary";
const VERIFIED_TAX_NUMBER = "48332376-1-42";
const VERIFIED_REGISTRATION_NUMBER = "58642889";
const VERIFIED_LEGAL_EMAIL = "career-legal@rythm-os.com";
const VERIFIED_SUPPORT_EMAIL = "career-support@rythm-os.com";
const VERIFIED_BILLING_EMAIL = "career-billing@rythm-os.com";
const VERIFIED_ADR_BODY = "Budapesti Békéltető Testület (Budapest Conciliation Board)";
const VERIFIED_ADR_ADDRESS = "1016 Budapest, Krisztina krt. 99. I. em. 111., Hungary";
const VERIFIED_ADR_POSTAL_ADDRESS = "1253 Budapest, Pf. 10., Hungary";
const VERIFIED_ADR_EMAIL = "bekelteto.testulet@bkik.hu";
const VERIFIED_ADR_PHONE = "+36 1 488 2131";
const VERIFIED_ADR_URL = "https://bekeltet.bkik.hu/elerhetosegek";

export const legalOperator = {
  legalName: (process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME || VERIFIED_LEGAL_ENTITY_NAME).trim(),
  tradingName: (process.env.NEXT_PUBLIC_TRADING_NAME || "AI Career OS").trim(),
  registeredAddress: (process.env.NEXT_PUBLIC_REGISTERED_ADDRESS || VERIFIED_REGISTERED_ADDRESS).trim(),
  registrationNumber: (process.env.NEXT_PUBLIC_COMPANY_REGISTRATION_NUMBER || VERIFIED_REGISTRATION_NUMBER).trim(),
  vatNumber: (process.env.NEXT_PUBLIC_VAT_NUMBER || VERIFIED_TAX_NUMBER).trim(),
  contactEmail: (process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL || VERIFIED_LEGAL_EMAIL).trim(),
  supportEmail: (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || VERIFIED_SUPPORT_EMAIL).trim(),
  billingEmail: (process.env.NEXT_PUBLIC_BILLING_EMAIL || VERIFIED_BILLING_EMAIL).trim(),
  phone: (process.env.NEXT_PUBLIC_SUPPORT_PHONE || "").trim(),
  complaintAddress: (process.env.NEXT_PUBLIC_COMPLAINT_ADDRESS || VERIFIED_REGISTERED_ADDRESS).trim(),
  disputeResolutionBody: (process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_BODY || VERIFIED_ADR_BODY).trim(),
  disputeResolutionAddress: (process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS || VERIFIED_ADR_ADDRESS).trim(),
  disputeResolutionPostalAddress: (process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_POSTAL_ADDRESS || VERIFIED_ADR_POSTAL_ADDRESS).trim(),
  disputeResolutionEmail: (process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_EMAIL || VERIFIED_ADR_EMAIL).trim(),
  disputeResolutionPhone: (process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_PHONE || VERIFIED_ADR_PHONE).trim(),
  disputeResolutionUrl: (process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_URL || VERIFIED_ADR_URL).trim(),
} as const;

export const requiredLegalIdentityFields = [
  ["Legal entity name", legalOperator.legalName],
  ["Registered address", legalOperator.registeredAddress],
  ["Sole-trader registration number (EVNY nyilvántartási szám)", legalOperator.registrationNumber],
  ["Hungarian tax number (adószám)", legalOperator.vatNumber],
  ["Legal contact email", legalOperator.contactEmail],
  ["Customer support email", legalOperator.supportEmail],
  ["Alternative dispute-resolution body", legalOperator.disputeResolutionBody],
] as const;

export const legalIdentityReady = requiredLegalIdentityFields.every(([, value]) => Boolean(value));

// Paid checkout remains a separate release gate. Legal identity can be complete while
// pricing, tax treatment, invoicing, checkout disclosures, and payment-provider setup
// are still pending final commercial configuration.
export const paidCheckoutReleaseGate = {
  legalIdentityReady,
  businessActivityVerified: false,
  taxAndInvoicingVerified: false,
  pricingAndPaymentTermsFinal: false,
  checkoutComplianceImplemented: false,
} as const;

export const paidCheckoutReady = Object.values(paidCheckoutReleaseGate).every(Boolean);

export function legalValue(value: string, fallback = "To be published before paid sales open"): string {
  return value || fallback;
}

export const legalLastUpdated = "16 August 2026";
