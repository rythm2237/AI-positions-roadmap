import { WorkspaceError, type Micros, type ModelConfiguration, type ProviderUsage } from "./contracts.ts";

const MAX_MICROS = BigInt(1_000_000_000_000_000);

export function micros(value: Micros): bigint {
  if (typeof value !== "string" || !/^(0|[1-9]\d{0,15})$/.test(value)) throw new WorkspaceError("INVALID_MONEY");
  const result = BigInt(value);
  if (result > MAX_MICROS) throw new WorkspaceError("INVALID_MONEY");
  return result;
}

export function tokenCount(value: number): bigint {
  if (!Number.isSafeInteger(value) || value < 0) throw new WorkspaceError("INVALID_USAGE");
  return BigInt(value);
}

export function costForUsage(model: ModelConfiguration, usage: ProviderUsage): Micros {
  const input = tokenCount(usage.inputTokens);
  const cached = tokenCount(usage.cachedInputTokens);
  const output = tokenCount(usage.outputTokens);
  if (cached > input) throw new WorkspaceError("INVALID_USAGE");
  const numerator = (input - cached) * micros(model.inputRate)
    + cached * micros(model.cachedInputRate) + output * micros(model.outputRate);
  return ((numerator + BigInt(999_999)) / BigInt(1_000_000)).toString();
}

/** Reserve uncached input and all billable output, including reasoning tokens. */
export function maximumCost(model: ModelConfiguration, inputTokens: number, outputTokens: number): Micros {
  return costForUsage(model, { inputTokens, cachedInputTokens: 0, outputTokens });
}
