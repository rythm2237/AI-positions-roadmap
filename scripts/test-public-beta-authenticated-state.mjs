import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const careerSlug = process.env.E2E_TEST_CAREER_SLUG || "ai-automation-specialist";

if (!url || !publishableKey) {
  throw new Error("Authenticated Beta gate requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
}

if (!email || !password) {
  console.log("Authenticated Beta gate skipped: set E2E_TEST_EMAIL and E2E_TEST_PASSWORD for a dedicated test account.");
  process.exit(0);
}

const supabase = createClient(url, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const marker = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const payload = {
  source: "public-beta-authenticated-gate",
  marker,
  completedResources: [],
  completedProjects: [],
};

let signedInUserId = "";

try {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError || !authData.user) throw new Error(`Test-account login failed: ${authError?.message || "no user"}`);
  signedInUserId = authData.user.id;

  const { error: upsertError } = await supabase.from("career_user_state").upsert(
    {
      user_id: signedInUserId,
      career_slug: careerSlug,
      state_key: "workspace_progress",
      payload,
      is_deleted: false,
    },
    { onConflict: "user_id,career_slug,state_key" },
  );
  if (upsertError) throw new Error(`Own-state upsert failed: ${upsertError.message}`);

  const { data: ownRows, error: readError } = await supabase
    .from("career_user_state")
    .select("user_id,career_slug,state_key,payload,is_deleted")
    .eq("user_id", signedInUserId)
    .eq("career_slug", careerSlug)
    .eq("state_key", "workspace_progress");
  if (readError) throw new Error(`Own-state read failed: ${readError.message}`);
  if (!ownRows?.length || ownRows[0]?.payload?.marker !== marker) throw new Error("Own-state round trip did not preserve the test marker.");

  const impossibleUserId = "00000000-0000-0000-0000-000000000000";
  const { data: foreignRows, error: foreignReadError } = await supabase
    .from("career_user_state")
    .select("user_id")
    .eq("user_id", impossibleUserId);
  if (foreignReadError) throw new Error(`Foreign-row RLS probe failed unexpectedly: ${foreignReadError.message}`);
  if (foreignRows?.length) throw new Error("RLS failure: signed-in test account can read a row for another user id.");

  const { error: foreignWriteError } = await supabase.from("career_user_state").upsert(
    {
      user_id: impossibleUserId,
      career_slug: careerSlug,
      state_key: "workspace_progress",
      payload: { marker: "should-never-write" },
      is_deleted: false,
    },
    { onConflict: "user_id,career_slug,state_key" },
  );
  if (!foreignWriteError) throw new Error("RLS failure: signed-in test account could write state for another user id.");

  const { error: deleteError } = await supabase
    .from("career_user_state")
    .delete()
    .eq("user_id", signedInUserId)
    .eq("career_slug", careerSlug)
    .eq("state_key", "workspace_progress")
    .contains("payload", { marker });
  if (deleteError) throw new Error(`Test-state cleanup failed: ${deleteError.message}`);

  const { data: afterDelete, error: afterDeleteError } = await supabase
    .from("career_user_state")
    .select("state_key")
    .eq("user_id", signedInUserId)
    .eq("career_slug", careerSlug)
    .eq("state_key", "workspace_progress");
  if (afterDeleteError) throw new Error(`Cleanup verification failed: ${afterDeleteError.message}`);
  if (afterDelete?.length) throw new Error("Cleanup verification failed: test state still exists.");

  console.log("Authenticated Public Beta state gate passed: login, own-state round trip, owner RLS isolation, foreign-write rejection, and cleanup.");
} finally {
  if (signedInUserId) await supabase.auth.signOut();
}
