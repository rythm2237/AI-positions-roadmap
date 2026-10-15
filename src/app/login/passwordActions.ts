"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { seoConfig } from "@/lib/seo";
import { runPasswordFlow, type AuthFormState, type PasswordMode } from "@/lib/auth/password";

async function submit(mode: PasswordMode, form: FormData): Promise<AuthFormState> {
  let state: AuthFormState;
  try {
    const requestHeaders = await headers();
    const production = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";
    const origin = production ? seoConfig.siteUrl : requestHeaders.get("origin");
    if (!origin) return { error: "Sign-in is temporarily unavailable. Please reload and try again." };
    state = await runPasswordFlow(await createClient(), mode, form, origin);
  } catch {
    return { error: "Authentication is temporarily unavailable. Please try again later." };
  }
  if (state.destination) redirect(state.destination);
  return state;
}
export async function loginWithPassword(_state: AuthFormState, form: FormData) { return submit("login", form); }
export async function registerWithPassword(_state: AuthFormState, form: FormData) { return submit("signup", form); }
export async function requestPasswordReset(_state: AuthFormState, form: FormData) { return submit("forgot", form); }
export async function updatePassword(_state: AuthFormState, form: FormData) { return submit("reset", form); }
