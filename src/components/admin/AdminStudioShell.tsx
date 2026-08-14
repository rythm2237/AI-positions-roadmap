"use client";

import { usePathname } from "next/navigation";
import AdminNavigation from "@/components/admin/AdminNavigation";

export default function AdminStudioShell({
  children,
  logoutControl,
}: {
  children: React.ReactNode;
  logoutControl: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCareerPreview = /^\/admin\/careers\/[^/]+\/preview$/.test(pathname);

  if (isCareerPreview) {
    return <div className="h-dvh overflow-hidden bg-slate-950 text-slate-200">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 lg:flex">
      <AdminNavigation />
      <div className="min-w-0 flex-1">
        <header className="flex min-h-16 items-center justify-between border-b border-white/10 px-4 sm:px-8">
          <p className="text-xs text-slate-500">Authorized operational workspace</p>
          {logoutControl}
        </header>
        {children}
      </div>
    </div>
  );
}
