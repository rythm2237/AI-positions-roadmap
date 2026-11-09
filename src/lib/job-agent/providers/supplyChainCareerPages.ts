export type ListingJob = { id: string; title: string; location: string; url: string; description?: string };
type LinkBoard = {
  company: string; careerUrl: string; path: RegExp; title?: RegExp; fixedCountry?: string; countryFromPath?: boolean;
};

export const supplyChainLinkBoards: LinkBoard[] = [
  { company: "GEODIS", careerUrl: "https://injob.geodis.com/offre-de-emploi/liste-toutes-offres.aspx?changefacet=1&facet_JobCountry=12880&facet_JobGeographicalArea=-12853&mode=list", path: /^\/offre-de-emploi\/emploi-[^/]+_(\d+)\.aspx$/, fixedCountry: "France" },
  { company: "DFDS Logistics", careerUrl: "https://dfdsgermany.teamtailor.com/jobs", path: /^\/jobs\/(\d+)-/, title: /<span[^>]*class="[^"]*text-block-base-link[^"]*"[^>]*>([\s\S]*?)<\/span>/i, fixedCountry: "Germany" },
  { company: "FIEGE", careerUrl: "https://karriere.fiege.com/standorte/landesweit", path: /^\/offer-redirect\/$/, fixedCountry: "Germany" },
  { company: "Militzer & Münch", careerUrl: "https://mumnet.mana-jobs.de/widgets/732", path: /^\/(\d+)-/, title: /<div class="text-2xl">([\s\S]*?)<\/div>/i, fixedCountry: "Germany" },
  { company: "Picnic", careerUrl: "https://jobs.picnic.app/en/jobs", path: /^\/(?:en\/vacancies|de\/jobangebot|fr\/offres|nl\/vacatures)\/([A-Z0-9]{8})\//, title: /<h4[^>]*>([\s\S]*?)<\/h4>/i, countryFromPath: true },
  { company: "Tesco", careerUrl: "https://apply.tesco-careers.com/v2/job/search/", path: /^\/members\/modules\/job\/detail\.php$/, fixedCountry: "United Kingdom" },
  { company: "REWE Group", careerUrl: "https://jobs.rewe-group.com/jobs/suchen", path: /^\/jobs\/[^/]+\/([^/]+)\/[^/]+\.html$/, title: /<p class="job-search__item-label">([\s\S]*?)<\/p>/i, fixedCountry: "Germany" },
  { company: "EDEKA", careerUrl: "https://verbund.edeka/karriere/stellenboerse/", path: /^\/karriere\/stellenboerse\/stelle-[^/]+\/$/, fixedCountry: "Germany" },
  { company: "Auchan", careerUrl: "https://auchan-jobs.lu/", path: /^\/offer\/c\/([a-f\d]+)$/, fixedCountry: "Luxembourg" },
];

const entities: Record<string, string> = { amp: "&", nbsp: " ", quot: '"', apos: "'", lt: "<", gt: ">", middot: "·" };
export function decodeListingHtml(value: string) {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, key: string) => {
    if (!key.startsWith("#")) return entities[key] ?? entity;
    const code = key[1].toLowerCase() === "x" ? Number.parseInt(key.slice(2), 16) : Number(key.slice(1));
    return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  });
}

export function listingText(value: string) {
  return decodeListingHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

export function parseCareerPageLinks(html: string, source: LinkBoard): ListingJob[] {
  const officialHost = source.company === "Auchan" ? "app.skeeled.com" : new URL(source.careerUrl).hostname;
  const jobs = new Map<string, ListingJob>();
  for (const [, href, content] of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let url: URL;
    try { url = new URL(decodeListingHtml(href), source.careerUrl); } catch { continue; }
    if (url.protocol !== "https:" || url.hostname !== officialHost) continue;
    const match = url.pathname.match(source.path);
    if (!match) continue;
    const id = match[1] ?? url.searchParams.get("offerApiId") ?? url.searchParams.get("record") ?? url.searchParams.get("id");
    const rawTitle = source.title ? content.match(source.title)?.[1] : content;
    const title = rawTitle ? listingText(rawTitle) : "";
    if (!id || title.length < 4 || title.length > 165 || /^(?:view|apply|details|initiativbewerbung|more details)\b/i.test(title) || jobs.has(id)) continue;
    const country = source.fixedCountry ?? (source.countryFromPath ? url.pathname.split("/").at(-1)?.replaceAll("-", " ") : "");
    if (country) jobs.set(id, { id, title, location: country, url: url.href });
  }
  return [...jobs.values()];
}

export function parseInterrollListings(html: string, origin: string): ListingJob[] {
  const jobs: ListingJob[] = [];
  for (const [, id, country, city, content] of html.matchAll(/<div id="(\d+)" class="quick js-job-offer" data-country="([^"]+)" data-location="([^"]*)"[^>]*>([\s\S]*?)(?=<div id="\d+" class="quick js-job-offer"|$)/gi)) {
    const title = content.match(/<h3>([\s\S]*?)<\/h3>/i)?.[1];
    const path = content.match(/href="(\/careers\/jobs\/job-detail\/[a-z\d-]+)"/i)?.[1];
    if (title && path) jobs.push({ id, title: listingText(title), location: `${listingText(city)}, ${listingText(country)}`, url: origin + path });
  }
  return jobs;
}

export function parseTgwListings(html: string, origin: string): ListingJob[] {
  const jobs: ListingJob[] = [];
  for (const [, path, body] of html.matchAll(/<a\b[^>]*href="((?:https:\/\/www\.tgw-group\.com)?\/[^"<>]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    if (!body.includes('class="jobListWrapper"')) continue;
    const fields = [...body.matchAll(/<div class="jobListPart[^"]*">([\s\S]*?)<\/div>/gi)].map((item) => listingText(item[1]));
    const url = new URL(path, origin);
    if (fields[0] && fields[1] && url.origin === origin && /^\/en\/career\/jobs\/detail\//.test(url.pathname)) {
      const country = url.pathname.includes("/detail/") ? body.match(/data-country="([^"]+)"/i)?.[1] : undefined;
      jobs.push({ id: url.pathname, title: fields[0], location: [fields[1], country].filter(Boolean).join(", "), url: url.href });
    }
  }
  return jobs;
}

type PhenomJob = { jobSeqNo?: string; title?: string; country?: string; cityStateCountry?: string; businessUnit?: string; descriptionTeaser?: string };
export function parsePhenomListings(html: string, origin: string): ListingJob[] {
  const marker = /"eagerLoadRefineSearch"\s*:\s*(?=\{)/.exec(html);
  if (!marker) throw new Error("UNRECOGNIZED_LISTING");
  const start = marker.index + marker[0].length;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = start;
  for (; end < html.length; end++) {
    const char = html[end];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) break;
  }
  const payload = JSON.parse(html.slice(start, end + 1)) as { data?: { jobs?: PhenomJob[] } };
  const rows = payload.data?.jobs;
  if (!Array.isArray(rows)) throw new Error("UNRECOGNIZED_LISTING");
  return rows.flatMap((row) => row.jobSeqNo && /^[a-z0-9_-]+$/i.test(row.jobSeqNo) && row.title && row.country
    ? [{ id: row.jobSeqNo, title: row.title, location: row.cityStateCountry ?? row.country,
        url: `${origin}/global/en/job/${row.jobSeqNo}` }] : []);
}
