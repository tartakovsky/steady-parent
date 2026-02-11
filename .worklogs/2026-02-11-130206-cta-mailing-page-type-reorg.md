# Reorganize CTA + Mailing Forms by Page Type

**Date:** 2026-02-11 13:02
**Scope:** landing/src/app/admin/spec/page.tsx, landing/src/app/admin/ctas/page.tsx, landing/src/app/api/admin/mailing/route.ts, landing/src/app/admin/mailing/page.tsx

## Summary
Reorganized admin dashboard so CTAs show only community + course (link-out cards) and Mailing Forms show only freebie + waitlist + quiz gates (email capture forms). Both are now organized by page type. Added coverage tables to the Mailing Forms validation page.

## Context & Problem
After the initial restructuring (.worklogs/2026-02-11-123722-admin-dashboard-restructure.md), freebie and waitlist entries were still showing in the CTA spec tab and CTA validation page. These are mailing forms (email capture), not CTAs (link-out). The distinction:
- **CTA** = card that links to a URL, no email collection: community, course
- **Mailing Form** = card that captures email, submits to API, tags subscriber: freebie, waitlist, quiz email gate

User also wanted both pages organized "by page type" (blog articles, course pages, quiz pages) with full data for each entry.

## Decisions Made

### CTA validation page filters out freebie/waitlist
- **Chose:** Client-side regex filter on error/warning messages (`/freebie|waitlist/i`)
- **Why:** CTA validator error messages always contain the type name as prefix. Simpler than splitting the validator, sufficient for admin dashboard.

### CtaCopyCell prop types with `| undefined`
- **Chose:** `{ copy?: CtaCopy | undefined; url?: string | undefined }` instead of `{ copy?: CtaCopy; url?: string }`
- **Why:** `exactOptionalPropertyTypes` is enabled — passing `CtaCopy | undefined` (from optional chaining) to `copy?: CtaCopy` is a type error

### Mailing API returns coverage data as serialized Sets
- **Chose:** Build Set objects server-side for dedup, spread to arrays in response
- **Why:** JSON doesn't serialize Sets; client rebuilds Sets for O(1) lookups

### Quiz taxonomy uses `.entries` not `.quizzes`
- **Chose:** Fixed `quizTaxonomy.entries.map(...)` instead of `.quizzes`
- **Why:** QuizTaxonomySchema has `entries` field, not `quizzes`

## Architectural Notes
- CTA validation page now shows 2-column coverage matrix (community, course) instead of 4
- Mailing Forms validation page has 3 new coverage tables before the integration checklists: Blog Freebie (20 categories), Course Waitlist (20 categories, mostly "Not configured"), Quiz Gate (24 quizzes)
- The mailing API route now additionally loads `cta_catalog.json` to build coverage data

## Files Changed
- `landing/src/app/admin/spec/page.tsx` — CtaCopyCell prop types fix for exactOptionalPropertyTypes
- `landing/src/app/admin/ctas/page.tsx` — filtered to community + course only, client-side error filtering
- `landing/src/app/api/admin/mailing/route.ts` — added cta_catalog loading, coverage data in response, fixed quiz taxonomy field name
- `landing/src/app/admin/mailing/page.tsx` — added Blog Freebie / Course Waitlist / Quiz Gate coverage tables

## Verification
- `npx tsx content-spec/src/validate-plans.ts` — all pass
- `npm run typecheck -w content-spec` — clean
- `npm run typecheck -w landing` — clean

## Key Files for Context
- `landing/src/app/admin/spec/page.tsx` — spec browser (CtasTab, MailingFormsTab)
- `landing/src/app/admin/ctas/page.tsx` — CTA validation page (community + course only)
- `landing/src/app/api/admin/mailing/route.ts` — mailing validation API (integration + coverage)
- `landing/src/app/admin/mailing/page.tsx` — mailing validation page (coverage + checklists + tags)
- `.worklogs/2026-02-11-123722-admin-dashboard-restructure.md` — prior worklog (initial restructuring)
