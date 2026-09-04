export type ReleaseEvidence = { migrationsValidated: boolean; unitTestsPassed: boolean; contractTestsPassed: boolean; integrationTestsPassed: boolean; rlsTestsPassed: boolean; desktopE2EPassed: boolean; mobileE2EPassed: boolean; liveVacancyReached: boolean; validApplicationActionReached: boolean; productionSmokePassed: boolean; externalWarnings: string[] };
export function classifyRelease(evidence: ReleaseEvidence): "READY" | "READY WITH WARNINGS" | "NOT READY" {
  const required = [evidence.migrationsValidated, evidence.unitTestsPassed, evidence.contractTestsPassed, evidence.integrationTestsPassed, evidence.rlsTestsPassed, evidence.desktopE2EPassed, evidence.mobileE2EPassed, evidence.liveVacancyReached, evidence.validApplicationActionReached, evidence.productionSmokePassed];
  if (required.some((value) => !value)) return "NOT READY";
  return evidence.externalWarnings.length ? "READY WITH WARNINGS" : "READY";
}
