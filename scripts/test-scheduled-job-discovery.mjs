import assert from "node:assert/strict";
import test from "node:test";

import {
  executeScheduledJobDiscovery,
  scheduledDiscoveryMaxUsers,
  summarizeScheduledDiscovery,
} from "../src/lib/job-agent/scheduledDiscoveryRunner.ts";

test("scheduled discovery defaults to two users and enforces the 1..5 boundary", () => {
  assert.equal(scheduledDiscoveryMaxUsers(undefined), 2);
  assert.equal(scheduledDiscoveryMaxUsers("0"), 2);
  assert.equal(scheduledDiscoveryMaxUsers("1"), 1);
  assert.equal(scheduledDiscoveryMaxUsers("50"), 5);
});

test("scheduled discovery returns completed for an empty or successful batch", () => {
  assert.deepEqual(summarizeScheduledDiscovery([]), {
    status: "completed",
    attempted: 0,
    completed: 0,
    failed: 0,
    outcomes: [],
  });
  assert.equal(summarizeScheduledDiscovery([{ ok: true, code: "completed" }]).status, "completed");
});

test("scheduled discovery isolates a user failure and continues the batch", async () => {
  const seen = [];
  const result = await executeScheduledJobDiscovery({
    maxUsers: 2,
    async loadAgents(limit) {
      assert.equal(limit, 2);
      return [
        { user_id: "user-a", updated_at: "2026-01-01T00:00:00Z" },
        { user_id: "user-b", updated_at: "2026-01-02T00:00:00Z" },
      ];
    },
    async searchUser(userId) {
      seen.push(userId);
      if (userId === "user-a") throw new Error("PROVIDER_TIMEOUT");
      return { ok: true, code: "completed" };
    },
  });

  assert.deepEqual(seen, ["user-a", "user-b"]);
  assert.equal(result.status, "partial");
  assert.equal(result.attempted, 2);
  assert.equal(result.completed, 1);
  assert.equal(result.failed, 1);
  assert.equal(result.outcomes[0]?.code, "PROVIDER_TIMEOUT");
});

test("scheduled discovery runs users sequentially to bound provider pressure", async () => {
  let active = 0;
  let peak = 0;
  await executeScheduledJobDiscovery({
    maxUsers: 2,
    async loadAgents() {
      return [
        { user_id: "user-a", updated_at: "2026-01-01T00:00:00Z" },
        { user_id: "user-b", updated_at: "2026-01-02T00:00:00Z" },
      ];
    },
    async searchUser() {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      return { ok: true, code: "completed" };
    },
  });
  assert.equal(peak, 1);
});
