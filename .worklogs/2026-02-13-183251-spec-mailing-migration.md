# Spec mailing.json migration + validator design

**Date:** 2026-02-13 18:32
**Scope:** `spec/mailing.json`, `scripts/migrate_mailing_spec.py`, `new_validation/` (validators workspace moved by user)

## Summary

Created `spec/mailing.json` — the mailing form spec file for all email capture forms on the site (freebies on article pages, waitlists on course pages, quiz gates on quiz pages). 289 entries total. Migrated from flat `content-plan/mailing_form_catalog.json` + quiz JSON files. Also documented the complete validator design for the next step.

## Context & Problem

The old `mailing_form_catalog.json` was a flat array of 64 entries mixing three form types (20 freebies, 20 waitlists, 24 quiz-gates). Each entry mixed rendered fields (copy text), infrastructure config (endpoints, tags), validation rules (word counts in the imperative validator), and generator context (what_it_is, name) in one blob. Quiz-gate entries had NO copy — the quiz preview component fell back to hardcoded defaults, but the actual quiz JSON files (`landing/src/lib/quiz/{slug}.json`) had fully generated per-quiz `previewCta` copy that was never captured in the catalog.

## Decisions Made

### Decision 1: Same nesting as CTAs — keyed by full URL path to the page

- **Chose:** Three sections: `blog/{category}/{article}`, `course/{courseSlug}`, `quiz/{quizSlug}`
- **Why:** Mailing forms appear on pages, keyed by the page they appear on. Same principle as `spec/ctas.json`.
- **Key point:** Blog freebies are keyed per-article (`blog/aggression/beyond-hitting`), NOT per-category, even though copy is currently identical within a category. There is no category page. The freebie appears on the article page.

### Decision 2: Spec fields = what the component renders + API configuration

- **Chose:** 8 fields per entry:
  - **Rendered:** `eyebrow`, `title`, `body`, `inputPlaceholder`, `buttonText`
  - **Infrastructure:** `endpoint`, `tags`, `params`
- **Why:** The spec must contain everything needed to wire up the form on the page: what to show the user (5 rendered fields) and where/how to submit (endpoint + tags + params). Unlike CTAs which are link-outs (just need a URL), mailing forms POST to an API with specific parameters.

### Decision 3: Params encode static POST body fields

- **Chose:** `params` object contains the static values the form sends alongside `email` and `timezone` (which are always sent).
  - Freebie: `{ "category": "tantrums" }`
  - Waitlist: `{ "category": "tantrums" }`
  - Quiz gate: `{ "quizSlug": "parenting-style", "fromGate": true }`
- **Why:** `email` comes from the input field, `timezone` is auto-detected by the browser — neither is spec config. But `category`, `quizSlug`, and `fromGate` are static per form and the frontend code currently hardcodes them. Moving them to the spec makes the form fully data-driven.
- **Source of truth:** Verified actual fetch calls in `course-hero.tsx` (waitlist), `quiz-container.tsx` and `likert-quiz.tsx` (quiz gate).

### Decision 4: Quiz gate copy pulled from quiz JSON files, not catalog

- **Chose:** Read `previewCta` from `landing/src/lib/quiz/{slug}.json` for all 24 quiz gate entries.
- **Why:** The mailing catalog had NO cta_copy for quiz-gate entries. The quiz preview component had hardcoded defaults ("Want the full results?", "Get your complete results..."). But the actual generated quiz JSON files all have fully unique, per-quiz `previewCta` with specific copy referencing each quiz's topic. These are what's live on the site.
- **Rejected:** Using component defaults — would lose the real, unique copy that was already generated.

### Decision 5: What goes in spec vs validator

- **In the spec (spec/mailing.json):**
  - `eyebrow` — rendered text
  - `title` — rendered text
  - `body` — rendered text
  - `inputPlaceholder` — rendered placeholder text in the email input
  - `buttonText` — rendered button label
  - `endpoint` — API URL the form POSTs to
  - `tags` — Kit tags applied when subscriber is created
  - `params` — static fields sent in the POST body

- **NOT in the spec — goes in Zod validator schemas:**
  - `name` (product name) — validator rule: freebie title must contain the product name
  - `what_it_is` (product description) — generator context, feeds the prompt not the component
  - Word count limits per field (differ by form type)
  - Forbidden terms list (same as CTAs)
  - No exclamation marks rule
  - Literal buttonText constraints ("Reserve your spot" for waitlist, "Send my results" for quiz gate)
  - Endpoint format rules (must start with `/api/`)
  - Tag rules (must include "lead")
  - `inputPlaceholder` max length
  - Param structure validation per form type

## Spec File Structure

```json
{
  "blog": {
    "{category}": {
      "{article}": {
        "eyebrow": "Three steps, every time",
        "title": "Get The 3-Step Tantrum Script Cheat Sheet",
        "body": "A one-page printable with the exact phrases...",
        "inputPlaceholder": "Email address",
        "buttonText": "Send me the cheat sheet",
        "endpoint": "/api/freebie-subscribe",
        "tags": ["lead", "freebie-tantrums"],
        "params": { "category": "tantrums" }
      }
    }
  },
  "course": {
    "{courseSlug}": {
      "eyebrow": "Meltdown in public",
      "title": "The Tantrum Toolkit course will give you a move...",
      "body": "You'll stop improvising and start responding...",
      "inputPlaceholder": "Your email",
      "buttonText": "Reserve your spot",
      "endpoint": "/api/waitlist-subscribe",
      "tags": ["lead", "waitlist-tantrums"],
      "params": { "category": "tantrums" }
    }
  },
  "quiz": {
    "{quizSlug}": {
      "eyebrow": "Want the full breakdown?",
      "title": "Get your complete parenting style profile...",
      "body": "See which dimension leads your profile...",
      "inputPlaceholder": "Email address",
      "buttonText": "Send my results",
      "endpoint": "/api/quiz-subscribe",
      "tags": ["lead", "quiz-parenting-style"],
      "params": { "quizSlug": "parenting-style", "fromGate": true }
    }
  }
}
```

## Migration Details

**Sources:**
- Freebies (20 per-category) → expanded to 245 per-article entries using `article_taxonomy.json`
- Waitlists (20 per-course) → 20 entries, course slug extracted from `pageUrlPattern`
- Quiz gates (24 per-quiz) → 24 entries, copy from `landing/src/lib/quiz/{slug}.json` `meta.previewCta`

**Field mapping:**
| Old field | New field | Notes |
|-----------|-----------|-------|
| `cta_copy.eyebrow` | `eyebrow` | Direct copy |
| `cta_copy.title` | `title` | Direct copy |
| `cta_copy.body` | `body` | Direct copy |
| `cta_copy.buttonText` | `buttonText` | Direct copy |
| (not in old) | `inputPlaceholder` | From component defaults: "Email address" for freebie/quiz, "Your email" for waitlist |
| `endpoint` | `endpoint` | Direct copy |
| `tags` | `tags` | Direct copy |
| (not in old) | `params` | Derived from actual fetch calls in component code |
| `name` | DROPPED | Goes to validator as a rule |
| `what_it_is` | DROPPED | Generator context |
| `id` | DROPPED | Structural — encoded by nesting path |
| `type` | DROPPED | Structural — encoded by section (blog/course/quiz) |
| `pageUrlPattern` | DROPPED | Encoded by nesting path |

**Verification:** 289 entries (245 blog + 20 course + 24 quiz). All quiz entries have unique, per-quiz copy.

## Validator Design (NEXT STEP)

The validator package is at `new_validation/` (moved by user from `validators/`). It already has `spec/ctas.ts` with the CTA Zod schemas. Next: create `spec/mailing.ts`.

### Zod schemas to create

**`FreebieFormSchema`** — validates each blog freebie entry:

| Field | Type in schema | Validation rules |
|-------|---------------|------------------|
| `eyebrow` | `z.string().min(1)` | 2-7 words |
| `title` | `z.string().min(1)` | 3-10 words; must contain product name (from validator constant, NOT from spec) |
| `body` | `z.string().min(1)` | 8-36 words |
| `inputPlaceholder` | `z.string().min(1)` | non-empty |
| `buttonText` | `z.string().min(1)` | non-empty (varies per freebie — "Send me the cheat sheet", "Send me the card", etc.) |
| `endpoint` | `z.literal("/api/freebie-subscribe")` | must be exactly this |
| `tags` | `z.array(z.string()).min(1)` | must include "lead" |
| `params` | `z.object({ category: z.string().min(1) })` | category must be a valid category slug (cross-ref) |

Cross-field rules (all text: eyebrow + title + body + buttonText):
- No exclamation marks
- No forbidden terms: "weekly expert q&as", "live coaching calls", "video content", "1-on-1 access", "guaranteed response times"

**`WaitlistFormSchema`** — validates each course waitlist entry:

| Field | Type in schema | Validation rules |
|-------|---------------|------------------|
| `eyebrow` | `z.string().min(1)` | 2-7 words |
| `title` | `z.string().min(1)` | 5-12 words |
| `body` | `z.string().min(1)` | 20-30 words |
| `inputPlaceholder` | `z.string().min(1)` | non-empty |
| `buttonText` | `z.literal("Reserve your spot")` | exact literal — hardcoded in CourseHero component |
| `endpoint` | `z.literal("/api/waitlist-subscribe")` | must be exactly this |
| `tags` | `z.array(z.string()).min(1)` | must include "lead" |
| `params` | `z.object({ category: z.string().min(1) })` | category must be a valid category slug (cross-ref) |

Same cross-field clean text rules (no exclamation marks, no forbidden terms).

**`QuizGateFormSchema`** — validates each quiz gate entry:

| Field | Type in schema | Validation rules |
|-------|---------------|------------------|
| `eyebrow` | `z.string().min(1)` | 2-7 words |
| `title` | `z.string().min(1)` | 3-10 words |
| `body` | `z.string().min(1)` | 8-36 words |
| `inputPlaceholder` | `z.string().min(1)` | non-empty |
| `buttonText` | `z.literal("Send my results")` | exact literal — always "Send my results" |
| `endpoint` | `z.literal("/api/quiz-subscribe")` | must be exactly this |
| `tags` | `z.array(z.string()).min(1)` | must include "lead" |
| `params` | `z.object({ quizSlug: z.string().min(1), fromGate: z.literal(true) })` | quizSlug must match a real quiz (cross-ref) |

Same cross-field clean text rules.

**`MailingSpecSchema`** — top-level file shape:

```ts
z.object({
  blog: z.record(z.string(), z.record(z.string(), FreebieFormSchema)),
  course: z.record(z.string(), WaitlistFormSchema),
  quiz: z.record(z.string(), QuizGateFormSchema),
})
```

### Constants for validator (NOT in spec)

```ts
export const WAITLIST_BUTTON_TEXT = "Reserve your spot";
export const QUIZ_GATE_BUTTON_TEXT = "Send my results";
export const FREEBIE_ENDPOINT = "/api/freebie-subscribe";
export const WAITLIST_ENDPOINT = "/api/waitlist-subscribe";
export const QUIZ_GATE_ENDPOINT = "/api/quiz-subscribe";
```

### Cross-reference validation function

`validateMailingCrossRefs(spec, taxonomy)` — bidirectional:

**Spec → Taxonomy (no orphans):**
- Every `blog/{category}` key exists as a category in taxonomy
- Every `blog/{category}/{article}` key exists as an article in that category
- Every `course/{slug}` key exists as a course in taxonomy
- Every `quiz/{slug}` key exists as a quiz in taxonomy
- Every freebie `params.category` matches its parent category key
- Every waitlist `params.category` matches a valid category slug

**Taxonomy → Spec (completeness):**
- Every article in taxonomy has an entry in `blog/{category}/{article}`
- Every course in taxonomy has an entry in `course/{slug}`
- Every quiz in taxonomy has an entry in `quiz/{slug}`

### Freebie product name validation

Product names (e.g. "The 3-Step Tantrum Script Cheat Sheet") are NOT in the spec — they're validation rules. The validator needs a lookup of product names per category. Options:
1. Hardcode in the validator as constants (simple, fragile)
2. Read from `content-plan/mailing_form_catalog.json` (the old file has them)
3. Store in a separate config in the taxonomy (cleanest long-term)

Decision deferred — for now, can use option 2 or extract from old catalog into a constant map in the validator. This is a "name in title" warning, not a hard error.

## Component Props Reference (for future validators/consumers)

**FreebieCTA** (`landing/src/components/blog/freebie-cta.tsx`):
- Props: eyebrow?, title?, body?, inputPlaceholder?, buttonText?, fullWidth?, variant?, onSubmit?
- Default inputPlaceholder: "Email address"
- Default buttonText: "Send me the sheet"
- Submits via onSubmit callback (parent wires the fetch)

**CourseHero** (`landing/src/components/course/course-hero.tsx`):
- Props: eyebrow, title, body, bullets, category
- Hardcoded placeholder: "Your email"
- Hardcoded buttonText: "Reserve your spot"
- Fetches: `POST /api/waitlist-subscribe { email, category, timezone }`

**QuizPreview** (`landing/src/components/quiz/quiz-preview.tsx`):
- Uses FreebieCTA internally with eyebrow, title, body, buttonText from `quizMeta.previewCta`
- Default eyebrow: "Want the full results?"
- Default buttonText: "Send my results"
- Parent wires onEmailSubmit → `POST /api/quiz-subscribe { email, quizSlug, resultUrl, fromGate: true, timezone }`

## Information Sources

- `content-plan/mailing_form_catalog.json` — old flat catalog (20 freebies + 20 waitlists + 24 quiz-gates)
- `content-plan/article_taxonomy.json` — article list for freebie expansion
- `landing/src/lib/quiz/{slug}.json` — 24 quiz JSON files with `meta.previewCta`
- `landing/src/components/blog/freebie-cta.tsx` — freebie component props
- `landing/src/components/course/course-hero.tsx` — waitlist form: posts `{ email, category, timezone }`
- `landing/src/components/quiz/quiz-container.tsx` — quiz gate: posts `{ email, quizSlug, resultUrl, fromGate, timezone }`
- `landing/src/components/quiz/quiz-preview.tsx` — quiz preview default copy values
- `content-spec/src/validator/mailing-form.ts` — old validator with all rules (word counts, button text, coverage)
- `content-spec/src/validator/cta.ts` — shared validateCtaCopy function, FORBIDDEN_TERMS, button text constants
- `.worklogs/2026-02-13-172525-spec-ctas-migration.md` — CTA migration worklog (same architectural decisions apply)

## Key Files for Context

- `spec/mailing.json` — the new mailing form spec (this migration's output)
- `spec/ctas.json` — CTA spec (committed earlier, same architectural pattern)
- `new_validation/spec/ctas.ts` — CTA Zod schemas (existing, same pattern for mailing)
- `new_validation/spec/index.ts` — barrel export
- `content-plan/mailing_form_catalog.json` — old file (still consumed by existing code)
- `content-spec/src/validator/mailing-form.ts` — old validator (rules to move into Zod schema)
- `content-spec/src/validator/cta.ts` — old shared copy validator (FORBIDDEN_TERMS, word counts)
- `scripts/migrate_mailing_spec.py` — migration script
- `.worklogs/2026-02-13-172525-spec-ctas-migration.md` — CTA migration decisions
- `.worklogs/2026-02-13-183251-spec-mailing-migration.md` — this worklog

## Next Steps / Continuation Plan

1. **Create `new_validation/spec/mailing.ts`** — Zod schemas for all three form types + cross-ref validator. Follow exact same pattern as `new_validation/spec/ctas.ts`. Use `.literal()` for fixed buttonText/endpoint values. Use `.superRefine()` for dynamic word count errors. Use `.meta()` for human-readable rule descriptions.

2. **Update `new_validation/spec/index.ts`** — add barrel exports for mailing schemas

3. **Smoke test** — parse `spec/mailing.json`, verify all 289 entries pass field validation

4. **Decide on product name validation** — how to supply freebie product names to the validator for "name in title" checks

5. **Commit** spec/mailing.json + migration script + worklog

6. **Future:** migrate taxonomy.json, linking.json following same process. Build admin Spec/ pages. Wire consumers to read from spec/ instead of content-plan/.
