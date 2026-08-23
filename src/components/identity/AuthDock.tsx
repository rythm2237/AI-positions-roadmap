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

  if (loading) return <div className="fixed right-4 top-[14px] z-[65] h-10 w-10 animate-pulse rounded-full border border-white/10 bg-[#0a0d1d]/80" aria-label="Loading account" />;

  if (!user) {
    return <Link href="/login?next=%2Fdashboard" className="fixed right-4 top-[14px] z-[65] rounded-xl border border-violet-300/20 bg-[#090b1d]/90 px-4 py-2.5 text-sm font-semibold text-violet-100 shadow-xl backdrop-blur-xl transition hover:bg-violet-500/15">Sign in</Link>;
  }

  const name = nameFor(user);
  const avatar = avatarFor(user);

  return (
    <div ref={rootRef} className="fixed right-4 top-[12px] z-[65]">
      <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#090b1d]/92 p-1.5 shadow-xl backdrop-blur-xl transition hover:border-violet-300/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" aria-expanded={open} aria-label="Open account menu" title={name}>
        {avatar ? <img src={avatar} alt="" className="h-8 w-8 rounded-full border border-white/10 object-cover" referrerPolicy="no-referrer" /> : <span className="grid h-8 w-8 place-items-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-100">{name.slice(0, 1).toUpperCase()}</span>}
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#090b1d]/98 p-2 shadow-2xl backdrop-blur-xl">
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
