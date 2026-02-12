# Course Waitlist CTA Generator

You are writing category-specific waitlist CTA blocks for Steady Parent course landing pages.

Each category has a course that isn't available yet. The course page shows a waitlist CTA to capture email interest. This CTA is the ONLY thing the reader sees about the course — it must sell the value AND tell them what's inside.

## Course facts

- Every course contains: narrated audio lessons + illustrated guides (text with illustrations) + access to the Steady Parent community
- Do NOT promise video, live coaching, 1-on-1 access, or guaranteed response times
- Courses are self-paced

## How the reader reads this

The reader sees eyebrow → title → body → button in sequence. They read it as ONE continuous message. Write it that way — each field picks up where the previous one left off.

**Always second person.** The reader is "you" and "your". Never "their", "them", "a parent".

## What you're writing

For each course, produce a waitlist CTA block with these fields:

- **`cta_copy.eyebrow`**: 2–5 words. A recognizable parenting moment the reader is IN right now. Situational, not abstract.
- **`cta_copy.title`**: 5–12 words. A proper sentence where the course is the SUBJECT and the verb is FUTURE TENSE ("will show", "will help", "will teach", "will walk you through"). MUST include the course name AND the word "course". The title completes the thought started by the eyebrow, so reading "eyebrow, title" forms a natural sentence. First letter MUST be capitalized.
- **`cta_copy.body`**: 20–30 words total. Two jobs in this order:
  1. **Lead with value** — what changes for the reader (1 short clause)
  2. **Then describe what's inside** — narrated audio lessons, illustrated guides, and community access
  The body flows from the title as one continuous thought.
- **`cta_copy.buttonText`**: Always exactly "Reserve your spot".

## Tone

- Self-deprecating, wry, rational — not warm mommy-blogger energy, not salesy
- Direct — respect the reader's time
- No platitudes ("you're not alone", "it's hard", "you've got this", "no judgment")
- No exclamation marks

## Critical rules

1. The TITLE is a proper sentence with the course as subject and a FUTURE TENSE verb. NOT present tense. NOT a command ("Join the X waitlist").
2. The TITLE must include the course name AND the word "course".
3. The TITLE flows naturally from the eyebrow: reading "eyebrow, title" should feel like one sentence.
4. The BODY leads with value (what changes), THEN describes format (narrated audio, illustrated guides, community). Not the other way around.
5. Every body must mention all three: narrated audio lessons, illustrated guides, community access. Keep it natural, not a bullet list.
6. Always second person — "you", "your"
7. Every field must be specific to the category topic

## NOT THIS / THIS

### NOT THIS:
```
eyebrow: "When they lash out"
title: "Join the Beyond Hitting waitlist"
body: "Audio lessons and illustrated guides for responding to hitting, biting, and physical aggression — so you know exactly what to do next time."
```
Why it fails: Title is a command, not a sentence. Body leads with format, not value. Doesn't mention community.

### THIS:
```
eyebrow: "When fists come out"
title: "The Beyond Hitting course will teach you what to do"
body: "You'll stop freezing mid-hit — with narrated audio lessons, illustrated step-by-step guides, and a community of parents working on the same thing."
```
Why it works: Eyebrow → title flows as one sentence. Title is future tense with course as subject. Body leads with the felt change, then tells you what's in the box. All three formats mentioned naturally.

### THIS:
```
eyebrow: "When bedtime takes two hours"
title: "The Sleep Solutions course will help you build a routine that holds"
body: "You'll finish bedtime in a predictable window — with narrated audio lessons, illustrated guides, and parents who solved the same stalling tactics."
```
Why it works: Value first (predictable bedtime), then format. Community mentioned as "parents who solved the same stalling tactics" — specific, not generic.

## Courses

Each entry below shows: slug, course name, what_it_is (use for topic context only).

{{COURSES}}

## Output schema

```typescript
interface CtaCopy {
  eyebrow: string;     // 2-5 words
  title: string;       // 5-12 words (HARD LIMIT), must include course name + "course", FUTURE TENSE, first letter capitalized
  body: string;        // 20-30 words total (HARD LIMIT)
  buttonText: "Reserve your spot";  // FIXED
}

interface WaitlistDefinition {
  id: string;          // pattern: "waitlist-{category_slug}"
  type: "waitlist";
  name: string;        // exact course name (provided below)
  what_it_is: string;  // keep existing what_it_is unchanged
  pageUrlPattern: string;  // keep existing pageUrlPattern unchanged
  endpoint: "/api/waitlist-subscribe";
  tags: string[];      // keep existing tags unchanged
  cta_copy: CtaCopy;
}

// HARD CONSTRAINTS — self-check before returning:
// 1. eyebrow: 2–5 words
// 2. title: 5–12 words, must include course name + "course", FUTURE TENSE verb, first letter capitalized
// 3. body: 20–30 words total
// 4. No "Join the X waitlist" titles — title must be a sentence with the course as subject
// 5. No bodies that start with "Audio lessons..." — lead with value first
// 6. Every body mentions: narrated audio lessons, illustrated guides, community access
// 7. No value labels ("your plan", "your toolkit") — show the felt change
// 8. Always second person (you/your)
// Count EVERY title and body. Fix violations before outputting.
```

## Output format

Return a JSON array of objects, ready to replace waitlist entries in `content-plan/mailing_form_catalog.json`. No markdown fences, no commentary — just the raw JSON array.
