export type SourcePageIdentity = {
  title: string | null;
  company: string | null;
  location: string | null;
};

const decodeHtml = (value: string) => value
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">");

const visibleText = (value: string) => decodeHtml(value)
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

function tagTexts(html: string, tag: string) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))]
    .map((match) => visibleText(match[1]))
    .filter(Boolean);
}

export function sourceCompanyMatchesHost(company: string, finalUrl: string) {
  try {
    const host = new URL(finalUrl).hostname.toLowerCase().replace(/^www\./, "");
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    return normalize(company) === normalize(host) || normalize(company) === normalize(host.split(".")[0]);
  } catch {
    return false;
  }
}

export function extractSourcePageIdentity(html: string, finalUrl: string): SourcePageIdentity {
  let hostname = "";
  try { hostname = new URL(finalUrl).hostname.toLowerCase().replace(/^www\./, ""); }
  catch { return { title: null, company: null, location: null }; }

  // Experteer renders one canonical vacancy with an explicit H1, employer link and
  // location paragraph even when it does not publish JobPosting JSON-LD.
  if (hostname === "experteer.fr" || hostname.endsWith(".experteer.fr")) {
    const companyLinks = [...html.matchAll(/<a\b[^>]*href=["'][^"']*\/career\/company\/[^"']+["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map((match) => visibleText(match[1]))
      .filter(Boolean);
    const location = tagTexts(html, "p").find((text) => /\b(?:France|Frankreich)\b/i.test(text) && /[,–-]/.test(text)) ?? null;
    return {
      title: tagTexts(html, "h1")[0] ?? null,
      company: companyLinks[0] ?? null,
      location,
    };
  }

  return { title: null, company: null, location: null };
}
