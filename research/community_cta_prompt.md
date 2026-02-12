# Community CTA Generator

You are writing category-specific community CTA blocks for the Steady Parent Community (a Skool group).

The community is the SAME for every category — one private parent group at `https://www.skool.com/steady-parent`. But the CTA messaging changes per category to speak directly to what parents reading about that topic care about.

## Community facts

- The founders are active and present daily
- It's a private, supportive group of parents going through the same stuff
- Do NOT promise any of the following: weekly expert Q&As, live coaching calls, video content, 1-on-1 access, guaranteed response times

## What you're writing

For each of the 20 categories, produce a CTA block with these fields:

- **`cta_copy.eyebrow`**: 2–5 words. A recognizable parenting moment the reader is IN right now — "When they...", "That moment after...", "After the third time tonight..." — situational, not abstract
- **`cta_copy.title`**: 5–12 words. Speaks TO the reader about what they get from joining: dialogue, being heard, sharing the load, finding people in the exact same situation. Must be clear this is about COMMUNITY (talking, sharing, being understood) — not a resource page, not a testimonial. The reader must see themselves IN the title, not observe other parents FROM THE OUTSIDE
- **`cta_copy.body`**: 8–25 words. Shows the specific value of this community FOR THIS CATEGORY — what conversations are happening, what the reader will find when they join. FOLLOWED BY ". We are there with you daily too." — that last sentence is fixed and mandatory, always appended

The buttonText is always "Join the community" — do not change it.

## Tone

- Self-deprecating, wry, rational — not warm mommy-blogger energy, not salesy
- Direct — respect the reader's time
- No platitudes ("you're not alone", "it's hard", "you've got this", "no judgment")
- No exclamation marks

## Critical rules

1. The TITLE must speak TO the reader, not ABOUT other parents. Never start with "Parents who..." — the reader is not observing a group from outside, they're being invited IN
2. The TITLE must make it clear this is a COMMUNITY — people talking, sharing, being heard. Not a resource, not a course, not tips
3. The BODY shows what's happening IN the community that's relevant to THIS category — active conversations, shared experiences, the specific burden being shared
4. Every field must be specific to the category topic — no generic "parenting is hard" copy that could apply to any category

## NOT THIS / THIS

### Discipline — NOT THIS:
```
eyebrow: "Real parents, real limits"
title: "Holding boundaries without yelling is a team effort"
body: "A private group where parents share what works when limits get tested every single day. We are there with you daily too."
```
Why it fails: Eyebrow is a label, not a moment. Title is an abstract statement. Body describes the group instead of showing its value to me.

### Discipline — NOT THIS EITHER:
```
eyebrow: "When they push back again"
title: "Parents who stopped the hitting without losing their minds"
body: "The strategies that actually worked when someone else's kid got bitten. We are there with you daily too."
```
Why it fails: Title talks ABOUT other parents as a third party. I'm observing them, not joining them. It reads like a testimonial, not a community invitation. Zero clarity on what I GET from joining.

### Discipline — THIS:
```
eyebrow: "When they push back again"
title: "Talk it through with parents setting the same limits"
body: "The daily back-and-forth on what's too strict, what's too soft, and what actually held up by Friday. We are there with you daily too."
```
Why it works: Eyebrow puts me in the moment. Title tells me what I'll DO (talk it through) with people in MY situation (setting the same limits). Body shows what's happening in the group (daily conversations about real dilemmas). It's unmistakably a community.

### Anxiety — NOT THIS:
```
eyebrow: "When worry won't let go"
title: "Parents who know the difference between a phase and a pattern"
body: "Real strategies from parents whose kids also couldn't sleep, wouldn't separate, or froze at drop-off. We are there with you daily too."
```
Why it fails: Title describes other parents' knowledge — not what I get. "Real strategies" makes it sound like a resource, not a conversation.

### Anxiety — THIS:
```
eyebrow: "When worry won't let go"
title: "Share the weight with parents in the same spiral"
body: "The conversation about whether it's a phase, when to worry, and what actually helped at drop-off this morning. We are there with you daily too."
```
Why it works: Title says what I DO (share the weight) and who's there (parents in the same spiral — MY spiral). Body shows the live conversation. It's a community, not a tip sheet.

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

Return a JSON array of 20 objects (one per category), ready to be inserted into `content-plan/cta_catalog.json`. No markdown fences, no commentary — just the raw JSON array.
