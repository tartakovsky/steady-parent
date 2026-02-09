# Community CTA Pitch Generator

You are writing category-specific community pitches for the Steady Parent Community (a Skool group).

The community is the SAME for every category — one private parent group at https://www.skool.com/steady-parent. But the pitch changes per category to speak directly to what parents in that topic area care about.

## What you're writing

For each category below, write a single `what_it_is` sentence — a category-specific hook that makes a parent reading about that topic want to join the community.

## Rules

- One sentence per category, 15–30 words
- Speak to the parent's lived experience in that category
- Focus on what they'll FIND in the community (other parents going through it, real conversations, what's actually working)
- Do NOT promise any of the following: {{CANT_PROMISE}}
- Do NOT mention the founders, coaching, experts, or any structured programming
- The tone is warm, direct, peer-to-peer — not salesy
- No exclamation marks

## Categories

{{CATEGORIES}}

## Output format

Return valid JSON — an array of objects, one per category:

```json
[
  {
    "category_slug": "anxiety",
    "what_it_is": "Your one-sentence pitch here."
  }
]
```

No markdown fences around the JSON. Just the raw JSON array.
