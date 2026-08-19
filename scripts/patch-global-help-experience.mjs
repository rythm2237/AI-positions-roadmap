import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const explainPath = path.join(root, "src/components/help/GlobalExplainMode.tsx");
const tourPath = path.join(root, "src/components/onboarding/FirstVisitGuidedTour.tsx");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, value) {
  fs.writeFileSync(file, value);
}

let explain = read(explainPath);

if (!explain.includes('data-global-help-button="true"')) {
  explain = explain.replace(
    'aria-pressed={enabled}\n        aria-label={enabled ? "Turn off Explain Mode" : "Turn on Explain Mode"}',
    'data-global-help-button="true"\n        aria-pressed={enabled}\n        aria-label={enabled ? "Turn off Explain Mode" : "Turn on Explain Mode"}',
  );
}

explain = explain.replace(
  'className={`fixed bottom-4 right-4 z-[86] inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold shadow-[0_16px_50px_rgba(0,0,0,.45)] backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${enabled ? "border-violet-300/45 bg-violet-500 text-white" : "border-white/10 bg-[#080b1c]/88 text-slate-200 hover:border-violet-300/35 hover:bg-[#0c1026]"}`}',
  'className={`fixed bottom-4 right-4 z-[86] grid h-11 w-11 place-items-center rounded-full border p-0 text-[0px] font-semibold shadow-[0_16px_50px_rgba(0,0,0,.45)] backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${enabled ? "border-violet-300/45 bg-violet-500 text-white" : "border-white/10 bg-[#080b1c]/88 text-slate-200 hover:border-violet-300/35 hover:bg-[#0c1026]"}`}',
);

explain = explain.replace(
  '<span className="grid h-5 w-5 place-items-center rounded-full border border-current/25 text-[11px]" aria-hidden="true">?</span>\n        {enabled ? "Explain: ON" : "Guide"}',
  '<span className="grid h-7 w-7 place-items-center rounded-full border border-current/25 text-base leading-none" aria-hidden="true">?</span>\n        <span className="sr-only">{enabled ? "Explain Mode on" : "Help"}</span>',
);

explain = explain.replace(
  'Press Esc or tap the Guide button to exit.',
  'Press Esc or tap the ? button to exit.',
);

write(explainPath, explain);

let tour = read(tourPath);
const helpStepMarker = 'id: "contextual-help"';
if (!tour.includes(helpStepMarker)) {
  const helpStep = `  {\n    id: "contextual-help",\n    route: "/careers/ai-engineer",\n    eyebrow: "Help anytime",\n    title: "Need help later? Tap the ? button",\n    body: "The ? button stays available across the public site. Activate it whenever something is unclear, then click or tap the part of the page you want explained. Explain Mode will describe that area without triggering its normal action, so you can learn the interface safely and continue at your own pace.",\n    placement: "center",\n  },\n`;

  const listEnd = /\n\];\n\ntype Rect/;
  if (!listEnd.test(tour)) {
    throw new Error("Guided-tour steps list signature changed; update patch-global-help-experience.mjs.");
  }
  tour = tour.replace(listEnd, `\n${helpStep}];\n\ntype Rect`);
}

write(tourPath, tour);
await import("./patch-cv-analyzer-roadmap-integration.mjs");
console.log("Global help experience applied: icon-only ? control and final guided-tour help step.");
