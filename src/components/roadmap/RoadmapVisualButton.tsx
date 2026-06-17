"use client";

const ROADMAPSH_URLS: Record<string, string> = {
  "ai-automation-specialist": "https://roadmap.sh/ai-engineer",
  "prompt-engineer": "https://roadmap.sh/prompt-engineering",
  "ai-data-analyst": "https://roadmap.sh/data-analyst",
  "ai-content-creator": "https://roadmap.sh/ai-engineer",
  "ml-engineer": "https://roadmap.sh/mlops",
  "ai-product-manager": "https://roadmap.sh/product-manager",
  "ai-ux-designer": "https://roadmap.sh/ux-design",
  "llm-app-developer": "https://roadmap.sh/ai-engineer",
  "ai-ethics-specialist": "https://roadmap.sh/ai-engineer",
  "ai-sales-marketing": "https://roadmap.sh/ai-engineer",
};

interface RoadmapVisualButtonProps {
  slug: string;
}

export default function RoadmapVisualButton({ slug }: RoadmapVisualButtonProps) {
  const url = ROADMAPSH_URLS[slug] ?? "https://roadmap.sh/ai-engineer";

  function handleOpen() {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label="View professional roadmap on roadmap.sh"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="12" cy="18" r="3" />
        <path d="M8.6 7.6 10.8 15" />
        <path d="M15.4 7.6 13.2 15" />
        <path d="M9 6h6" />
      </svg>
      <span className="hidden sm:inline">View Pro Roadmap</span>
    </button>
  );
}
