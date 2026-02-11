# Show quiz gate previewCta copy in admin pages

**Date:** 2026-02-11 21:54
**Scope:** landing/src/app/api/admin/spec/route.ts, landing/src/app/admin/spec/page.tsx, landing/src/app/api/admin/mailing/route.ts, content-plan/plan-improve-cta-and-mailing-copy-prompts.md

## Summary
Added quiz email gate copy display to both admin pages. The spec page's mailing tab now shows a Copy column for quiz gates (previewCta from quiz JSON files). The mailing validation page now validates quiz gate copy against the previewCta instead of showing "missing" errors.

## Context & Problem
Quiz email gate forms (`quiz-gate-{slug}`) have their copy (`previewCta`) stored in quiz JSON files (`landing/src/lib/quiz/*.json` → `meta.previewCta`), not in `mailing_form_catalog.json`. The admin spec page had no Copy column for quiz gates (while freebie and waitlist tables did). The mailing validation page showed 24 "missing cta_copy" errors for all quiz gates.

## Decisions Made

### Import quiz registry in API routes instead of reading files from disk
- **Chose:** `import { quizzes } from "@/lib/quiz"` in both API routes
- **Why:** Works in both dev and production (data bundled via static imports), simpler than fs.readFile with path handling
- **Alternatives considered:**
  - Read quiz JSON files from disk with fs.readFile — rejected because standalone production build doesn't have source files on disk

### Patch byEntry after validator runs (mailing route)
- **Chose:** Run `validateMailingFormCatalog()` first, then overwrite quiz-gate checks with previewCta validation results
- **Why:** Avoids modifying the shared validator (which would need quiz JSON data as a new parameter). The patching is localized to the admin API route.

## Key Files for Context
- `landing/src/app/api/admin/spec/route.ts` — spec API route, now returns `quizPreviewCtas` map
- `landing/src/app/admin/spec/page.tsx` — spec page, quiz gate table now has Copy column via `CtaCopyCell`
- `landing/src/app/api/admin/mailing/route.ts` — mailing API route, patches byEntry with previewCta validation
- `content-plan/plan-improve-cta-and-mailing-copy-prompts.md` — plan for improving CTA/mailing copy generation prompts
- `.worklogs/2026-02-11-211017-admin-validation-overhaul.md` — prior worklog for the CTA/mailing split

## Next Steps / Continuation Plan
1. Implement the copy generation plan in `content-plan/plan-improve-cta-and-mailing-copy-prompts.md`
