/** Canonicalize country identifiers when verifying an external vacancy. */
const aliases: Record<string, string> = {
  de: "germany", deu: "germany", deutschland: "germany", germany: "germany", allemagne: "germany",
  ie: "ireland", irl: "ireland", ireland: "ireland", irland: "ireland",
  gb: "united kingdom", uk: "united kingdom", gbr: "united kingdom", "united kingdom": "united kingdom",
  at: "austria", aut: "austria", austria: "austria", osterreich: "austria",
  nl: "netherlands", nld: "netherlands", netherlands: "netherlands", holland: "netherlands",
  fr: "france", fra: "france", france: "france",
  hu: "hungary", hun: "hungary", hungary: "hungary", magyarorszag: "hungary",
  be: "belgium", bel: "belgium", belgium: "belgium",
  ch: "switzerland", che: "switzerland", switzerland: "switzerland", schweiz: "switzerland",
  es: "spain", esp: "spain", spain: "spain", espana: "spain",
  pt: "portugal", prt: "portugal", portugal: "portugal",
  pl: "poland", pol: "poland", poland: "poland",
};
export function canonicalCountry(value: string | null | undefined): string {
  const normalized = (value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
  return aliases[normalized] ?? normalized;
}
export function countryMetadataConflicts(existing: string | null | undefined, verified: string | null | undefined): boolean {
  if (!existing || !verified) return false;
  const a = canonicalCountry(existing);
  const b = canonicalCountry(verified);
  return Boolean(a && b && a !== b);
}
