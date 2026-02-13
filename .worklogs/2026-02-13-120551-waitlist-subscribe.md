# Implement course waitlist email subscription

**Date:** 2026-02-13 12:05
**Scope:** landing/src/lib/kit-config.ts, landing/src/app/api/waitlist-subscribe/route.ts, landing/src/components/course/course-hero.tsx, landing/src/app/(public)/course/[slug]/page.tsx

## Summary
Wired the 20 course waitlist forms to Kit. Created 21 Kit tags (20 per-category + 1 passive marker), a new API route, and connected the CourseHero form with email state, loading, success/error messages.

## Context & Problem
Course pages at `/course/{slug}/` had `CourseHero` with a no-op form (`onSubmit` just prevented default). Needed to subscribe users to Kit with the correct tags so per-course Kit automations can send confirmation emails.

## Decisions Made

### No shared trigger tag for re-triggering
- **Chose:** `waitlist-joined` is a passive marker only — no automation fires on it, no remove/re-add dance
- **Why:** Unlike quizzes (one `quiz-completed` tag triggers one sequence for all quizzes), each course has its own `waitlist-{category}` tag. Signing up for different courses adds different tags → different automations fire independently. Re-signup for the same course: tag already exists, already on the list — correct behavior.
- **Alternatives considered:**
  - Shared trigger tag with remove/re-add (like quiz-completed) — rejected, unnecessary since each course is a separate tag event

### 20 simple Kit automations (not one branching sequence)
- **Chose:** Each `waitlist-{category}` tag triggers its own automation sending a course-specific confirmation email
- **Why:** Simple to set up (one trigger + one email each), easy to maintain, no branching logic. Kit sequences don't re-fire for subscribers who already completed them, but tag-triggered single-email automations work cleanly.
- **Kit setup:** Manual — user creates 20 automations in Kit UI

### Category validation via freebieConfig keys
- **Chose:** Derive valid categories from `freebieConfig` keys at module load time (`VALID_CATEGORIES` Set)
- **Why:** Single source of truth — if a category is in freebieConfig, it has tags configured. No separate allowlist to keep in sync.

### freebieConfig includes waitlist-joined in every waitlist entry
- **Chose:** `"waitlist/aggression": ["lead", "waitlist-joined", "waitlist-aggression"]`
- **Why:** `waitlist-joined` is a passive segmentation tag to know "this person has joined at least one waitlist." Applied alongside `lead` and the specific waitlist tag.

## Architectural Notes
- API route pattern matches quiz-subscribe but simpler: no `fromGate`, no `resultUrl`, no tag re-triggering
- `subscribeWithTags` handles both new and existing subscribers (POST to create, PUT to update fields)
- CourseHero form: clears email on success, shows success message, stays usable (not disabled after success)
- `category` prop passed from course page: extracted from `waitlist.id.replace("waitlist-", "")`

## Verification Done
- `npm run typecheck -w landing` — clean
- curl POST to `/api/waitlist-subscribe` with `flar49+1@gmail.com` + `aggression` → success, tags: `lead`, `waitlist-joined`, `waitlist-aggression`
- Second signup same email + `anxiety` → success, new tag `waitlist-anxiety` added alongside existing tags
- Invalid category → 400 "Invalid category"

## Key Files for Context
- `landing/src/lib/kit-config.ts` — tag IDs + freebieConfig with 20 waitlist entries
- `landing/src/app/api/waitlist-subscribe/route.ts` — new API route
- `landing/src/components/course/course-hero.tsx` — wired form with email state + API call
- `landing/src/app/(public)/course/[slug]/page.tsx` — passes `category` prop
- `landing/src/lib/kit-api.ts` — `subscribeWithTags` helper (unchanged)
- `content-plan/mailing_form_catalog.json` — waitlist definitions (20 entries)
- `.worklogs/2026-02-13-120137-quiz-gate-email-only.md` — prior quiz gate change

## Next Steps / Continuation Plan
1. Set up 20 Kit automations in Kit UI (manual): each triggered by `waitlist-{category}` tag → sends course-specific confirmation email
2. Test in browser with Chrome extension (was disconnected during this session — API tested via curl)
3. Check admin dashboard `/admin/mailing` — waitlist checks should go green
4. Consider whether CourseHero should pre-fill email from localStorage if subscriber email exists
