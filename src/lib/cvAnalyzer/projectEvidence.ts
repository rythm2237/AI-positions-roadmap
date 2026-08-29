export type ProjectEvidenceSignal =
  | "explicit_project_section"
  | "named_product_evidence"
  | "case_study_evidence"
  | "implementation_evidence"
  | "portfolio_reference"
  | "weak_project_signal";

export type ProjectEvidenceAssessment = {
  score: number;
  confidence: "none" | "low" | "medium" | "high";
  signals: ProjectEvidenceSignal[];
  namedProducts: string[];
};

const IMPLEMENTATION_VERBS = [
  "built",
  "building",
  "created",
  "developed",
  "designed",
  "implemented",
  "launched",
  "deployed",
  "architected",
  "integrated",
  "validated",
  "automated",
];

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9+#.%/ -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function namedProducts(text: string) {
  const patterns = [
    /\b(?:[A-Z][A-Za-z0-9&+.-]*\s+){1,5}(?:OS|Platform|System|Suite|Engine|Portal|Studio|Agent|App)\b/g,
    /\b(?:[A-Z]{2,}\s+){1,3}(?:OS|Platform|System|Suite|Engine|Portal|Studio|Agent|App)\b/g,
  ];
  return unique(patterns.flatMap((pattern) => text.match(pattern) ?? []))
    .map((value) => value.trim())
    .filter((value) => value.split(/\s+/).length >= 2)
    .slice(0, 8);
}

function implementationVerbCount(text: string) {
  const normalized = normalize(text);
  return IMPLEMENTATION_VERBS.filter((verb) => new RegExp(`\\b${verb}\\b`, "i").test(normalized)).length;
}

function hasSubstantialProductDescription(text: string, products: string[]) {
  const normalized = normalize(text);
  return products.some((product) => {
    const index = normalized.indexOf(normalize(product));
    if (index < 0) return false;
    const context = normalized.slice(Math.max(0, index - 80), index + normalize(product).length + 360);
    return context.split(/\s+/).length >= 18 && implementationVerbCount(context) >= 1;
  });
}

export function assessProjectEvidence(input: {
  projects: string;
  summary: string;
  experience: string;
  source: string;
}): ProjectEvidenceAssessment {
  const { projects, summary, experience, source } = input;
  const combined = [projects, summary, experience, source].filter(Boolean).join("\n");
  const products = namedProducts(combined);
  const verbs = implementationVerbCount([projects, summary, experience].join("\n"));
  const explicitWords = projects.split(/\s+/).filter(Boolean).length;
  const caseStudy = /\b(?:case study|case-study|portfolio project|capstone|proof of concept|proof-of-concept|poc)\b/i.test(combined);
  const portfolio = /github\.com|behance\.net|dribbble\.com|notion\.site|\bportfolio\b/i.test(combined);
  const substantialNamedProduct = products.length > 0 && hasSubstantialProductDescription(combined, products);
  const signals: ProjectEvidenceSignal[] = [];
  let score = 0;

  if (explicitWords >= 12) {
    signals.push("explicit_project_section");
    score += explicitWords >= 35 ? 5 : 4;
  }
  if (substantialNamedProduct) {
    signals.push("named_product_evidence");
    score += Math.min(6, 3 + products.length);
  }
  if (caseStudy) {
    signals.push("case_study_evidence");
    score += 3;
  }
  if (verbs >= 2 && (explicitWords >= 8 || substantialNamedProduct || caseStudy)) {
    signals.push("implementation_evidence");
    score += Math.min(5, verbs);
  } else if (verbs >= 1) {
    signals.push("weak_project_signal");
    score += 1;
  }
  if (portfolio) {
    signals.push("portfolio_reference");
    score += 2;
  }

  const confidence = score >= 9 ? "high" : score >= 6 ? "medium" : score >= 3 ? "low" : "none";
  return { score: Math.min(16, score), confidence, signals: unique(signals), namedProducts: products };
}
