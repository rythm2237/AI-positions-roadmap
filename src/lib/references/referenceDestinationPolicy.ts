export type LearningDestinationMode = "reading" | "video" | "course" | "practice";

type LearningDestinationOption = {
  mode: LearningDestinationMode;
  contentType?: string;
  title?: string;
  description?: string;
  url: string;
  provider?: string;
  verifiedContentType?: boolean;
  verificationSource?: string;
  [key: string]: unknown;
};

type DestinationOverride = Partial<LearningDestinationOption> & { url: string };

const DIRECT_DESTINATION_OVERRIDES: Record<string, DestinationOverride> = {
  "journey-ibm-skillsbuild:reading": {
    url: "https://www.ibm.com/think/topics/artificial-intelligence",
    title: "What is artificial intelligence (AI)?",
    description:
      "Read IBM's focused AI explainer directly, without entering the SkillsBuild catalog or choosing among unrelated courses.",
    provider: "IBM",
    contentType: "documentation",
    verificationSource: "official-direct-reading-page",
  },
  "journey-github-docs:practice": {
    url: "https://github.com/new?template_owner=skills&template_name=introduction-to-github&owner=%40me&name=skills-introduction-to-github&description=Exercise%3A+Introduction+to+GitHub&visibility=public",
    title: "Start the Introduction to GitHub exercise",
    description:
      "Open GitHub's official exercise-copy screen directly. Creating the repository starts the guided GitHub Skills exercise in your own account.",
    provider: "GitHub Skills",
    contentType: "interactive-course",
    verificationSource: "official-direct-exercise-start",
  },
  "journey-openai-docs:practice": {
    url: "https://github.com/openai/openai-cookbook/blob/main/examples/responses_api/responses_example.ipynb",
    title: "OpenAI Responses API practice notebook",
    description:
      "Open the exact official OpenAI Cookbook notebook for hands-on Responses API practice instead of the Cookbook repository home.",
    provider: "OpenAI",
    contentType: "hands-on-lab",
    verificationSource: "official-direct-practice-notebook",
  },
  "journey-hf-docs:practice": {
    url: "https://huggingface.co/learn/llm-course/en/chapter1/3",
    title: "Transformers: What can they do?",
    description:
      "Open the exact Hugging Face LLM Course lesson with runnable model examples instead of the general notebooks repository.",
    provider: "Hugging Face",
    contentType: "hands-on-lab",
    verificationSource: "official-direct-course-practice",
  },
};

const GENERIC_PATHS = new Set([
  "",
  "/",
  "/learning-catalog",
  "/course-catalog",
  "/catalog",
  "/search",
  "/paths",
  "/courses",
  "/training",
  "/learn",
]);

function normalizedHost(url: URL) {
  return url.hostname.toLowerCase().replace(/^www\./, "");
}

function normalizedPath(url: URL) {
  const path = url.pathname.replace(/\/+$/, "").toLowerCase();
  return path || "/";
}

function pathSegments(url: URL) {
  return normalizedPath(url).split("/").filter(Boolean);
}

function isGitHubRepositoryRoot(url: URL) {
  if (normalizedHost(url) !== "github.com") return false;
  return pathSegments(url).length === 2;
}

function isYouTubeDirectVideo(url: URL) {
  const host = normalizedHost(url);
  const path = normalizedPath(url);
  if (host === "youtu.be") return pathSegments(url).length === 1;
  if (host !== "youtube.com") return false;
  return path === "/watch" && Boolean(url.searchParams.get("v"));
}

function isKnownGenericLanding(url: URL) {
  const host = normalizedHost(url);
  const path = normalizedPath(url);

  if (GENERIC_PATHS.has(path)) return true;
  if (path.startsWith("/@")) return true;
  if (path.includes("/search")) return true;
  if (/\/(?:learning-)?catalog(?:\/[^/]*-catalog)?$/.test(path)) return true;

  if (host === "skillsbuild.org") {
    return (
      path === "/adult-learners/explore-learning" ||
      path === "/adult-learners/explore-learning/artificial-intelligence" ||
      path === "/college-students/course-catalog" ||
      path === "/learning-catalog/university-catalog"
    );
  }

  if (host === "skillbuilder.aws") return path === "/";
  if (host === "cloudskillsboost.google") return path === "/paths";

  return false;
}

function isPracticeContentType(contentType?: string) {
  return /(?:lab|exercise|sandbox|notebook|codelab|challenge|ctf|interactive|hands-on|project)/i.test(contentType ?? "");
}

export function isDirectLearningDestination(
  option: Pick<LearningDestinationOption, "mode" | "url" | "contentType">,
) {
  let url: URL;
  try {
    url = new URL(option.url);
  } catch {
    return false;
  }

  if (!new Set(["http:", "https:"]).has(url.protocol)) return false;
  if (isKnownGenericLanding(url)) return false;

  const host = normalizedHost(url);
  const path = normalizedPath(url);

  if (option.mode === "video") {
    if (host === "youtube.com" || host === "youtu.be") {
      return isYouTubeDirectVideo(url);
    }
    if (host === "learn.microsoft.com" && path.includes("/shows/")) {
      return pathSegments(url).length >= 3;
    }
    return path !== "/";
  }

  if (option.mode === "course") {
    // A Course must be a specific course, module, path or enrollment page —
    // never a provider homepage or catalog where the learner must search again.
    return path !== "/" && pathSegments(url).length >= 2;
  }

  if (option.mode === "practice") {
    // Practice is deliberately stricter than Course. The declared resource
    // must actually be hands-on, not merely a documentation/course page.
    if (!isPracticeContentType(option.contentType)) return false;
    if (host === "github.com") {
      if (path === "/new") {
        return Boolean(
          url.searchParams.get("template_owner") &&
            url.searchParams.get("template_name"),
        );
      }
      return !isGitHubRepositoryRoot(url);
    }
    return path !== "/";
  }

  return path !== "/";
}

export function applyLearningDestinationPolicy<T extends LearningDestinationOption>(
  referenceId: string,
  option: T,
): T {
  const override = DIRECT_DESTINATION_OVERRIDES[`${referenceId}:${option.mode}`];
  const resolved = override ? ({ ...option, ...override } as T) : option;
  const direct = isDirectLearningDestination(resolved);

  return {
    ...resolved,
    verifiedContentType: Boolean(resolved.verifiedContentType) && direct,
    verificationSource: direct
      ? `${resolved.verificationSource ?? "curated"}+direct-destination`
      : `${resolved.verificationSource ?? "curated"}+destination-rejected`,
  };
}

export function getDirectDestinationOverride(referenceId: string, mode: LearningDestinationMode) {
  return DIRECT_DESTINATION_OVERRIDES[`${referenceId}:${mode}`] ?? null;
}