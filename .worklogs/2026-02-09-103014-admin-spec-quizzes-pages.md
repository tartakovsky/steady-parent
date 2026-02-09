# Add Spec browser and Quizzes page to admin dashboard

**Date:** 2026-02-09 10:30
**Scope:** landing/src/app/admin/spec/, landing/src/app/admin/quizzes/, landing/src/app/api/admin/spec/, landing/src/app/api/admin/quizzes/, landing/src/components/admin/admin-sidebar.tsx

## Summary
Added two new admin pages: a Spec browser (tabbed view of all plan data files) and a Quizzes inventory page (24 planned quizzes with deployment status). Also added Spec and Quizzes nav items to the admin sidebar.

## Context & Problem
The admin dashboard showed deployed article state but not the underlying plan/requirements. Users couldn't verify that taxonomy, page types, CTA definitions, or mailing tag specs were correct without reading JSON files directly. Additionally, quizzes (3 deployed / 24 planned) had no admin presence at all.

## Decisions Made

### Read JSON files via API routes (not DB)
- **Chose:** API routes that read research/*.json files, validate with content-spec Zod schemas, return as JSON
- **Why:** Plan data is static, the JSON files are the source of truth. Adding DB tables would duplicate data the sync engine doesn't need to track.

### Single /api/admin/spec endpoint returning all 4 data sets
- **Chose:** One endpoint returning `{ taxonomy, pageTypes, ctaCatalog, mailingTags }`
- **Why:** Avoids 4 separate fetches on page load. The data is small (~50KB total).

### Hardcoded deployed quiz slugs
- **Chose:** `DEPLOYED_SLUGS` set in the quizzes API route rather than dynamically reading the quiz registry
- **Why:** The quiz registry is a TypeScript file with imports, not parseable at runtime from an API route. 3 slugs is trivial to maintain.

## Key Files for Context
- `landing/src/app/admin/spec/page.tsx` — Spec browser with 4 tabs (Taxonomy, Page Types, CTAs, Mailing)
- `landing/src/app/admin/quizzes/page.tsx` — Quiz inventory with filter tabs
- `landing/src/app/api/admin/spec/route.ts` — Reads + validates 4 plan JSON files
- `landing/src/app/api/admin/quizzes/route.ts` — Reads quiz_taxonomy.json, enriches with deployment status
- `landing/src/components/admin/admin-sidebar.tsx` — Updated nav with Spec and Quizzes items
