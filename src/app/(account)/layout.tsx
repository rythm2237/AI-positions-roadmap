import Link from "next/link";
import { logout } from "./actions";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <><header className="sticky top-0 z-50 border-b border-white/[.06] bg-[#050714]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-6xl items-center gap-5 px-5 py-4"><Link href="/" className="font-display font-semibold text-white">AI Career <span className="gradient-text">OS</span></Link><nav aria-label="Account navigation" className="ml-auto flex items-center gap-4 text-sm text-slate-400"><Link href="/dashboard" className="hover:text-white">Dashboard</Link><Link href="/profile" className="hover:text-white">Profile</Link><form action={logout}><button className="hover:text-white">Log out</button></form></nav></div></header>{children}</>;
}

