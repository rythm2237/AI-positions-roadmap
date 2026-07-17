import { redirect } from "next/navigation";
import AdminNavigation from "@/components/admin/AdminNavigation";
import AccessDenied from "@/components/admin/AccessDenied";
import { logoutAction } from "@/app/admin/login/actions";
import { requireAdmin } from "@/lib/admin/adminAuth";
export default async function AdminStudioLayout({children}:{children:React.ReactNode}){const authorization=await requireAdmin().catch(()=>({status:"unauthenticated" as const}));if(authorization.status==="unauthenticated")redirect("/admin/login?returnTo=/admin");if(authorization.status==="forbidden")return <AccessDenied/>;return <div className="min-h-screen bg-slate-950 text-slate-200 lg:flex"><AdminNavigation/><div className="min-w-0 flex-1"><header className="flex min-h-16 items-center justify-between border-b border-white/10 px-4 sm:px-8"><p className="text-xs text-slate-500">Authorized operational workspace</p><form action={logoutAction}><button className="min-h-11 rounded-xl border border-white/10 px-4 text-xs font-semibold text-white">Sign out</button></form></header>{children}</div></div>}
