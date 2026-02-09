# Cross-Linking tab + taxonomy fix: separate concerns

**Date:** 2026-02-09 12:48
**Scope:** content-spec/src/validator/cross-links.ts (new), landing/src/app/admin/spec/page.tsx, landing/src/app/api/admin/spec/route.ts, content-spec/src/validate-plans.ts

## Summary
Fixed the Taxonomy tab to only show what exists (articles and quizzes separately, no cross-references). Added a new Cross-Linking tab that shows how things connect: link plan stats, link type distribution, CTA distribution, quiz→category connections, and referential integrity validation. Added cross-link validator to content-spec.

## Context & Problem
The previous implementation incorrectly mixed quizzes into article category rows on the Taxonomy tab (showing quiz count badges and quiz rows inside categories). User correctly pointed out: "Taxonomy does not say anything about crosslinks, it just lists what we have." Also identified that cross-linking had no spec page representation and no referential integrity validation.

## Decisions Made

### Taxonomy = what exists, Cross-Linking = how things connect
- **Chose:** Strict separation. Taxonomy tab shows articles by category + quizzes table (no connectsTo). Cross-Linking tab shows link plan stats + quiz connections + validation.
- **Why:** User requirement — taxonomy is an inventory, not a relationship map.

### Cross-link validator with URL normalization
- **Chose:** Strip trailing slashes before URL comparison
- **Why:** Link plan uses trailing slashes (`/quiz/calm-down-toolkit/`), quiz taxonomy doesn't (`/quiz/calm-down-toolkit`). Without normalization, 258+ false errors.

### Server-side aggregation for link plan
- **Chose:** Compute stats on API side, return aggregates (not raw 245 entries)
- **Why:** `article_link_plan.json` is 15K lines. Sending it all to the browser is wasteful.

### Four cross-link validation checks
1. Quiz `connectsTo` refs valid category slugs
2. Every article in taxonomy has a link plan entry (warning)
3. Every link plan entry has a known article URL (error)
4. All link targets reference known article or quiz URLs (error)

## Key Files
- `content-spec/src/validator/cross-links.ts` — NEW: `computeCrossLinkStats()` + `validateCrossLinks()`
- `content-spec/src/validate-plans.ts` — added cross-link validation as cross-file check
- `landing/src/app/api/admin/spec/route.ts` — loads link plan, computes stats + validation
- `landing/src/app/admin/spec/page.tsx` — fixed Taxonomy tab, added Cross-Linking tab
- `research/article_link_plan.json` — 245 articles × {links, ctas} (unchanged, just now validated)

## Next Steps
- The link plan Zod schema (`LinkPlanSchema`) only does structural validation, no cross-references. The new `validateCrossLinks()` handles cross-refs at the validator level.
- `research/category_ctas.json` is still not deleted (superseded by `cta_catalog.json`)
