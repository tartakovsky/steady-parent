# OpenRouter LLM Client

A TypeScript client for OpenRouter's chat completions API with structured JSON output support via Zod schemas.

## Features

- Structured JSON responses using `response_format: json_schema`
- Automatic Zod schema to JSON Schema conversion
- Robust JSON parsing with multiple recovery strategies (code fences, escaped quotes, nested stringification)
- Type-safe responses validated against your Zod schema

## Setup

### 1. Install dependencies

```bash
npm install zod zod-to-json-schema
```

### 2. Copy the folder

Copy this entire `openrouter/` folder into your project.

### 3. Configure TypeScript

Ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "moduleResolution": "node" // or "bundler"
  }
}
```

## Usage

```typescript
import { OpenRouterLLMClient } from './openrouter';
import { z } from 'zod';

// Initialize with your API key
const client = new OpenRouterLLMClient(process.env.OPENROUTER_API_KEY!);

// Define your response schema
const SentimentSchema = z.object({
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

// Make a request
const result = await client.ask({
  model: 'google/gemini-2.0-flash-001',
  messages: [
    { role: 'system', content: 'Analyze the sentiment of the given text.' },
    { role: 'user', content: 'I love this product! It works great.' },
  ],
  responseSchema: SentimentSchema,
  schemaName: 'sentiment_analysis', // optional, for debugging
});

console.log(result.sentiment);   // 'positive'
console.log(result.confidence);  // 0.95
console.log(result.reasoning);   // '...'
```

## API

### `OpenRouterLLMClient`

```typescript
constructor(apiKey: string, baseUrl?: string)
```

- `apiKey`: Your OpenRouter API key
- `baseUrl`: Optional custom endpoint (defaults to `https://openrouter.ai/api/v1/chat/completions`)

### `ask<T>(request: LLMAskRequest<T>): Promise<T>`

```typescript
interface LLMAskRequest<T> {
  model: string;                              // OpenRouter model ID
  messages: LLMMessage[];                     // Chat messages
  responseSchema: z.ZodType<T>;               // Zod schema for response
  responseJsonSchema?: Record<string, unknown>; // Optional pre-built JSON schema
  schemaName?: string;                        // Optional name for debugging
}

type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};
```

## Environment Variables

```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

## Models

See [OpenRouter Models](https://openrouter.ai/models) for available models. Examples:

- `google/gemini-2.0-flash-001` - Fast, good for structured output
- `anthropic/claude-3.5-sonnet` - High quality
- `openai/gpt-4o` - OpenAI via OpenRouter

## Error Handling

The client throws errors for:
- HTTP failures (network, auth, rate limits)
- Empty responses
- Schema validation failures (response doesn't match your Zod schema)

```typescript
try {
  const result = await client.ask({ ... });
} catch (error) {
  if (error.message.includes('HTTP')) {
    // API error
  } else if (error.name === 'ZodError') {
    // Response didn't match schema
  }
}
```
