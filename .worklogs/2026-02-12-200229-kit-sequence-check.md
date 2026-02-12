# Add Kit sequence check to admin mailing dashboard

**Date:** 2026-02-12 20:02
**Scope:** content-plan/kit_integration.json, content-spec/src/schemas/kit-integration.ts, landing/src/app/api/admin/mailing/route.ts, landing/src/app/admin/mailing/page.tsx

## Summary
Added infrastructure check that verifies the Kit email sequence ("Quiz Results Email") exists via Kit API. Surfaces in both the stats block and per-quiz-gate table rows.

## Context & Problem
Quiz gate infrastructure checks showed all green (API route, frontend, Kit field, Kit tag) but there was no check for whether Kit would actually SEND an email when the quiz-completed tag is triggered. The Kit automation + sequence must exist for the flow to work end-to-end, but Kit's API doesn't expose visual automations — only sequences.

## Decisions Made

### Check sequences, not automations
- **Chose:** Verify sequence exists by name via `GET /v4/sequences` API
- **Why:** Kit API exposes sequence listing but NOT visual automations. The sequence is the verifiable piece — if it exists and the automation is wired, the flow works.
- **Limitation:** Can't verify the visual automation trigger (tag added → add to sequence) exists. But if the sequence is missing, the flow definitely doesn't work.

### requiredSequences in kit_integration.json
- **Chose:** Add `"requiredSequences": {"quizResults": "Quiz Results Email"}` to the spec
- **Why:** Name-based matching against Kit API response. Keeps the expected sequence name in the spec alongside other Kit configuration.

### Also renamed quiz-completed tag
- **Chose:** Renamed Kit tag from "Quiz Completed" (title case) to "quiz-completed" (kebab case)
- **Why:** All other tags use kebab-case names in Kit. This one was created manually and got title case by mistake.

## Key Files for Context
- `landing/src/app/api/admin/mailing/route.ts` — fetches sequences, adds to infrastructure
- `landing/src/app/admin/mailing/page.tsx` — displays Kit Seq column + stats line
- `content-plan/kit_integration.json` — `requiredSequences` spec
- `content-spec/src/schemas/kit-integration.ts` — schema with optional `requiredSequences`
- `.worklogs/2026-02-12-193750-kit-api-bugfixes.md` — prior bugfix worklog
