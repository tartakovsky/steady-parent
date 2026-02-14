# Rename cross-ref files to -vs-taxonomy and add category-course CTA check

**Date:** 2026-02-14 12:41
**Scope:** new_validation/validators/spec/{cta,mailing,linking}-vs-taxonomy.ts, index.ts

## Summary
Renamed all three cross-ref files from `*-cross-ref.ts` to `*-vs-taxonomy.ts` with matching function names. Added missing category-specific course URL check to CTA validator.

## Decisions Made

### File/function naming
- `ctas-cross-ref.ts` → `cta-vs-taxonomy.ts`, `validateCtaCrossRefs` → `validateCtaVsTaxonomy`
- `mailing-cross-ref.ts` → `mailing-vs-taxonomy.ts`, `validateMailingCrossRefs` → `validateMailingVsTaxonomy`
- `linking-cross-ref.ts` → `linking-vs-taxonomy.ts`, `validateLinkingCrossRefs` → `validateLinkingVsTaxonomy`
- **Why:** Names describe exactly what they check — this spec vs taxonomy

### Added category-specific course URL check (CTA)
- **Old:** Only checked `courseUrls.has(buttonUrl)` — any course URL passed
- **New:** Uses `courseByCat` map to verify buttonUrl matches the specific course for the article's category
- **Why:** A blog article under `staying-calm` shouldn't point to the `discipline` course. The linking vs taxonomy already had this check via `courseUrlByCat`; CTA validator was missing it.

## Key Files for Context
- `new_validation/validators/spec/cta-vs-taxonomy.ts` — CTA bidirectional checks
- `new_validation/validators/spec/mailing-vs-taxonomy.ts` — mailing bidirectional checks
- `new_validation/validators/spec/linking-vs-taxonomy.ts` — linking bidirectional checks
- `.worklogs/2026-02-14-123702-cta-mailing-crossref-extraction.md` — prior worklog
