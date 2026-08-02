"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthChangeEvent, Session, User, UserResponse } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

function displayName(user: User) {
  const metadata = user.user_metadata ?? {};
  return metadata.full_name || metadata.name || metadata.user_name || user.email || "Account";
}

function avatarUrl(user: User) {
  const metadata = user.user_metadata ?? {};
  return metadata.avatar_url || metadata.picture || null;
}

export default function AuthDock() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }: UserResponse) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
        router.refresh();
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSigningOut(false);
    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="fixed right-4 top-[76px] z-[55] h-10 w-24 animate-pulse rounded-xl border border-white/10 bg-[#0a0d1d]/85 backdrop-blur-xl" aria-label="Loading account status" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login?next=%2Fdashboard"
        className="fixed right-4 top-[76px] z-[55] rounded-xl border border-indigo-300/20 bg-[#0a0d1d]/90 px-4 py-2.5 text-sm font-semibold text-indigo-100 shadow-xl backdrop-blur-xl transition hover:border-indigo-300/40 hover:bg-indigo-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        Sign in
      </Link>
    );
  }

  const avatar = avatarUrl(user);
  const name = displayName(user);

  return (
    <div className="fixed right-4 top-[76px] z-[55] flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0a0d1d]/92 p-2 shadow-2xl backdrop-blur-xl">
      <Link href="/dashboard" className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-8 w-8 rounded-full border border-white/10 object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-100">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-36 truncate text-sm font-medium text-slate-200 sm:block">{name}</span>
      </Link>
      <button
        type="button"
        onClick={signOut}
        disabled={signingOut}
        className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
