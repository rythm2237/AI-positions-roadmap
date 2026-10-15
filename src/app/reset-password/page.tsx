import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordForm } from "@/components/auth/PasswordForm";
import { getCurrentUser } from "@/lib/auth/session";
import { privateRouteMetadata } from "@/lib/seo";
export const metadata = privateRouteMetadata("Choose new password");
export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  return <AuthShell title="Choose a new password" description="Set a unique password for your account.">{user ? <PasswordForm mode="reset" /> : <div className="mt-6 space-y-4"><p role="alert" className="text-sm text-rose-200">Your reset link is missing or has expired. Request a new link and open it in the same browser.</p><Link className="inline-block text-indigo-300 hover:underline" href="/forgot-password">Request a new reset link</Link></div>}</AuthShell>;
}
