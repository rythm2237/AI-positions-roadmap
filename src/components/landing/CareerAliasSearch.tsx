"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AVAILABLE_CAREERS } from "@/data/careerCatalog";
import {
  aliasSearchTerms,
  getDefaultCareerTitleAliases,
  normalizeCareerTitle,
} from "@/data/careerTitleAliases";
import {
  CAREER_UNIVERSE_PHASE_EVENT,
  type ScenePhase,
} from "@/components/opening-scene/SceneContext";

const searchableCareers = AVAILABLE_CAREERS.map((career) => ({
  ...career,
  aliases: getDefaultCareerTitleAliases(career.slug),
}));

export default function CareerAliasSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(true);
  const normalizedQuery = normalizeCareerTitle(query);

  useEffect(() => {
    function handlePhase(event: Event) {
      const phase = (event as CustomEvent<ScenePhase>).detail;
      const shouldShow = phase === "idle";
      setVisible(shouldShow);
      if (!shouldShow) setQuery("");
    }

    window.addEventListener(CAREER_UNIVERSE_PHASE_EVENT, handlePhase);
    return () => {
      window.removeEventListener(CAREER_UNIVERSE_PHASE_EVENT, handlePhase);
    };
  }, []);

  const matches = useMemo(() => {
    if (!normalizedQuery) return searchableCareers;

    return searchableCareers
      .map((career) => {
        const terms = aliasSearchTerms(career.title, career.aliases);
        const normalizedTerms = terms.map(normalizeCareerTitle);
        const exact = normalizedTerms.some((term) => term === normalizedQuery);
        const startsWith = normalizedTerms.some((term) => term.startsWith(normalizedQuery));
        const includes = normalizedTerms.some((term) => term.includes(normalizedQuery));
        return {
          career,
          score: exact ? 3 : startsWith ? 2 : includes ? 1 : 0,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.career.displayOrder - b.career.displayOrder)
      .map((item) => item.career);
  }, [normalizedQuery]);

  function openCareer(slug: string, route?: string) {
    router.push(route ?? `/careers/${slug}`);
  }

  return (
    <section
      aria-label="Find a career by any job title"
      aria-hidden={!visible}
      className={`pointer-events-auto absolute inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 mx-auto w-auto max-w-[34rem] transition-all duration-300 ease-out sm:bottom-[4.25rem] sm:w-[min(34rem,calc(100%-3rem))] ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <div className="relative rounded-2xl border border-indigo-300/15 bg-slate-950/72 p-3 shadow-[0_16px_48px_rgba(0,0,0,.28)] backdrop-blur-xl sm:p-3.5">
        <label className="block">
          <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-200/70 sm:text-[10px]">
            Find your career by job title
          </span>
          <input
            type="search"
            value={query}
            tabIndex={visible ? 0 : -1}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try LLM Engineer, AI Integration Engineer…"
            className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-900/82 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/15"
          />
        </label>

        {query ? (
          <div className="absolute inset-x-0 bottom-[calc(100%+.6rem)] max-h-[42dvh] space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/96 p-2.5 shadow-2xl backdrop-blur-xl sm:p-3" role="listbox" aria-label="Matching canonical careers">
            {matches.length ? (
              matches.map((career) => {
                const aliases = getDefaultCareerTitleAliases(career.slug);
                return (
                  <button
                    key={career.slug}
                    type="button"
                    onClick={() => openCareer(career.slug, career.route)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-cyan-300/35 hover:bg-cyan-400/[0.07]"
                  >
                    <span className="block text-sm font-semibold text-white">{career.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">
                      Also listed as {aliases.slice(0, 4).map((alias) => alias.title).join(" · ")}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="rounded-xl border border-amber-300/15 bg-amber-400/[0.06] p-3 text-xs leading-5 text-amber-100">
                No active career matches this title yet. Try a broader title or explore the Career Universe.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
