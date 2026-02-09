# How to Generate Per-Category Community CTA Pitches

## What this produces

20 per-category community CTA entries for `research/cta_catalog.json`. Each has a unique `what_it_is` pitch tailored to the category topic while promoting the same Skool community.

## Steps

### 1. Assemble the prompt

Read these two files:
- `research/community_cta_prompt.md` — the prompt template (has one placeholder: `{{CATEGORIES_WITH_COURSES}}`)
- `research/cta_catalog.json` — the CTA catalog (need course entries for context)
- `research/article_taxonomy.json` — the category list (need slugs + names)

Build the `{{CATEGORIES_WITH_COURSES}}` block by pairing each category with its course description:

```
- **Aggression** (`aggression`): Audio lessons and illustrated guides for responding to hitting, biting, and physical aggression at every age.
- **Anxiety** (`anxiety`): Audio lessons and illustrated guides for helping your child manage worry, fear, and avoidance behaviors.
...one line per category...
```

The course entries in `cta_catalog.json` have `id: "course-{slug}"` — match by slug.

### 2. Run a background agent

Launch a Task agent (subagent_type: `general-purpose`) with the assembled prompt. The agent returns raw JSON — an array of 20 `CtaDefinition` objects.

### 3. Validate the output

Parse the JSON response. Validate each entry:
- `id` matches `community-{slug}` for one of the 20 category slugs
- `type` is `"community"`
- `name` is `"Steady Parent Community"`
- `url` is `"https://www.skool.com/steady-parent"`
- `what_it_is` is a non-empty string
- `can_promise` and `cant_promise` are both empty arrays
- No entry mentions: weekly expert Q&As, live coaching calls, video content, 1-on-1 access, guaranteed response times

You can also validate programmatically:
```bash
npx tsx -e "
  import { CtaCatalogSchema } from './content-spec/src/schemas/index';
  const entries = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));
  CtaCatalogSchema.parse(entries);
  console.log('Valid:', entries.length, 'entries');
" < generated_output.json
```

### 4. Merge into cta_catalog.json

Insert the 20 entries into `research/cta_catalog.json` immediately after the global community entry (id: `"community"`), before the first course entry. Sort by `id` alphabetically.

The catalog order should be:
1. Global community entry (`id: "community"`)
2. Per-category community entries (`id: "community-aggression"` through `id: "community-transitions"`)
3. Course + freebie pairs (`id: "course-aggression"`, `id: "freebie-aggression"`, ...)

### 5. Verify

Run the plan validation to confirm the merged catalog passes the schema:
```bash
npx tsx content-spec/src/validate-plans.ts
```

Check the admin at `/admin/spec` → CTAs tab — the "Community Pitch" column should now show pitches for all 20 categories.

## File references

| File | Role |
|------|------|
| `research/community_cta_prompt.md` | Prompt template with output schema |
| `research/cta_catalog.json` | Target file — merge output here |
| `research/article_taxonomy.json` | Category slugs + names |
| `content-spec/src/schemas/cta-catalog.ts` | Zod schema for validation |
