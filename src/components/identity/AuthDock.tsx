"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AuthChangeEvent, Session, User, UserResponse } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

function nameFor(user: User) {
  const metadata = user.user_metadata ?? {};
  return metadata.full_name || metadata.name || metadata.user_name || user.email || "Account";
}

function avatarFor(user: User) {
  const metadata = user.user_metadata ?? {};
  return metadata.avatar_url || metadata.picture || null;
}

export default function AuthDock() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const inCareerWorkspace = pathname.startsWith("/careers/");
  const mobileTop = inCareerWorkspace
    ? "top-[calc(env(safe-area-inset-top)+0.5rem)]"
    : "top-[14px]";

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getUser().then(({ data }: UserResponse) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      setLoading(false);
      router.refresh();
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [router]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);

  async function signOut() {
    setSigningOut(true);
    await createClient().auth.signOut();
    setUser(null);
    setOpen(false);
    setSigningOut(false);
    router.replace("/");
    router.refresh();
  }

  if (pathname.startsWith("/admin")) return null;

  if (loading) {
    return (
      <div
        className={`fixed right-16 z-[65] h-10 w-10 animate-pulse rounded-full border border-white/10 bg-[#0a0d1d]/80 sm:right-4 lg:right-4 ${mobileTop} lg:top-[14px]`}
        aria-label="Loading account"
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login?next=%2Fdashboard"
        className={`fixed right-16 z-[65] rounded-xl border border-violet-300/20 bg-[#090b1d]/90 px-3 py-2.5 text-sm font-semibold text-violet-100 shadow-xl backdrop-blur-xl transition hover:bg-violet-500/15 sm:right-4 sm:px-4 lg:right-4 ${mobileTop} lg:top-[14px]`}
      >
        Sign in
      </Link>
    );
  }

  const name = nameFor(user);
  const avatar = avatarFor(user);

  return (
    <div ref={rootRef} className={`fixed right-16 z-[65] sm:right-4 lg:right-4 ${inCareerWorkspace ? "top-[calc(env(safe-area-inset-top)+0.375rem)]" : "top-[12px]"} lg:top-[12px]`}>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex h-11 max-w-[13.5rem] items-center gap-2 rounded-full border border-white/10 bg-[#090b1d]/92 p-1.5 pr-2 shadow-xl backdrop-blur-xl transition hover:border-violet-300/25 sm:pr-3" aria-expanded={open} aria-label="Open account menu">
        {avatar ? <img src={avatar} alt="" className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover" referrerPolicy="no-referrer" /> : <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-100">{name.slice(0, 1).toUpperCase()}</span>}
        <span className="hidden min-w-0 max-w-24 truncate text-sm font-medium text-slate-200 2xl:block">{name}</span>
        <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} fill="currentColor"><path d="m5.5 7.5 4.5 4 4.5-4" /></svg>
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-[min(14rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#090b1d]/98 p-2 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 px-3 py-2"><p className="truncate text-sm font-semibold text-white">{name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
          <div className="py-2">
            <Link href="/dashboard" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white">Dashboard</Link>
            <Link href="/profile" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white">Profile</Link>
          </div>
          <button type="button" onClick={signOut} disabled={signingOut} className="w-full rounded-xl border border-white/10 px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white disabled:opacity-50">{signingOut ? "Signing out…" : "Sign out"}</button>
        </div>
      ) : null}
    </div>
  );
}
