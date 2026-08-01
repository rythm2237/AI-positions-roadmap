"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AVAILABLE_CAREERS } from "@/data/careerCatalog";
import {
  aliasSearchTerms,
  getDefaultCareerTitleAliases,
  normalizeCareerTitle,
} from "@/data/careerTitleAliases";

const searchableCareers = AVAILABLE_CAREERS.map((career) => ({
  ...career,
  aliases: getDefaultCareerTitleAliases(career.slug),
}));

export default function CareerAliasSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeCareerTitle(query);

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
      className="pointer-events-auto absolute left-1/2 top-[calc(4.75rem+env(safe-area-inset-top))] z-30 w-[min(42rem,calc(100%-2rem))] -translate-x-1/2"
    >
      <div className="rounded-2xl border border-indigo-300/20 bg-slate-950/80 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
        <label className="block">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-200/80">
            Find your career — any job title works
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try: LLM Engineer, AI Integration Engineer, Hyperautomation Specialist…"
            className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-900/85 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/15"
          />
        </label>

        {query ? (
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto" role="listbox" aria-label="Matching canonical careers">
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
