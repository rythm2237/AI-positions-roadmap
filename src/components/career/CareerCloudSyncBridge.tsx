"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type CloudStateRow = {
  state_key: string;
  payload: unknown;
  is_deleted: boolean;
  updated_at: string;
};

type StateSpec = {
  stateKey: string;
  localKey: (careerSlug: string) => string;
};

const STATE_SPECS: StateSpec[] = [
  { stateKey: "workspace_progress", localKey: (slug) => `career_workspace_progress__${slug}` },
  { stateKey: "starting_profile", localKey: (slug) => `career_starting_profile__${slug}` },
  { stateKey: "baseline_diagnostic", localKey: (slug) => `career_baseline_diagnostic__${slug}` },
  { stateKey: "project_evidence", localKey: (slug) => `career_project_evidence__${slug}` },
  { stateKey: "job_matches", localKey: (slug) => `career_job_matches__${slug}` },
  { stateKey: "interview_evidence", localKey: (slug) => `career_interview_evidence__${slug}` },
  { stateKey: "applications", localKey: (slug) => `career_applications__${slug}` },
  { stateKey: "retention_snapshots", localKey: (slug) => `career_retention_snapshots__${slug}` },
];

const POLL_MS = 2500;

function safeParse(raw: string): unknown | undefined {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

export default function CareerCloudSyncBridge({ careerSlug }: { careerSlug: string }) {
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let intervalId: number | undefined;
    const cache = new Map<string, string | null>();

    async function upsertLocalState(userId: string, spec: StateSpec, raw: string | null) {
      if (raw === null) {
        await supabase.from("career_user_state").upsert(
          {
            user_id: userId,
            career_slug: careerSlug,
            state_key: spec.stateKey,
            payload: {},
            is_deleted: true,
          },
          { onConflict: "user_id,career_slug,state_key" },
        );
        return;
      }

      const payload = safeParse(raw);
      if (payload === undefined) return;
      await supabase.from("career_user_state").upsert(
        {
          user_id: userId,
          career_slug: careerSlug,
          state_key: spec.stateKey,
          payload,
          is_deleted: false,
        },
        { onConflict: "user_id,career_slug,state_key" },
      );
    }

    async function start() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data, error } = await supabase
        .from("career_user_state")
        .select("state_key,payload,is_deleted,updated_at")
        .eq("user_id", user.id)
        .eq("career_slug", careerSlug);

      // During a staged rollout the table may not exist yet. Local state remains the fallback.
      if (error || cancelled) return;

      const remote = new Map((data as CloudStateRow[] | null)?.map((row) => [row.state_key, row]) ?? []);
      let hydratedFromCloud = false;

      for (const spec of STATE_SPECS) {
        const localKey = spec.localKey(careerSlug);
        const localRaw = window.localStorage.getItem(localKey);
        const remoteRow = remote.get(spec.stateKey);

        if (remoteRow) {
          if (remoteRow.is_deleted) {
            if (localRaw !== null) {
              window.localStorage.removeItem(localKey);
              hydratedFromCloud = true;
            }
            cache.set(spec.stateKey, null);
            continue;
          }

          const remoteRaw = JSON.stringify(remoteRow.payload);
          if (localRaw !== remoteRaw) {
            window.localStorage.setItem(localKey, remoteRaw);
            hydratedFromCloud = true;
          }
          cache.set(spec.stateKey, remoteRaw);
          continue;
        }

        cache.set(spec.stateKey, localRaw);
        if (localRaw !== null) {
          await upsertLocalState(user.id, spec, localRaw);
        }
      }

      if (cancelled) return;

      // Existing feature workspaces read localStorage on mount. One guarded reload makes
      // cloud hydration immediately visible without rewriting every workspace at once.
      const hydrationGuard = `career_cloud_hydrated__${user.id}__${careerSlug}`;
      if (hydratedFromCloud && window.sessionStorage.getItem(hydrationGuard) !== "1") {
        window.sessionStorage.setItem(hydrationGuard, "1");
        window.location.reload();
        return;
      }
      window.sessionStorage.setItem(hydrationGuard, "1");

      intervalId = window.setInterval(() => {
        void (async () => {
          for (const spec of STATE_SPECS) {
            const raw = window.localStorage.getItem(spec.localKey(careerSlug));
            if (cache.get(spec.stateKey) === raw) continue;
            await upsertLocalState(user.id, spec, raw);
            cache.set(spec.stateKey, raw);
          }
        })();
      }, POLL_MS);
    }

    void start();

    return () => {
      cancelled = true;
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [careerSlug]);

  return null;
}
