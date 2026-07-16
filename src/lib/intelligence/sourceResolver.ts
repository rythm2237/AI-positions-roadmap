import registryData from "../../../content/intelligence/source-registry.json";
import type { IntelligenceSource } from "@/types/intelligenceSource";

const registry = registryData as IntelligenceSource[];
const byId = new Map(registry.map((source) => [source.sourceId, source]));
export function resolveIntelligenceSource(sourceId:string) { return byId.get(sourceId) ?? null; }
export function resolveIntelligenceSources(sourceIds:string[]) { return [...new Set(sourceIds)].map(resolveIntelligenceSource).filter((source):source is IntelligenceSource=>Boolean(source)); }
export function listIntelligenceSources() { return [...registry]; }
export function isSourceUsable(sourceId:string) { return resolveIntelligenceSource(sourceId)?.status === "active"; }
