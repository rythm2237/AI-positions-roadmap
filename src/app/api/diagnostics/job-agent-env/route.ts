import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabaseUrl: Boolean(process.env.SUPABASE_URL),
    nextPublicSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseSecretKey: Boolean(process.env.SUPABASE_SECRET_KEY),
    supabaseServiceKey: Boolean(process.env.SUPABASE_SERVICE_KEY),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    resendApiKey: Boolean(process.env.RESEND_API_KEY),
    resendFromEmail: Boolean(process.env.RESEND_FROM_EMAIL),
    cronSecret: Boolean(process.env.CRON_SECRET),
  });
}
