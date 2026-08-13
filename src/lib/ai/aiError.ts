import "server-only";
import { APICallError, NoOutputGeneratedError, TypeValidationError } from "ai";

export type CareerAiErrorCode =
  | "AI_GATEWAY_NOT_CONFIGURED"
  | "AI_GATEWAY_BILLING_REQUIRED"
  | "AI_GATEWAY_MODEL_RESTRICTED"
  | "AI_GATEWAY_RATE_LIMITED"
  | "AI_SCHEMA_REJECTED"
  | "AI_OUTPUT_INVALID"
  | "CAREER_GENERATION_FAILED"
  | "RESOURCE_GENERATION_FAILED";

function errorChain(error: unknown) {
  const chain: unknown[] = [];
  let current: unknown = error;
  for (let index = 0; current && index < 6; index += 1) {
    chain.push(current);
    current = current instanceof Error ? current.cause : undefined;
  }
  return chain;
}

export function classifyCareerAiError(error: unknown, fallback: "CAREER_GENERATION_FAILED" | "RESOURCE_GENERATION_FAILED") {
  const chain = errorChain(error);
  const apiError = chain.find(APICallError.isInstance);
  const message = chain.map((item) => item instanceof Error ? `${item.name}: ${item.message}` : String(item)).join(" | ");

  // Gateway account-verification failures currently arrive as 403 responses,
  // so billing signals must be classified before generic authentication errors.
  if (apiError?.statusCode === 402 || /billing|payment|required credits|spend limit|valid credit card|customer_verification_required|add-credit-card/i.test(message)) {
    return { code: "AI_GATEWAY_BILLING_REQUIRED" as const, status: 503 };
  }
  if (apiError?.statusCode === 403
    && /free tier users do not have access|RestrictedModelsError|restricted model|upgrade to paid credits|modal=top-up/i.test(message)) {
    return { code: "AI_GATEWAY_MODEL_RESTRICTED" as const, status: 503 };
  }
  if (apiError?.statusCode === 401 || apiError?.statusCode === 403 || /Unauthenticated|AI_GATEWAY_API_KEY|GatewayAuthentication|OIDC/i.test(message)) {
    return { code: "AI_GATEWAY_NOT_CONFIGURED" as const, status: 503 };
  }
  if (apiError?.statusCode === 429 || /rate.?limit|too many requests/i.test(message)) {
    return { code: "AI_GATEWAY_RATE_LIMITED" as const, status: 429 };
  }
  if (apiError?.statusCode === 400 && /schema|response_format|structured output/i.test(message)) {
    return { code: "AI_SCHEMA_REJECTED" as const, status: 502 };
  }
  if (chain.some((item) => NoOutputGeneratedError.isInstance(item) || TypeValidationError.isInstance(item))
    || /OUTPUT_INVALID|No output generated|could not parse/i.test(message)) {
    return { code: "AI_OUTPUT_INVALID" as const, status: 502 };
  }
  return { code: fallback, status: 500 };
}

export function logCareerAiError(error: unknown, context: { route: string; requestId: string | null; startedAt: number }) {
  const chain = errorChain(error);
  const apiError = chain.find(APICallError.isInstance);
  console.error(JSON.stringify({
    level: "error",
    message: "Career AI request failed",
    route: context.route,
    requestId: context.requestId,
    durationMs: Date.now() - context.startedAt,
    errorName: error instanceof Error ? error.name : "UnknownError",
    errorMessage: error instanceof Error ? error.message.slice(0, 800) : String(error).slice(0, 800),
    cause: chain.slice(1).map((item) => item instanceof Error ? `${item.name}: ${item.message}`.slice(0, 800) : String(item).slice(0, 800)),
    providerStatus: apiError?.statusCode,
    providerResponse: apiError?.responseBody?.slice(0, 1200),
  }));
}
