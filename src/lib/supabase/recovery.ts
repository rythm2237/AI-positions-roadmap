import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "./config";

// Recovery links are opened in mail apps and other devices. Do not bind issuance
// to a PKCE verifier cookie in the browser that requested the email.
// OAuth and normal sign-in continue to use the existing SSR/PKCE client.
export function createRecoveryEmailClient() {
  const { url, publishableKey } = getPublicSupabaseConfig();
  return createClient(url, publishableKey, { auth: {
    flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } });
}
