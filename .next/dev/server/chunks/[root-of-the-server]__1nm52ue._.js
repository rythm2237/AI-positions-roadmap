module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/waitlist/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
// src/app/api/waitlist/route.ts
// Next.js Route Handler — receives waitlist form submissions,
// saves them to Supabase, and sends a welcome email via Resend.
//
// Environment variables required (add to .env.local and Vercel dashboard):
//   SUPABASE_URL           — your project URL from supabase.com → Settings → API
//   SUPABASE_SERVICE_KEY   — service_role secret key (NOT the anon key)
//   RESEND_API_KEY         — from resend.com → API Keys
//   RESEND_FROM_EMAIL      — verified sender address e.g. hello@yourdomain.com
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Minimal Supabase REST insert — no SDK needed, keeps bundle small. */ async function insertToSupabase(data) {
    const url = `${process.env.SUPABASE_URL}/rest/v1/waitlist`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
            Prefer: "return=minimal"
        },
        body: JSON.stringify({
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            interest: data.interest || null
        })
    });
    if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        // Code 23505 = unique violation (duplicate email) — treat as success
        if (err.code === "23505") return;
        throw new Error(`Supabase insert failed: ${err.message ?? res.statusText}`);
    }
}
/** Send a welcome email via Resend REST API — no SDK needed. */ async function sendWelcomeEmail(data) {
    const interestLabel = data.interest ? data.interest.replace(/-/g, " ").replace(/\b\w/g, (c)=>c.toUpperCase()) : "AI careers";
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the list!</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 40px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;color:#c7d2fe;text-transform:uppercase;">AI Career Roadmaps</p>
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">
                You're on the list! 🎉
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.6;">
                Hi <strong>${data.name.trim()}</strong>,
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.6;">
                Thanks for joining the early access waitlist for <strong>AI Career Roadmaps</strong>. 
                We've noted your interest in <strong>${interestLabel}</strong> and you'll be among 
                the first to know when it launches.
              </p>
              <p style="margin:0 0 32px;font-size:16px;color:#374151;line-height:1.6;">
                Here's what you get as an early member:
              </p>

              <!-- Benefits -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                ${[
        [
            "🚀",
            "Early access",
            "Be first in line when we launch — before the public."
        ],
        [
            "💰",
            "Early-bird pricing",
            "Locked-in discount for waitlist members only."
        ],
        [
            "🗺️",
            "Free Phase 1",
            "Start learning immediately — no account required."
        ],
        [
            "📬",
            "Launch updates",
            "We'll keep you posted on new roadmaps and features."
        ]
    ].map(([icon, title, desc])=>`
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:40px;font-size:22px;">${icon}</td>
                  <td style="padding:10px 0 10px 8px;vertical-align:top;">
                    <p style="margin:0;font-size:15px;font-weight:700;color:#1f2937;">${title}</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${desc}</p>
                  </td>
                </tr>`).join("")}
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://ai-positions-roadmap.vercel.app/roadmaps/ai-automation-specialist"
                       style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;">
                      Explore Free Preview →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;font-size:13px;color:#9ca3af;">
                You're receiving this because you signed up at ai-positions-roadmap.vercel.app.<br />
                No spam — ever. We respect your inbox.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL ?? "AI Career Roadmaps <hello@aicareerroadmaps.com>",
            to: [
                data.email.trim().toLowerCase()
            ],
            subject: "You're on the early access list 🎉",
            html
        })
    });
    if (!res.ok) {
        // Log but don't throw — a failed email should not block the user
        const body = await res.json().catch(()=>({}));
        console.error("[Resend] Failed to send welcome email:", body);
    }
}
// ─── Validation ───────────────────────────────────────────────────────────────
function validatePayload(body) {
    if (!body || typeof body !== "object") {
        throw new Error("Invalid request body.");
    }
    const { name, email, interest } = body;
    if (!name || typeof name !== "string" || name.trim().length < 2) {
        throw new Error("Please enter your full name.");
    }
    if (!email || typeof email !== "string") {
        throw new Error("Please enter a valid email address.");
    }
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        throw new Error("Please enter a valid email address.");
    }
    return {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        interest: typeof interest === "string" ? interest.trim() : ""
    };
}
async function POST(req) {
    try {
        // 1. Parse body
        const rawBody = await req.json().catch(()=>null);
        // 2. Validate
        let payload;
        try {
            payload = validatePayload(rawBody);
        } catch (validationError) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: validationError.message
            }, {
                status: 400
            });
        }
        // 3. Check env vars are configured
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
            console.error("[Waitlist] Missing Supabase env vars.");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Server configuration error. Please try again later."
            }, {
                status: 500
            });
        }
        // 4. Save to Supabase
        await insertToSupabase(payload);
        // 5. Send welcome email (non-blocking — failure won't affect response)
        if (process.env.RESEND_API_KEY) {
            sendWelcomeEmail(payload).catch((err)=>console.error("[Waitlist] Email send error:", err));
        }
        // 6. Return success
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "You're on the list!"
        }, {
            status: 200
        });
    } catch (err) {
        console.error("[Waitlist] Unexpected error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Something went wrong. Please try again."
        }, {
            status: 500
        });
    }
}
async function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Method not allowed."
    }, {
        status: 405
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1nm52ue._.js.map