import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogoWithDescriptor } from "@/components/brand/BrandLogo";

export function AuthShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <main className="grid min-h-dvh place-items-center px-5 py-16"><section className="glass w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-premium">
    <Link href="/" className="inline-flex rounded-xl focus-visible:ring-2 focus-visible:ring-violet-400" aria-label="Back to AI Role Path"><BrandLogoWithDescriptor className="h-12 w-auto" /></Link>
    <p className="eyebrow mt-8">Your private workspace</p><h1 className="mt-3 font-display text-3xl font-semibold text-white">{title}</h1>
    <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>{children}
  </section></main>;
}
