# Restructure Admin Dashboard: Matching CTA + Mailing Forms Spec/Validation

**Date:** 2026-02-11 12:37
**Scope:** content-plan/, content-spec/, landing/src/app/admin/, landing/src/app/api/admin/, landing/src/components/admin/

## Summary
Restructured the admin dashboard so that CTAs and Mailing Forms each have matching SPEC (requirements) and VALIDATION (reality check) pages. Previously, CTA validation was embedded inside the CTA spec tab, mailing was a raw tag list, and Kit Tags validation only covered quiz integration. Now every domain has its own spec tab and validation page.

## Context & Problem
User could not compare spec vs reality because the admin dashboard had mismatched organization:
- SPEC group had tabs for CTAs (with embedded validation), Mailing Tags (just a raw list)
- VALIDATION group had Articles/Quizzes/Plan/Kit Tags — no CTA or mailing validation
- Blog freebie forms had zero visibility anywhere
- Kit Tags page only covered quiz email gate integration

## Decisions Made

### New sidebar structure
- **Chose:** Spec group: Taxonomy, Page Types, Cross-Linking, CTAs, Mailing Forms. Validation group: Articles, Quizzes, Plan vs Reality, CTAs, Mailing Forms.
- **Why:** Matching names in both groups makes it obvious what to compare

### Expanded data file (kit_quiz_integration.json → kit_integration.json)
- **Chose:** Add blogFreebieFlow alongside quizSubscribeFlow, change subscriberApiRoute to subscriberApiRoutes record
- **Why:** Blog freebie forms are a separate flow with different endpoints/tags but same validation pattern
- **Alternatives considered:**
  - Separate data file for blog freebies — rejected because quiz and freebie flows share config (localStorage key, custom fields, frontend checks)

### CTA validation moved to dedicated page
- **Chose:** New /admin/ctas page with coverage matrix + error/warning lists; spec tab shows spec only
- **Why:** Keeps spec (requirements) and validation (reality check) clearly separated

### Mailing Forms spec tab has 4 sections
- **Chose:** Blog Freebie Forms table, Quiz Email Gates table, Integration Requirements, Tag Registry
- **Why:** Groups by form type (blog vs quiz) then shows shared config and tag registry at bottom

## Architectural Notes
- `validateKitIntegrationOffline()` and `validateKitIntegration()` both take optional `categorySlugs` param to enable blog freebie checks
- `CodeChecks.apiRouteExists: boolean` changed to `apiRouteResults: Record<string, boolean>` for multiple routes
- New mailing validation API route (`/api/admin/mailing`) is the replacement for old `/api/admin/kit` — same DB queries and Kit API calls but expanded validation
- Build script now copies `kit_integration.json` and `article_taxonomy.json` to mdx-sources (article_taxonomy was missing before)

## Files Changed
- `content-plan/kit_quiz_integration.json` → DELETED (renamed)
- `content-plan/kit_integration.json` → CREATED (expanded spec)
- `content-plan/README.md` → updated reference
- `content-spec/src/schemas/kit-integration.ts` → added BlogFreebieFlowSchema, subscriberApiRoutes
- `content-spec/src/schemas/index.ts` → export BlogFreebieFlowSchema
- `content-spec/src/validator/kit-integration.ts` → blog freebie offline + live checks, new CodeChecks shape
- `content-spec/src/validate-plans.ts` → new filename + categorySlugs
- `landing/src/app/api/admin/spec/route.ts` → added formTagMappings + integrationSpec
- `landing/src/app/api/admin/ctas/route.ts` → CREATED (CTA validation API)
- `landing/src/app/admin/ctas/page.tsx` → CREATED (CTA validation page)
- `landing/src/app/api/admin/mailing/route.ts` → CREATED (replaces /api/admin/kit)
- `landing/src/app/admin/mailing/page.tsx` → CREATED (replaces /admin/kit)
- `landing/src/app/admin/spec/page.tsx` → removed CTA validation, replaced MailingTab with MailingFormsTab
- `landing/src/components/admin/admin-sidebar.tsx` → updated nav
- `landing/src/app/admin/kit/` → DELETED
- `landing/src/app/api/admin/kit/` → DELETED
- `landing/package.json` → build script updated

## Verification
- `npx tsx content-spec/src/validate-plans.ts` — all pass
- `npm run typecheck -w content-spec` — clean
- `npm run typecheck -w landing` — clean (after clearing .next type cache)

## Key Files for Context
- `content-plan/kit_integration.json` — expanded integration spec (quiz + blog freebie)
- `content-spec/src/validator/kit-integration.ts` — offline + full validation logic
- `content-spec/src/validate-plans.ts` — CLI validator
- `landing/src/app/admin/spec/page.tsx` — spec browser (all tabs)
- `landing/src/app/admin/ctas/page.tsx` — CTA validation page
- `landing/src/app/admin/mailing/page.tsx` — Mailing Forms validation page
- `landing/src/app/api/admin/mailing/route.ts` — mailing validation API
- `landing/src/components/admin/admin-sidebar.tsx` — sidebar navigation
- `.worklogs/2026-02-11-123722-admin-dashboard-restructure.md` — this worklog
