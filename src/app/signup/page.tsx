import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { safeInternalRedirect } from "@/lib/auth/redirects";
import { privateRouteMetadata } from "@/lib/seo";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordForm } from "@/components/auth/PasswordForm";
export const metadata = privateRouteMetadata("Create account");
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const query = await searchParams;
  return <AuthShell title="Create your account" description="Use your email to save careers, manage your CV and track your progress."><PasswordForm mode="signup" next={safeInternalRedirect(query.next)} /></AuthShell>;
}
