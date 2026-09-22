import { WorkspaceError, type ProviderUsage } from "./contracts.ts";
import type { ProviderEvent, WorkspaceProvider } from "./execution.ts";

/** Server callers supply the key; there is no configurable URL/SSRF surface. */
export function createOpenAIProvider(apiKey: string, fetcher: typeof fetch = fetch): WorkspaceProvider {
  if (!apiKey) throw new WorkspaceError("PROVIDER_NOT_CONFIGURED", 503);
  return {
    async *stream({ route, context, requestId, signal }): AsyncIterable<ProviderEvent> {
      const response = await fetcher("https://api.openai.com/v1/responses", {
        method: "POST", cache: "no-store",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Client-Request-Id": requestId },
        signal: AbortSignal.any([signal, AbortSignal.timeout(110000)]),
        body: JSON.stringify({ model: route.model.id, stream: true, store: false,
          instructions: context.system,
          input: [{ role: "developer", content: context.developer }, ...context.messages],
          max_output_tokens: route.maxOutputTokens,
          ...(route.reasoning !== "none" ? { reasoning: { effort: route.reasoning } } : {}),
        }),
      });
      if (!response.ok || !response.body) throw new WorkspaceError("PROVIDER_UNAVAILABLE", 502);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const chunk = await reader.read();
          buffer += decoder.decode(chunk.value, { stream: !chunk.done });
          // Normalize CRLF only after chunk assembly (a CR/LF can straddle chunks).
          buffer = buffer.replace(/\r\n/g, "\n");
          if (buffer.length > 1000000) throw new WorkspaceError("INVALID_PROVIDER_STREAM", 502);
          let end: number;
          while ((end = buffer.indexOf("\n\n")) !== -1) {
            const frame = buffer.slice(0, end);
            buffer = buffer.slice(end + 2);
            const data = frame.split("\n").filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n");
            if (!data || data === "[DONE]") continue;
            const event = JSON.parse(data) as { type?: string; delta?: string; response?: {
              id?: string; model?: string; usage?: { input_tokens?: number; output_tokens?: number; input_tokens_details?: { cached_tokens?: number } };
            } };
            if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
              yield { type: "text", delta: event.delta };
            } else if (event.type === "response.completed" || event.type === "response.incomplete") {
              const usage = event.response?.usage;
              if (!usage || !event.response?.id || typeof usage.input_tokens !== "number" || typeof usage.output_tokens !== "number") {
                throw new WorkspaceError("PROVIDER_USAGE_UNKNOWN", 502);
              }
              const normalized: ProviderUsage = { inputTokens: usage.input_tokens,
                cachedInputTokens: usage.input_tokens_details?.cached_tokens ?? 0, outputTokens: usage.output_tokens };
              yield { type: "complete", usage: normalized, providerRequestId: event.response.id, incomplete: event.type === "response.incomplete" };
            } else if (event.type === "error" || event.type === "response.failed") {
              throw new WorkspaceError("PROVIDER_UNAVAILABLE", 502);
            }
          }
          if (chunk.done) break;
        }
      } finally {
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
      }
    },
  };
}
