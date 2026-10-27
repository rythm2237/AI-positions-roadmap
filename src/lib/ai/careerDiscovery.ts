import { CAREER_TITLE_ALIASES } from "@/data/careerTitleAliases";
import { AVAILABLE_CAREERS } from "@/data/careerCatalog";

export type CareerCandidate = {
  slug: string;
  title: string;
  aliases: string[];
  href: string;
  source: "published" | "built-in";
};

export function normalizeCareerTitle(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function careerSlugForTitle(value: string) {
  return normalizeCareerTitle(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function canonicalizeCareerCandidates(candidates: CareerCandidate[]) {
  const bySlug = new Map<string, CareerCandidate>();
  for (const candidate of candidates) {
    if (!candidate.slug || !candidate.title) continue;
    const previous = bySlug.get(candidate.slug);
    bySlug.set(candidate.slug, {
      ...candidate,
      aliases: [...new Set([...(previous?.aliases ?? []), ...candidate.aliases].filter(Boolean))],
      source: previous?.source === "published" || candidate.source === "published" ? "published" : "built-in",
    });
  }
  return [...bySlug.values()];
}

export function exactCareerMatches(query: string, candidates: CareerCandidate[]) {
  const normalized = normalizeCareerTitle(query);
  if (!normalized) return [];
  const canonical = candidates.filter((candidate) => normalizeCareerTitle(candidate.title) === normalized);
  if (canonical.length) return canonical;
  return candidates.filter((candidate) => candidate.aliases.some((alias) => normalizeCareerTitle(alias) === normalized));
}

function tokens(value: string) {
  return new Set(normalizeCareerTitle(value).split(" ").filter((word) => word.length > 1));
}

function jaccard(left: Set<string>, right: Set<string>) {
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

/** Conservative lexical proximity signal. It suggests confirmation; it never merges occupations. */
export function relatedCareerCandidates(query: string, candidates: CareerCandidate[]) {
  const queryTokens = tokens(query);
  return candidates
    .map((candidate) => ({
      candidate,
      score: Math.max(jaccard(queryTokens, tokens(candidate.title)), ...candidate.aliases.map((alias) => jaccard(queryTokens, tokens(alias)), 0)),
    }))
    .filter((entry) => entry.score >= 0.28 && entry.score < 0.78)
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title))
    .slice(0, 3);
}

export function builtInCareerCandidates(): CareerCandidate[] {
  return AVAILABLE_CAREERS.map((career) => ({
    slug: career.slug,
    title: career.title,
    aliases: (CAREER_TITLE_ALIASES[career.slug] ?? []).flatMap((alias) => [alias.title, ...(alias.keywords ?? [])]),
    href: `/careers/${career.slug}`,
    source: "built-in",
  }));
}
