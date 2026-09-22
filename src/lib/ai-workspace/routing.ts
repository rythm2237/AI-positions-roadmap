import { WorkspaceError, type Entitlements, type ExecutionRoute, type Intent, type ModelConfiguration, type WorkspaceMode } from "./contracts.ts";
import { maximumCost, micros } from "./money.ts";

const categories: Array<[string, RegExp]> = [
  ["debugging", /\b(debug|exception|stack trace|bug|error)\b|دیباگ|خطای/iu],
  ["architecture", /\b(architecture|distributed|system design|threat model)\b|معماری/iu],
  ["cv", /\b(cv|resume|résumé)\b|رزومه/iu],
  ["interview", /\binterview\b|مصاحبه/iu],
  ["translation", /\b(translat|translate|translation)\b|ترجمه/iu],
  ["marketing", /\b(marketing|seo|campaign)\b|بازاریابی/iu],
  ["development", /\b(code|typescript|javascript|python|sql|programming)\b|برنامه‌نویسی/iu],
  ["career", /\b(career|job|cover letter)\b|شغل|کاریابی/iu],
  ["research", /\b(research|sources|investigate)\b|تحقیق|منابع/iu],
];

export function classifyIntent(text: string): Intent {
  const category = categories.find(([, pattern]) => pattern.test(text))?.[0] ?? "general";
  const complex = ["debugging", "architecture"].includes(category) || text.length > 6000;
  const simple = /^(hi|hello|hey|سلام)[!.؟\s]*$/iu.test(text.trim()) || category === "translation";
  return {
    category,
    complexity: complex ? "complex" : simple ? "simple" : "standard",
    currentInformation: /\b(today|latest|current|search the web|browse|news)\b|امروز|آخرین|جستجو|جست‌وجو/iu.test(text),
    requiresVision: false,
  };
}

export function chooseRoute(input: {
  intent: Intent; mode: WorkspaceMode; models: ModelConfiguration[];
  entitlements: Entitlements; inputTokenBound: number; availableMicros: string; now?: number;
}): ExecutionRoute {
  const { entitlements, mode, intent } = input;
  if (!entitlements.enabled) throw new WorkspaceError("ACCESS_DISABLED", 403);
  if (!entitlements.modes.includes(mode)) throw new WorkspaceError("MODE_NOT_ALLOWED", 403);
  if (!Number.isSafeInteger(input.inputTokenBound) || input.inputTokenBound < 1
    || input.inputTokenBound > entitlements.maxContextTokens) throw new WorkspaceError("CONTEXT_LIMIT", 413);
  const available = micros(input.availableMicros);
  const ceiling = micros(entitlements.maxRequestMicros);
  const routes: ExecutionRoute[] = [];
  for (const model of input.models) {
    if (!model.enabled || !entitlements.models.includes(model.id)) continue;
    if (intent.requiresVision && !model.vision) continue;
    const verified = Date.parse(model.pricingVerifiedAt);
    // Stale/unknown prices fail closed until an administrator verifies them.
    if (!Number.isFinite(verified) || verified > (input.now ?? Date.now())
      || (input.now ?? Date.now()) - verified > 30 * 86400000) continue;
    if (!Number.isSafeInteger(model.contextTokens) || !Number.isSafeInteger(model.maxOutputTokens)
      || !Number.isFinite(model.quality) || !Number.isFinite(model.latency)) continue;
    const output = Math.min(model.maxOutputTokens, entitlements.maxOutputTokens,
      intent.complexity === "simple" ? 1024 : 4096);
    if (output < 1 || input.inputTokenBound + output > model.contextTokens) continue;
    if (micros(model.cachedInputRate) > micros(model.inputRate)) continue;
    const reservation = maximumCost(model, input.inputTokenBound, output);
    if (micros(reservation) > available || micros(reservation) > ceiling) continue;
    const desired = intent.complexity === "complex" && mode !== "fast" ? "high"
      : intent.complexity === "simple" || mode === "fast" ? "none" : "medium";
    const reasoning = model.reasoning.includes(desired) ? desired
      : model.reasoning.includes("low") ? "low" : model.reasoning[0];
    if (!reasoning) continue;
    routes.push({ model, reasoning, inputTokenBound: input.inputTokenBound,
      maxOutputTokens: output, reservationMicros: reservation, intent });
  }
  routes.sort((a, b) => {
    if (mode === "best" || (mode === "auto" && intent.complexity === "complex")) {
      const quality = b.model.quality - a.model.quality;
      if (quality) return quality;
    }
    const diff = micros(a.reservationMicros) - micros(b.reservationMicros);
    return diff === BigInt(0) ? a.model.latency - b.model.latency : diff < BigInt(0) ? -1 : 1;
  });
  if (!routes.length) throw new WorkspaceError("NO_AFFORDABLE_ROUTE", 402);
  return routes[0];
}
