"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  estimateReadinessWeeks,
  getJobReadinessReport,
} from "@/lib/jobReadiness";
import type {
  CareerWorkspaceData,
  CareerWorkspaceProgress,
} from "@/types/careerWorkspace";

type ExperienceLevel = "new" | "adjacent" | "experienced";

type StartingProfile = {
  background: string;
  experienceLevel: ExperienceLevel;
  weeklyHours: number;
  targetOutcome: string;
};

const DEFAULT_PROFILE: StartingProfile = {
  background: "",
  experienceLevel: "new",
  weeklyHours: 6,
  targetOutcome: "Become job-ready for this role",
};

function profileStorageKey(slug: string) {
  return `career_starting_profile__${slug}`;
}

function loadProfile(slug: string): StartingProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(profileStorageKey(slug));
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveProfile(slug: string, profile: StartingProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(profileStorageKey(slug), JSON.stringify(profile));
  } catch {
    // The readiness experience still works when local storage is unavailable.
  }
}

function bandLabel(band: ReturnType<typeof getJobReadinessReport>["band"]) {
  if (band === "application-ready") return "Application ready";
  if (band === "almost-ready") return "Almost ready";
  return "Building evidence";
}

export default function CareerReadinessPanel({
  career,
  progress,
}: {
  career: CareerWorkspaceData;
  progress: CareerWorkspaceProgress;
}) {
  const [profile, setProfile] = useState<StartingProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfile(loadProfile(career.slug));
    setLoaded(true);
  }, [career.slug]);

  useEffect(() => {
    if (loaded) saveProfile(career.slug, profile);
  }, [career.slug, loaded, profile]);

  const report = useMemo(
    () => getJobReadinessReport(career, progress),
    [career, progress]
  );
  const weeks = useMemo(
    () => estimateReadinessWeeks(report, profile.weeklyHours),
    [profile.weeklyHours, report]
  );

  const hasProfile = Boolean(profile.background.trim());

  return (
    <section
      aria-labelledby="career-readiness-title"
      className="mt-6 rounded-2xl border border-cyan-300/15 bg-slate-950/65 p-4 shadow-card backdrop-blur-xl md:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
            Personalized readiness
          </p>
          <h2 id="career-readiness-title" className="mt-1 text-xl font-semibold text-white">
            {report.score}% job-readiness evidence
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
            This score uses completed learning, passed assessments, project evidence and career-launch tasks. It does not treat a checked box as proof of skill.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
          <p className="text-xs text-slate-500">Status</p>
          <p className="text-sm font-semibold text-white">{bandLabel(report.band)}</p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-ai-500 via-violet-500 to-cyber-400"
          style={{ width: `${report.score}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {report.dimensions.map((dimension) => (
          <div key={dimension.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-300">{dimension.label}</p>
              <span className="text-xs font-semibold text-white">{dimension.score}%</span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">{dimension.evidence}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-300">Next best action</p>
              <h3 className="mt-1 font-semibold text-white">{report.nextBestAction.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">{report.nextBestAction.detail}</p>
            </div>
          </div>

          {report.gaps.length ? (
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold text-slate-300">What is still missing</p>
              {report.gaps.map((gap) => (
                <div key={gap.id} className="rounded-lg bg-black/15 px-3 py-2">
                  <p className="text-xs font-semibold text-white">{gap.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{gap.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 border-t border-white/10 pt-4 text-sm text-emerald-300">
              Core readiness gates are satisfied. Evaluate specific job descriptions before applying.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-300">Starting profile</p>
              <p className="mt-1 text-sm text-slate-400">
                {hasProfile ? profile.background : "Add your background to personalize the plan."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="min-h-10 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08]"
            >
              {editing ? "Done" : hasProfile ? "Edit" : "Set profile"}
            </button>
          </div>

          {editing ? (
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Current background
                <textarea
                  value={profile.background}
                  onChange={(event) => setProfile({ ...profile, background: event.target.value })}
                  placeholder="Example: operations analyst, no coding experience"
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
                />
              </label>

              <label className="block text-xs font-medium text-slate-300">
                Relevant experience
                <select
                  value={profile.experienceLevel}
                  onChange={(event) => setProfile({ ...profile, experienceLevel: event.target.value as ExperienceLevel })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
                >
                  <option value="new">Starting from zero</option>
                  <option value="adjacent">Adjacent / transferable experience</option>
                  <option value="experienced">Already working with related skills</option>
                </select>
              </label>

              <label className="block text-xs font-medium text-slate-300">
                Hours available per week
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={profile.weeklyHours}
                  onChange={(event) => setProfile({ ...profile, weeklyHours: Math.max(1, Math.min(40, Number(event.target.value) || 1)) })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
                />
              </label>

              <label className="block text-xs font-medium text-slate-300">
                Target outcome
                <input
                  value={profile.targetOutcome}
                  onChange={(event) => setProfile({ ...profile, targetOutcome: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
              <div>
                <p className="text-slate-500">Weekly capacity</p>
                <p className="mt-1 font-semibold text-white">{profile.weeklyHours}h / week</p>
              </div>
              <div>
                <p className="text-slate-500">Estimated remaining time</p>
                <p className="mt-1 font-semibold text-white">
                  {weeks ? `${weeks.min}–${weeks.max} weeks` : "Add weekly capacity"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500">Target</p>
                <p className="mt-1 font-semibold text-white">{profile.targetOutcome}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
