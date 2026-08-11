import "server-only";

type StructuredResponseOptions = {
  name: string;
  description: string;
  schema: Record<string, unknown>;
  instructions: string;
  input: string;
  tools?: Array<{ type: "web_search" }>;
};

type OpenAIResponse = {
  status?: string;
  error?: { message?: string } | null;
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

export class AdminAIError extends Error {
  constructor(public code: "not_configured" | "provider_error" | "invalid_output", message: string) {
    super(message);
  }
}

function config() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_ADMIN_MODEL || "gpt-5.1";
  if (!apiKey) throw new AdminAIError("not_configured", "OpenAI is not configured for Admin Studio.");
  return { apiKey, model };
}

function extractOutputText(body: OpenAIResponse) {
  if (typeof body.output_text === "string" && body.output_text.trim()) return body.output_text;
  for (const item of body.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string" && content.text.trim()) return content.text;
    }
  }
  return null;
}

export async function createStructuredAdminResponse<T>(options: StructuredResponseOptions): Promise<T> {
  const { apiKey, model } = config();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions: options.instructions,
      input: options.input,
      ...(options.tools?.length ? { tools: options.tools } : {}),
      text: {
        format: {
          type: "json_schema",
          name: options.name,
          description: options.description,
          strict: true,
          schema: options.schema,
        },
      },
    }),
    cache: "no-store",
  });

  const body = (await response.json().catch(() => ({}))) as OpenAIResponse;
  if (!response.ok || body.error) {
    throw new AdminAIError("provider_error", body.error?.message || `OpenAI request failed with status ${response.status}.`);
  }
  const outputText = extractOutputText(body);
  if (!outputText) throw new AdminAIError("invalid_output", "OpenAI returned no structured output.");
  try {
    return JSON.parse(outputText) as T;
  } catch {
    throw new AdminAIError("invalid_output", "OpenAI returned output that could not be parsed.");
  }
}
