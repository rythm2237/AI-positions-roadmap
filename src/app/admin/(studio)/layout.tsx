import { redirect } from "next/navigation";
import AccessDenied from "@/components/admin/AccessDenied";
import AdminStudioShell from "@/components/admin/AdminStudioShell";
import { logoutAction } from "@/app/admin/login/actions";
import { requireAdmin } from "@/lib/admin/adminAuth";

export default async function AdminStudioLayout({ children }: { children: React.ReactNode }) {
  const authorization = await requireAdmin().catch(() => ({ status: "unauthenticated" as const }));
  if (authorization.status === "unauthenticated") redirect("/admin/login?returnTo=/admin");
  if (authorization.status === "forbidden") return <AccessDenied />;

  const logoutControl = (
    <form action={logoutAction}>
      <button className="min-h-11 rounded-xl border border-white/10 px-4 text-xs font-semibold text-white">Sign out</button>
    </form>
  );

  return <AdminStudioShell logoutControl={logoutControl}>{children}</AdminStudioShell>;
}
