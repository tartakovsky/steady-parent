# Add "waitlist" CTA type — schema, validation, prompt, admin UI

**Date:** 2026-02-10 11:07
**Scope:** `content-spec/src/schemas/cta-catalog.ts`, `content-spec/src/validator/cta.ts`, `content-spec/src/index.ts`, `landing/src/app/admin/spec/page.tsx`, `research/waitlist_cta_prompt.md`, `research/how-to-generate-waitlist-ctas.md`

## Summary
Added a new "waitlist" CTA type for course landing pages. Each of the 20 categories will get a waitlist CTA with "Reserve your spot" copy, shown on the course page while the course isn't yet available. This commit adds the type, validation rules, generation prompt template, generation instructions, and admin UI — but does NOT generate the actual 20 entries yet.

## Context & Problem
Course CTAs on blog posts link to `/course/[slug]/` pages. Since no courses exist yet, those landing pages need a "Reserve your spot" email capture CTA. The copy should be category-specific (like community CTAs), selling the specific course. We needed:
1. A new CTA type in the schema
2. Validation rules matching existing patterns (word counts, forbidden terms, etc.)
3. A prompt template for generating the 20 entries
4. Admin UI to view rules and track generation status

## Decisions Made

### Store waitlist entries in the same cta_catalog.json
- **Chose:** Add `type: "waitlist"` entries to the existing catalog alongside community/course/freebie
- **Why:** Consistent with existing pattern, single source of truth, existing validator infrastructure handles it
- **Alternatives considered:**
  - Separate file — rejected because it fragments the catalog and requires separate validation

### Missing waitlist entries are warnings, not errors
- **Chose:** Coverage check for waitlist uses `warnings.push()` not `errors.push()`
- **Why:** Waitlist entries don't exist yet; making them errors would block validation for the entire catalog. Once generated, they'll be validated with full rigor.

### Waitlist CTA reuses course metadata exactly
- **Chose:** `name`, `url`, and `what_it_is` must match the corresponding course entry exactly
- **Why:** These are the same product — the waitlist is just the pre-launch version of the course CTA. Keeps data consistent.

### Prompt modeled on community CTA pattern
- **Chose:** Same generation pattern: prompt template with `{{CATEGORIES_WITH_COURSES}}` placeholder, instructions doc, background agent
- **Why:** Proven pattern from community CTA generation. Same validation, same merge workflow.

## Architectural Notes
- `CtaTypeEnum` now includes 5 types: course, community, freebie, guide, waitlist
- Waitlist validation in `cta.ts` follows the same structure as community/course/freebie sections
- `WAITLIST_BUTTON_TEXT = "Reserve your spot"` is the canonical constant, re-exported from content-spec index
- Admin spec page extracts waitlist entries into `waitlistBySlug` map, shows "Not generated" in orange when missing
- The prompt template enforces: no video promises, no exclamation marks, fixed buttonText, course-specific copy

## Information Sources
- Existing community CTA generation pattern: `research/community_cta_prompt.md`, `research/how-to-generate-community-ctas.md`
- CTA validator: `content-spec/src/validator/cta.ts`
- CTA catalog schema: `content-spec/src/schemas/cta-catalog.ts`
- Admin spec page: `landing/src/app/admin/spec/page.tsx`

## Open Questions / Future Considerations
- Need to actually generate the 20 waitlist entries using the prompt (next step)
- Course landing pages at `/course/[slug]/` don't exist in Next.js yet — will need routes + components
- Waitlist email capture will need ConvertKit integration (form + tag)

## Key Files for Context
- `content-spec/src/schemas/cta-catalog.ts` — CTA type enum (now includes "waitlist")
- `content-spec/src/validator/cta.ts` — all CTA validation rules including waitlist
- `research/waitlist_cta_prompt.md` — prompt template for generating waitlist CTAs
- `research/how-to-generate-waitlist-ctas.md` — step-by-step generation instructions
- `research/cta_catalog.json` — the catalog where entries will be added
- `landing/src/app/admin/spec/page.tsx` — admin spec browser showing waitlist rules + table column
- `.worklogs/2026-02-09-190846-quiz-cta-validation.md` — prior worklog for quiz CTA validation (same session)

## Next Steps / Continuation Plan
1. Generate 20 waitlist CTA entries: follow `research/how-to-generate-waitlist-ctas.md`
2. Merge entries into `research/cta_catalog.json`
3. Run `npx tsx content-spec/src/validate-plans.ts` — should show 0 warnings
4. Verify on `/admin/spec?tab=ctas` — waitlist column should show copy for all 20 categories
