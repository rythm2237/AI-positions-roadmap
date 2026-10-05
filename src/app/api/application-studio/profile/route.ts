import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.is_anonymous) return NextResponse.json({ error: "Sign in to import your personal profile and saved CV." }, { status: 401 });
  const slug = new URL(request.url).searchParams.get("career") || "";
  const [profile, resumes, state] = await Promise.all([
    supabase.from("profiles").select("name,email,current_country,current_position,years_experience,skills,languages,certificates").eq("id", user.id).maybeSingle(),
    supabase.from("resumes").select("storage_path,file_type,title").eq("user_id", user.id).order("uploaded_at", { ascending: false }).limit(1),
    slug && /^[a-z0-9-]{1,100}$/.test(slug) ? supabase.from("career_user_state").select("state_key,payload").eq("user_id", user.id).eq("career_slug", slug).eq("is_deleted", false).in("state_key", ["workspace_progress", "project_evidence"]) : Promise.resolve({ data: [] }),
  ]);
  if (profile.error || !profile.data) return NextResponse.json({ error: "Your profile is unavailable. Complete your profile first." }, { status: 503 });
  let resume = null;
  const latest = resumes.data?.[0];
  if (latest?.storage_path.startsWith(`${user.id}/`)) {
    const signed = await supabase.storage.from("resumes").createSignedUrl(latest.storage_path, 120);
    if (signed.data) resume = { url: signed.data.signedUrl, name: `Saved-CV.${latest.file_type}` };
  }
  return NextResponse.json({ userId: user.id, profile: profile.data, resume, progress: state.data?.find(row => row.state_key === "workspace_progress")?.payload, projects: state.data?.find(row => row.state_key === "project_evidence")?.payload }, { headers: { "Cache-Control": "private, no-store" } });
}
