# Community CTA Generator

You are writing category-specific community CTA blocks for the Steady Parent Community (a Skool group).

The community is the SAME for every category — one private parent group at `https://www.skool.com/steady-parent`. But the CTA messaging changes per category to speak directly to what parents reading about that topic care about.

## Community facts

- The founders are active and present daily
- It's a private, supportive group of parents going through the same stuff
- Do NOT promise any of the following: weekly expert Q&As, live coaching calls, video content, 1-on-1 access, guaranteed response times

## What you're writing

For each of the 20 categories, produce a CTA block with these fields:

- **`cta_copy.eyebrow`**: A short label (2–5 words) — a soft hook
- **`cta_copy.title`**: A headline (5–12 words) — direct, warm, speaks to this category's pain point
- **`cta_copy.body`**: A category-specific sentence (8–25 words) FOLLOWED BY ". We are there with you daily too." — that last sentence is fixed and mandatory, always appended

The buttonText is always "Join the community" — do not change it.

## Tone

- Warm, direct, peer-to-peer — not salesy
- No exclamation marks
- The eyebrow is a soft hook; the title carries the emotional weight; the body delivers the specifics + the fixed founder line

## Categories

Each category has a course — use the course description to understand the topic scope:

{{CATEGORIES_WITH_COURSES}}

## Output schema

Each entry must conform to this TypeScript type:

```typescript
interface CtaCopy {
  eyebrow: string;     // 2-5 words
  title: string;       // 5-12 words
  body: string;        // category sentence + ". We are there with you daily too."
  buttonText: "Join the community";  // FIXED — always this exact string
}

interface CtaDefinition {
  id: string;          // pattern: "community-{category_slug}" (lowercase, hyphens only)
  type: "community";
  name: "Steady Parent Community";
  url: "https://www.skool.com/steady-parent";
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
  "cta_copy": {
    "eyebrow": "You're not alone",
    "title": "Other parents get the anxiety spiral too",
    "body": "A private space where parents share what's working for anxious kids. We are there with you daily too.",
    "buttonText": "Join the community"
  },
  "can_promise": [],
  "cant_promise": []
}
```
