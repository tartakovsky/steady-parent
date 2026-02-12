# Quiz Community CTA Generator

You are writing quiz-specific community CTA blocks for the Steady Parent Community (a Skool group).

These CTAs appear on quiz results pages. The reader just completed a quiz and learned something about themselves or their child. The CTA invites them into a community where parents with similar results talk about what they discovered.

The community is the SAME for every quiz — one private parent group at `https://www.skool.com/steady-parent`. But the CTA messaging changes per quiz to speak directly to the insight the reader just gained.

## Community facts

- The founders are active and present daily
- It's a private, supportive group of parents going through the same stuff
- Do NOT promise any of the following: weekly expert Q&As, live coaching calls, video content, 1-on-1 access, guaranteed response times

## What you're writing

For each of the 24 quizzes, produce a CTA block with these fields:

- **`cta_copy.eyebrow`**: 2–5 words. A recognizable moment tied to the quiz result — what the reader is feeling or thinking RIGHT NOW after seeing their result. Not a label, not a platitude.
- **`cta_copy.title`**: 5–12 words. Speaks TO the reader about what they get from joining: dialogue, being heard, comparing notes with parents who got similar results. Must be clear this is about COMMUNITY (talking, sharing, being understood). The reader must see themselves IN the title.
- **`cta_copy.body`**: 8–25 words. Shows the specific value of this community FOR THIS QUIZ'S TOPIC — what conversations are happening that relate to what the reader just discovered. FOLLOWED BY ". We are there with you daily too." — that last sentence is fixed and mandatory, always appended.

The buttonText is always "Join the community" — do not change it.

## Tone

- Self-deprecating, wry, rational — not warm mommy-blogger energy, not salesy
- Direct — respect the reader's time
- No platitudes ("you're not alone", "it's hard", "you've got this", "no judgment", "no shame")
- No exclamation marks

## Critical rules

1. The TITLE must speak TO the reader, not ABOUT other parents. Never start with "Parents who..." or "Other parents..." — the reader is not observing a group from outside, they're being invited IN
2. The TITLE must make it clear this is a COMMUNITY — people talking, sharing, being heard. Not a resource, not a course, not tips
3. The BODY shows what's happening IN the community that's relevant to THIS QUIZ'S INSIGHT — the conversations sparked by what the reader just learned about themselves
4. Every field must be specific to the quiz topic — no generic copy that could apply to any quiz
5. The EYEBROW must reference the quiz result moment — the reader just saw their score/type/result. What are they thinking?

## NOT THIS / THIS

### Parenting Style quiz — NOT THIS:
```
eyebrow: "No one right way"
title: "Your family does not fit in a parenting box"
body: "A private group where parents build approaches that fit their real lives, not a textbook. We are there with you daily too."
```
Why it fails: Eyebrow is a platitude, not a moment. Title is a statement — no community, no action. Body describes the group abstractly.

### Parenting Style quiz — THIS:
```
eyebrow: "Now that you know your style"
title: "Compare notes with parents who got the same result"
body: "The conversation about what your style looks like on a hard day, and what other types handle differently. We are there with you daily too."
```
Why it works: Eyebrow acknowledges the reader just learned something. Title tells them what they'll DO (compare notes) with relevant people (same result). Body shows the live conversation tied to the quiz insight.

### Emotional Intelligence quiz — NOT THIS:
```
eyebrow: "They get it"
title: "When the meltdown passes and you need to talk"
body: "A group where parents share what works when emotions run high. We are there with you daily too."
```
Why it fails: Eyebrow is generic. Title doesn't reference the quiz or community clearly. Body is vague — could be for any topic.

### Emotional Intelligence quiz — THIS:
```
eyebrow: "After seeing their score"
title: "Talk through what the score means with parents tracking the same growth"
body: "The ongoing conversation about which emotional skills came naturally and which ones need daily practice. We are there with you daily too."
```
Why it works: Eyebrow ties to the quiz moment. Title is an action (talk through) with community (parents tracking same growth). Body shows specific conversations about the quiz's domain.

## Quizzes

Each quiz has a title and connected categories — use both to understand the topic:

{{QUIZZES_WITH_CONTEXT}}

## Output schema

Each entry must conform to this TypeScript type:

```typescript
interface CtaCopy {
  eyebrow: string;     // 2-5 words
  title: string;       // 5-12 words
  body: string;        // quiz-specific sentence + ". We are there with you daily too."
  buttonText: "Join the community";  // FIXED — always this exact string
}

interface CtaDefinition {
  id: string;          // pattern: "community-quiz-{quiz_slug}" (lowercase, hyphens only)
  type: "community";
  name: "Steady Parent Community";
  url: "https://www.skool.com/steady-parent";
  cta_copy: CtaCopy;
  can_promise: [];     // always empty
  cant_promise: [];    // always empty
}
```

## HARD CONSTRAINTS — self-check before returning

1. eyebrow: 2–5 words (count them)
2. title: 5–12 words (count them)
3. body before the fixed sentence: 8–25 words (count them). The full body = your sentence + ". We are there with you daily too."
4. No title starts with "Parents who" or "Other parents"
5. Every title makes it clear this is a COMMUNITY the reader is joining
6. buttonText is exactly "Join the community"
7. Every eyebrow references the quiz result moment — what the reader just learned

Count every eyebrow and title word count. If ANY violate limits, fix them before outputting.

## Output format

Return a JSON array of 24 objects (one per quiz), ready to be inserted into `content-plan/cta_catalog.json`. No markdown fences, no commentary — just the raw JSON array.
