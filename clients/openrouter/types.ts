import type { z } from 'zod';

export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface LLMAskRequest<T> {
  model: string;
  messages: LLMMessage[];
  responseSchema: z.ZodType<T>;
  /**
   * Optional explicit JSON Schema (Draft-07-ish) for provider structured outputs.
   * If provided, clients should prefer this over attempting to derive from Zod.
   */
  responseJsonSchema?: Record<string, unknown>;
  /**
   * Optional stable schema name for OpenRouter structured outputs.
   * Used for observability/debuggability on the provider side.
   */
  schemaName?: string;
}

export interface LLMClient {
  ask<T>(req: LLMAskRequest<T>): Promise<T>;
}
