export function parseProviderPostedAt(value: string | null | undefined, now = new Date()): string | null {
  const text = value?.trim().toLowerCase();
  if (!text) return null;
  if (/^(today|just posted|new)$/.test(text)) return now.toISOString();
  const relative = text.match(/(\d+)\+?\s*(minute|hour|day|week|month)s?\s+ago/);
  if (relative) {
    const amount = Number(relative[1]);
    const unit = relative[2];
    const milliseconds = amount * (unit === "minute" ? 60_000 : unit === "hour" ? 3_600_000 : unit === "day" ? 86_400_000 : unit === "week" ? 604_800_000 : 2_629_800_000);
    return new Date(now.getTime() - milliseconds).toISOString();
  }
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

const amount = (raw: string, suffix: string | undefined) => {
  const value = Number(raw.replace(/[\s,]/g, ""));
  if (!Number.isFinite(value)) return null;
  return value * (suffix?.toLowerCase() === "k" ? 1_000 : suffix?.toLowerCase() === "m" ? 1_000_000 : 1);
};

export function parseProviderAnnualSalary(value: string | null | undefined): { min: number | null; max: number | null; currency: string | null } {
  const text = value?.trim() ?? "";
  if (!text || /\b(?:hour|hourly|day|daily|week|weekly|month|monthly)\b/i.test(text) || (!/\b(?:year|yearly|annual|annum|yr)\b/i.test(text) && !/\b\d{5,}\b/.test(text.replace(/[,\s]/g, "")))) return { min: null, max: null, currency: null };
  const currency = /\b(?:HUF|Ft)\b/i.test(text) ? "HUF" : /\bCHF\b/i.test(text) ? "CHF" : /€|\bEUR\b/i.test(text) ? "EUR" : /£|\bGBP\b/i.test(text) ? "GBP" : /\bCAD\b/i.test(text) ? "CAD" : /\bAUD\b/i.test(text) ? "AUD" : /\bNZD\b/i.test(text) ? "NZD" : /\$|\bUSD\b/i.test(text) ? "USD" : null;
  const matches = [...text.matchAll(/(\d[\d,\s]*(?:\.\d+)?)\s*([kKmM])?/g)].map((match) => amount(match[1], match[2])).filter((entry): entry is number => entry !== null && entry >= 1_000);
  if (!matches.length) return { min: null, max: null, currency };
  return { min: matches[0], max: matches[1] ?? matches[0], currency };
}
