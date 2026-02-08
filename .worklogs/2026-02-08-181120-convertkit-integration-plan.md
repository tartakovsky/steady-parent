# ConvertKit (Kit) Integration Plan — Freebie Email Capture

**Date:** 2026-02-08 18:11
**Scope:** FreebieCTA component, new API route, new kit config file, Kit account setup

## Summary
Plan for connecting the FreebieCTA email capture forms to Kit (formerly ConvertKit) so that when a user enters their email on any freebie form, they get subscribed, tagged as a lead, and tagged with the specific freebie they clicked. Covers blog category freebies (~20) and quiz freebies (~24).

## Context & Problem

### Current state
- FreebieCTA component exists at `landing/src/components/blog/freebie-cta.tsx`
- It renders an email + submit button form, but the form does nothing (`onSubmit` just calls `e.preventDefault()`)
- Every blog article has 1 inline FreebieCTA (in the MDX body) + 1 page-level FreebieCTA at the bottom of the page (`landing/src/app/blog/[category]/[slug]/page.tsx` line 57)
- Quiz result pages also show FreebieCTAs
- `category_ctas.json` defines canonical freebie names/promises for 20 blog categories
- No Kit API key, tags, forms, or config exist yet

### What we need
When a user submits their email on any FreebieCTA:
1. Create them as a subscriber in Kit (or update if they already exist)
2. Tag them as `lead`
3. Tag them with the specific freebie they clicked (e.g., `freebie-tantrums` or `quiz-parenting-battery`)

This enables: segmented email lists, freebie-specific delivery automations, and understanding which content converts.

### Existing pattern
The site already has a Lemon Squeezy → Pipedream → Kit pipeline for purchases. But Pipedream adds management overhead and another service to maintain. For freebie signups (no payment involved), going direct to Kit API is simpler.

---

## Key Decisions

### 1. Direct Kit API — no Pipedream
- **Chose:** Next.js API route calls Kit API directly
- **Why:** Freebie signups are simple (email + tags, no payment). Adding Pipedream as middleware creates another service to manage for no benefit. The API route is ~30 lines of code.
- **Trade-off:** Logic lives in codebase (needs redeploy to change). Acceptable because this logic rarely changes.

### 2. Freebie identity derived from page URL
- **Chose:** The freebie "slug" is the URL prefix of the page where the form appears
- **Why:** No special props needed on FreebieCTA. The component reads the current URL path and derives the freebie identity automatically. This works for both blog articles and quizzes.
- **How it works:**

| Page URL | Freebie slug | Meaning |
|----------|-------------|---------|
| `/blog/tantrums/handle-tantrum-scripts` | `blog/tantrums` | Tantrums category freebie |
| `/blog/tantrums/prevent-meltdowns` | `blog/tantrums` | Same freebie (same category) |
| `/blog/anxiety/childhood-fears-by-age` | `blog/anxiety` | Anxiety category freebie |
| `/quiz/parenting-battery` | `quiz/parenting-battery` | Quiz-specific freebie |
| `/quiz/calm-down-toolkit` | `quiz/calm-down-toolkit` | Quiz-specific freebie |

- **Derivation rule:**
  - Blog pages (`/blog/{category}/{slug}`): strip the article slug → `blog/{category}`
  - Quiz pages (`/quiz/{slug}`): use as-is → `quiz/{slug}`
- **Component uses `usePathname()` from `next/navigation`** — no props needed, works for both inline and page-level FreebieCTAs

### 3. Two-layer tag mapping with human-readable names
- **Chose:** Config file has two maps: (1) tag names → Kit tag IDs, (2) freebie slugs → tag name arrays
- **Why:** Using raw tag IDs (numbers) throughout the config is error-prone and unreadable. You can't tell at a glance what tag 182 is. With named tags, the config is self-documenting.
- **Structure:**

```typescript
// landing/src/lib/kit-config.ts

// Layer 1: Human-readable tag names → Kit tag IDs
// Fill in IDs after creating tags in Kit (via MCP or dashboard)
export const kitTags: Record<string, number> = {
  "lead":                       0,  // applied to every freebie signup
  // Blog category freebies (20)
  "freebie-tantrums":           0,
  "freebie-aggression":         0,
  "freebie-sleep":              0,
  "freebie-siblings":           0,
  "freebie-anxiety":            0,
  "freebie-discipline":         0,
  "freebie-staying-calm":       0,
  "freebie-breaking-the-cycle": 0,
  "freebie-big-feelings":       0,
  "freebie-potty-training":     0,
  "freebie-eating":             0,
  "freebie-screens":            0,
  "freebie-social-skills":      0,
  "freebie-body-safety":        0,
  "freebie-new-parent":         0,
  "freebie-teens":              0,
  "freebie-transitions":        0,
  "freebie-spirited-kids":      0,
  "freebie-parenting-approach": 0,
  "freebie-parenting-science":  0,
  // Quiz freebies (~24, add as quizzes are created)
  "quiz-parenting-battery":     0,
  "quiz-potty-training-readiness": 0,
  "quiz-kindergarten-readiness":   0,
  // ... etc
};

// Layer 2: Freebie slug (from URL) → which tag names to apply
export const freebieConfig: Record<string, string[]> = {
  // Blog categories — all articles in a category share the same freebie
  "blog/tantrums":           ["lead", "freebie-tantrums"],
  "blog/aggression":         ["lead", "freebie-aggression"],
  "blog/sleep":              ["lead", "freebie-sleep"],
  "blog/siblings":           ["lead", "freebie-siblings"],
  "blog/anxiety":            ["lead", "freebie-anxiety"],
  "blog/discipline":         ["lead", "freebie-discipline"],
  "blog/staying-calm":       ["lead", "freebie-staying-calm"],
  "blog/breaking-the-cycle": ["lead", "freebie-breaking-the-cycle"],
  "blog/big-feelings":       ["lead", "freebie-big-feelings"],
  "blog/potty-training":     ["lead", "freebie-potty-training"],
  "blog/eating":             ["lead", "freebie-eating"],
  "blog/screens":            ["lead", "freebie-screens"],
  "blog/social-skills":      ["lead", "freebie-social-skills"],
  "blog/body-safety":        ["lead", "freebie-body-safety"],
  "blog/new-parent":         ["lead", "freebie-new-parent"],
  "blog/teens":              ["lead", "freebie-teens"],
  "blog/transitions":        ["lead", "freebie-transitions"],
  "blog/spirited-kids":      ["lead", "freebie-spirited-kids"],
  "blog/parenting-approach": ["lead", "freebie-parenting-approach"],
  "blog/parenting-science":  ["lead", "freebie-parenting-science"],
  // Quizzes — each quiz has its own freebie
  "quiz/parenting-battery":        ["lead", "quiz-parenting-battery"],
  "quiz/potty-training-readiness": ["lead", "quiz-potty-training-readiness"],
  "quiz/kindergarten-readiness":   ["lead", "quiz-kindergarten-readiness"],
  // ... add as quizzes are created
};
```

- **Resolution at request time:** freebie slug → tag names (from `freebieConfig`) → tag IDs (from `kitTags`) → Kit API calls

### 4. Kit setup via MCP server (not manual dashboard clicking)
- **Chose:** Use the `kit-mcp-server` npm package to create all tags programmatically
- **Why:** Creating ~44 tags manually in the Kit dashboard is tedious and error-prone. The MCP server provides `kit_create_tag` and `kit_list_tags` tools that can be called directly from Claude Code.
- **Setup steps:**
  1. Get Kit v4 API key from Kit.com Settings > Developer
  2. Add MCP server to Claude Code: `claude mcp add kit -e KIT_API_KEY=your-key -- npx kit-mcp-server`
  3. Create all tags programmatically (1 `lead` + 20 blog freebie + N quiz tags)
  4. List tags back to get their IDs
  5. Fill in the IDs in `kit-config.ts`
- **Reference:** https://github.com/aplaceforallmystuff/mcp-kit

### 5. API key stored as environment variable
- **Chose:** `KIT_API_KEY` in `.env.local` (for dev) and Railway environment variables (for prod)
- **Why:** Standard practice. Never committed to repo. The API route reads it at runtime.

---

## Implementation Plan

### Step 1: Kit account setup (via MCP)
1. User provides Kit v4 API key
2. Install Kit MCP server
3. Create all tags: `lead`, `freebie-tantrums`, `freebie-aggression`, ..., `quiz-parenting-battery`, ...
4. List tags to get IDs
5. Record IDs in config

### Step 2: Config file
Create `landing/src/lib/kit-config.ts` with the two-layer mapping (tag names → IDs, freebie slugs → tag names).

### Step 3: API route
Create `landing/src/app/api/subscribe/route.ts`:
- Accepts POST with `{ email: string, freebieSlug: string }`
- Validates email format and that freebieSlug exists in config
- Calls Kit API v4:
  1. `POST /v4/subscribers` — create/upsert subscriber by email
  2. `POST /v4/tags/{tagId}/subscribers` — apply each tag (lead + freebie-specific)
- Returns success/error JSON
- Auth: reads `KIT_API_KEY` from env

### Step 4: Wire up FreebieCTA component
Modify `landing/src/components/blog/freebie-cta.tsx`:
- Add `usePathname()` to derive freebie slug from current URL
- On form submit: `fetch('/api/subscribe', { method: 'POST', body: { email, freebieSlug } })`
- Add loading state, success state, error state
- Accept optional `freebieSlug` prop as override (for cases where URL derivation doesn't work)

### Step 5: Page-level FreebieCTA
The `<FreebieCTA fullWidth />` at the bottom of blog posts (`page.tsx` line 57) will automatically work because it reads the URL. Two options:
- **Keep it:** user sees freebie offer after finishing the article (second chance to convert)
- **Remove it:** articles already have an inline FreebieCTA (avoids double-ask)
Decision: keep for now, remove later if it feels spammy.

### Step 6: Update page-level FreebieCTA copy
Currently shows hardcoded tantrum-specific defaults. Options:
- Pass category-specific props from page component (requires looking up canonical CTA data)
- Or: the component itself could look up the right copy from a client-accessible config based on the URL
Decision: TBD during implementation.

---

## Kit API Reference (v4)

All calls use header `X-Kit-Api-Key: {key}` and `Content-Type: application/json`.

### Create subscriber (upsert)
```
POST https://api.kit.com/v4/subscribers
Body: { "email_address": "user@example.com" }
Response: { "subscriber": { "id": 286, "email_address": "...", "state": "active", ... } }
```
- Creates if new, updates if exists (upsert by email)
- Subscriber must exist before tagging

### Tag subscriber by email
```
POST https://api.kit.com/v4/tags/{tag_id}/subscribers
Body: { "email_address": "user@example.com" }
Response: { "subscriber": { "id": 286, ..., "tagged_at": "..." } }
```
- Returns 201 (newly tagged) or 200 (already had tag)
- Subscriber must already exist

### List tags
```
GET https://api.kit.com/v4/tags
Response: { "tags": [{ "id": 162, "name": "lead", ... }, ...] }
```

### Create tag
```
POST https://api.kit.com/v4/tags
Body: { "name": "freebie-tantrums" }
Response: { "tag": { "id": 163, "name": "freebie-tantrums", ... } }
```

---

## Data Flow Summary

```
User clicks FreebieCTA on /blog/anxiety/childhood-fears-by-age
    │
    ▼
FreebieCTA component (client)
    ├── usePathname() → "/blog/anxiety/childhood-fears-by-age"
    ├── derive slug → "blog/anxiety"
    └── fetch POST /api/subscribe { email, freebieSlug: "blog/anxiety" }
           │
           ▼
    API route /api/subscribe (server)
           ├── freebieConfig["blog/anxiety"] → ["lead", "freebie-anxiety"]
           ├── kitTags["lead"] → 182
           ├── kitTags["freebie-anxiety"] → 194
           └── Kit API calls:
               1. POST /v4/subscribers { email }         → create/upsert
               2. POST /v4/tags/182/subscribers { email } → tag: lead
               3. POST /v4/tags/194/subscribers { email } → tag: freebie-anxiety
                      │
                      ▼
               Kit dashboard shows:
               subscriber "user@example.com"
               tags: [lead, freebie-anxiety]
```

---

## Open Questions

1. **Quiz freebie list**: need to enumerate all quiz slugs and create corresponding tags. Currently 3 active quizzes in `posts.ts` quiz references, but `research/quizzes/quiz-ideas.md` may have more planned.
2. **Freebie delivery**: tagging alone doesn't send the freebie. Options:
   - Kit automation: "when tagged with freebie-tantrums → send email with download link"
   - Or: API route returns a download URL directly after successful subscribe
   - Decision deferred — tagging infrastructure first, delivery automation second.
3. **Rate limiting**: Kit API rate limits not documented in v4 docs. Unlikely to hit them (one user at a time), but worth knowing for batch operations.
4. **Double opt-in**: Kit may require double opt-in depending on account settings. The subscriber would get a confirmation email before being tagged. Need to check Kit account settings.

## Key Files for Context

- `landing/src/components/blog/freebie-cta.tsx` — current FreebieCTA component (form does nothing)
- `landing/src/components/blog/course-cta.tsx` — CourseCTA component (for reference)
- `landing/src/app/blog/[category]/[slug]/page.tsx` — blog post page (renders page-level FreebieCTA at line 57)
- `research/category_ctas.json` — canonical freebie names/promises per category
- `.worklogs/2026-02-08-171844-full-session-canonical-ctas-pipeline.md` — prior session context
- `landing/.env.local` — where KIT_API_KEY will live

## Next Steps / Continuation Plan

1. User provides Kit v4 API key
2. Install Kit MCP server, create all tags, record IDs
3. Create `landing/src/lib/kit-config.ts` with filled-in tag IDs
4. Create `landing/src/app/api/subscribe/route.ts`
5. Update FreebieCTA component with usePathname + fetch
6. Test end-to-end on localhost
7. Add KIT_API_KEY to Railway env vars
8. Deploy
