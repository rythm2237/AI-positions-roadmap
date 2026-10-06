export type GatewayFailure = {
  code: string;
  message: string;
  refundQuota: boolean;
  providerStatus?: number;
  errorName: string;
};
export function classifyStudioGatewayError(error: unknown): GatewayFailure {
  const value = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const status = typeof value.statusCode === "number" ? value.statusCode : undefined;
  const name = typeof value.name === "string" ? value.name : "UnknownError";
  const message = typeof value.message === "string" ? value.message.toLowerCase() : "";
  const gateway = name.startsWith("Gateway");
  const base = {providerStatus: status, errorName: name, refundQuota: gateway && [401,402,403,429].includes(status ?? 0)};
  if (gateway && status === 403 && /free tier.*(?:access|model)|model.*(?:not available|not allowed).*free tier/.test(message)) return {...base,code:"AI_MODEL_ACCESS_DENIED",message:"The configured AI model is unavailable on this site's current plan. Your draft is preserved."};
  if (gateway && (/budget|spend limit|quota.*exceed/.test(message) || status === 402)) return {...base,code:"AI_GATEWAY_BUDGET_EXCEEDED",message:"The site's AI spending limit has been reached. The site administrator must review the AI Gateway budget. Your draft is preserved."};
  if (gateway && /credit|balance|fund/.test(message)) return {...base,code:"AI_GATEWAY_CREDITS_UNAVAILABLE",message:"The site's AI credit balance is unavailable. The site administrator must review AI Gateway credits. Your draft is preserved."};
  if (gateway && status === 403) return {...base,code:"AI_GATEWAY_ACCESS_DENIED",message:"AI Gateway has denied this site's request. The site administrator must review Gateway access settings. Your draft is preserved."};
  if (gateway && status === 401) return {...base,code:"AI_GATEWAY_AUTH_FAILED",message:"The site's AI service could not authenticate. Your draft is preserved."};
  if (gateway && status === 429) return {...base,code:"AI_GATEWAY_RATE_LIMITED",message:"The AI provider is temporarily rate limited. Please try again later. Your draft is preserved."};
  return {...base,code:"AI_SERVICE_UNAVAILABLE",message:"The site's AI service is temporarily unavailable. Your draft is preserved. Please try again later."};
}
// Only free-tier model availability qualifies. Never bypass account budgets or configured access policies.
export function studioModelFallback(error: unknown, model: string): string | undefined {
  return model === "openai/gpt-5.4-mini" && classifyStudioGatewayError(error).code === "AI_MODEL_ACCESS_DENIED" ? "openai/gpt-4.1-mini" : undefined;
}
