export type ScheduledDiscoveryAgent = { user_id: string; updated_at: string };

export type ScheduledDiscoveryOutcome = {
  ok: boolean;
  code: string;
};

export function scheduledDiscoveryMaxUsers(rawValue: string | undefined) {
  return Math.max(1, Math.min(5, Number(rawValue) || 2));
}

export function summarizeScheduledDiscovery(outcomes: ScheduledDiscoveryOutcome[]) {
  const completed = outcomes.filter((outcome) => outcome.ok).length;
  const failed = outcomes.length - completed;
  return {
    status: failed > 0 ? "partial" : "completed",
    attempted: outcomes.length,
    completed,
    failed,
    outcomes,
  } as const;
}

export async function executeScheduledJobDiscovery({
  maxUsers,
  loadAgents,
  searchUser,
}: {
  maxUsers: number;
  loadAgents: (limit: number) => Promise<ScheduledDiscoveryAgent[]>;
  searchUser: (userId: string) => Promise<ScheduledDiscoveryOutcome>;
}) {
  const agents = await loadAgents(maxUsers);
  const outcomes: ScheduledDiscoveryOutcome[] = [];
  for (const agent of agents) {
    try {
      outcomes.push(await searchUser(agent.user_id));
    } catch (error) {
      outcomes.push({
        ok: false,
        code: error instanceof Error ? error.message.slice(0, 80) : "SCHEDULED_DISCOVERY_FAILED",
      });
    }
  }
  return summarizeScheduledDiscovery(outcomes);
}
