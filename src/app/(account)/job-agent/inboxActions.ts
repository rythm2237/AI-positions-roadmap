"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const idFrom = (form: FormData) => String(form.get("inbox_id") ?? "").trim();

export async function markInboxRead(form: FormData) {
  const user = await requireUser("/job-agent"); const id = idFrom(form); if (!id) return;
  const supabase = await createClient();
  await supabase.from("job_agent_inbox").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/job-agent");
}

export async function dismissInboxItem(form: FormData) {
  const user = await requireUser("/job-agent"); const id = idFrom(form); if (!id) return;
  const supabase = await createClient();
  await supabase.from("job_agent_inbox").update({ status: "dismissed", read_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/job-agent");
}
