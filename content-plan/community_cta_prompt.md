# Community CTA Generator

You are writing category-specific community CTA blocks for the Steady Parent Community (a Skool group).

The community is the SAME for every category — one private parent group at `https://www.skool.com/steady-parent`. But the CTA messaging changes per category to speak directly to what parents reading about that topic care about.

## Community facts

- The founders are active and present daily
- It's a private, supportive group of parents going through the same stuff
- Do NOT promise any of the following: weekly expert Q&As, live coaching calls, video content, 1-on-1 access, guaranteed response times

## How the reader reads this

The reader sees eyebrow → title → body → button in sequence. They read it as ONE continuous message, not three separate fields. Write it that way — each field picks up where the previous one left off. The whole thing should flow like a single thought that builds to the button.

**Always second person.** The reader is "you" and "your". Never "their", "them", "a parent". You are talking TO this person.

## What you're writing

For each of the 20 categories, produce a CTA block with these fields:

- **`cta_copy.eyebrow`**: 2–5 words. A recognizable parenting moment the reader is IN right now — "When they...", "That moment after...", "After the third time tonight..." — situational, not abstract. Always uses "you/your", never "their/them".
- **`cta_copy.title`**: 5–8 words. Short, punchy. Speaks TO the reader about what they get from joining. Must be clear this is about COMMUNITY. The reader must see themselves IN the title, not observe other parents. Must flow naturally from the eyebrow.
- **`cta_copy.body`**: The full body (including the mandatory suffix) must be 17–24 words total. Your custom sentence comes first, then ". We are there with you daily too." (7 words). So your sentence is 10–17 words. Shows the specific RELIEF the reader gets — what changes for them next time. Not "the conversation about X" — show the tangible before/after.

The buttonText is always "Join the community" — do not change it.

## Tone

- Self-deprecating, wry, rational — not warm mommy-blogger energy, not salesy
- Direct — respect the reader's time
- No platitudes ("you're not alone", "it's hard", "you've got this", "no judgment")
- No exclamation marks

## Critical rules

1. The TITLE must speak TO the reader, not ABOUT other parents. Never start with "Parents who..." — the reader is not observing a group from outside, they're being invited IN
2. The TITLE must make it clear this is a COMMUNITY — people talking, sharing, being heard. Not a resource, not a course, not tips
3. The BODY shows the specific RELIEF — what changes for the reader after joining. Not "the conversation about X, Y, and Z" but what they'll have that they don't have now. Next time this happens, they won't be guessing alone.
4. Every field must be specific to the category topic — no generic "parenting is hard" copy that could apply to any category
5. Always second person — "you", "your", never "their", "them", "a parent"
6. Eyebrow → title → body must flow as one continuous thought. The body should not repeat or rephrase the title — it should CONTINUE it

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

### Body anti-pattern — NEVER DO THIS:
```
body: "The daily conversation about what's too strict, what's too soft, and what actually held up by Friday."
```
Why it fails: "The conversation about X, Y, and Z" is a dead formula. It describes a conversation — it doesn't show what changes for ME. Every body reads exactly the same. Instead, show specific relief: what I'll HAVE after joining that I don't have now.

### Discipline — THIS:
```
eyebrow: "When they push back again"
title: "Talk it through with parents setting the same limits"
body: "Next time you'll have ten parents who already tested your exact boundary and can tell you if it held. We are there with you daily too."
```
Why it works: Eyebrow puts you in the moment. Title tells you what you'll DO (talk it through) with people in YOUR situation. Body shows the specific relief — next time you won't be guessing, you'll have people who already tried it. The whole thing flows: moment → action → payoff.

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
body: "Next time you're up at 2 AM googling symptoms, you'll have parents who've been in your exact spiral to ask instead. We are there with you daily too."
```
Why it works: Title says what you DO (share the weight) with people in YOUR spiral. Body shows specific relief — instead of googling alone, you have real people to ask. Flows naturally from title to body.

## Categories

Each category has a course — use the course description to understand the topic scope:

{{CATEGORIES_WITH_COURSES}}

## Output schema

Each entry must conform to this TypeScript type:

```typescript
interface CtaCopy {
  eyebrow: string;     // 2-5 words
  title: string;       // 5-8 words (HARD LIMIT)
  body: string;        // 17-24 words TOTAL including ". We are there with you daily too." (HARD LIMIT)
  buttonText: "Join the community";  // FIXED — always this exact string
}

// HARD CONSTRAINTS — self-check before returning:
// 1. eyebrow: 2–5 words
// 2. title: 5–8 words — if over 8, shorten it
// 3. full body: 17–24 words total (your sentence + ". We are there with you daily too.")
// 4. No "Parents who..." titles, no "The conversation about..." bodies
// 5. Always second person (you/your)
// Count EVERY title and body. Fix violations before outputting.

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
