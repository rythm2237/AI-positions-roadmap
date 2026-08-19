import type { CareerWorkspaceData } from "@/types/careerWorkspace";

type ExtractionResponse = {
  text?: string;
  error?: string;
};

export async function extractCVText(file: File): Promise<string> {
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("CV files must be 8 MB or smaller.");
  }

  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/cv-analyzer/extract", {
    method: "POST",
    body,
  });
  const data = (await response.json()) as ExtractionResponse;

  if (!response.ok || !data.text) {
    throw new Error(data.error || "CV extraction failed.");
  }

  return data.text.trim();
}

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ");

export function analyzeCVLocally(text: string, career: CareerWorkspaceData) {
  const haystack = normalize(text);
  const stages = career.journeyStages.map((stage) => {
    const terms = [stage.title, ...stage.lessons, ...stage.tasks.map((task) => task.title)]
      .flat()
      .flatMap((value) => normalize(value).split(" "))
      .filter((term) => term.length > 3);
    const unique = [...new Set(terms)];
    const matches = unique.filter((term) => haystack.includes(term));
    return {
      stageId: stage.id,
      title: stage.title,
      matches,
      coverage: unique.length ? Math.round((matches.length / unique.length) * 100) : 0,
    };
  });
  const strengths = stages
    .filter((stage) => stage.coverage >= 20)
    .sort((a, b) => b.coverage - a.coverage);
  const gaps = stages.filter((stage) => stage.coverage < 20);
  const keywords = [...new Set(stages.flatMap((stage) => stage.matches))];

  return {
    skillCoverage: stages.length
      ? Math.round(stages.reduce((sum, stage) => sum + stage.coverage, 0) / stages.length)
      : 0,
    strengths,
    gaps,
    keywords,
    unclearEvidence: gaps.map(
      (stage) =>
        `${stage.title} may be present in your experience but is not clearly evidenced in this CV.`,
    ),
  };
}
