import Link from "next/link";
import { BrandLogo, BrandMark } from "@/components/brand/BrandLogo";
import { privateRouteMetadata } from "@/lib/seo";
import { logout } from "./actions";

export const metadata = privateRouteMetadata("Private workspace");

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <><header className="sticky top-0 z-50 border-b border-white/[.06] bg-[#050714]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:gap-5 sm:px-5"><Link href="/" className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" aria-label="AI Role Path home"><BrandMark size={28} className="h-7 w-auto sm:hidden" /><BrandLogo className="hidden h-8 w-auto sm:block" /></Link><nav aria-label="Account navigation" className="ml-auto flex min-w-0 items-center gap-3 text-xs text-slate-400 sm:gap-4 sm:text-sm"><Link href="/dashboard" className="hover:text-white">Dashboard</Link><Link href="/job-search-mode" className="hidden hover:text-white sm:inline">Fast Track</Link><Link href="/profile" className="hover:text-white">Profile</Link><Link href="/job-agent" className="hidden hover:text-white lg:inline">Job Agent</Link><form action={logout}><button className="whitespace-nowrap hover:text-white">Log out</button></form></nav></div></header>{children}</>;
}
