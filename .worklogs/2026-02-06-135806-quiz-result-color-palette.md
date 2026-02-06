# Quiz result page color palette redesign

**Date:** 2026-02-06 13:58
**Scope:** `landing/src/components/quiz/quiz-result.tsx`, `landing/src/components/quiz/result-domain-insight.tsx`

## Summary
Replaced the amber/orange warning-toned color palette on quiz result pages with a green/sunshine-yellow/pink palette that feels encouraging rather than alarming. Also changed "concern" callouts from amber AlertTriangle to indigo Lightbulb, and decoupled badge text colors from visual colors for readability.

## Context & Problem
The original palette used amber (#d97706) for "Almost There" and orange (#ea580c) for "Not Yet" — both traffic-light warning colors. For a parenting quiz, these triggered anxiety rather than encouragement. The goal was a three-tier color system (Strong → Developing → Emerging) that feels warm, supportive, and distinct without evoking caution/failure.

## Decisions Made

### Final palette: green / sunshine-yellow / pink
- **Chose:** Strong=#16a34a (green), Developing=#e8c840 (sunshine yellow), Emerging=#d05597 (pink)
- **Why:** Green=success is universal. Pink is warm/gentle without the alarm of orange/red. Sunshine yellow (#e8c840) is bright enough to feel cheerful and optimistic rather than cautionary, landing in "sunshine" territory (HSL ~48°, 74%, 58%) rather than "amber warning" territory (HSL ~38°, darker).
- **Alternatives considered and rejected:**
  - **Blue (#2563eb)** for developing — felt like a "corporate report"
  - **Indigo (#6366f1)** — "doesn't feel like developing"; too abstract/cool
  - **Teal (#00a782)** — too similar to green; couldn't distinguish them on the page
  - **Dark gold (#b08000)** — "signals it's bad"; too dark, warning-toned
  - **Medium gold (#ceaa2e)** — "too tense and unpleasant"; still in amber territory
  - **Violet/purple (#7b7fdd)** — "doesn't feel like developing"; too abstract

### Decoupled badge text from visual color
- **Chose:** Separate `getDomainBadgeText()` function returning dark-green (#166534), dark-amber (#854d0e), and dark-rose (#9f1239) for badge text; visual color (progress bar, ring, icon) uses the brighter shade
- **Why:** Yellow text on white has terrible contrast (~2.2:1 for #ceaa2e, even worse for lighter yellows). By decoupling, we can use a bright, cheerful yellow for visual elements without sacrificing badge readability. Badge background opacity bumped from `12` (7%) to `18` (9.4%) for slightly more visible tint.
- **Alternative considered:** Keeping a single color for both — rejected because it forces the color to be dark enough for text contrast, which pushes yellows into the "gold/warning" zone the user dislikes

### Concern callouts: amber → indigo with Lightbulb icon
- **Chose:** Changed "Room to Grow" and domain-level concern callouts from amber bg + AlertTriangle to indigo bg + Lightbulb
- **Why:** Amber + warning triangle screams "problem." Indigo + lightbulb reframes concerns as growth opportunities. Indigo is neutral/cool and doesn't compete with the three-tier green/yellow/pink system.

## Architectural Notes
- Colors are defined in two places: `getTheme()` in quiz-result.tsx (hero ring, gradient backgrounds, action plan) and `getDomainColor()` in result-domain-insight.tsx (domain card progress bars, icons, badges)
- The hero component (result-hero.tsx) uses themeColor only for the SVG ring stroke and a decorative gradient blob — the percentage number uses `text-foreground`, so hero has no text-contrast constraint
- Badge text decoupling is per-level, not per-color — works because levels map 1:1 to colors

## Information Sources
- Multiple rounds of live browser testing with user feedback
- OKLCH color space used for perceptual matching in earlier iterations (green and pink matched at L≈0.60, C≈0.16)
- WCAG contrast ratios computed for badge text: green #16a34a ≈ 3.35:1, pink #d05597 ≈ 4.02:1, old gold #ceaa2e ≈ 2.22:1 (failing), new yellow #e8c840 ≈ even lower — motivated the badge text decoupling

## Open Questions / Future Considerations
- The sunshine yellow may still read as "cautionary" to some users — monitor feedback post-launch
- If more quiz types are added, the three-tier color system should be reused consistently (consider extracting to a shared theme utility)
- The kindergarten quiz uses the same color functions as the potty training quiz — palette is global to all quizzes
