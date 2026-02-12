# Surface infrastructure readiness in mailing page stats

**Date:** 2026-02-12 17:23
**Scope:** landing/src/app/api/admin/mailing/route.ts, landing/src/app/admin/mailing/page.tsx

## Summary
Added infrastructure readiness flags to the mailing admin page so broken submission pipelines are immediately visible. API routes, frontend handlers, Kit custom fields, and Kit tags are now checked and surfaced in both the stats header and per-article freebie sub-tables.

## Context & Problem
The mailing page validated catalog DATA quality (copy word counts, forbidden terms, Kit form mappings) but never checked whether forms can actually SUBMIT. The `validateKitIntegration` function already checks API routes, frontend code patterns, Kit tags, and custom fields — but those results were buried in collapsible accordions at the bottom of the page.

A form showing green in the stats meant nothing if `/api/quiz-subscribe` doesn't exist and FreebieCTA has no real submit handler.

## Decisions Made

### Return infrastructure flags separately from integration checks
- **Chose:** Add a flat `infrastructure` object with 7 boolean flags + 2 counts to the API response
- **Why:** The integration check results (IntegrationCheck[]) are label/status/detail objects designed for display in accordion lists. The stats and sub-tables need simple booleans for conditional logic. Extracting these from the existing computed data is trivial.

### Patch per-article checks with infrastructure columns
- **Chose:** After computing infrastructure flags, loop through articlesByCategory and add `api_route` and `frontend` checks to each published article
- **Why:** The per-article freebie loop runs before code checks (apiRouteResults/frontendResults) are computed. Rather than reordering the code, we compute infrastructure last and patch the articles. This keeps the existing code structure intact.
- **Alternatives considered:**
  - Move code checks before articlesByCategory loop — more disruptive reorder, same result
  - Add infrastructure as separate sub-table columns not in checks — would need separate rendering logic

### Quiz gate passing requires ALL infrastructure
- **Chose:** Quiz gates only count as passing when: catalog ok + Kit mapping + quizApiRoute + quizFrontendReady + kitCustomFieldReady + kitQuizTagsReady
- **Why:** If any infrastructure piece is missing, no quiz gate can work. This makes all 24 quiz gates show as 0/24 when infrastructure is broken — which is the truth.

## Current Infrastructure State
- freebieApiRoute: false (/api/freebie-subscribe doesn't exist)
- quizApiRoute: false (/api/quiz-subscribe doesn't exist)
- freebieFrontendReady: true (FreebieCTA has "onSubmit" string — though handler is a no-op e.preventDefault())
- quizFrontendReady: false (quiz components missing subscribe patterns)
- kitCustomFieldReady: false (quiz_result_url not in Kit)
- kitFreebieTagsReady: true (20 freebie tags exist in Kit)
- kitQuizTagsReady: true (24 quiz tags exist in Kit)

Note: freebieFrontendReady shows true because the spec checks for string "onSubmit" presence, and the dead-end handler matches. The API route check catches the real problem.

## Key Files
- `landing/src/app/api/admin/mailing/route.ts` — infrastructure computation + per-article patching
- `landing/src/app/admin/mailing/page.tsx` — BoolStat component, infrastructure stats display, updated FREEBIE_CHECK_COLUMNS, quiz infra in passing counts
- `content-plan/kit_integration.json` — spec for what infrastructure should exist (read-only)
