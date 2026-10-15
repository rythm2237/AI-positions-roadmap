import { privateRouteMetadata } from "@/lib/seo";
export const metadata = privateRouteMetadata("Verify password reset");
export default function RecoveryPage() {
  return <main className="grid min-h-dvh place-items-center px-5"><p role="status" className="text-slate-300">Verifying your password reset link…</p><noscript>Enable JavaScript to verify this email link, or request a new link from the forgot-password page.</noscript></main>;
}
