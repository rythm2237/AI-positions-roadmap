import type {
  CareerEffortRange,
  CareerJourneyEffortEstimate,
} from "@/types/careerWorkspace";

export function formatEffortMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} ${hours === 1 ? "hour" : "hours"}`;
}

export function formatEffortRange(range: CareerEffortRange): string {
  if (range.minMinutes === range.maxMinutes) {
    return formatEffortMinutes(range.minMinutes);
  }

  if (range.minMinutes >= 60 && range.maxMinutes >= 60) {
    const minHours = range.minMinutes / 60;
    const maxHours = range.maxMinutes / 60;
    const formatHours = (hours: number) =>
      Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
    return `${formatHours(minHours)}–${formatHours(maxHours)} hours`;
  }

  return `${formatEffortMinutes(range.minMinutes)}–${formatEffortMinutes(range.maxMinutes)}`;
}

export function getEffortBreakdownTotal(
  breakdown: CareerJourneyEffortEstimate["breakdown"]
): CareerEffortRange {
  return Object.values(breakdown).reduce<CareerEffortRange>(
    (total, range) => ({
      minMinutes: total.minMinutes + range.minMinutes,
      maxMinutes: total.maxMinutes + range.maxMinutes,
    }),
    { minMinutes: 0, maxMinutes: 0 }
  );
}
