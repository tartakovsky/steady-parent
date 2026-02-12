/**
 * Kit (ConvertKit) API v4 helper — server-side only.
 *
 * Used by all subscription API routes (quiz, freebie, waitlist).
 * Handles subscriber creation, tag management, and custom fields.
 */

const KIT_API_BASE = "https://api.kit.com/v4";

function getApiKey(): string {
  const key = process.env["KIT_API_KEY"];
  if (!key) throw new Error("KIT_API_KEY not set");
  return key;
}

function kitHeaders(): HeadersInit {
  return {
    "X-Kit-Api-Key": getApiKey(),
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

interface KitSubscriber {
  id: number;
  email_address: string;
  state: string;
  fields: Record<string, string>;
}

/**
 * Create or retrieve a Kit subscriber by email.
 * Kit's POST /subscribers is idempotent — returns existing subscriber if email matches.
 * Pass `fields` to set custom fields (e.g., { quiz_result_url: "...", timezone: "..." }).
 */
export async function createOrUpdateSubscriber(
  email: string,
  fields?: Record<string, string>,
): Promise<KitSubscriber> {
  const body: Record<string, unknown> = { email_address: email };
  if (fields && Object.keys(fields).length > 0) {
    body["fields"] = fields;
  }

  const res = await fetch(`${KIT_API_BASE}/subscribers`, {
    method: "POST",
    headers: kitHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kit create subscriber failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { subscriber: KitSubscriber };
  return data.subscriber;
}

/**
 * Add a tag to a subscriber by email.
 * Kit resolves the subscriber by email — no need to know subscriber ID first.
 */
export async function addTagToSubscriber(
  email: string,
  tagId: number,
): Promise<void> {
  const res = await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribers`, {
    method: "POST",
    headers: kitHeaders(),
    body: JSON.stringify({ email_address: email }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kit add tag ${tagId} failed: ${res.status} ${text}`);
  }
}

/**
 * Remove a tag from a subscriber by subscriber ID.
 * Used for quiz-completed remove+re-add trick to force automation re-trigger.
 * Silently succeeds if the tag wasn't present (404 is OK).
 */
export async function removeTagFromSubscriber(
  subscriberId: number,
  tagId: number,
): Promise<void> {
  const res = await fetch(
    `${KIT_API_BASE}/subscribers/${subscriberId}/tags/${tagId}`,
    { method: "DELETE", headers: kitHeaders() },
  );
  // 204 = removed, 404 = wasn't there — both are fine
  if (!res.ok && res.status !== 204 && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Kit remove tag ${tagId} failed: ${res.status} ${text}`);
  }
}

/**
 * Subscribe an email with all the tags for a given freebie/quiz/waitlist slug.
 * Uses kit-config.ts to resolve slug → tag names → tag IDs.
 * Optionally sets custom fields (for quiz result URLs, timezone, etc.).
 */
export async function subscribeWithTags(
  email: string,
  slug: string,
  fields?: Record<string, string>,
): Promise<{ subscriberId: number }> {
  const { resolveTagIds } = await import("@/lib/kit-config");

  const tagIds = resolveTagIds(slug);
  if (!tagIds) {
    throw new Error(`Unknown slug: "${slug}"`);
  }

  // Create subscriber (with custom fields if any)
  const subscriber = await createOrUpdateSubscriber(email, fields);

  // Apply all tags in parallel
  await Promise.all(tagIds.map((tagId) => addTagToSubscriber(email, tagId)));

  return { subscriberId: subscriber.id };
}
