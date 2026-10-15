import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordForm } from "@/components/auth/PasswordForm";
import { privateRouteMetadata } from "@/lib/seo";
export const metadata = privateRouteMetadata("Reset password");
export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return <AuthShell title="Forgot your password?" description="Enter your account email and we’ll send you a link to choose a new password. If you normally use Google or GitHub, you can also use this to set a password for the same email.">{query.error === "expired" && <p role="alert" className="mt-5 text-sm text-rose-200">This reset link has expired or was already used. Request a new one below.</p>}<PasswordForm mode="forgot" /></AuthShell>;
}
