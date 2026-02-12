# Course CTA Generator

You are writing category-specific course CTA blocks for Steady Parent courses.

Each category has ONE course. The CTA appears on article pages where the reader is mid-problem — they're reading about their struggle and the course is the structured solution.

## Course facts

- Every course contains: audio lessons + illustrated guides (text + audio + illustrations)
- Do NOT promise video, live coaching, 1-on-1 access, or guaranteed response times
- Courses are self-paced

## How the reader reads this

The reader sees eyebrow → title → body → button in sequence. They read it as ONE continuous message — one flowing sentence across all fields. Write it that way — each field picks up where the previous one left off.

**Always second person.** The reader is "you" and "your". Never "their", "them", "a parent".

## What you're writing

For each course, produce a CTA block with these fields:

- **`cta_copy.eyebrow`**: 2–5 words. A recognizable parenting moment the reader is IN right now. Situational, not abstract. Not a label.
- **`cta_copy.title`**: 5–12 words. A proper sentence where the course is the SUBJECT and the verb is FUTURE TENSE ("will show", "will help", "will teach", "will walk you through"). MUST include the course name AND the word "course". The title completes the thought started by the eyebrow, so reading "eyebrow, title" forms a natural sentence. First letter MUST be capitalized.
- **`cta_copy.body`**: 17–24 words total. Shows the specific RELIEF — what changes for the reader after taking this course. Describe what their daily life looks like AFTER. Not a product description ("Audio lessons and illustrated guides for..."). Not a declaration of value ("your plan", "your move"). Show what actually changes.
- **`cta_copy.buttonText`**: Always exactly "Start the course".

## Tone

- Self-deprecating, wry, rational — not warm mommy-blogger energy, not salesy
- Direct — respect the reader's time
- No platitudes ("you're not alone", "it's hard", "you've got this", "no judgment")
- No exclamation marks

## Critical rules

1. The TITLE is a proper sentence with the course as subject and a FUTURE TENSE verb: "will show", "will help", "will teach", "will walk you through". NOT present tense ("shows", "helps", "gives").
2. The TITLE must include the course name AND the word "course".
3. The TITLE flows naturally from the eyebrow: reading "eyebrow, title" should feel like one sentence.
4. NOT a command ("Start the X course"). NOT a dash-fragment ("X course — your plan"). NOT present tense.
5. The BODY shows what daily life looks like AFTER the course. Not features ("audio lessons for..."), not value labels ("your toolkit"), but the actual lived difference.
6. Always second person — "you", "your"
7. Every field must be specific to the category topic

## NOT THIS / THIS

### Aggression — NOT THIS:
```
eyebrow: "When they lash out"
title: "Start the Beyond Hitting course"
body: "Audio lessons and illustrated guides for responding to hitting, biting, and physical aggression."
```
Why it fails: Title is a generic command. Body is a product spec. No emotion, no felt change.

### Aggression — NOT THIS EITHER:
```
eyebrow: "When they hit again"
title: "Beyond Hitting course — your move for mid-hit"
body: "After this course, you'll have a plan for every aggression scenario from biting to throwing."
```
Why it fails: Dash-fragment, not a sentence. "Your move" is labeling value. "You'll have a plan" declares value instead of making it felt.

### Aggression — NOT THIS EITHER:
```
eyebrow: "When they hit again"
title: "the Beyond Hitting course shows you what works"
body: "..."
```
Why it fails: Present tense "shows" — the course hasn't happened yet. Use future tense: "will show".

### Aggression — THIS:
```
eyebrow: "When they hit again"
title: "the Beyond Hitting course will show you what works"
body: "You'll know what to do mid-hit and what to say after, instead of freezing or yelling every time."
```
Why it works: Eyebrow → title reads as one sentence: "When they hit again, the Beyond Hitting course will show you what works." Future tense. Course is the subject. Body shows the felt before/after (freezing → knowing what to do).

### Anxiety — THIS:
```
eyebrow: "When worry takes over"
title: "the Childhood Anxiety course will show you what's real"
body: "You'll stop guessing whether to push past the fear or back off, and start reading your child's signals accurately."
```
Why it works: "When worry takes over, the Childhood Anxiety course will show you what's real." Natural flowing sentence. Future tense. Body shows the daily change (guessing → reading accurately).

## Courses

Each entry below shows: slug, course name, what_it_is (use for topic context, NOT for the body copy).

{{COURSES}}

## Output schema

```typescript
interface CtaCopy {
  eyebrow: string;     // 2-5 words
  title: string;       // 5-12 words (HARD LIMIT), must include course name + "course", FUTURE TENSE
  body: string;        // 17-24 words total (HARD LIMIT)
  buttonText: "Start the course";  // FIXED
}

interface CtaDefinition {
  id: string;          // pattern: "course-{category_slug}"
  type: "course";
  name: string;        // exact course name (provided below)
  url: string;         // "/course/{slug}/"
  what_it_is: string;  // keep existing what_it_is unchanged
  cta_copy: CtaCopy;
  can_promise: [];
  cant_promise: [];
}

// HARD CONSTRAINTS — self-check before returning:
// 1. eyebrow: 2–5 words
// 2. title: 5–12 words, must include course name + "course", FUTURE TENSE verb
// 3. body: 17–24 words total
// 4. No "Start the X course" titles
// 5. No dash-fragment titles ("X course — something")
// 6. No present tense titles ("shows", "helps", "gives") — use "will show", "will help", "will give"
// 7. No "Audio lessons and..." or feature-list bodies
// 8. No value labels ("your plan", "your move", "your toolkit") — show the felt change
// 9. Always second person (you/your)
// Count EVERY title and body. Fix violations before outputting.
```

## Output format

Return a JSON array of objects, ready to replace entries in `content-plan/cta_catalog.json`. No markdown fences, no commentary — just the raw JSON array.
