# How to Generate Per-Category Community CTA Blocks

## What this produces

20 per-category community CTA entries for `research/cta_catalog.json`. Each has:
- A unique `what_it_is` pitch tailored to the category topic
- Full `cta_copy` block (eyebrow, title, body, buttonText) for the CommunityCTA component
- Founder presence mentioned in the body copy

## Steps

### 1. Assemble the prompt

Read these files:
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

Launch a Task agent (subagent_type: `general-purpose`) with the assembled prompt. The agent returns raw JSON — an array of 20 `CtaDefinition` objects, each with a `cta_copy` block.

### 3. Validate the output

Parse the JSON response. Validate each entry:
- `id` matches `community-{slug}` for one of the 20 category slugs
- `type` is `"community"`
- `name` is `"Steady Parent Community"`
- `url` is `"https://www.skool.com/steady-parent-1727"`
- `what_it_is` is a non-empty string, 15-30 words
- `cta_copy` exists with all 4 fields: `eyebrow`, `title`, `body`, `buttonText`
- `cta_copy.body` mentions founders being active/present
- `can_promise` and `cant_promise` are both empty arrays
- No entry mentions: weekly expert Q&As, live coaching calls, video content, 1-on-1 access, guaranteed response times
- No exclamation marks anywhere

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

Replace the existing 20 per-category community entries in `research/cta_catalog.json`. Keep:
1. Global community entry (`id: "community"`) — unchanged
2. Per-category community entries (`id: "community-aggression"` through `id: "community-transitions"`) — replaced with new entries
3. Course + freebie pairs (`id: "course-aggression"`, `id: "freebie-aggression"`, ...) — unchanged

### 5. Verify

Run the plan validation to confirm the merged catalog passes the schema:
```bash
npx tsx content-spec/src/validate-plans.ts
```

Check the admin at `/admin/spec` → CTAs tab — the Community Pitch column should now show eyebrow, title, body, and button text for all 20 categories.

## File references

| File | Role |
|------|------|
| `research/community_cta_prompt.md` | Prompt template with output schema |
| `research/cta_catalog.json` | Target file — merge output here |
| `research/article_taxonomy.json` | Category slugs + names |
| `content-spec/src/schemas/cta-catalog.ts` | Zod schema for validation |
