const origin = (process.env.PUBLIC_BETA_SMOKE_ORIGIN || "https://www.airolepath.com").replace(/\/$/, "");

async function expectStatus(path, expected, init) {
  const response = await fetch(`${origin}${path}`, { redirect: "manual", ...init });
  if (!expected.includes(response.status)) {
    const body = await response.text().catch(() => "");
    throw new Error(`${path}: expected ${expected.join("/")}, got ${response.status}. ${body.slice(0, 240)}`);
  }
  console.log(`✓ ${path} → ${response.status}`);
  return response;
}

const publicRoutes = [
  "/",
  "/careers",
  "/careers/ai-automation-specialist",
  "/cv-analyzer",
  "/contact",
  "/support",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/refunds",
  "/login",
];

for (const route of publicRoutes) {
  await expectStatus(route, [200]);
}

// Public Beta commercial boundary: direct checkout must stay unavailable.
await expectStatus("/api/billing/checkout", [503], {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ careerSlug: "ai-automation-specialist", interval: "monthly" }),
});

// AI endpoints must not be usable anonymously. These checks are non-destructive and
// should fail before any model call or quota consumption occurs.
await expectStatus("/api/project-review", [401], {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({}),
});

await expectStatus("/api/interview-review", [401], {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({}),
});

console.log("Public Beta production smoke passed: public routes are reachable, paid checkout is disabled, and AI review endpoints require authentication.");
