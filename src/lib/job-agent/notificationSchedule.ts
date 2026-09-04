import type { JobAgent } from "../../types/jobAgent.ts";

export function localScheduleParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", hourCycle: "h23" });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, weekday: parts.weekday, hour: Number(parts.hour) };
}

export function jobReportDue(agent: Pick<JobAgent, "status" | "report_frequency" | "notification_channels" | "timezone" | "report_time">, now: Date) {
  if (agent.status !== "active" || agent.report_frequency === "none" || !agent.notification_channels.includes("email")) return null;
  let local: ReturnType<typeof localScheduleParts>;
  try { local = localScheduleParts(now, agent.timezone || "UTC"); } catch { return null; }
  const requestedHour = Number((agent.report_time ?? "20:00").slice(0, 2));
  if (Number.isFinite(requestedHour) && local.hour !== requestedHour) return null;
  if (agent.report_frequency === "weekly" && local.weekday !== "Mon") return null;
  return { type: agent.report_frequency as "daily" | "weekly", periodKey: agent.report_frequency === "weekly" ? `${local.date}:week` : local.date };
}
