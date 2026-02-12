# Quiz Gate Email Subscription — End-to-End Implementation

**Date:** 2026-02-12 19:17
**Scope:** kit-config.ts, kit-api.ts (new), quiz-subscribe/route.ts (new), freebie-cta.tsx, quiz-preview.tsx, quiz-container.tsx, likert-quiz.tsx, mailing_tags.json, kit_integration.json, form-subscription-implementation-plan.md

## Summary
Implemented the full quiz email gate subscription flow: Kit tag creation, shared API helper, quiz-subscribe API route with fromGate/timezone support, and frontend wiring across all quiz components. Verified via curl + Kit MCP that subscribers are correctly created with tags and custom fields.

## Context & Problem
All quiz email gate forms rendered but did nothing — `onSubmit={(e) => { e.preventDefault(); }}` everywhere. No API routes existed. The admin dashboard correctly showed 0/24 quiz gates passing infrastructure checks.

## Decisions Made

### fromGate flag for email trigger control
- **Chose:** API route accepts `fromGate: boolean` to control whether quiz-completed tag is remove+re-added (triggering Kit automation)
- **Why:** First quiz → gate → email sent. Returning user (localStorage) → silent background → no email. Cleared localStorage → gate again → email sent again (remove+re-add forces trigger)
- **Alternatives considered:**
  - Single quiz-completed tag without remove+re-add — rejected because returning users who clear localStorage would never get email again
  - Per-quiz automations (24 automations) — rejected, absurdly complex for identical behavior

### Timezone capture on every form
- **Chose:** Frontend captures `Intl.DateTimeFormat().resolvedOptions().timeZone` and sends to every API route, which sets it as Kit custom field
- **Why:** Kit does NOT natively detect subscriber timezone. Browser timezone is the only reliable source.

### Custom fields must be pre-created in Kit v4
- **Chose:** Create fields via Kit API v4 `POST /v4/custom_fields` before use
- **Why:** Kit v4 does NOT auto-create custom fields when set on subscribers (unlike v3). Tested: setting fields on subscriber creation silently ignores unknown field keys.
- **Created:** `quiz_result_url` (id: 1196248), `timezone` (id: 1196249)

### Shared kit-api.ts helper
- **Chose:** Single shared helper with createOrUpdateSubscriber, addTagToSubscriber, removeTagFromSubscriber, subscribeWithTags
- **Why:** All three form types (quiz, freebie, waitlist) need the same Kit operations. DRY.

### FreebieCTA onSubmit prop with loading/success/error states
- **Chose:** Optional `onSubmit` prop — when not provided, form stays a no-op (backward compatible)
- **Why:** FreebieCTA is used in multiple contexts (blog articles, quiz preview). Not all call sites are wired yet.

## Architectural Notes
- `quiz-container.tsx` and `likert-quiz.tsx` both have the full subscription logic duplicated (buildResultUrl, silentQuizSubscribe, getBrowserTimezone, STORAGE_KEY). Small enough to duplicate rather than extracting to a hook.
- `silentSubscribeFired` ref prevents the silent background call from firing multiple times on re-renders.
- Kit API calls are sequential for the quiz-completed remove+re-add (must remove before add). Tag applications in subscribeWithTags are parallel.

## Test Results
- `npm run typecheck -w landing` → clean
- `npm run build -w landing` → clean, `/api/quiz-subscribe` shows as dynamic route
- `curl POST {} → 400` (missing fields) ✓
- `curl POST {invalid email} → 400` ✓
- `curl POST {fromGate:true} → 200` — subscriber created with lead + quiz-parenting-style + Quiz Completed tags + quiz_result_url + timezone fields ✓
- `curl POST {fromGate:false, different quiz} → 200` — quiz-emotional-intelligence tag added, Quiz Completed timestamp unchanged (not re-triggered), quiz_result_url updated ✓
- Browser test pending (Chrome extension not connected)

## Information Sources
- `research/form-subscription-implementation-plan.md` — comprehensive implementation plan
- Kit API v4 docs: `POST /v4/custom_fields` requires pre-creation
- Kit API v4 docs: subscriber `fields` keys must match custom field `key` property

## Open Questions / Future Considerations
- Kit MCP `remove_tag_from_subscriber` returned 404 — may use different endpoint format than expected. Direct API works fine from our route.
- Kit visual automation for "Quiz Completed" tag → results email needs to be set up in Kit dashboard (cannot be done via API)
- Browser end-to-end test still needed
- Blog freebie and course waitlist forms still need implementation (same pattern)

## Key Files for Context
- `landing/src/lib/kit-api.ts` — shared Kit API helper (NEW)
- `landing/src/lib/kit-config.ts` — tag IDs including quiz-completed
- `landing/src/app/api/quiz-subscribe/route.ts` — quiz subscribe API route (NEW)
- `landing/src/components/blog/freebie-cta.tsx` — updated with onSubmit + loading states
- `landing/src/components/quiz/quiz-preview.tsx` — updated with onEmailSubmit prop
- `landing/src/components/quiz/quiz-container.tsx` — updated with subscription logic
- `landing/src/components/quiz/likert-quiz.tsx` — updated with subscription logic
- `content-plan/kit_integration.json` — updated spec with fromGate, timezone, waitlist
- `content-plan/mailing_tags.json` — added quiz-completed tag
- `research/form-subscription-implementation-plan.md` — master plan (updated)
- `.worklogs/2026-02-12-172355-infrastructure-readiness-stats.md` — prior infrastructure work

## Next Steps / Continuation Plan
1. Connect Chrome extension and run browser end-to-end test (take quiz → email gate → submit → verify results page + Kit data)
2. Set up Kit visual automation: tag "Quiz Completed" added → send results email with `{{ subscriber.quiz_result_url }}`
3. Implement blog freebie subscription (same pattern, no fromGate needed)
4. Implement course waitlist subscription (create 20 waitlist tags first)
5. Update admin dashboard infrastructure checks to reflect new code
