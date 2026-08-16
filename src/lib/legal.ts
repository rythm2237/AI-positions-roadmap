export const legalOperator = {
  legalName: (process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME || "").trim(),
  tradingName: (process.env.NEXT_PUBLIC_TRADING_NAME || "AI Career OS").trim(),
  registeredAddress: (process.env.NEXT_PUBLIC_REGISTERED_ADDRESS || "").trim(),
  registrationNumber: (process.env.NEXT_PUBLIC_COMPANY_REGISTRATION_NUMBER || "").trim(),
  vatNumber: (process.env.NEXT_PUBLIC_VAT_NUMBER || "").trim(),
  contactEmail: (process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL || "").trim(),
  supportEmail: (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "").trim(),
  phone: (process.env.NEXT_PUBLIC_SUPPORT_PHONE || "").trim(),
  complaintAddress: (process.env.NEXT_PUBLIC_COMPLAINT_ADDRESS || "").trim(),
  disputeResolutionBody: (process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_BODY || "").trim(),
  disputeResolutionUrl: (process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_URL || "").trim(),
} as const;

export const requiredCommercialLegalFields = [
  ["Legal entity name", legalOperator.legalName],
  ["Registered address", legalOperator.registeredAddress],
  ["Company / sole-trader registration number", legalOperator.registrationNumber],
  ["VAT / tax number", legalOperator.vatNumber],
  ["Legal contact email", legalOperator.contactEmail],
] as const;

export const commercialLegalReady = requiredCommercialLegalFields.every(([, value]) => Boolean(value));

export function legalValue(value: string, fallback = "To be published before paid sales open"): string {
  return value || fallback;
}

export const legalLastUpdated = "16 August 2026";
