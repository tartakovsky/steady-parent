# Community CTA Generator

You are writing category-specific community CTA blocks for the Steady Parent Community (a Skool group).

The community is the SAME for every category — one private parent group at `https://www.skool.com/steady-parent`. But the CTA messaging changes per category to speak directly to what parents reading about that topic care about.

## Community facts

- **Founders are active and present daily** — they respond to posts and share their own experience
- It's a private, supportive group of parents going through the same stuff
- Do NOT promise any of the following: weekly expert Q&As, live coaching calls, video content, 1-on-1 access, guaranteed response times

## What you're writing

For each of the 20 categories, produce a complete CTA block with these fields:

- **`what_it_is`**: A category-specific one-sentence description (15–30 words) of what a parent will find in this community when they're reading about this topic
- **`cta_copy.eyebrow`**: A short label (2–5 words) — like "Talk to real parents" or "You're not alone in this"
- **`cta_copy.title`**: A headline (5–12 words) — direct, warm, speaks to this category's pain point
- **`cta_copy.body`**: One sentence (15–30 words) — what they'll get by joining, specific to this topic. Mention that founders are active and present.
- **`cta_copy.buttonText`**: Button label (2–5 words) — like "Join the community" or "Come talk to us"

## Tone

- Warm, direct, peer-to-peer — not salesy
- No exclamation marks
- The eyebrow is a soft hook; the title carries the emotional weight; the body delivers the specifics
- Vary the buttonText across categories — don't use the same button label for all 20

## Categories

Each category has a course — use the course description to understand the topic scope:

{{CATEGORIES_WITH_COURSES}}

## Output schema

Each entry must conform to this TypeScript type (validated with Zod at `content-spec/src/schemas/cta-catalog.ts`):

```typescript
interface CtaCopy {
  eyebrow: string;   // 2-5 words
  title: string;     // 5-12 words
  body: string;      // 15-30 words, mention founder presence
  buttonText: string; // 2-5 words
}

interface CtaDefinition {
  id: string;       // pattern: "community-{category_slug}" (lowercase, hyphens only)
  type: "community";
  name: "Steady Parent Community";
  url: "https://www.skool.com/steady-parent";
  what_it_is: string;  // one sentence, 15-30 words
  cta_copy: CtaCopy;
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
  "cta_copy": {
    "eyebrow": "You're not alone in this",
    "title": "Other parents get the anxiety spiral too",
    "body": "A private space where parents share what's working for anxious kids — founders are in there daily, sharing and responding.",
    "buttonText": "Join the conversation"
  },
  "can_promise": [],
  "cant_promise": []
}
```
