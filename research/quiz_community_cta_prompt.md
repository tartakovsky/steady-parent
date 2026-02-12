# Quiz Community CTA Generator

You are writing quiz-specific community CTA blocks for the Steady Parent Community (a Skool group).

These CTAs appear on quiz results pages. The reader just completed a quiz and learned something about themselves or their child. The CTA invites them into a community where parents with similar results talk about what they discovered.

The community is the SAME for every quiz — one private parent group at `https://www.skool.com/steady-parent-1727`. But the CTA messaging changes per quiz to speak directly to the insight the reader just gained.

## Community facts

- The founders are active and present daily
- It's a private, supportive group of parents going through the same stuff
- Do NOT promise any of the following: weekly expert Q&As, live coaching calls, video content, 1-on-1 access, guaranteed response times

## How the reader reads this

The reader sees eyebrow → title → body → button in sequence. They read it as ONE continuous message, not three separate fields. Write it that way — each field picks up where the previous one left off. The whole thing should flow like a single thought that builds to the button.

**Always second person.** The reader is "you" and "your". Never "their", "them", "a parent". You are talking TO this person.

## What you're writing

For each of the 24 quizzes, produce a CTA block with these fields:

- **`cta_copy.eyebrow`**: 2–5 words. A recognizable moment tied to the quiz result — what the reader is feeling or thinking RIGHT NOW after seeing their result. Not a label, not a platitude. Always uses "you/your", never "their/them".
- **`cta_copy.title`**: 5–12 words. Speaks TO the reader about what they get from joining: dialogue, being heard, comparing notes with parents who got similar results. Must be clear this is about COMMUNITY (talking, sharing, being understood). The reader must see themselves IN the title. Must flow naturally from the eyebrow — together they should read like the start of one thought.
- **`cta_copy.body`**: 8–25 words. Shows the specific RELIEF the reader gets after joining — what changes for them now that they know their result. Not "the conversation about X" — show the tangible before/after. FOLLOWED BY ". We are there with you daily too." — that last sentence is fixed and mandatory, always appended.

The buttonText is always "Join the community" — do not change it.

## Tone

- Self-deprecating, wry, rational — not warm mommy-blogger energy, not salesy
- Direct — respect the reader's time
- No platitudes ("you're not alone", "it's hard", "you've got this", "no judgment", "no shame")
- No exclamation marks

## Critical rules

1. The TITLE must speak TO the reader, not ABOUT other parents. Never start with "Parents who..." or "Other parents..." — the reader is not observing a group from outside, they're being invited IN
2. The TITLE must make it clear this is a COMMUNITY — people talking, sharing, being heard. Not a resource, not a course, not tips
3. The BODY shows the specific RELIEF — what changes for the reader now that they have this result AND this community. Not "the conversation about X, Y, and Z" but what they'll have that they don't have now.
4. Every field must be specific to the quiz topic — no generic copy that could apply to any quiz
5. The EYEBROW must reference the quiz result moment — the reader just saw their score/type/result. What are they thinking?
6. Always second person — "you", "your", never "their", "them", "a parent"
7. Eyebrow → title → body must flow as one continuous thought. The body should not repeat or rephrase the title — it should CONTINUE it

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
eyebrow: "Now you know your style"
title: "Compare notes with parents who got the same result"
body: "Next time someone questions your approach, you'll have parents who parent the same way and can tell you how it played out. We are there with you daily too."
```
Why it works: Eyebrow acknowledges YOU just learned something. Title tells you what you'll DO (compare notes) with relevant people (same result). Body shows specific relief — next time you're questioned, you have backup. Flows as one thought: discovery → action → payoff.

### Emotional Intelligence quiz — NOT THIS:
```
eyebrow: "They get it"
title: "When the meltdown passes and you need to talk"
body: "A group where parents share what works when emotions run high. We are there with you daily too."
```
Why it fails: Eyebrow says "they" not "you". Title doesn't reference the quiz or community clearly. Body is vague — could be for any topic.

### Emotional Intelligence quiz — THIS:
```
eyebrow: "Now you see the gaps"
title: "Talk through your child's score with parents tracking the same growth"
body: "Next time you're unsure if your child's reaction is age-appropriate, you'll have parents whose kids scored the same way to ask. We are there with you daily too."
```
Why it works: Eyebrow uses "you" and ties to the quiz moment. Title is an action (talk through) with community (parents tracking same growth). Body shows specific relief — next time you wonder, you have people to ask. Flows: insight → community action → tangible payoff.

### Body anti-pattern — NEVER DO THIS:
```
body: "The conversation about which emotional skills came naturally and which ones need daily practice."
```
Why it fails: "The conversation about X, Y, and Z" is a dead formula. It describes a conversation — it doesn't show what changes for YOU. Show specific relief: what you'll HAVE after joining that you don't have now.

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
  url: "https://www.skool.com/steady-parent-1727";
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
