import fs from 'node:fs';

const route = fs.readFileSync('src/app/api/cron/job-agent-reports/route.ts', 'utf8');
if (!route.includes('process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL')) {
  throw new Error('Job Agent cron must normalize SUPABASE_URL from NEXT_PUBLIC_SUPABASE_URL');
}
console.log('Job Agent cron Supabase URL fallback check passed.');
