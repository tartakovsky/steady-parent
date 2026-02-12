# Form Subscription Implementation Plan

**Goal:** Make all three form types (quiz gate, course waitlist, blog freebie) actually submit emails to Kit with correct tags, custom fields, and localStorage caching.

**Current state:** All forms render but do NOTHING — `onSubmit={(e) => { e.preventDefault(); }}` everywhere. No API routes exist. No Kit custom fields exist. Waitlist tags don't exist in Kit.

---

## Table of Contents

1. [Kit Setup (CLI/Dashboard)](#1-kit-setup)
2. [Data File Updates](#2-data-file-updates)
3. [Shared Kit API Helper](#3-shared-kit-api-helper)
4. [Quiz Gate: API Route](#4-quiz-gate-api-route)
5. [Quiz Gate: Frontend](#5-quiz-gate-frontend)
6. [Course Waitlist: API Route](#6-course-waitlist-api-route)
7. [Course Waitlist: Frontend](#7-course-waitlist-frontend)
8. [Blog Freebie: API Route](#8-blog-freebie-api-route)
9. [Blog Freebie: Frontend](#9-blog-freebie-frontend)
10. [Validation Spec Updates](#10-validation-spec-updates)
11. [Implementation Order](#11-implementation-order)

---

## 1. Kit Setup

### 1a. Create `quiz_result_url` custom field

**Tool:** Kit MCP or Kit dashboard

There are currently ZERO custom fields in Kit. We need one: `quiz_result_url` — stores the personalized results URL (with encoded answers in query params) so Kit automations can include it in emails.

Kit API doesn't expose a custom field creation endpoint in the MCP tools, so either:
- **Option A:** Kit dashboard → Settings → Custom Fields → Add → key: `quiz_result_url`
- **Option B:** Kit API v4 directly — `POST https://api.kit.com/v4/custom_fields` with `{"label": "Quiz Result URL"}` (undocumented but may work)
- **Option C:** ~~Auto-created on first use~~ — **DOES NOT WORK in Kit API v4.** Fields must be pre-created.

**Resolution (done):** Created both fields via Kit API v4:
```bash
curl -X POST "https://api.kit.com/v4/custom_fields" \
  -H "X-Kit-Api-Key: $KIT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"label":"quiz_result_url"}'
# → id: 1196248, key: "quiz_result_url"

curl -X POST "https://api.kit.com/v4/custom_fields" \
  -H "X-Kit-Api-Key: $KIT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"label":"timezone"}'
# → id: 1196249, key: "timezone"
```

**Important:** Kit v4 requires custom fields to exist before they can be set on subscribers. The `fields` keys in our API calls must match the custom field `key` (not `label` or `name`).

### 1b. Timezone custom field

**Tool:** Auto-created by Kit on first subscriber creation

Kit does NOT natively detect subscriber timezone. Every frontend form captures it via:
```ts
Intl.DateTimeFormat().resolvedOptions().timeZone  // e.g. "America/New_York"
```

All API routes pass it to Kit as a `timezone` custom field alongside any other fields. Kit auto-creates the field on first use. Updated on every submission so it stays current if a subscriber moves.

This applies to ALL form types: quiz gate, course waitlist, blog freebie.

### 1c. Create `quiz-completed` automation trigger tag in Kit

**Tool:** Kit MCP `kit_create_tag`

This is a single universal tag added to every quiz subscriber when they go through the email gate. A Kit visual automation triggers on this tag to send the results email. The API route removes then re-adds it to force re-triggering for returning users (cleared localStorage / new browser).

```
kit_create_tag(name: "Quiz Completed")
```

After creation, add to `mailing_tags.json`:
```json
{ "id": "quiz-completed", "name": "Quiz Completed", "kitTagId": <ID_FROM_KIT> }
```

And add to `kit-config.ts` in the `kitTags` map:
```ts
"quiz-completed": <KIT_TAG_ID>,
```

**Kit automation setup (dashboard — manual):**
- Trigger: Tag `Quiz Completed` is added
- Action: Send email with subject like "Your quiz results are ready"
- Email body includes `{{ subscriber.quiz_result_url }}` link

### 1c. Create waitlist tags in Kit

**Tool:** Kit MCP `kit_create_tag`

The catalog references 20 `waitlist-*` tags that do NOT exist in Kit yet:
```
waitlist-aggression, waitlist-anxiety, waitlist-big-feelings,
waitlist-body-safety, waitlist-breaking-the-cycle, waitlist-discipline,
waitlist-eating, waitlist-new-parent, waitlist-parenting-approach,
waitlist-parenting-science, waitlist-potty-training, waitlist-screens,
waitlist-siblings, waitlist-sleep, waitlist-social-skills,
waitlist-spirited-kids, waitlist-staying-calm, waitlist-tantrums,
waitlist-teens, waitlist-transitions
```

Create each with `mcp__kit__kit_create_tag`, then note the returned IDs.

After creation, run the Kit tag sync in the admin dashboard to populate the DB (`/admin` → sync tags).

### 1d. Sync tags to DB

After creating waitlist tags, trigger a Kit tag sync via the admin dashboard. The `sync-orchestrator.ts` will pull all Kit tags and insert them into the `kit_tags` table. This makes the tag IDs available to the validation dashboard.

---

## 2. Data File Updates

### 2a. Add waitlist tags to `mailing_tags.json`

After creating tags in Kit (step 1b), add entries to `content-plan/mailing_tags.json`:

```json
{
  "id": "waitlist-aggression",
  "name": "Waitlist Aggression",
  "kitTagId": <ID_FROM_KIT>
},
// ... 20 entries total
```

### 2b. Add waitlist form-to-tag mappings to `form_tag_mappings.json`

Currently `content-plan/form_tag_mappings.json` only has `blog/*` and `quiz/*` entries. Add 20 waitlist entries:

```json
{
  "formId": "waitlist/aggression",
  "description": "Course waitlist for aggression category",
  "tagIds": ["lead", "waitlist-aggression"]
},
// ... 20 entries total
```

### 2c. Add waitlist tags to `kit-config.ts`

`landing/src/lib/kit-config.ts` needs three additions:

**Layer 1 — kitTags:** Add 20 waitlist tag IDs:
```ts
// Waitlist tags (20)
"waitlist-aggression":  <KIT_TAG_ID>,
"waitlist-anxiety":     <KIT_TAG_ID>,
// ... etc
```

**Layer 2 — freebieConfig:** Add 20 waitlist mappings. Rename to a more generic name since it now handles waitlists too:
```ts
// Course waitlists — each category has its own waitlist
"waitlist/aggression":  ["lead", "waitlist-aggression"],
"waitlist/anxiety":     ["lead", "waitlist-anxiety"],
// ... etc
```

**Helper — freebieSlugFromPathname:** Add course URL handling:
```ts
if (parts[0] === "course" && parts.length >= 2) {
  return `waitlist/${parts[1]}`;
}
```

---

## 3. Shared Kit API Helper

**File:** `landing/src/lib/kit-api.ts` (NEW)

All three API routes need the same Kit operations. Extract them into a shared helper.

```ts
// landing/src/lib/kit-api.ts

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
 * Pass `fields` to set custom fields (e.g., { quiz_result_url: "..." }).
 */
export async function createOrUpdateSubscriber(
  email: string,
  fields?: Record<string, string>,
): Promise<KitSubscriber> {
  const body: Record<string, unknown> = { email_address: email };
  if (fields && Object.keys(fields).length > 0) {
    body.fields = fields;
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
 * Silently succeeds if the tag wasn't present.
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
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Kit remove tag ${tagId} failed: ${res.status} ${text}`);
  }
}

/**
 * Subscribe an email with all the tags for a given freebie/quiz/waitlist slug.
 * Uses kit-config.ts to resolve slug → tag names → tag IDs.
 * Optionally sets custom fields (for quiz result URLs).
 */
export async function subscribeWithTags(
  email: string,
  slug: string,
  fields?: Record<string, string>,
): Promise<{ subscriberId: number }> {
  // Import here to avoid circular dependency if needed
  const { resolveTagIds } = await import("@/lib/kit-config");

  const tagIds = resolveTagIds(slug);
  if (!tagIds) {
    throw new Error(`Unknown freebie/quiz/waitlist slug: "${slug}"`);
  }

  // Create subscriber (with custom fields if any)
  const subscriber = await createOrUpdateSubscriber(email, fields);

  // Apply all tags in parallel
  await Promise.all(tagIds.map((tagId) => addTagToSubscriber(email, tagId)));

  return { subscriberId: subscriber.id };
}
```

**Why a shared helper:**
- All three routes do the same thing: create subscriber + apply tags
- Quiz route additionally sets `quiz_result_url` field
- ALL routes set `timezone` field (captured from browser)
- DRY, testable, one place to handle Kit API errors

**Timezone convention:** Every API route receives `timezone` from the frontend and merges it into the `fields` param. The shared helper doesn't need to know about timezone — it just passes whatever fields it receives to Kit.

---

## 4. Quiz Gate: API Route

**File:** `landing/src/app/api/quiz-subscribe/route.ts` (NEW)

The route accepts a `fromGate` boolean that controls whether to trigger the Kit results email:
- `fromGate: true` — user submitted through the email gate → remove+re-add `quiz-completed` tag → Kit automation fires → email sent
- `fromGate: false` — silent background call (localStorage had email) → just tag + update field → no email

```ts
// landing/src/app/api/quiz-subscribe/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  subscribeWithTags,
  removeTagFromSubscriber,
  addTagToSubscriber,
} from "@/lib/kit-api";

// quiz-completed tag ID — loaded from kit-config
import { kitTags } from "@/lib/kit-config";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      quizSlug?: string;
      resultUrl?: string;
      fromGate?: boolean;
      timezone?: string;
    };

    const { email, quizSlug, resultUrl, fromGate, timezone } = body;

    if (!email || !quizSlug || !resultUrl) {
      return NextResponse.json(
        { error: "Missing required fields: email, quizSlug, resultUrl" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // slug format: "quiz/parenting-style"
    const slug = `quiz/${quizSlug}`;

    // Build custom fields — always include timezone if provided
    const fields: Record<string, string> = { quiz_result_url: resultUrl };
    if (timezone) fields.timezone = timezone;

    // Step 1: Create/update subscriber + apply quiz-specific tags + set custom fields
    const { subscriberId } = await subscribeWithTags(email, slug, fields);

    // Step 2: If user went through the email gate, trigger the results email
    // by removing then re-adding quiz-completed tag (forces Kit automation)
    if (fromGate) {
      const quizCompletedTagId = kitTags["quiz-completed"];
      if (quizCompletedTagId) {
        await removeTagFromSubscriber(subscriberId, quizCompletedTagId);
        await addTagToSubscriber(email, quizCompletedTagId);
      }
    }

    return NextResponse.json({ success: true, subscriberId });
  } catch (err) {
    console.error("Quiz subscribe error:", err);
    return NextResponse.json(
      { error: "Subscription failed" },
      { status: 500 },
    );
  }
}
```

**Two scenarios:**

**Scenario A — First quiz / cleared localStorage (fromGate: true):**
1. Frontend POSTs `{ email, quizSlug: "parenting-style", resultUrl: "/quiz/parenting-style?a=...", fromGate: true }`
2. Creates subscriber, sets `quiz_result_url`, adds `lead` + `quiz-parenting-style` tags
3. Removes `quiz-completed` (no-op if first time), re-adds it → Kit automation fires → results email sent
4. Returns success → frontend stores email in localStorage → unlocks full results

**Scenario B — Returning subscriber, same browser (fromGate: false):**
1. User completes quiz, localStorage has email → gate skipped, results shown immediately
2. Frontend silently POSTs `{ email, quizSlug: "emotional-intelligence", resultUrl: "/quiz/emotional-intelligence?a=...", fromGate: false }`
3. Adds `quiz-emotional-intelligence` tag, updates `quiz_result_url` — does NOT touch `quiz-completed`
4. No Kit automation fires → no email sent (user already sees results on screen)

---

## 5. Quiz Gate: Frontend

Three files need changes: `freebie-cta.tsx`, `quiz-preview.tsx`, `quiz-container.tsx` (and `likert-quiz.tsx`).

### 5a. FreebieCTA — add `onSubmit` prop + loading/success states

The FreebieCTA component is used by both blog articles AND quiz previews. It needs an `onSubmit` callback so the parent can decide what to do with the email.

**File:** `landing/src/components/blog/freebie-cta.tsx`

```tsx
"use client";

import { useRef, useState } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Loader2, CheckCircle2 } from "lucide-react";

interface FreebieCTAProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  inputPlaceholder?: string;
  buttonText?: string;
  fullWidth?: boolean;
  variant?: "primary" | "secondary";
  onSubmit?: (email: string) => Promise<void>;  // NEW
}

// Inside the component:
const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
const [errorMsg, setErrorMsg] = useState("");
const inputRef = useRef<HTMLInputElement>(null);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  const email = inputRef.current?.value?.trim();
  if (!email || !onSubmit) return;

  setStatus("loading");
  setErrorMsg("");
  try {
    await onSubmit(email);
    setStatus("success");
  } catch {
    setStatus("error");
    setErrorMsg("Something went wrong. Please try again.");
  }
}
```

The form replaces the no-op handler:
```tsx
<form onSubmit={handleSubmit}>
  <Input ref={inputRef} ... disabled={status === "loading" || status === "success"} />
  <Button type="submit" disabled={status === "loading" || status === "success"}>
    {status === "loading" ? <Loader2 className="animate-spin" /> : null}
    {status === "success" ? <><CheckCircle2 /> Sent!</> : buttonText}
  </Button>
</form>
{status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}
```

**Key:** When no `onSubmit` is provided, the form stays a no-op (graceful degradation for server-rendered contexts where submission isn't wired yet).

### 5b. QuizPreview — pass onEmailSubmit callback to FreebieCTA

**File:** `landing/src/components/quiz/quiz-preview.tsx`

Add `onEmailSubmit` prop to `QuizPreview`:

```tsx
interface QuizPreviewProps {
  result: AnyResult;
  quizMeta: QuizMeta;
  onRetake: () => void;
  onEmailSubmit?: (email: string) => Promise<void>;  // NEW
}

// In the render, pass it to FreebieCTA:
<FreebieCTA
  eyebrow={cta.eyebrow}
  title={cta.title}
  body={cta.body}
  buttonText={cta.buttonText}
  variant="secondary"
  onSubmit={onEmailSubmit}  // NEW
/>
```

### 5c. QuizContainer + LikertQuiz — handle subscription + unlock results

**File:** `landing/src/components/quiz/quiz-container.tsx`

This is the most involved change. The container needs to:
1. Check localStorage on mount — if `sp_subscriber_email` exists, skip preview
2. Provide a `subscribeForQuizResults` callback to QuizPreview (gate submission, `fromGate: true`)
3. On successful subscribe, store email in localStorage, flip `preview` to false
4. When localStorage skips the gate and quiz completes, silently call the API with `fromGate: false`

```tsx
const STORAGE_KEY = "sp_subscriber_email";

// Helper to build the clean result URL
function buildResultUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete("p");
  url.searchParams.delete("s");
  return url.pathname + url.search;
}

// Helper to get browser timezone
function getBrowserTimezone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
  catch { return ""; }
}

// Helper to silently notify Kit (fire-and-forget, no UI feedback)
function silentQuizSubscribe(email: string, quizSlug: string) {
  fetch("/api/quiz-subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      quizSlug,
      resultUrl: buildResultUrl(),
      fromGate: false,  // silent — no email
      timezone: getBrowserTimezone(),
    }),
  }).catch((err) => console.error("Silent quiz subscribe failed:", err));
}

// Check localStorage on mount
useEffect(() => {
  const savedEmail = localStorage.getItem(STORAGE_KEY);
  if (savedEmail) {
    // Returning subscriber — skip the email gate
    setPreview(false);
  }
}, []);

// When results are shown and gate was skipped (returning user),
// silently tag the subscriber for this quiz
useEffect(() => {
  if (!preview && !shared) {
    const savedEmail = localStorage.getItem(STORAGE_KEY);
    if (savedEmail && result) {
      silentQuizSubscribe(savedEmail, quiz.meta.slug);
    }
  }
}, [preview, shared, result, quiz.meta.slug]);

// Gate submission handler — passed to QuizPreview → FreebieCTA
const subscribeForQuizResults = useCallback(async (email: string) => {
  const res = await fetch("/api/quiz-subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      quizSlug: quiz.meta.slug,
      resultUrl: buildResultUrl(),
      fromGate: true,  // gate submission — send email
      timezone: getBrowserTimezone(),
    }),
  });

  if (!res.ok) {
    throw new Error("Subscription failed");
  }

  // Success — cache email and unlock results
  localStorage.setItem(STORAGE_KEY, email);
  setPreview(false);
}, [quiz.meta.slug]);

// In the preview render:
if (preview && !shared) {
  return (
    <QuizPreview
      result={result}
      quizMeta={quiz.meta}
      onRetake={handleRetake}
      onEmailSubmit={subscribeForQuizResults}  // gate path
    />
  );
}
```

**Same changes apply to `likert-quiz.tsx`** — it has the same preview/result pattern. Extract `buildResultUrl` and `silentQuizSubscribe` into a shared util or duplicate (they're small enough to duplicate).

### 5d. Result URL strategy

The `resultUrl` stored in Kit's `quiz_result_url` field is the URL the user can visit to see their full results. The quiz encodes answers in URL params (via `pushStateToUrl`). The logic:

- User completes quiz → URL becomes `/quiz/parenting-style?a=ABC...&q=12&p=1`
- `p=1` means "preview mode", `s=1` means "shared" — we strip both for the result URL
- Result URL stored in Kit: `/quiz/parenting-style?a=ABC...&q=12` (clean)
- Kit email automation includes this URL → user clicks → sees full results

**Note on `quiz_result_url` overwriting:** Each quiz submission overwrites this field with the latest result URL. This is fine because:
- `fromGate: true` — email is sent immediately, using the URL just set
- `fromGate: false` — no email is sent, field update is just for bookkeeping
- If user clears localStorage and goes through the gate again for a different quiz, the new result URL is set and the email fires with the correct link

---

## 6. Course Waitlist: API Route

**File:** `landing/src/app/api/waitlist-subscribe/route.ts` (NEW)

```ts
// landing/src/app/api/waitlist-subscribe/route.ts

import { NextRequest, NextResponse } from "next/server";
import { subscribeWithTags } from "@/lib/kit-api";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      categorySlug?: string;
    };

    const { email, categorySlug } = body;

    if (!email || !categorySlug) {
      return NextResponse.json(
        { error: "Missing required fields: email, categorySlug" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // slug format: "waitlist/aggression"
    const slug = `waitlist/${categorySlug}`;

    const { subscriberId } = await subscribeWithTags(email, slug);

    return NextResponse.json({ success: true, subscriberId });
  } catch (err) {
    console.error("Waitlist subscribe error:", err);
    return NextResponse.json(
      { error: "Subscription failed" },
      { status: 500 },
    );
  }
}
```

**What happens:**
1. Frontend POSTs `{ email, categorySlug: "aggression" }`
2. Route calls `subscribeWithTags("user@example.com", "waitlist/aggression")`
3. Kit helper creates subscriber, adds `lead` + `waitlist-aggression` tags
4. Returns success → frontend shows confirmation

---

## 7. Course Waitlist: Frontend

**File:** `landing/src/components/course/course-hero.tsx`

The CourseHero component needs:
1. An `onSubmit` prop (or handle it internally since it's only used in one place)
2. Loading/success states
3. A `categorySlug` prop so it knows which waitlist to subscribe to

**Option A: Props-based (cleaner):**

```tsx
interface CourseHeroProps {
  eyebrow: string;
  title: string;
  body: string;
  bullets: readonly string[];
  categorySlug: string;  // NEW — needed for the API call
}

export function CourseHero({ eyebrow, title, body, bullets, categorySlug }: CourseHeroProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = inputRef.current?.value?.trim();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, categorySlug }),
      });
      if (!res.ok) throw new Error("Failed");
      localStorage.setItem("sp_subscriber_email", email);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  // Form render:
  <form onSubmit={handleSubmit}>
    <Input ref={inputRef} disabled={status === "loading" || status === "success"} ... />
    <Button type="submit" disabled={status === "loading" || status === "success"}>
      {status === "loading" ? "Reserving..." : status === "success" ? "You're on the list!" : "Reserve your spot"}
    </Button>
  </form>
  {status === "error" && <p className="text-sm text-red-600">Something went wrong. Try again.</p>}
  {status === "success" && <p className="text-sm text-emerald-600">Check your inbox for confirmation.</p>}
}
```

**The course page** (`landing/src/app/(public)/course/[slug]/page.tsx`) needs to derive `categorySlug` from the waitlist entry and pass it:

```tsx
// Currently the waitlist is loaded by URL slug.
// We need to map the course URL slug to the category slug.
// The mailing_form_catalog id is "waitlist-{categorySlug}".
const categorySlug = waitlist.id.replace(/^waitlist-/, "");

<CourseHero
  eyebrow={eyebrow}
  title={title}
  body={body}
  bullets={bullets}
  categorySlug={categorySlug}  // NEW
/>
```

---

## 8. Blog Freebie: API Route

**File:** `landing/src/app/api/freebie-subscribe/route.ts` (NEW)

```ts
// landing/src/app/api/freebie-subscribe/route.ts

import { NextRequest, NextResponse } from "next/server";
import { subscribeWithTags } from "@/lib/kit-api";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      categorySlug?: string;
    };

    const { email, categorySlug } = body;

    if (!email || !categorySlug) {
      return NextResponse.json(
        { error: "Missing required fields: email, categorySlug" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // slug format: "blog/tantrums"
    const slug = `blog/${categorySlug}`;

    const { subscriberId } = await subscribeWithTags(email, slug);

    return NextResponse.json({ success: true, subscriberId });
  } catch (err) {
    console.error("Freebie subscribe error:", err);
    return NextResponse.json(
      { error: "Subscription failed" },
      { status: 500 },
    );
  }
}
```

---

## 9. Blog Freebie: Frontend

**File:** `landing/src/app/(public)/blog/[category]/[slug]/page.tsx`

The blog page already renders `<FreebieCTA>` with the right copy. It needs to pass an `onSubmit` callback:

```tsx
// The page is a server component, so we need a client wrapper for the submit handler.
// Option A: Make a thin client component that wraps FreebieCTA with the API call.
// Option B: Pass categorySlug as a prop and let FreebieCTA handle it internally.

// Option A is cleaner — create a small wrapper:
```

**File:** `landing/src/components/blog/freebie-cta-connected.tsx` (NEW)

```tsx
"use client";

import { useCallback } from "react";
import { FreebieCTA } from "./freebie-cta";

interface ConnectedFreebieCTAProps {
  categorySlug: string;
  title?: string;
  body?: string;
  eyebrow?: string;
  buttonText?: string;
  fullWidth?: boolean;
  variant?: "primary" | "secondary";
}

export function ConnectedFreebieCTA({ categorySlug, ...props }: ConnectedFreebieCTAProps) {
  const handleSubmit = useCallback(async (email: string) => {
    const res = await fetch("/api/freebie-subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, categorySlug }),
    });
    if (!res.ok) throw new Error("Failed");
    localStorage.setItem("sp_subscriber_email", email);
  }, [categorySlug]);

  return <FreebieCTA {...props} onSubmit={handleSubmit} />;
}
```

Then in the blog page, replace `<FreebieCTA>` with `<ConnectedFreebieCTA categorySlug={category}>`.

**Alternative:** Instead of a separate wrapper file, make FreebieCTA accept an optional `categorySlug` prop and handle the fetch internally. This is simpler but mixes concerns. Either works.

---

## 10. Validation Spec Updates

### 10a. `content-plan/kit_integration.json`

Add waitlist flow and frontend check:

```json
{
  "subscriberApiRoutes": {
    "quiz": "/api/quiz-subscribe",
    "blogFreebie": "/api/freebie-subscribe",
    "waitlist": "/api/waitlist-subscribe"        // ADD
  },
  "waitlistFlow": {                               // ADD
    "description": "Course waitlist form submits to /api/waitlist-subscribe, creates/updates Kit subscriber, adds lead tag + waitlist category tag",
    "requiredTags": ["lead"],
    "tagPrefix": "waitlist-"
  },
  "frontendChecks": {
    "freebieCta": {
      "file": "src/components/blog/freebie-cta.tsx",
      "requiredPatterns": ["onSubmit", "fetch("]   // UPDATE: more specific
    },
    "quizContainer": {
      "file": "src/components/quiz/quiz-container.tsx",
      "requiredPatterns": ["sp_subscriber_email", "subscribeForQuizResults"]
    },
    "likertQuiz": {
      "file": "src/components/quiz/likert-quiz.tsx",
      "requiredPatterns": ["sp_subscriber_email", "subscribeForQuizResults"]
    },
    "courseHero": {                                 // ADD
      "file": "src/components/course/course-hero.tsx",
      "requiredPatterns": ["fetch(", "/api/waitlist-subscribe"]
    }
  }
}
```

### 10b. Update mailing route infrastructure checks

The route currently checks `freebieCta` for `requiredProps: ["onSubmit"]` which matches the dead handler. After implementation, change the check pattern to `["fetch(", "/api/freebie-subscribe"]` to verify actual submission logic exists.

Similarly, add `courseHero` to the frontend checks in the route handler.

### 10c. Update kit-config.ts `freebieConfig` to include waitlists

The `resolveTagIds` function resolves a slug to Kit tag IDs. It needs waitlist entries. See section 2c above.

---

## 11. Implementation Order

### Phase 1: Kit setup + data files (no code changes)

1. Create 20 `waitlist-*` tags in Kit via MCP `kit_create_tag`
2. Sync tags in admin dashboard
3. Update `mailing_tags.json` with waitlist tag entries + kitTagIds
4. Update `form_tag_mappings.json` with `waitlist/*` entries
5. Update `kit-config.ts` with waitlist tags + config + URL helper
6. Verify: `quiz_result_url` custom field note (will be auto-created on first use)

### Phase 2: Shared helper + API routes (server code only)

7. Create `landing/src/lib/kit-api.ts` — shared Kit API helper
8. Create `landing/src/app/api/quiz-subscribe/route.ts`
9. Create `landing/src/app/api/waitlist-subscribe/route.ts`
10. Create `landing/src/app/api/freebie-subscribe/route.ts`
11. Test each route with curl:
    ```bash
    curl -X POST http://localhost:3000/api/quiz-subscribe \
      -H "Content-Type: application/json" \
      -d '{"email":"test@example.com","quizSlug":"parenting-style","resultUrl":"/quiz/parenting-style?a=test"}'
    ```
    Then verify in Kit dashboard that subscriber + tags + custom field are correct.

### Phase 3: Frontend wiring (client code)

12. Update `FreebieCTA` — add `onSubmit` prop, loading/success/error states, `ref` on input
13. Update `QuizPreview` — pass `onEmailSubmit` to FreebieCTA
14. Update `quiz-container.tsx` — localStorage check + `subscribeForQuizResults` callback
15. Update `likert-quiz.tsx` — same as quiz-container
16. Update `CourseHero` — add submit handler with loading/success states, accept `categorySlug`
17. Update `course/[slug]/page.tsx` — pass `categorySlug` to CourseHero
18. Create `ConnectedFreebieCTA` (or inline the fetch in blog page)
19. Update `blog/[category]/[slug]/page.tsx` — use ConnectedFreebieCTA

### Phase 4: Validation spec + dashboard verification

20. Update `kit_integration.json` — add waitlist flow, courseHero frontend check, stricter freebie patterns
21. Update mailing route infrastructure checks for waitlist
22. Verify admin dashboard: all infrastructure flags green
23. End-to-end test: take quiz → enter email → verify Kit subscriber → verify full results unlock

---

## File Summary

| File | Action | Phase |
|------|--------|-------|
| Kit dashboard / MCP | Create waitlist tags, verify custom field | 1 |
| `content-plan/mailing_tags.json` | Add 20 waitlist tag entries | 1 |
| `content-plan/form_tag_mappings.json` | Add 20 waitlist form mappings | 1 |
| `landing/src/lib/kit-config.ts` | Add waitlist tags + config + URL helper | 1 |
| `landing/src/lib/kit-api.ts` | NEW — shared Kit API helper | 2 |
| `landing/src/app/api/quiz-subscribe/route.ts` | NEW — quiz email gate API | 2 |
| `landing/src/app/api/waitlist-subscribe/route.ts` | NEW — waitlist signup API | 2 |
| `landing/src/app/api/freebie-subscribe/route.ts` | NEW — blog freebie API | 2 |
| `landing/src/components/blog/freebie-cta.tsx` | Add onSubmit + states | 3 |
| `landing/src/components/quiz/quiz-preview.tsx` | Pass onEmailSubmit | 3 |
| `landing/src/components/quiz/quiz-container.tsx` | localStorage + subscribe | 3 |
| `landing/src/components/quiz/likert-quiz.tsx` | localStorage + subscribe | 3 |
| `landing/src/components/course/course-hero.tsx` | Add submit handler | 3 |
| `landing/src/app/(public)/course/[slug]/page.tsx` | Pass categorySlug | 3 |
| `landing/src/components/blog/freebie-cta-connected.tsx` | NEW — connected wrapper | 3 |
| `landing/src/app/(public)/blog/[category]/[slug]/page.tsx` | Use connected CTA | 3 |
| `content-plan/kit_integration.json` | Add waitlist flow + checks | 4 |
| `landing/src/app/api/admin/mailing/route.ts` | Add waitlist infra checks | 4 |

---

## 12. Autonomous Testing Strategy

What I can run without human intervention after each phase, what tools to use, what to check, and what I explicitly CANNOT verify.

### Available test commands

| Command | What it catches | When to run |
|---------|----------------|-------------|
| `npm run typecheck -w landing` | Type errors, import issues, wrong prop types | After EVERY file change |
| `npm run lint -w landing` | Lint violations, unused imports | After every phase |
| `npm run build -w landing` | SSR errors, missing dependencies, broken imports, dynamic route issues | After Phase 3 (all code complete) |
| `npx tsx content-spec/src/validate-plans.ts` | Data file schema violations, cross-reference errors (tag refs, form mappings) | After Phase 1 (data file changes) |
| `curl http://localhost:3000/api/admin/mailing` | Infrastructure flag status — are the checks turning green? | After each phase |

### Phase 1 tests: Kit setup + data files

**After creating waitlist tags in Kit (MCP):**
```bash
# Verify tags exist via MCP
mcp__kit__kit_list_tags  # Should show 20 new waitlist-* tags
```

**After updating mailing_tags.json + form_tag_mappings.json:**
```bash
# Validate all data files parse correctly and cross-references are valid
npx tsx content-spec/src/validate-plans.ts
```

**After updating kit-config.ts:**
```bash
npm run typecheck -w landing
# Specifically verify: resolveTagIds("waitlist/aggression") would resolve correctly.
# Can't run this directly, but typecheck ensures no typos in the tag ID map.
```

**Risk:** Zero — data files and config are read-only during runtime. Worst case: a typo in a tag ID that only surfaces during Phase 2 API testing.

### Phase 2 tests: API routes

**After creating each API route:**
```bash
npm run typecheck -w landing
```

**Smoke tests (no Kit API calls, just input validation):**
```bash
# Missing fields → 400
curl -s -X POST http://localhost:3000/api/quiz-subscribe \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('error'), f'Expected error: {d}'; print('PASS: missing fields → 400')"

# Invalid email → 400
curl -s -X POST http://localhost:3000/api/quiz-subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail","quizSlug":"x","resultUrl":"/x"}' | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('error'), f'Expected error: {d}'; print('PASS: invalid email → 400')"

# Same for waitlist-subscribe and freebie-subscribe
```

**Integration test (creates REAL data in Kit):**

Use a dedicated test email that's clearly identifiable: `claude-test@steady-parent.com` (or any non-real address — Kit doesn't validate deliverability).

```bash
# Test quiz subscribe — gate submission (should trigger email automation)
curl -s -X POST http://localhost:3000/api/quiz-subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"claude-test@steady-parent.com","quizSlug":"parenting-style","resultUrl":"/quiz/parenting-style?a=test123","fromGate":true}'
# Expected: {"success":true,"subscriberId":<number>}
```

**Then verify in Kit via MCP:**
```
mcp__kit__kit_list_subscribers(status="active")
# → Find claude-test@steady-parent.com

mcp__kit__kit_get_subscriber_tags(subscriber_id="<id>")
# → Should include "lead", "quiz-parenting-style", AND "quiz-completed"

mcp__kit__kit_get_subscriber(subscriber_id="<id>")
# → fields should include quiz_result_url: "/quiz/parenting-style?a=test123"

mcp__kit__kit_list_custom_fields()
# → Should now include "quiz_result_url" (auto-created on first use)
```

```bash
# Test quiz subscribe — silent background (should NOT trigger email)
curl -s -X POST http://localhost:3000/api/quiz-subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"claude-test@steady-parent.com","quizSlug":"emotional-intelligence","resultUrl":"/quiz/emotional-intelligence?a=test456","fromGate":false}'
# Expected: {"success":true,"subscriberId":<number>}
```

**Verify in Kit:**
```
mcp__kit__kit_get_subscriber_tags(subscriber_id="<id>")
# → Should now ALSO include "quiz-emotional-intelligence"
# → "quiz-completed" should still be there (untouched — not removed+re-added)
```

**Repeat for waitlist:**
```bash
curl -s -X POST http://localhost:3000/api/waitlist-subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"claude-test@steady-parent.com","categorySlug":"aggression"}'
```
Then verify `waitlist-aggression` tag was added to the same subscriber.

**Repeat for freebie:**
```bash
curl -s -X POST http://localhost:3000/api/freebie-subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"claude-test@steady-parent.com","categorySlug":"tantrums"}'
```
Then verify `freebie-tantrums` tag was added.

**Cleanup:**
Kit MCP has no `delete_subscriber` tool. Cleanup options:
- Remove all test tags via `mcp__kit__kit_remove_tag_from_subscriber` (tedious but complete)
- Leave the test subscriber — it's clearly identifiable by email
- **Recommendation:** Remove tags after testing, leave subscriber. One orphan subscriber in Kit is harmless.

**Risk:** Low — creates one test subscriber with test tags. All reversible except subscriber creation.

### Phase 3 tests: Frontend code

**After each file change:**
```bash
npm run typecheck -w landing
```

**After all frontend changes are complete:**
```bash
npm run build -w landing
# This is the critical test. Catches:
# - Server component importing client-only code
# - Missing props (CourseHero now requires categorySlug)
# - Dynamic route generation failures
# - Anything that breaks static generation
```

**Pattern verification (what the infra validator checks):**
```bash
# Verify freebie-cta.tsx has real submit logic
grep -c "fetch(" landing/src/components/blog/freebie-cta.tsx
# Expected: >= 1

# Verify quiz-container.tsx has required patterns
grep -c "sp_subscriber_email" landing/src/components/quiz/quiz-container.tsx
grep -c "subscribeForQuizResults" landing/src/components/quiz/quiz-container.tsx
# Expected: >= 1 each

# Verify likert-quiz.tsx has same patterns
grep -c "sp_subscriber_email" landing/src/components/quiz/likert-quiz.tsx
grep -c "subscribeForQuizResults" landing/src/components/quiz/likert-quiz.tsx
# Expected: >= 1 each

# Verify course-hero.tsx has submit logic
grep -c "fetch(" landing/src/components/course/course-hero.tsx
grep -c "/api/waitlist-subscribe" landing/src/components/course/course-hero.tsx
# Expected: >= 1 each
```

**Risk:** Medium — FreebieCTA is the riskiest change because it's used in multiple places:
1. Blog article pages (via ConnectedFreebieCTA) — gets `onSubmit`
2. Quiz preview (via QuizPreview) — gets `onEmailSubmit` passed through
3. Other potential call sites?

**Mitigation:** When `onSubmit` is not provided, the form must stay a no-op (backward compatible). Verify:
```bash
# Check all FreebieCTA usage sites
grep -rn "FreebieCTA" landing/src/ --include="*.tsx" --include="*.ts"
# Every call site must either:
# a) Pass onSubmit prop, OR
# b) Work fine without it (form submits do nothing)
```

### Phase 4 tests: Dashboard verification

**After updating kit_integration.json and route checks:**
```bash
npm run typecheck -w landing

# Curl the mailing API and check ALL infrastructure flags
curl -s http://localhost:3000/api/admin/mailing | python3 -c "
import sys, json
d = json.load(sys.stdin)
infra = d.get('infrastructure', {})
print('Infrastructure flags:')
failing = []
for k, v in infra.items():
    status = 'PASS' if v is True else ('FAIL' if v is False else f'={v}')
    print(f'  {k}: {status}')
    if v is False:
        failing.append(k)
if failing:
    print(f'\nSTILL FAILING: {failing}')
else:
    print('\nALL INFRASTRUCTURE CHECKS PASSING')
"
```

**Check per-entry errors are gone:**
```bash
curl -s http://localhost:3000/api/admin/mailing | python3 -c "
import sys, json
d = json.load(sys.stdin)
be = d.get('mailingByEntry', {})
errors = {k: v['errors'] for k, v in be.items() if v['errors']}
if errors:
    print(f'{len(errors)} entries with errors:')
    for k, errs in list(errors.items())[:5]:
        print(f'  {k}: {errs}')
else:
    print('ALL ENTRIES PASSING')
"
```

### What I CANNOT test (requires human / browser)

| What | Why | How user can verify |
|------|-----|-------------------|
| Visual appearance of loading/success/error states | No browser automation connected | Open quiz, enter email, watch the button change |
| localStorage read/write actually works | Requires real browser JS context | Complete a quiz, refresh page, verify gate is skipped |
| Full quiz flow: take quiz → preview → email → results | Requires clicking through quiz UI | Take any deployed quiz end-to-end |
| Email deliverability | Kit may or may not send to test addresses | Check Kit dashboard → Subscribers → click subscriber → activity log |
| CSS correctness of new states (disabled inputs, success messages) | Visual check | Look at the forms on desktop + mobile |
| Rate limiting / abuse protection | Not implemented in this plan | Consider adding later if needed |
| Kit automation triggers (welcome email, etc.) | Depends on Kit automation setup | Configure in Kit dashboard separately |

### Summary: autonomous test checklist

Run these in order after full implementation:

```
[ ] npm run typecheck -w landing                    → clean
[ ] npm run lint -w landing                         → clean
[ ] npx tsx content-spec/src/validate-plans.ts      → all data files valid
[ ] npm run build -w landing                        → builds successfully
[ ] curl /api/quiz-subscribe (bad input)            → 400
[ ] curl /api/waitlist-subscribe (bad input)        → 400
[ ] curl /api/freebie-subscribe (bad input)         → 400
[ ] curl /api/quiz-subscribe (good input)           → 200 + Kit subscriber verified
[ ] curl /api/waitlist-subscribe (good input)       → 200 + Kit tags verified
[ ] curl /api/freebie-subscribe (good input)        → 200 + Kit tags verified
[ ] mcp verify: subscriber has all expected tags
[ ] mcp verify: quiz_result_url custom field exists + set correctly
[ ] mcp cleanup: remove test tags from subscriber
[ ] curl /api/admin/mailing → infrastructure        → all flags true
[ ] curl /api/admin/mailing → byEntry               → quiz-gate and waitlist entries have 0 errors
[ ] grep frontend files for required patterns       → all present
```

---

## 13. Browser Automation Tests (Chrome MCP)

With Chrome browser access, every item from the "requires human / browser" table becomes testable. These tests run AFTER the autonomous checklist above passes.

**Setup:** Dev server running at `localhost:3000`. Test email: `claude-test@steady-parent.com`.

### 13a. Quiz gate — full end-to-end flow

1. Navigate to `/quiz/parenting-style`
2. Answer all questions (click through each Likert option)
3. Hit the email gate (preview screen with FreebieCTA)
4. Enter `claude-test@steady-parent.com` in the email input
5. Submit the form
6. **Verify:** Results page loads (URL contains `s=1` or answer params)
7. **Verify via Kit MCP:** `kit_get_subscriber_tags` → includes `quiz-parenting-style`
8. **Verify via Kit MCP:** `kit_get_subscriber` → `fields.quiz_result_url` contains the results URL with encoded answers

**What this catches:** Broken fetch calls, wrong API endpoint, missing props threading from quiz-container → quiz-preview → freebie-cta, JSON parse errors, Kit API failures not surfaced to user.

### 13b. localStorage persistence

1. After 13a completes (email submitted), run `javascript_tool`:
   ```js
   localStorage.getItem("sp_subscriber_email")
   ```
   **Expected:** `"claude-test@steady-parent.com"`

2. Reload the page (navigate to same quiz URL again)
3. **Verify:** The email gate is skipped — quiz goes straight to results or shows the quiz questions without the gate blocking

**What this catches:** localStorage key typo, gate bypass logic not reading localStorage, SSR vs client hydration issues.

### 13c. Course waitlist form

1. Navigate to a course page (e.g. `/course/aggression`)
2. Find the CourseHero email input
3. Enter `claude-test@steady-parent.com`
4. Submit the form
5. **Verify:** Success state renders (button text changes, input disabled)
6. **Verify via Kit MCP:** `kit_get_subscriber_tags` → includes `waitlist-aggression`

**What this catches:** Missing `categorySlug` prop, wrong API endpoint, tag resolution failures.

### 13d. Blog freebie form

1. Navigate to a blog post that has a FreebieCTA (e.g. `/blog/tantrums/handle-tantrum-scripts`)
2. Find the FreebieCTA email input
3. Enter `claude-test@steady-parent.com`
4. Submit the form
5. **Verify:** Success state renders
6. **Verify via Kit MCP:** `kit_get_subscriber_tags` → includes `freebie-tantrums`

**What this catches:** ConnectedFreebieCTA not passing onSubmit, category slug derivation from pathname, tag resolution for blog freebies.

### 13e. Loading / success / error states (visual)

For each form type (quiz gate, waitlist, freebie):

1. Take a screenshot BEFORE submitting (idle state)
2. Submit with valid email, take screenshot during loading (if capturable — may be too fast)
3. Take screenshot AFTER success
4. **Verify:** Button text changed, input is disabled, success message visible

Error state test:
1. Stop the dev server (or use a known-bad endpoint)
2. Submit the form
3. Take screenshot — error message should be visible
4. Restart dev server

### 13f. Responsive check

For each form type:
1. `resize_window` to 1280×800 → screenshot (desktop)
2. `resize_window` to 375×812 → screenshot (mobile)
3. **Verify:** Forms are not broken, inputs are visible, buttons are tappable

### 13g. Console & network verification

During each form submission:
1. `read_console_messages(pattern: "error|Error|fail")` → should be empty
2. `read_network_requests(urlPattern: "/api/")` → verify the POST request returned 200

### 13h. Admin dashboard visual verification

1. Navigate to `/admin/mailing`
2. Take screenshot of stats header → all infrastructure flags should be green
3. Scroll to waitlist table → screenshot → all rows should show green for api_route, frontend
4. Scroll to quiz-gate table → screenshot → all rows green for api_route, frontend, kit_field, kit_tag
5. Scroll to freebie table → screenshot → all rows green for API, Frontend

**What this catches:** Rendering bugs, stats not updating, column layout issues, data not flowing from API to page.

### 13i. Cross-form localStorage sharing

1. After submitting email on quiz gate (13a), navigate to a blog freebie form
2. Check if the email input is pre-filled from localStorage (if designed to do so)
3. Navigate to a course waitlist form — same check

**Note:** This test only applies if the frontend implementation reads `sp_subscriber_email` to pre-fill forms. If not in scope, skip.

### 13j. Cleanup

After all browser tests:
1. Remove all test tags from the test subscriber via Kit MCP:
   - `kit_remove_tag_from_subscriber` for each tag added during testing
2. Leave the subscriber in Kit (no delete endpoint available)

### What STILL cannot be tested

| What | Why |
|------|-----|
| Actual email delivery to inbox | Kit sends emails via its own infrastructure — no way to check inbox |
| Kit automation triggers (welcome sequences) | Configured in Kit dashboard, not in our codebase |
| Rate limiting / abuse protection | Not implemented in this plan |
| Real mobile device rendering | Chrome resize approximates but isn't identical to real devices |

### Summary: browser test checklist

```
[ ] Quiz gate: answer all questions → email gate → submit → results page loads
[ ] Quiz gate: Kit subscriber has quiz-parenting-style tag + quiz_result_url field
[ ] localStorage: sp_subscriber_email is set after quiz submit
[ ] localStorage: page reload skips email gate
[ ] Waitlist: submit email on /course/aggression → success state renders
[ ] Waitlist: Kit subscriber has waitlist-aggression tag
[ ] Freebie: submit email on blog post → success state renders
[ ] Freebie: Kit subscriber has freebie-tantrums tag
[ ] Console: no JS errors during any form submission
[ ] Network: all /api/ POST requests return 200
[ ] Screenshots: desktop + mobile for each form type
[ ] Admin dashboard: /admin/mailing shows all green infrastructure flags
[ ] Cleanup: remove test tags from subscriber
```
