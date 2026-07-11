import type { CareerJourneyData, JourneyPoint } from "@/types/careerJourney";

export type JourneyValidationCode =
  | "MISSING_STATION_ID"
  | "DUPLICATE_STATION_ID"
  | "INVALID_COORDINATES"
  | "INVALID_STATION_REFERENCE"
  | "MISSING_CONNECTION"
  | "MISSING_REQUIRED_TEST"
  | "INSUFFICIENT_TEST_QUESTIONS"
  | "MISSING_RESOURCE_FIELD";

export interface JourneyValidationIssue {
  code: JourneyValidationCode;
  message: string;
  path: string;
}

export interface JourneyValidationResult {
  valid: boolean;
  issues: JourneyValidationIssue[];
}

const validPoint = (point: JourneyPoint, width: number, height: number) =>
  Number.isFinite(point.x) && Number.isFinite(point.y) && point.x >= 0 && point.y >= 0 && point.x <= width && point.y <= height;

export function validateJourneyData(data: CareerJourneyData): JourneyValidationResult {
  const issues: JourneyValidationIssue[] = [];
  const add = (code: JourneyValidationCode, message: string, path: string) => issues.push({ code, message, path });
  const stationIds = new Set<string>();

  data.stations.forEach((station, index) => {
    const path = `stations[${index}]`;
    if (!station.id.trim()) add("MISSING_STATION_ID", "Station ID is required.", `${path}.id`);
    else if (stationIds.has(station.id)) add("DUPLICATE_STATION_ID", `Duplicate station ID: ${station.id}.`, `${path}.id`);
    else stationIds.add(station.id);

    if (!validPoint(station.position, data.map.width, data.map.height))
      add("INVALID_COORDINATES", `Station ${station.id || index} is outside the logical map.`, `${path}.position`);
    if (station.mobilePosition && !validPoint(station.mobilePosition, data.map.width, data.map.height))
      add("INVALID_COORDINATES", `Station ${station.id || index} has invalid mobile coordinates.`, `${path}.mobilePosition`);

    const tests = [station.test, station.phaseTest].filter((test) => test !== undefined);
    if (!station.test || !station.test.required)
      add("MISSING_REQUIRED_TEST", `Station ${station.id || index} requires a station test.`, `${path}.test`);
    tests.forEach((test) => {
      if (test.questions.length < 5)
        add("INSUFFICIENT_TEST_QUESTIONS", `Test ${test.id} must contain at least 5 questions.`, `${path}.${test === station.test ? "test" : "phaseTest"}.questions`);
    });

    station.resources.forEach((resource, resourceIndex) => {
      const missing = (["id", "title", "type", "provider", "url", "access", "priority"] as const).filter(
        (field) => typeof resource[field] !== "string" || !resource[field].trim()
      );
      if (missing.length)
        add("MISSING_RESOURCE_FIELD", `Resource is missing required fields: ${missing.join(", ")}.`, `${path}.resources[${resourceIndex}]`);
    });
  });

  data.stations.forEach((station, index) => {
    (["nextStationId", "previousStationId"] as const).forEach((field) => {
      const reference = station[field];
      if (reference && !stationIds.has(reference))
        add("INVALID_STATION_REFERENCE", `${field} references unknown station ${reference}.`, `stations[${index}].${field}`);
    });
    if (data.stations.length > 1) {
      const connected = data.connections.some(({ from, to }) => from === station.id || to === station.id);
      if (!connected) add("MISSING_CONNECTION", `Station ${station.id} has no connection.`, `stations[${index}]`);
    }
    if (station.nextStationId && !data.connections.some(({ from, to }) => from === station.id && to === station.nextStationId))
      add("MISSING_CONNECTION", `Missing connection from ${station.id} to ${station.nextStationId}.`, `stations[${index}].nextStationId`);
    if (station.previousStationId && !data.connections.some(({ from, to }) => from === station.previousStationId && to === station.id))
      add("MISSING_CONNECTION", `Missing connection from ${station.previousStationId} to ${station.id}.`, `stations[${index}].previousStationId`);
  });

  data.connections.forEach((connection, index) => {
    if (!stationIds.has(connection.from) || !stationIds.has(connection.to))
      add("INVALID_STATION_REFERENCE", `Connection references an unknown station (${connection.from} -> ${connection.to}).`, `connections[${index}]`);
  });

  return { valid: issues.length === 0, issues };
}
