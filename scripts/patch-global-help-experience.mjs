import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const explainPath = path.join(root, "src/components/help/GlobalExplainMode.tsx");
const tourPath = path.join(root, "src/components/onboarding/FirstVisitGuidedTour.tsx");
const validatorPath = path.join(root, "scripts/validate-audited-career-availability.mjs");

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

if (!tour.includes('consentEventName, readConsent')) {
  tour = tour.replace(
    'import { useCallback, useEffect, useMemo, useRef, useState } from "react";',
    'import { useCallback, useEffect, useMemo, useRef, useState } from "react";\nimport { consentEventName, readConsent } from "@/components/legal/CookieConsent";',
  );
}

tour = tour.replace('const INVITE_DELAY_MS = 3000;', 'const INVITE_DELAY_MS = 5000;');
tour = tour.replace('const INVITE_DELAY_MS = 5000;\n', 'const INVITE_DELAY_MS = 5000;\nconst COOKIE_SETTINGS_OPEN_EVENT = "career-os:open-cookie-settings";\n');
tour = tour.replace(
  'const COOKIE_SETTINGS_OPEN_EVENT = "career-os:open-cookie-settings";\nconst COOKIE_SETTINGS_OPEN_EVENT = "career-os:open-cookie-settings";\n',
  'const COOKIE_SETTINGS_OPEN_EVENT = "career-os:open-cookie-settings";\n',
);

const oldInviteEffect = `  useEffect(() => {\n    if (active) return;\n    if (pathname === "/" && readTourStatus() === null) {\n      const timer = window.setTimeout(() => setInviteOpen(true), INVITE_DELAY_MS);\n      return () => window.clearTimeout(timer);\n    }\n  }, [active, pathname]);`;

const consentAwareInviteEffect = `  useEffect(() => {\n    if (active || pathname !== "/" || readTourStatus() !== null) return;\n\n    let timer: number | null = null;\n    const cancelInvite = () => {\n      if (timer !== null) window.clearTimeout(timer);\n      timer = null;\n      setInviteOpen(false);\n    };\n    const scheduleInvite = () => {\n      cancelInvite();\n      if (readTourStatus() !== null || readConsent() === null) return;\n      timer = window.setTimeout(() => {\n        if (readConsent() !== null && readTourStatus() === null) setInviteOpen(true);\n      }, INVITE_DELAY_MS);\n    };\n\n    if (readConsent() !== null) scheduleInvite();\n    window.addEventListener(consentEventName, scheduleInvite);\n    window.addEventListener(COOKIE_SETTINGS_OPEN_EVENT, cancelInvite);\n    return () => {\n      cancelInvite();\n      window.removeEventListener(consentEventName, scheduleInvite);\n      window.removeEventListener(COOKIE_SETTINGS_OPEN_EVENT, cancelInvite);\n    };\n  }, [active, pathname]);`;

if (tour.includes(oldInviteEffect)) {
  tour = tour.replace(oldInviteEffect, consentAwareInviteEffect);
} else if (!tour.includes('window.addEventListener(consentEventName, scheduleInvite)')) {
  throw new Error("Guided-tour invite effect signature changed; update consent gating patch.");
}

// Keep Tour and contextual Help together as one compact lower-right utility cluster.
tour = tour.replace(
  'className="fixed bottom-4 left-4 z-[62] inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-[#070a18]/80 px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-lg backdrop-blur-xl transition hover:border-violet-300/30 hover:bg-[#0a0d20]/95 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" aria-label="Start guided tour"',
  'className="fixed bottom-4 right-[4.75rem] z-[86] grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#070a18]/88 p-0 text-violet-200 shadow-[0_16px_50px_rgba(0,0,0,.45)] backdrop-blur-xl transition hover:border-violet-300/35 hover:bg-[#0c1026] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" aria-label="Start guided tour" title="Guided tour" data-guided-tour-launcher="true"',
);
tour = tour.replace(
  '<span className="grid h-5 w-5 place-items-center rounded-full bg-violet-500/15 text-[11px] text-violet-200" aria-hidden="true">?</span>\n          Tour',
  '<span className="grid h-7 w-7 place-items-center rounded-full border border-violet-300/25 bg-violet-500/10 text-sm leading-none" aria-hidden="true">✦</span>\n          <span className="sr-only">Guided tour</span>',
);

tour = tour.replaceAll("AI Career OS", "AI Role Path");

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

// The release validator used to require the landing live-job search labels. Keep the gate,
// but validate the new product contract: internal Career search on Landing, live jobs later.
let validator = read(validatorPath);
validator = validator.replace('"Search Jobs", "Semantic role search",', '"Search Careers", "AI Role Path directory",');
write(validatorPath, validator);

await import("./patch-cv-analyzer-roadmap-integration.mjs");
console.log("Global help experience applied: privacy-gated 5s tour invite, consolidated utilities, and internal Career search contract.");
