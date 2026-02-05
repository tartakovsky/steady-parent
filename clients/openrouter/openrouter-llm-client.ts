import type { LLMAskRequest, LLMClient } from './types';
import { zodToJsonSchema } from 'zod-to-json-schema';

type OpenRouterChatCompletionResponse = {
  choices?: Array<{
    message?: { content?: unknown };
  }>;
  error?: { message?: string };
};

function shortText(s: string, n: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n)}…`;
}

function sanitizeJsonSchemaForOpenRouter(schema: Record<string, unknown>): Record<string, unknown> {
  // OpenRouter's `response_format: { type: "json_schema" }` is picky.
  // In practice, stripping meta keys like "$schema" avoids provider-side errors.
  const { $schema: _schema, definitions: _definitions, ...rest } = schema as any;
  return rest as Record<string, unknown>;
}

function extractFirstJsonValue(text: string): string | null {
  const s = text.trim();
  const objStart = s.indexOf('{');
  const objEnd = s.lastIndexOf('}');
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) return s.slice(objStart, objEnd + 1);
  const arrStart = s.indexOf('[');
  const arrEnd = s.lastIndexOf(']');
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) return s.slice(arrStart, arrEnd + 1);
  return null;
}

function stripCodeFences(text: string): string {
  // Handles:
  // ```json\n{...}\n```
  // ```\n{...}\n```
  // Also tolerates leading/trailing whitespace.
  const s = text.trim();
  if (!s.startsWith('```')) return text;
  const firstNewline = s.indexOf('\n');
  if (firstNewline === -1) return text;
  const lastFence = s.lastIndexOf('```');
  if (lastFence <= firstNewline) return text;
  return s.slice(firstNewline + 1, lastFence).trim();
}

function tryParseJsonString(s: string): unknown | undefined {
  try {
    return JSON.parse(s) as unknown;
  } catch {
    return undefined;
  }
}

function coercePossiblyStringifiedJson(content: unknown): unknown {
  if (typeof content !== 'string') return content;
  let cur: string = stripCodeFences(content);

  for (let i = 0; i < 3; i++) {
    try {
      const parsed = JSON.parse(cur) as unknown;
      if (typeof parsed === 'string') {
        cur = parsed;
        continue;
      }
      return parsed;
    } catch {
      const extracted = extractFirstJsonValue(cur);
      if (!extracted || extracted === cur) break;
      cur = extracted;
    }
  }

  // Some providers return \"quoted\" JSON without wrapping the whole thing in quotes, e.g.:
  // {\"score\": 0.4, \"reasoning\": \"...\"}
  // Try a conservative unescape pass and parse again.
  if (cur.includes('\\"') && !cur.includes('"score"')) {
    const unescaped = cur.replace(/\\"/g, '"');
    const parsed = tryParseJsonString(unescaped);
    if (parsed !== undefined) return parsed;
  }

  // As a last resort, try extracting JSON again after stripping code fences/unescaping.
  const extracted2 = extractFirstJsonValue(cur);
  if (extracted2 && extracted2 !== cur) {
    const parsed = tryParseJsonString(extracted2);
    if (parsed !== undefined) return parsed;
  }

  return cur;
}

export class OpenRouterLLMClient implements LLMClient {
  constructor(
    private apiKey: string,
    private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'
  ) {}

  async ask<T>(req: LLMAskRequest<T>): Promise<T> {
    const schemaName = req.schemaName ?? 'response';

    const derived = zodToJsonSchema(req.responseSchema as any, {
      name: schemaName,
      $refStrategy: 'none',
    }) as unknown as Record<string, unknown>;

    const rawSchema =
      (req.responseJsonSchema as Record<string, unknown> | undefined) ??
      (((derived as any).schema ?? derived) as Record<string, unknown>);
    const schemaForProvider = sanitizeJsonSchemaForOpenRouter(rawSchema);

    const body = {
      model: req.model,
      messages: req.messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: schemaName,
          strict: true,
          // zod-to-json-schema returns { $schema, definitions, ... } and may wrap
          // the actual schema under "schema". OpenRouter expects the plain schema
          // object. "schema" is present for some versions/configs; fall back to root.
          schema: schemaForProvider,
        },
      },
    };

    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const raw = (await res.json().catch(() => null)) as OpenRouterChatCompletionResponse | null;
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn('[OpenRouterLLMClient] request failed', {
        status: res.status,
        error: raw?.error?.message,
        schemaName,
        schemaKeys: Object.keys(schemaForProvider ?? {}),
      });
      throw new Error(raw?.error?.message ?? `OpenRouter request failed: HTTP ${res.status}`);
    }
    const content = raw?.choices?.[0]?.message?.content;
    if (content == null) throw new Error('OpenRouter returned empty content');

    const coerced = coercePossiblyStringifiedJson(content);
    try {
      return req.responseSchema.parse(coerced);
    } catch (err) {
      // Log enough to debug malformed structured output (no secrets).
      const preview =
        typeof content === 'string'
          ? content.slice(0, 800)
          : typeof coerced === 'string'
            ? coerced.slice(0, 800)
            : JSON.stringify(content).slice(0, 800);

      const system = req.messages.find((m) => m.role === 'system')?.content ?? '';
      const user = req.messages.find((m) => m.role === 'user')?.content ?? '';

      const schemaSummary =
        schemaForProvider && typeof schemaForProvider === 'object'
          ? {
              type: (schemaForProvider as any).type,
              required: (schemaForProvider as any).required,
              propertiesKeys: Object.keys(
                (((schemaForProvider as any).properties ?? {}) as Record<string, unknown>) ?? {}
              ),
              additionalProperties: (schemaForProvider as any).additionalProperties,
            }
          : { type: typeof schemaForProvider };
      // eslint-disable-next-line no-console
      console.warn('[OpenRouterLLMClient] response schema parse failed', {
        model: req.model,
        schemaName: req.schemaName,
        request: {
          systemPromptLen: system.length,
          systemPromptPreview: shortText(system, 220),
          userLen: user.length,
          userPreview: shortText(user, 220),
          schema: schemaSummary,
        },
        contentType: typeof content,
        coercedType: typeof coerced,
        preview,
      });
      throw err;
    }
  }
}
