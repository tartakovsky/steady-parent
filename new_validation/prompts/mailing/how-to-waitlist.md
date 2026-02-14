# How to Generate Per-Category Waitlist CTA Blocks

## What this produces

20 per-category waitlist CTA entries for `research/cta_catalog.json`. Each has:
- Course name, URL, and description copied from the matching course entry
- Full `cta_copy` block (eyebrow, title, body, buttonText) for the course waitlist page
- buttonText is always "Reserve your spot"

## Steps

### 1. Assemble the prompt

Read these files:
- `research/waitlist_cta_prompt.md` — the prompt template (has one placeholder: `{{CATEGORIES_WITH_COURSES}}`)
- `research/cta_catalog.json` — the CTA catalog (need course entries for context)
- `research/article_taxonomy.json` — the category list (need slugs + names)

Build the `{{CATEGORIES_WITH_COURSES}}` block by pairing each category with its course entry:

```
- **Aggression** (`aggression`): course="Beyond Hitting", url="/course/beyond-hitting/", what_it_is="Audio lessons and illustrated guides for responding to hitting, biting, and physical aggression at every age."
- **Anxiety** (`anxiety`): course="Childhood Anxiety", url="/course/childhood-anxiety/", what_it_is="Audio lessons and illustrated guides for helping your child manage worry, fear, and avoidance behaviors."
...one line per category...
```

The course entries in `cta_catalog.json` have `id: "course-{slug}"` — match by slug.

### 2. Run a background agent

Launch a Task agent (subagent_type: `general-purpose`) with the assembled prompt. The agent returns raw JSON — an array of 20 `WaitlistCtaDefinition` objects, each with a `cta_copy` block.

### 3. Validate the output

Parse the JSON response. Validate each entry:
- `id` matches `waitlist-{slug}` for one of the 20 category slugs
- `type` is `"waitlist"`
- `name` matches the course entry's name exactly
- `url` matches the course entry's URL exactly (must start with `/course/`)
- `what_it_is` matches the course entry's what_it_is exactly
- `cta_copy` exists with all 4 fields: `eyebrow`, `title`, `body`, `buttonText`
- `cta_copy.buttonText` is exactly "Reserve your spot"
- `can_promise` and `cant_promise` are both empty arrays
- No entry mentions: video content, live coaching, 1-on-1 access, guaranteed response times
- No exclamation marks anywhere
- Word counts: eyebrow 2-5, title 3-12, body 8-35

### 4. Merge into cta_catalog.json

Add the 20 waitlist entries to `research/cta_catalog.json`. They go after the existing course + freebie pairs. Keep all existing entries unchanged.

### 5. Verify

Run the plan validation to confirm the merged catalog passes the schema:
```bash
npx tsx content-spec/src/validate-plans.ts
```

Check the admin at `/admin/spec` → CTAs tab — the Waitlist column should now show eyebrow, title, body, and button text for all 20 categories.

## File references

| File | Role |
|------|------|
| `research/waitlist_cta_prompt.md` | Prompt template with output schema |
| `research/cta_catalog.json` | Target file — merge output here |
| `research/article_taxonomy.json` | Category slugs + names |
| `content-spec/src/schemas/cta-catalog.ts` | Zod schema for validation |
