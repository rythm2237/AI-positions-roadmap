import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;
export function createClient() {
  const { url, publishableKey } = getPublicSupabaseConfig();
  browserClient ??= createBrowserClient(url, publishableKey);
  return browserClient;
}
