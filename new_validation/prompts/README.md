# Generation Prompts

Prompts fed to Claude agents to generate spec content. Each subdirectory maps to a spec file in `../spec/`.

## Directory → Spec Mapping

### `ctas/` → `spec/ctas.json`

| Prompt | Generates | Scope | Output |
|--------|-----------|-------|--------|
| `community.md` | `blog.{cat}.{article}.community` | Per-category (20), fanned out to all articles | eyebrow, title, body, buttonText |
| `course.md` | `blog.{cat}.{article}.course` | Per-category (20), fanned out to all articles | eyebrow, title, body, buttonText |
| `quiz-community.md` | `quiz.{slug}.community` | Per-quiz (24) | eyebrow, title, body, buttonText |
| `how-to-community.md` | — | Instructions for running community.md | — |

### `mailing/` → `spec/mailing.json`

| Prompt | Generates | Scope | Output |
|--------|-----------|-------|--------|
| `waitlist.md` | `course.{slug}` waitlist forms | Per-course (20) | eyebrow, title, body |
| **MISSING: freebie.md** | `blog.{cat}.{article}` freebie forms | Per-category (20), fanned out | eyebrow, title, body |
| `how-to-waitlist.md` | — | Instructions for running waitlist.md | — |

Quiz-gate forms (`quiz.{slug}`) use hardcoded defaults — no generation prompt needed.

### `linking/` → `spec/linking.json`

**MISSING** — Link plans were generated in Phase 5 via per-category Opus calls, but the prompt was not saved. Link intents need a generation prompt.

### `articles/` → MDX blog posts

| Prompt | Generates | Scope |
|--------|-----------|-------|
| `writer.md` | Blog article MDX | Per-article (245), assembled by generation script with source extracts + link plan + CTA catalog |

### `quizzes/` → quiz definition JSON

Quiz generation prompts live in `landing/src/lib/quiz/quiz-prompt.ts` (634 lines, TypeScript). They generate prompts programmatically per quiz type (Likert, Identity, Assessment).

## Missing Prompts

1. **`mailing/freebie.md`** — Freebie form copy for blog articles. See `plan-improve-copy.md` for requirements.
2. **`linking/intents.md`** — Link intent generation. Needs reconstruction from Phase 5 methodology.

## Validators

Each spec file has matching validators in `../validators/spec/`:
- Zod schema validation (structural): `ctas.ts`, `mailing.ts`, `linking.ts`, `taxonomy.ts`
- Cross-reference validation: `cta-vs-taxonomy.ts`, `mailing-vs-taxonomy.ts`, `linking-vs-taxonomy.ts`
