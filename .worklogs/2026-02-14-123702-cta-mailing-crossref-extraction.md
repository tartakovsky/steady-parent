# Extract cross-ref validators and consolidate shared constants

**Date:** 2026-02-14 12:37
**Scope:** new_validation/validators/spec/{shared,ctas,mailing,linking,ctas-cross-ref,mailing-cross-ref,index}.ts

## Summary
Extracted cross-reference validators from ctas.ts and mailing.ts into separate files (matching the linking/linking-cross-ref pattern). Fixed quiz catalog completeness bugs in both. Consolidated COMMUNITY_URL and COURSE_URL_REGEX into shared.ts.

## Context & Problem
Review of CTA and mailing validators against lessons from linking validator work revealed:
1. Both CTA and mailing cross-ref completeness checks would false-positive on the `""` quiz catalog entry (added to taxonomy in prior session)
2. COMMUNITY_URL was defined in 3 places (ctas.ts, linking.ts, shared.ts now)
3. Course URL regex was duplicated between ctas.ts and linking.ts
4. Cross-ref functions lived inline in schema files, unlike linking which had already been split

## Decisions Made

### Separate cross-ref files for CTA and mailing
- **Chose:** `ctas-cross-ref.ts` and `mailing-cross-ref.ts` (same pattern as `linking-cross-ref.ts`)
- **Why:** Consistent architecture — schema files define Zod shapes and structural rules; cross-ref files handle taxonomy-dependent validation

### Fix quiz catalog completeness
- **Chose:** Skip entries where `"pageType" in quiz && quiz.pageType === "catalog"` in both CTA and mailing cross-ref
- **Why:** Catalog pages don't have CTAs or mailing forms — they're listing pages

### Add waitlist category cross-ref
- **Chose:** Check `spec.course[slug].params.category` matches `taxonomy.course[slug].categorySlug`
- **Why:** The existing check only validated that params.category was a valid category slug, not that it matched the specific course's category in taxonomy

### Consolidate shared constants
- **Chose:** COMMUNITY_URL and COURSE_URL_REGEX in shared.ts, imported everywhere
- **Why:** Single source of truth, no drift risk

## Key Files for Context
- `new_validation/validators/spec/shared.ts` — shared constants, schemas, helpers
- `new_validation/validators/spec/ctas.ts` — CTA Zod schemas (cross-ref removed)
- `new_validation/validators/spec/ctas-cross-ref.ts` — NEW: CTA cross-ref validator
- `new_validation/validators/spec/mailing.ts` — mailing Zod schemas (cross-ref removed)
- `new_validation/validators/spec/mailing-cross-ref.ts` — NEW: mailing cross-ref validator
- `new_validation/validators/spec/linking.ts` — linking schemas (now imports from shared)
- `new_validation/validators/spec/index.ts` — barrel exports (updated)
- `.worklogs/2026-02-14-121653-linking-validator-checks.md` — prior worklog

## Next Steps / Continuation Plan
1. The 40 CTA/mailing cross-ref issues are pre-existing: pillar articles keyed as `{category-slug}` in CTA/mailing specs but `guide` in taxonomy. Need to update CTA and mailing migration scripts to remap pillar keys.
2. The 15 linking structural issues are duplicate link URLs in source article_link_plan.json — need investigation.
