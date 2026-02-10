# Course Waitlist CTA Generator

You are writing category-specific waitlist CTA blocks for Steady Parent course landing pages.

Each category has a course that isn't available yet. The course page shows a "Reserve your spot" CTA to capture email interest. The CTA messaging changes per category to sell the specific course.

## Course facts

- Courses contain audio lessons, illustrated guides, and text content
- Do NOT promise any of the following: video content, video walkthroughs, live coaching, 1-on-1 access, guaranteed response times
- Each course has a name, URL, and description already defined — you must reuse them exactly

## What you're writing

For each of the 20 categories, produce a waitlist CTA block with these fields:

- **`cta_copy.eyebrow`**: A short label (2-5 words) — a hook related to the course topic
- **`cta_copy.title`**: A headline (3-12 words) — direct, sells the value of the course for this topic
- **`cta_copy.body`**: One sentence (8-35 words) — what the course covers and why they should reserve early. Specific to the course content, not generic.

The buttonText is always "Reserve your spot" — do not change it.

## Tone

- Direct, confident, not hype-y or salesy
- No exclamation marks
- The eyebrow is a short hook; the title sells the course; the body gives specifics about what they'll get

## Categories with courses

{{CATEGORIES_WITH_COURSES}}

## Output schema

Each entry must conform to this TypeScript type:

```typescript
interface CtaCopy {
  eyebrow: string;     // 2-5 words
  title: string;       // 3-12 words
  body: string;        // 8-35 words, course-specific
  buttonText: "Reserve your spot";  // FIXED — always this exact string
}

interface WaitlistCtaDefinition {
  id: string;          // pattern: "waitlist-{category_slug}" (lowercase, hyphens only)
  type: "waitlist";
  name: string;        // MUST match the course name exactly
  url: string;         // MUST match the course URL exactly
  what_it_is: string;  // MUST match the course what_it_is exactly
  can_promise: [];     // always empty
  cant_promise: [];    // always empty
  cta_copy: CtaCopy;
}
```

## Output format

Return a JSON array of 20 objects (one per category), ready to be inserted into `research/cta_catalog.json`. No markdown fences, no commentary — just the raw JSON array.

Example of ONE entry (do not copy this pitch):

```json
{
  "id": "waitlist-anxiety",
  "type": "waitlist",
  "name": "Childhood Anxiety",
  "url": "/course/childhood-anxiety/",
  "what_it_is": "Audio lessons and illustrated guides for helping your child manage worry, fear, and avoidance behaviors.",
  "can_promise": [],
  "cant_promise": [],
  "cta_copy": {
    "eyebrow": "Coming soon",
    "title": "Be first to get the Childhood Anxiety course",
    "body": "Audio lessons and illustrated guides for helping your child face worry instead of being ruled by it — reserve your spot before it opens.",
    "buttonText": "Reserve your spot"
  }
}
```
