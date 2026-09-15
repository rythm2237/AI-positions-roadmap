import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getPublishedCareer } from "../src/lib/publishedCareerFetch.ts";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const originalFetch = globalThis.fetch;
const originalAbortSignalTimeout = AbortSignal.timeout;

function restoreGlobals() {
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;

  if (originalAnonKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;

  globalThis.fetch = originalFetch;
  AbortSignal.timeout = originalAbortSignalTimeout;
}

function configureManagedContent() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://managed-content-preview.invalid";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "synthetic-anon-key";
}

test("managed Career lookup returns null when configuration is missing", async (t) => {
  t.after(restoreGlobals);
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  globalThis.fetch = async () => {
    throw new Error("fetch must not run without configuration");
  };

  assert.equal(await getPublishedCareer("ai-automation-specialist"), null);
});

test("managed Career lookup contains network exceptions", async (t) => {
  t.after(restoreGlobals);
  configureManagedContent();
  globalThis.fetch = async () => {
    throw new Error("synthetic DNS failure");
  };

  assert.equal(await getPublishedCareer("ai-automation-specialist"), null);
});

test("managed Career lookup returns null for non-2xx responses", async (t) => {
  t.after(restoreGlobals);
  configureManagedContent();
  globalThis.fetch = async () => ({ ok: false, status: 503 });

  assert.equal(await getPublishedCareer("ai-automation-specialist"), null);
});

test("managed Career lookup uses a bounded 3-5 second timeout and contains timeout errors", async (t) => {
  t.after(restoreGlobals);
  configureManagedContent();

  let configuredTimeoutMs = 0;
  AbortSignal.timeout = (milliseconds) => {
    configuredTimeoutMs = milliseconds;
    return AbortSignal.abort(new DOMException("Synthetic managed-content timeout", "TimeoutError"));
  };
  globalThis.fetch = async (_input, init) => {
    assert.equal(init?.signal?.aborted, true);
    throw init?.signal?.reason ?? new Error("synthetic timeout");
  };

  assert.equal(await getPublishedCareer("ai-automation-specialist"), null);
  assert.ok(configuredTimeoutMs >= 3_000 && configuredTimeoutMs <= 5_000);
});

test("managed Career lookup returns a valid published Career response", async (t) => {
  t.after(restoreGlobals);
  configureManagedContent();

  const managedCareer = {
    slug: "ai-automation-specialist",
    title: "AI Automation Specialist",
    shortDescription: "Synthetic managed Career content.",
    skills: ["Automation"],
    data: { slug: "ai-automation-specialist", title: "Managed workspace" },
  };

  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => [{ content_json: managedCareer, published_at: "2026-09-15T00:00:00.000Z" }],
  });

  assert.deepEqual(await getPublishedCareer("ai-automation-specialist"), managedCareer);
});

test("public Career page retains curated content as the managed-content fallback", () => {
  const pageSource = readFileSync(
    new URL("../src/app/careers/[slug]/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(pageSource, /managed\?\.data\s*\?\?\s*builtIn\[slug\]\s*\?\?\s*null/);
});
