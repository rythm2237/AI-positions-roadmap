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
        const startsWith = normalizedTerms.some((term) =>
          term.startsWith(normalizedQuery)
        );
        const includes = normalizedTerms.some((term) =>
          term.includes(normalizedQuery)
        );
        return {
          career,
          score: exact ? 3 : startsWith ? 2 : includes ? 1 : 0,
        };
      })
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.career.displayOrder - b.career.displayOrder
      )
      .map((item) => item.career);
  }, [normalizedQuery]);

  function openCareer(slug: string, route?: string) {
    router.push(route ?? `/careers/${slug}`);
  }

  return (
    <section
      aria-label="Find a career by any job title"
      className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-30 w-[min(34rem,calc(100%-2rem))] -translate-x-1/2 sm:bottom-[4.75rem] lg:bottom-[5.5rem]"
    >
      <div className="rounded-2xl border border-indigo-300/15 bg-slate-950/72 p-2.5 shadow-[0_16px_48px_rgba(0,0,0,.34)] backdrop-blur-xl sm:p-3">
        <label className="block">
          <span className="mb-1.5 block px-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-200/65 sm:text-[10px]">
            Search by any job title
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="LLM Engineer, AI Integration Engineer…"
            className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-900/82 px-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/15 sm:min-h-12 sm:px-4"
          />
        </label>

        {query ? (
          <div
            className="absolute bottom-[calc(100%+.5rem)] left-0 right-0 max-h-[min(42vh,18rem)] space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/96 p-2.5 shadow-2xl backdrop-blur-xl sm:p-3"
            role="listbox"
            aria-label="Matching canonical careers"
          >
            {matches.length ? (
              matches.map((career) => {
                const aliases = getDefaultCareerTitleAliases(career.slug);
                return (
                  <button
                    key={career.slug}
                    type="button"
                    onClick={() => openCareer(career.slug, career.route)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-cyan-300/35 hover:bg-cyan-400/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40"
                  >
                    <span className="block text-sm font-semibold text-white">
                      {career.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">
                      Also listed as {aliases
                        .slice(0, 3)
                        .map((alias) => alias.title)
                        .join(" · ")}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="rounded-xl border border-amber-300/15 bg-amber-400/[0.06] p-3 text-xs leading-5 text-amber-100">
                No active career matches this title yet. Try a broader title or
                explore the Career Universe.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
