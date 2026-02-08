# content-spec framework planning + admin CTA expansion + quiz refinements

**Date:** 2026-02-08 21:24
**Scope:** research/decoupling-planning.md, landing/src/lib/admin/*, landing/src/lib/quiz/*, landing/src/lib/db/schema.ts, research/category_ctas.json, research/writer_prompt.md, clients/openrouter/*, scripts/generate-one-quiz.ts

## Summary
Designed the content-spec reusable framework (typed pipeline for content sites). Also completed CTA metadata expansion (eyebrow, buttonText) across admin parser chain, refined quiz community CTA constraints, and cleaned up dead code (openrouter client, generate-one-quiz script).

## Context & Problem
Multiple sessions of work accumulated:
1. Admin dashboard needed full CTA metadata (eyebrow, buttonText) — was only extracting type/title/body/href
2. Quiz community CTA was over-promising (wrong price, wrong features) — needed constraints aligned with actual community offering
3. Dead code from previous experiments (openrouter client, generate-one-quiz script) needed cleanup
4. Main task: designing a reusable content-spec framework that types every stage of the content pipeline so agents can't break the spec

## Decisions Made

### content-spec architecture: typed pipeline
- **Chose:** 3-stage typed pipeline (Plan → Generation → Validation) where every stage has types, prompts, and data
- **Why:** User wants framework reusable across multiple landing sites. Agents generate everything from loose human input — every plan file needs a schema + generation prompt. Page types are composable (article = body + CTAs + images + FAQ + JSON-LD).
- **Alternatives considered:**
  - Simple 3-layer (plan schemas → parser → validator) — rejected because it didn't account for the generation stage or composable page parts

### CTAs as standalone entities
- **Chose:** Flat array of CTA definitions, each with id/type/name/url/what_it_is/can_promise/cant_promise
- **Why:** Previous design coupled CTAs 1:1 with article categories. But courses can span categories, categories can have no course, and the relationship is many-to-many. Mapping lives in the link plan.

### Landing doesn't depend on content-spec
- **Chose:** Content-spec is a dependency of admin (once decoupled), not landing
- **Why:** Landing just serves pages. Parser/validator are admin concerns. Admin decoupling is a separate task.

### Humans give loose input, agents generate typed data
- **Chose:** Every plan file has a generation prompt. Human says "I have 3 courses roughly like X" → agent produces typed CTA catalog.
- **Why:** The whole pipeline is agent-driven. Typing each stage ensures agents produce valid data at every step.

## Architectural Notes
- Page types are a registry, not hardcoded — articles, quizzes, stories, comparisons, etc.
- Each page type composes different "parts" — each part has its own output type and prompt template
- JSON-LD requirements are first-class — input for generation AND validation
- Taxonomy convention: every entry has slug + url, categorySlug is optional (standalone articles)
- CTA url is optional (freebie/mailing CTAs may not have one)
- RangeSchema max is nonnegative (0 = "not allowed", e.g. no FAQs)

## Information Sources
- Existing codebase: article-validator.ts, mdx-parser.ts, types.ts, category_ctas.json
- 5 parallel inventory agents from previous session
- User feedback through iterative review of plan document

## Open Questions / Future Considerations
- Admin decoupling (separate task)
- Kit client decoupling (separate task)
- Prompt template storage (content-spec or research?)
- Parser generalization beyond MDX

## Key Files for Context
- `research/decoupling-planning.md` — THE plan document, iterated through multiple review rounds
- `research/category_ctas.json` — current CTA definitions (will be rewritten to cta_catalog.json)
- `landing/src/lib/admin/mdx-parser.ts` — parser that moves to content-spec
- `landing/src/lib/admin/article-validator.ts` — validator that moves to content-spec
- `landing/src/lib/admin/types.ts` — types that get replaced by Zod schemas
- `.worklogs/2026-02-08-191817-admin-dashboard-full-system-reference.md` — prior session worklog

## Next Steps / Continuation Plan
1. Create `content-spec/` workspace, scaffold package.json + tsconfig.json
2. Write all Stage 1 Zod schemas (taxonomy, cta-catalog, mailing, link-plan, page-types, json-ld)
3. Write Stage 2 generation schemas (output types, composition)
4. Move parser + validator from landing, refactor for PageType config
5. Create data files (agent-generated from loose input)
6. Validate everything end-to-end
