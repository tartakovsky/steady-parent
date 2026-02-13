# Spec/validator architecture redesign — CTA migration (Phase 1)

**Date:** 2026-02-13 17:25
**Scope:** `spec/ctas.json`, `spec/` folder, `validators/` folder structure

## Summary

Created the new `spec/` and `validators/` folder structure. Migrated CTA data from the old flat `content-plan/cta_catalog.json` (65 entries in a flat array) to a clean nested `spec/ctas.json` (245 blog articles + 24 quizzes). This is the first file in a complete architecture redesign of how spec data, validators, and admin pages work.

## Context & Problem

The old system had multiple problems:

1. **Scattered data files** — all spec data lived in `content-plan/` with inconsistent naming, mixed concerns, and no clear separation between spec data and historical research artifacts.

2. **Flat CTA structure** — `cta_catalog.json` was a flat array of 65 objects mixing three different things: a base community metadata entry, 44 per-context community CTA copy entries (20 categories + 24 quizzes), and 20 course CTA entries. Every community entry redundantly repeated `name: "Steady Parent Community"` and `url: "https://www.skool.com/..."`. Dead fields like `can_promise: []` were on every entry.

3. **Hardcoded validation in UI** — admin pages had tooltip "Expected" values hardcoded as strings (e.g. "2-7 words") that could drift from actual validator rules. The user demanded validators output structured rule metadata and the UI render it directly.

4. **Mixed spec/production concerns** — validators and admin pages mixed "does the spec JSON follow business rules?" with "does the deployed site match the spec?" These are fundamentally different questions.

## Decisions Made

### Decision 1: New folder structure

- **Chose:**
  ```
  spec/                    # Clean spec data files (JSON)
  validators/
    spec/                  # Validate spec JSONs against business rules
    prod/                  # Validate deployed site against spec
  ```
- **Why:** Clear separation of concerns. Spec files are the source of truth for what should be on the site. Spec validators check the data files. Prod validators check the actual site. This maps directly to two admin page groups (Spec/ and Prod/).
- **`content-plan/` stays for now** — it still has files not yet migrated (taxonomy, linking, mailing, prompts, etc). Files are migrated one at a time. Old consumers keep reading from `content-plan/` until each migration is complete.

### Decision 2: Spec files contain EXACTLY what the component renders

- **Chose:** Spec fields = component props. Nothing more, nothing less.
- **Why:** The spec is the contract for what appears on the production page. If the React component takes `eyebrow`, `title`, `body`, `buttonText`, and `href` (renamed to `buttonUrl` for clarity), then those are the spec fields. Period.
- **What this means in practice:**
  - `name` (e.g. "Steady Parent Community", "Beyond Hitting") is NOT in the spec. The components don't have a name prop. Name is a validation concern — the Zod schema can check that the title contains the course name.
  - `what_it_is` — NOT in the spec. It's generator context / marketing copy, not a rendered field.
  - `founder_presence` — NOT in the spec. It's a validation rule ("body must contain 'We are there with you daily too'"), enforced by the Zod schema.
  - `can_promise` / `cant_promise` / `FORBIDDEN_TERMS` — NOT in the spec. They are validation rules in the Zod schema.
  - `buttonText` IS in the spec even though it's currently identical across all community CTAs ("Join the community"). The fact that it's the same now is coincidental. The spec should be complete — every field the component needs.

### Decision 3: Nest by actual URL path

- **Chose:** JSON structure mirrors the site's URL routing.
  ```json
  {
    "blog": {
      "aggression": {
        "beyond-hitting": {
          "community": { ... },
          "course": { ... }
        }
      }
    },
    "quiz": {
      "parenting-style": {
        "community": { ... }
      }
    }
  }
  ```
- **Why:** The URL path is already the unique identifier. `blog/aggression/beyond-hitting` maps to `/blog/aggression/beyond-hitting`. No invented ID system, no compound IDs to parse. The nesting IS the routing. You can validate paths directly against the spec keys.
- **Alternatives rejected:**
  - Flat array with IDs (old approach) — requires parsing IDs to understand structure, redundant type/scope fields
  - Flat keyed object (`"blog/aggression/beyond-hitting": { ... }`) — keys encode structure but you'd parse prefixes to know the shape
  - Nested by category only — user explicitly said "there is no concept of category, articles have CTAs". Each article has its own entry even though copy currently repeats within a category.

### Decision 4: CTAs are per-article, not per-category

- **Chose:** Every article gets its own CTA entry in the spec, even though all articles in a category currently share identical community/course copy.
- **Why:** CTAs appear on article pages, so they belong to articles. The fact that current copy is identical per category is an artifact of how the copy was generated (one batch per category). When articles are regenerated, each can get unique copy. The data model should not encode a coincidental constraint.

### Decision 5: Freebie is NOT a CTA

- **Chose:** Freebie email capture forms go in `spec/mailing.json`, not `spec/ctas.json`.
- **Why:** The freebie component (`FreebieCTA`) is an email capture form — it submits to an API endpoint, not a link. It has `inputPlaceholder` instead of `buttonUrl`. It's a fundamentally different thing (mailing/lead gen) even though it visually looks like a CTA card. Community and course CTAs are link-out CTAs (click → go somewhere). Freebies are email forms.

### Decision 6: Zod schemas as single source of truth for ALL validation rules

- **Chose:** Move all validation rules into Zod schemas using Zod 4's `.refine()` and metadata registries.
- **Why:** Currently validation rules live in hand-written imperative code in `content-spec/src/validator/cta.ts` (word counts, forbidden terms, required phrases, button text matching). The admin UI then hardcodes the same rules as tooltip strings. This causes drift. With Zod 4:
  - Rules are defined once in the schema (`.refine()` for checks, `.meta()` for human-readable descriptions)
  - Validation is `schema.safeParse(data)` — errors come with paths and messages
  - Admin UI reads rule metadata from the schema registry — zero hardcoded strings
  - Generator agents receive the schema (as JSON description) so they know exact constraints
- **What lives in the Zod schema (NOT in the spec JSON):**
  - Word count limits per field (e.g. eyebrow 2-7 words, title 3-10 words)
  - Forbidden terms list (no "weekly expert Q&As", "video content", etc.)
  - Required phrases (e.g. community body must contain "We are there with you daily too")
  - Button text constraints (e.g. community buttonText must be "Join the community")
  - URL format constraints (e.g. community buttonUrl must match the Skool URL pattern)
  - Product name references (e.g. course title should contain the course name)
  - No exclamation marks rule
- **What lives in the spec JSON (NOT in the schema):**
  - The actual final text for each field: eyebrow, title, body, buttonText, buttonUrl
  - These are the exact values that will appear in the production component

### Decision 7: Blog entries have community + course; Quiz entries have community only

- **Chose:** The Zod schema enforces different shapes:
  - `blog/*` entries must have `{ community: CopySchema, course: CopySchema }`
  - `quiz/*` entries must have `{ community: CopySchema }`
- **Why:** This matches what actually renders. Articles show 3 CTAs (community + course + freebie, but freebie is in mailing.json). Quizzes show 1 CTA (community on results page).

## What Was Migrated

**Source:** `content-plan/cta_catalog.json` (65 entries, flat array)
**Destination:** `spec/ctas.json` (245 blog articles + 24 quizzes, nested)

### Mapping:
- 1 base community entry (`id: "community"`) → DROPPED. Fields (`name`, `url`, `what_it_is`, `founder_presence`, `cant_promise`) become Zod schema rules.
- 20 per-category community entries (`id: "community-{category}"`) → EXPANDED to 245 per-article entries. Each article in a category gets that category's community copy. Copy fields extracted from `cta_copy` object. `url` becomes `buttonUrl`.
- 24 per-quiz community entries (`id: "community-quiz-{slug}"`) → 24 quiz entries. Copy fields extracted, `url` becomes `buttonUrl`.
- 20 course entries (`id: "course-{category}"`) → EXPANDED to 245 per-article entries. Each article gets its category's course copy. `name` and `what_it_is` dropped (schema concerns). `url` becomes `buttonUrl`.

### Fields per CTA entry (all 5 are required):
| Field | Description | Example |
|-------|-------------|---------|
| `eyebrow` | Small text above title | "When they hit again" |
| `title` | Main heading | "Hash it out with parents facing this too" |
| `body` | Description paragraph | "Next time you'll have parents who..." |
| `buttonText` | Button label | "Join the community" |
| `buttonUrl` | Where the button links | "https://www.skool.com/steady-parent-1727" |

### Dropped fields (will live in Zod schema):
| Old Field | New Location | How |
|-----------|-------------|-----|
| `name` | Zod schema | `.refine()` — course title must contain course name |
| `what_it_is` | Zod schema `.meta()` | Generator context, not rendered |
| `founder_presence` | Zod schema | `.refine()` — body must contain founder line |
| `cant_promise` / `FORBIDDEN_TERMS` | Zod schema | `.refine()` — body/title must not contain forbidden terms |
| `can_promise` | DELETED | Was always empty, never used |
| `type` | Structural | Encoded by nesting (`blog/` vs `quiz/`) |
| `id` | Structural | Encoded by nesting path (`blog/aggression/beyond-hitting`) |

### Verification:
- 20 categories, 245 articles — all have both community and course
- 24 quizzes — all have community
- Zero entries missing
- File size: 216 KB

## Architectural Notes

### The full target architecture (not yet implemented):

```
spec/                          # Spec data files — exactly what goes on the site
  ctas.json                    ✅ DONE (this worklog)
  mailing.json                 TODO — freebie forms, waitlist forms, quiz gates
  taxonomy.json                TODO — categories, articles, quizzes
  linking.json                 TODO — internal link plan

validators/                    # Validation code
  spec/                        # Validates spec JSON against business rules
    ctas.ts                    TODO — Zod schema with all CTA rules
    mailing.ts                 TODO
    taxonomy.ts                TODO
    linking.ts                 TODO
  prod/                        # Validates deployed site against spec
    ctas.ts                    TODO
    mailing.ts                 TODO
    taxonomy.ts                TODO
    linking.ts                 TODO
```

Admin pages (future):
- **Spec/** — Taxonomy, Linking, CTAs, Mailing → show spec data + spec validation
- **Prod/** — Articles, Linking, CTAs, Mailing → check deployed site against spec

### How Zod 4 metadata registries will work:

```ts
const specRegistry = z.registry<{
  field: string;
  expected: string;
}>();

const eyebrowSchema = z.string()
  .refine(s => wordCount(s) >= 2 && wordCount(s) <= 7, {
    message: "must be 2-7 words"
  })
  .register(specRegistry, {
    field: "cta_copy.eyebrow",
    expected: "2-7 words",
  });
```

- **Validation:** `schema.safeParse(data)` → structured errors with paths + messages
- **UI tooltips:** `specRegistry.get(eyebrowSchema)` → `{ field, expected }` — no hardcoded strings
- **Generator prompts:** iterate registry to list all rules as JSON → agent knows exact constraints

### Old files that still reference `content-plan/`:
9 TypeScript files, 3 Python scripts, 1 validation CLI, 1 build script. These will be updated as each file migrates. `content-plan/` is not renamed or deleted until all migrations are complete.

## Information Sources

- `content-plan/cta_catalog.json` — old 65-entry flat CTA catalog
- `content-plan/article_taxonomy.json` — article list with category assignments (used for expansion)
- `landing/src/components/blog/community-cta.tsx` — community CTA component (props: eyebrow, title, body, buttonText, href)
- `landing/src/components/blog/course-cta.tsx` — course CTA component (same props)
- `landing/src/components/blog/freebie-cta.tsx` — freebie component (different: has inputPlaceholder, no href)
- `content-spec/src/validator/cta.ts` — current validator with hardcoded rules (to be replaced by Zod schema)
- `content-spec/src/schemas/cta-catalog.ts` — current minimal Zod schema (to be replaced with full rules)
- https://zod.dev/metadata — Zod 4 metadata registries documentation

## Open Questions / Future Considerations

1. **Per-article copy generation** — right now all articles in a category have identical copy. When articles are regenerated, the generator can produce unique copy per article. The data model supports this already.
2. **Quiz CTA types** — quizzes currently only have community CTAs. If quizzes need course CTAs in the future, just add a `course` key to the quiz entry.
3. **Validator migration order** — next files to migrate: mailing.json (freebies, waitlists, quiz-gates), taxonomy.json, linking.json. Each follows the same process: discuss every field, verify against components, migrate, commit.
4. **Build script** — `landing/package.json` copies files from `content-plan/` to `mdx-sources/`. Will need updating when the system starts consuming from `spec/` instead.

## Key Files for Context

- `spec/ctas.json` — the new CTA spec file (this migration's output)
- `content-plan/cta_catalog.json` — the old CTA file (still consumed by existing code)
- `content-spec/src/schemas/cta-catalog.ts` — current Zod schema (minimal, to be rewritten)
- `content-spec/src/validator/cta.ts` — current validator code (rules to move into Zod schema)
- `landing/src/components/blog/community-cta.tsx` — community CTA component
- `landing/src/components/blog/course-cta.tsx` — course CTA component
- `landing/src/components/blog/freebie-cta.tsx` — freebie component (NOT a CTA, goes in mailing.json)
- `.worklogs/2026-02-13-172525-spec-ctas-migration.md` — this worklog

## Next Steps / Continuation Plan

1. **Write Zod schema for `spec/ctas.json`** — `validators/spec/ctas.ts` with full rules (word counts, forbidden terms, required phrases, URL patterns) using Zod 4 `.refine()` and `.meta()` registries
2. **Migrate next spec file** — discuss `mailing.json` fields (freebie forms, waitlists, quiz gates), verify against components, migrate
3. **Migrate taxonomy.json** — categories, articles, quizzes
4. **Migrate linking.json** — internal link plan
5. **Build admin Spec/CTAs page** — reads `spec/ctas.json`, runs Zod schema, renders table with tooltips from registry metadata
6. **Wire up consumers** — update code that reads from `content-plan/` to read from `spec/` instead
