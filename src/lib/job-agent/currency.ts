const countryCurrency: Record<string, string> = {
  austria: "EUR",
  belgium: "EUR",
  bulgaria: "BGN",
  croatia: "EUR",
  cyprus: "EUR",
  czechia: "CZK",
  "czech republic": "CZK",
  denmark: "DKK",
  estonia: "EUR",
  finland: "EUR",
  france: "EUR",
  germany: "EUR",
  greece: "EUR",
  hungary: "HUF",
  ireland: "EUR",
  italy: "EUR",
  latvia: "EUR",
  lithuania: "EUR",
  luxembourg: "EUR",
  malta: "EUR",
  netherlands: "EUR",
  norway: "NOK",
  poland: "PLN",
  portugal: "EUR",
  romania: "RON",
  slovakia: "EUR",
  slovenia: "EUR",
  spain: "EUR",
  sweden: "SEK",
  switzerland: "CHF",
  "united kingdom": "GBP",
  uk: "GBP",
  "united states": "USD",
  usa: "USD",
  canada: "CAD",
  australia: "AUD",
  "new zealand": "NZD",
};

export function currencyForCountry(country: string): string | null {
  return countryCurrency[country.trim().toLowerCase()] ?? null;
}

export function inferSearchCurrency(countries: string[]): string | null {
  const currencies = [...new Set(countries.map(currencyForCountry).filter((value): value is string => Boolean(value)))];
  if (!countries.length || currencies.length !== 1) return null;
  return currencies[0];
}
