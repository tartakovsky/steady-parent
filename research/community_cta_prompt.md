# Community CTA Pitch Generator

You are writing category-specific community pitches for the Steady Parent Community (a Skool group).

The community is the SAME for every category — one private parent group at `https://www.skool.com/steady-parent`. But the pitch changes per category to speak directly to what parents reading about that topic care about.

## What you're writing

For each category, write a single `what_it_is` sentence — a category-specific hook that makes a parent reading about that topic want to join the community.

## Constraints

- One sentence per category, 15–30 words
- Speak to the parent's lived experience in that category
- Focus on what they'll FIND in the community (other parents going through it, real conversations, what's actually working)
- Do NOT promise any of the following: weekly expert Q&As, live coaching calls, video content, 1-on-1 access, guaranteed response times
- Do NOT mention the founders, coaching, experts, or any structured programming
- The tone is warm, direct, peer-to-peer — not salesy
- No exclamation marks

## Categories

Each category has a course — use the course description to understand the topic scope:

{{CATEGORIES_WITH_COURSES}}

## Output schema

Each entry must conform to this TypeScript type (validated with Zod at `content-spec/src/schemas/cta-catalog.ts`):

```typescript
interface CtaDefinition {
  id: string;       // pattern: "community-{category_slug}" (lowercase, hyphens only)
  type: "community";
  name: "Steady Parent Community";
  url: "https://www.skool.com/steady-parent";
  what_it_is: string;  // YOUR pitch — one sentence, 15-30 words
  can_promise: [];     // always empty for per-category community entries
  cant_promise: [];    // always empty for per-category community entries
}
```

## Output format

Return a JSON array of 20 objects (one per category), ready to be inserted into `research/cta_catalog.json`. No markdown fences, no commentary — just the raw JSON array.

Example of ONE entry (do not copy this pitch):

```json
{
  "id": "community-anxiety",
  "type": "community",
  "name": "Steady Parent Community",
  "url": "https://www.skool.com/steady-parent",
  "what_it_is": "See how other parents are navigating worry and avoidance — and what's actually helping their kids feel braver.",
  "can_promise": [],
  "cant_promise": []
}
```
