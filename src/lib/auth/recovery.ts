import type { SupabaseClient } from "@supabase/supabase-js";

export function recoveryTokens(fragment: string) {
  const parameters = new URLSearchParams(fragment.replace(/^#/, ""));
  if (parameters.get("type") !== "recovery" || parameters.has("error") || parameters.has("error_code")) return null;
  const access_token = parameters.get("access_token");
  const refresh_token = parameters.get("refresh_token");
  return access_token && refresh_token ? { access_token, refresh_token } : null;
}

export async function restoreRecoverySession(client: Pick<SupabaseClient, "auth">, fragment: string) {
  const tokens = recoveryTokens(fragment);
  if (!tokens) return false;
  const { error } = await client.auth.setSession(tokens);
  if (error) return false;
  const { data: { user }, error: userError } = await client.auth.getUser();
  return !userError && Boolean(user);
}
