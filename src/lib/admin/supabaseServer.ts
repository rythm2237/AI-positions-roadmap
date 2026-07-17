import "server-only";

export function supabaseServerConfig() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  if (!url || !secretKey) throw new Error("ADMIN_DATABASE_NOT_CONFIGURED");
  return { url, secretKey };
}

export async function supabaseUserFetch(path: string, accessToken: string, init: RequestInit = {}) {
  const { url, secretKey } = supabaseServerConfig();
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  return response;
}
