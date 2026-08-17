"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Explanation = {
  title: string;
  body: string;
  hint?: string;
};

const MEANINGFUL_SELECTOR = [
  "[data-help-title]",
  "button",
  "a",
  "article",
  "nav",
  "header",
  "footer",
  "section",
  "aside",
  "form",
  "input",
  "select",
  "textarea",
  "main",
  "[role='button']",
  "[role='tab']",
  "[role='dialog']",
  "[role='navigation']",
].join(",");

function cleanText(value: string | null | undefined, max = 72) {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

function elementLabel(element: HTMLElement) {
  const override = cleanText(element.dataset.helpTitle);
  if (override) return override;

  const aria = cleanText(element.getAttribute("aria-label"));
  if (aria) return aria;

  if (element instanceof HTMLInputElement) {
    return cleanText(element.placeholder) || cleanText(element.name) || "Input field";
  }

  const heading = element.matches("h1,h2,h3,h4,h5,h6")
    ? element
    : element.querySelector<HTMLElement>("h1,h2,h3,h4,h5,h6");
  const headingText = cleanText(heading?.textContent);
  if (headingText) return headingText;

  const directText = cleanText(element.textContent);
  if (directText) return directText;

  const tag = element.tagName.toLowerCase();
  if (tag === "nav") return "Navigation";
  if (tag === "header") return "Page header";
  if (tag === "footer") return "Footer";
  if (tag === "main") return "Main content";
  if (tag === "section") return "Page section";
  if (tag === "article") return "Content card";
  return "This area";
}

function pageContext(pathname: string) {
  if (pathname === "/") return "Career Universe home";
  if (pathname === "/careers") return "Career Directory";
  if (/^\/careers\/[^/]+\/learning/.test(pathname)) return "Career Learning workspace";
  if (/^\/careers\/[^/]+/.test(pathname)) return "Career Workspace";
  if (pathname.startsWith("/career-intelligence")) return "Career Intelligence";
  if (pathname.startsWith("/methodology")) return "Methodology";
  if (pathname.startsWith("/sources")) return "Sources";
  if (pathname.startsWith("/legal")) return "Legal information";
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/career-dashboard")) return "Dashboard";
  if (pathname.startsWith("/profile")) return "Profile";
  return "this page";
}

function explainElement(element: HTMLElement, pathname: string): Explanation {
  const explicitBody = cleanText(element.dataset.helpDescription, 320);
  const title = elementLabel(element);
  if (explicitBody) {
    return { title, body: explicitBody, hint: element.dataset.helpHint };
  }

  const tag = element.tagName.toLowerCase();
  const role = element.getAttribute("role");
  const context = pageContext(pathname);

  if (tag === "a") {
    const href = element.getAttribute("href") || "";
    return {
      title,
      body: `This is a navigation link in ${context}. Normally, selecting it opens ${href.startsWith("/") ? "another part of AI Career OS" : "the linked destination"}. Explain Mode blocks that navigation so you can inspect it safely.`,
      hint: "Turn Explain Mode off when you want to follow the link.",
    };
  }

  if (tag === "button" || role === "button" || role === "tab") {
    return {
      title,
      body: `This is an interactive control in ${context}. It performs the action indicated by its label. While Explain Mode is active, the action is temporarily blocked so the control can be explained without changing the page.`,
      hint: "Turn Explain Mode off to use this control normally.",
    };
  }

  if (tag === "input" || tag === "select" || tag === "textarea") {
    return {
      title,
      body: `This field collects or filters information in ${context}. Explain Mode prevents accidental editing while you inspect the interface.`,
      hint: "Turn Explain Mode off before entering or changing a value.",
    };
  }

  if (tag === "nav" || role === "navigation") {
    return {
      title,
      body: `This navigation area helps you move between the main parts of AI Career OS. On ${context}, it gives you a consistent way to reach related pages or return to broader career discovery.`,
    };
  }

  if (tag === "article") {
    return {
      title,
      body: `This card represents a focused piece of content in ${context}. Cards are used to group information or provide a clear entry point into a Career, resource, project, or related feature.`,
    };
  }

  if (tag === "header") {
    return {
      title,
      body: `This is the page header. It keeps the primary product identity and navigation available while you move through AI Career OS.`,
    };
  }

  if (tag === "footer") {
    return {
      title,
      body: "This footer contains supporting links such as legal, privacy, source, and product-information pages.",
    };
  }

  if (tag === "section" || tag === "aside" || tag === "main" || role === "dialog") {
    return {
      title,
      body: `This is a content area within ${context}. Its heading and nearby controls define what you can learn, compare, or do in this part of the product.`,
    };
  }

  return {
    title,
    body: `This element belongs to ${context}. It contributes to the information or interaction available in this part of AI Career OS.`,
  };
}

function resolveMeaningfulTarget(raw: EventTarget | null) {
  if (!(raw instanceof HTMLElement)) return null;
  if (raw.closest("[data-explain-ui='true']")) return null;
  return raw.closest<HTMLElement>(MEANINGFUL_SELECTOR) ?? raw;
}

export default function GlobalExplainMode() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const previousOutline = useRef<{ element: HTMLElement; outline: string; outlineOffset: string } | null>(null);

  const allowed = useMemo(
    () => !pathname.startsWith("/admin") && !pathname.startsWith("/login") && !pathname.startsWith("/auth"),
    [pathname],
  );

  useEffect(() => {
    if (!allowed) {
      setEnabled(false);
      setExplanation(null);
      setTarget(null);
    }
  }, [allowed]);

  useEffect(() => {
    if (!enabled) return;

    const onClick = (event: MouseEvent) => {
      const element = resolveMeaningfulTarget(event.target);
      if (!element) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setTarget(element);
      setExplanation(explainElement(element, pathname));
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (explanation) setExplanation(null);
        else setEnabled(false);
      }
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKey);
    document.documentElement.dataset.explainMode = "on";
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKey);
      delete document.documentElement.dataset.explainMode;
    };
  }, [enabled, explanation, pathname]);

  useEffect(() => {
    if (previousOutline.current) {
      const prev = previousOutline.current;
      prev.element.style.outline = prev.outline;
      prev.element.style.outlineOffset = prev.outlineOffset;
      previousOutline.current = null;
    }

    if (!enabled || !target) return;
    previousOutline.current = {
      element: target,
      outline: target.style.outline,
      outlineOffset: target.style.outlineOffset,
    };
    target.style.outline = "2px solid rgba(167,139,250,.95)";
    target.style.outlineOffset = "4px";

    return () => {
      if (!previousOutline.current) return;
      const prev = previousOutline.current;
      prev.element.style.outline = prev.outline;
      prev.element.style.outlineOffset = prev.outlineOffset;
      previousOutline.current = null;
    };
  }, [enabled, target]);

  if (!allowed) return null;

  return (
    <div data-explain-ui="true">
      <button
        type="button"
        onClick={() => {
          setEnabled((value) => !value);
          setExplanation(null);
          setTarget(null);
        }}
        aria-pressed={enabled}
        aria-label={enabled ? "Turn off Explain Mode" : "Turn on Explain Mode"}
        className={`fixed bottom-4 right-4 z-[86] inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold shadow-[0_16px_50px_rgba(0,0,0,.45)] backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${enabled ? "border-violet-300/45 bg-violet-500 text-white" : "border-white/10 bg-[#080b1c]/88 text-slate-200 hover:border-violet-300/35 hover:bg-[#0c1026]"}`}
      >
        <span className="grid h-5 w-5 place-items-center rounded-full border border-current/25 text-[11px]" aria-hidden="true">?</span>
        {enabled ? "Explain: ON" : "Guide"}
      </button>

      {enabled && !explanation ? (
        <div className="pointer-events-none fixed bottom-[4.7rem] right-4 z-[85] max-w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-violet-300/15 bg-[#080b1c]/92 px-4 py-3 text-xs leading-5 text-slate-300 shadow-xl backdrop-blur-xl">
          Explain Mode is active. Click any visible part of the page to learn what it does. Press Esc or tap the Guide button to exit.
        </div>
      ) : null}

      {enabled && explanation ? (
        <div className="fixed inset-0 z-[87] flex items-end justify-center bg-black/28 p-3 pb-[max(5rem,env(safe-area-inset-bottom))] sm:pointer-events-none sm:items-center sm:bg-transparent sm:p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`Guide: ${explanation.title}`}
            className="pointer-events-auto w-full max-w-md rounded-[26px] border border-violet-300/20 bg-[#080b1c]/97 p-5 text-white shadow-[0_28px_100px_rgba(0,0,0,.65)] backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-violet-300">Contextual guide</p>
                <h2 className="mt-2 font-display text-xl font-semibold leading-tight">{explanation.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExplanation(null);
                  setTarget(null);
                }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Close explanation"
              >
                ×
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{explanation.body}</p>
            {explanation.hint ? (
              <p className="mt-3 rounded-xl border border-cyan-300/10 bg-cyan-400/[0.05] px-3 py-2.5 text-xs leading-5 text-cyan-100/75">{explanation.hint}</p>
            ) : null}
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setEnabled(false);
                  setExplanation(null);
                  setTarget(null);
                }}
                className="min-h-10 rounded-xl px-2 text-xs font-semibold text-slate-500 transition hover:text-white"
              >
                Exit Guide
              </button>
              <button
                type="button"
                onClick={() => {
                  setExplanation(null);
                  setTarget(null);
                }}
                className="min-h-10 rounded-xl bg-violet-500 px-4 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Explain another area
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <style jsx global>{`
        html[data-explain-mode='on'],
        html[data-explain-mode='on'] body,
        html[data-explain-mode='on'] body *:not([data-explain-ui='true']):not([data-explain-ui='true'] *) {
          cursor: help !important;
        }
      `}</style>
    </div>
  );
}
