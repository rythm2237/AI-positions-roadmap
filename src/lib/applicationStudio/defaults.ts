import "server-only";
import { createClient } from "@/lib/supabase/server";
import { designFor, photoData, TEMPLATES } from "./design.mjs";

export type SavedDesign = { template: string; design: ReturnType<typeof designFor> };
export type DesignDefaults = SavedDesign & { portrait: string | null; contentVolume: string; letters: { cover: SavedDesign; motivation: SavedDesign } };
const scope = { career_slug: "application-studio", state_key: "applications" };
export function sanitizeDefaults(input: unknown): DesignDefaults {
  if (!input || typeof input !== "object") throw new Error("Invalid design settings.");
  const value = input as Record<string, unknown>;
  const sanitize = (item: unknown): SavedDesign => {
    const v = item && typeof item === "object" ? item as Record<string, unknown> : value;
    const template = typeof v.template === "string" && TEMPLATES.some(t => t.name === v.template) ? v.template : "Professional";
    return { template, design: designFor(template, v.design) };
  };
  const letters = value.letters && typeof value.letters === "object" ? value.letters as Record<string, unknown> : {};
  if (value.portrait && !photoData(value.portrait)) throw new Error("Invalid portrait. Upload a PNG or JPEG photo again.");
  return { ...sanitize(value), portrait: photoData(value.portrait), contentVolume: ["short", "balanced", "long"].includes(String(value.contentVolume)) ? String(value.contentVolume) : "balanced", letters: { cover: sanitize(letters.cover), motivation: sanitize(letters.motivation) } };
}
export async function getDesignDefaults(userId: string) {
  const db = await createClient();
  const { data, error } = await db.from("career_user_state").select("payload").eq("user_id", userId).eq("career_slug", scope.career_slug).eq("state_key", scope.state_key).eq("is_deleted", false).maybeSingle();
  if (error) throw new Error("Saved designs are unavailable.");
  return data?.payload?.designDefaults ? sanitizeDefaults(data.payload.designDefaults) : null;
}
export async function putDesignDefaults(userId: string, defaults: DesignDefaults) {
  const db = await createClient();
  const { error } = await db.from("career_user_state").upsert({ user_id: userId, ...scope, payload: { schemaVersion: 1, designDefaults: defaults }, is_deleted: false }, { onConflict: "user_id,career_slug,state_key" });
  if (error) throw new Error("Your default designs could not be saved.");
}
