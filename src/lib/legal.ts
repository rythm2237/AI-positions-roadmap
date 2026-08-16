const VERIFIED_LEGAL_ENTITY_NAME = "Tayyebialashti Yaser e.v.";
const VERIFIED_REGISTERED_ADDRESS = "1143 Budapest, Gizella út 35, Hungary";
const VERIFIED_TAX_NUMBER = "48332376-1-42";

export const legalOperator = {
  legalName: (process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME || VERIFIED_LEGAL_ENTITY_NAME).trim(),
  tradingName: (process.env.NEXT_PUBLIC_TRADING_NAME || "AI Career OS").trim(),
  registeredAddress: (process.env.NEXT_PUBLIC_REGISTERED_ADDRESS || VERIFIED_REGISTERED_ADDRESS).trim(),
  registrationNumber: (process.env.NEXT_PUBLIC_COMPANY_REGISTRATION_NUMBER || "").trim(),
  vatNumber: (process.env.NEXT_PUBLIC_VAT_NUMBER || VERIFIED_TAX_NUMBER).trim(),
  contactEmail: (process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL || "").trim(),
  supportEmail: (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "").trim(),
  phone: (process.env.NEXT_PUBLIC_SUPPORT_PHONE || "").trim(),
  complaintAddress: (process.env.NEXT_PUBLIC_COMPLAINT_ADDRESS || VERIFIED_REGISTERED_ADDRESS).trim(),
  disputeResolutionBody: (process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_BODY || "").trim(),
  disputeResolutionUrl: (process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_URL || "").trim(),
} as const;

export const requiredCommercialLegalFields = [
  ["Legal entity name", legalOperator.legalName],
  ["Registered address", legalOperator.registeredAddress],
  ["Sole-trader registration number (EVNY nyilvántartási szám)", legalOperator.registrationNumber],
  ["Tax / VAT number", legalOperator.vatNumber],
  ["Legal contact email", legalOperator.contactEmail],
] as const;

export const commercialLegalReady = requiredCommercialLegalFields.every(([, value]) => Boolean(value));

export function legalValue(value: string, fallback = "To be published before paid sales open"): string {
  return value || fallback;
}

export const legalLastUpdated = "16 August 2026";
