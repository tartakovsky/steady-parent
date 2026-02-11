# Kit Quiz Integration — Spec + Validator + Admin Monitoring

**Date:** 2026-02-11 12:03
**Scope:** `content-plan/kit_quiz_integration.json`, `content-spec/src/schemas/kit-integration.ts`, `content-spec/src/schemas/index.ts`, `content-spec/src/validator/kit-integration.ts`, `content-spec/src/index.ts`, `content-spec/src/validate-plans.ts`, `landing/src/app/api/admin/kit/route.ts`, `landing/src/app/admin/kit/page.tsx`, `landing/package.json`

## Summary
Created the full spec→validator→admin pipeline for Kit quiz integration monitoring. A data file defines the expected integration state, validators check actual vs expected (offline for CLI, full for admin API with live Kit state + file system checks), and the admin Kit page shows a checklist of pass/fail/warn items.

## Context & Problem
The Kit quiz integration plan (`content-plan/kit-quiz-integration-plan.md`) defines how quiz email gates should work — tags, custom fields, forms, API routes, frontend wiring. Almost nothing is implemented yet. We needed the same spec→validator→admin pattern used everywhere else (quizzes, CTAs, cross-links) to create an implementation checklist that shows exactly what's done and what's missing.

## Decisions Made

### Spec data file structure
- **Chose:** Single JSON file defining custom fields, API route, localStorage key, quiz subscribe flow, and frontend code checks
- **Why:** Matches the project's pattern of declarative specs in content-plan/ validated by content-spec/
- **Alternatives considered:**
  - Embedding requirements in code comments — rejected because not machine-checkable
  - Multiple small spec files — rejected because it's one cohesive integration

### Two-tier validation (offline vs full)
- **Chose:** `validateKitIntegrationOffline()` for CLI (data cross-refs only) + `validateKitIntegration()` for admin API (+ Kit API + file system)
- **Why:** CLI has no Kit API access or file system context; admin API can do everything
- **Alternatives considered:**
  - Single validator with optional params — leads to messy conditionals
  - CLI-only — loses the live Kit state checks which are most valuable

### Frontend code checks via pattern matching
- **Chose:** `fileContainsPatterns()` reads source files and checks for string patterns (e.g., `sp_subscriber_email`, `subscribeForQuizResults`)
- **Why:** Simple, deterministic, no AST parsing needed. Patterns are specific enough to avoid false positives.
- **Alternatives considered:**
  - AST parsing — way over-engineered for this
  - Manual checklist — defeats the purpose of automated validation

### FreebieCTA check: `requiredProps` vs `requiredPatterns`
- **Chose:** Schema supports both `requiredProps` and `requiredPatterns` as separate arrays. FreebieCTA uses `requiredProps: ["onSubmit"]` since it already has onSubmit in the code.
- **Why:** Lets the spec distinguish between "this prop exists" and "this pattern appears in the file"

## Architectural Notes
- Kit custom fields fetched via `GET https://api.kit.com/v4/custom_fields` with `X-Kit-Api-Key` header
- Live tag state comes from kit_tags DB table (already synced by sync-orchestrator), NOT from Kit API directly
- Build script in `landing/package.json` extended to copy `kit_quiz_integration.json`, `mailing_tags.json`, `form_tag_mappings.json` to `mdx-sources/` for production
- `exactOptionalPropertyTypes` TS strict mode requires `detail?: string | undefined` not just `detail?: string` when assigning `undefined` from ternaries
- Integration validation is wrapped in try/catch in the API route so spec file issues don't break existing tag list functionality

## Validation Results (as of now)
- **CLI (offline):** All pass — data files are internally consistent
- **Admin API (live):** 4 errors, 1 warning:
  - FAIL: Custom field `quiz_result_url` not in Kit
  - FAIL: API route `/api/quiz-subscribe` file not found
  - FAIL: quiz-container.tsx missing `sp_subscriber_email`, `subscribeForQuizResults`
  - FAIL: likert-quiz.tsx missing `sp_subscriber_email`, `subscribeForQuizResults`
  - WARN: 0/24 quiz tags have subscribers
  - PASS: 24/24 quiz tags mapped in kit-config
  - PASS: 24/24 form tag mappings exist
  - PASS: 24/24 quiz tags exist in Kit
  - PASS: freebieCta has required patterns

## Information Sources
- `content-plan/kit-quiz-integration-plan.md` — the integration plan driving requirements
- `landing/src/app/admin/quizzes/page.tsx` — UI pattern reference (expandable error rows, icons)
- `landing/src/app/api/admin/spec/route.ts` — loadAndValidate pattern for content-plan files
- `landing/src/lib/admin/sync-orchestrator.ts` — Kit API fetch patterns
- `.worklogs/2026-02-06-120000-article-generation-pipeline-experiments.md` — prior pipeline context

## Open Questions / Future Considerations
- As each piece of the integration gets built (API route, frontend wiring, Kit custom field), items will flip from fail to pass
- May want to add form-level checks (Kit forms exist, forms have correct tags) once forms are created
- Could add a "last checked" timestamp to the integration result

## Key Files for Context
- `content-plan/kit_quiz_integration.json` — expected integration spec
- `content-plan/kit-quiz-integration-plan.md` — the human-written integration plan
- `content-spec/src/schemas/kit-integration.ts` — Zod schema for spec file
- `content-spec/src/validator/kit-integration.ts` — offline + full validator
- `content-spec/src/validate-plans.ts` — CLI validation runner
- `landing/src/app/api/admin/kit/route.ts` — admin API with live validation
- `landing/src/app/admin/kit/page.tsx` — admin UI with integration checklist
- `landing/src/lib/kit-config.ts` — tag name→Kit ID mappings

## Next Steps / Continuation Plan
1. Implement the actual quiz email integration (API route, frontend localStorage/subscribe wiring, Kit custom field creation) — each step will flip checklist items from red to green
2. The admin Kit page at `/admin/kit` serves as the implementation tracker
