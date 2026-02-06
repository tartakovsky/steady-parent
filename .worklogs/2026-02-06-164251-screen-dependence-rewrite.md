# Rewrite screen-dependence quiz from validated instruments

**Date:** 2026-02-06 16:42
**Scope:** `landing/src/lib/quiz/screen-dependence.json`

## Summary
Rewrote the screen dependence quiz from scratch using domains and items adapted from 7 validated psychometric instruments (ScreenQ, SCREENS-Q, PSUS, PMUM-SF, MEPA, DSEQ, DREAMER). This addresses real-user feedback that the original quiz was biased, didn't model families accurately, and gave wrong results.

## Context & Problem
Anna tested the original screen-dependence quiz and gave detailed feedback:
- Questions assumed child-driven screen demand; in her family, PARENTS are the ones offering screens
- Options forced false choices — "on half the questions I had to pick closest but it wasn't complete"
- Result was "completely wrong" — scored as if screen-dependent when their child happily does other things
- Quiz was basically a linear scale from 0 to "person who shoves iPad at screaming kid on plane"

Root cause: original questions were AI-invented from topic description, not adapted from validated instruments that actually model how families use screens.

## Decisions Made

### Domain structure: 4 research-backed domains
- **Chose:** media-ecology (ScreenQ/SCREENS-Q), why-screens (PSUS), screen-quality (ScreenQ/MEPA), flexibility (PMUM-SF/DREAMER)
- **Why:** These map directly to validated instruments' subscales. Critically, "Why Screens Come Out" captures parent-driven use (the PSUS instrument), which is exactly what Anna's feedback was about.
- **Alternatives considered:**
  - Keep original 4 domains (daily-patterns, emotional-reliance, content-engagement, family-flexibility) — rejected because they were invented, not research-backed
  - 6 domains (one per instrument) — rejected because too granular for 12 questions

### Question design: concrete situations, not severity grades
- **Chose:** Each option describes a specific family scenario (e.g., "I offer a screen before they ask — it solves the problem quickly")
- **Why:** Validated instruments use behavioral anchors that map to real situations. "Always/Sometimes/Never" scales produce social desirability bias.

### Scoring: 3 points per question, 4 options
- **Chose:** 3/2/1/0 per question, 3 questions per domain = 9 max per domain, 36 total
- **Why:** Matches existing engine expectations and potty-training-readiness pattern

## Information Sources
- Research brief: `research/quizzes/research/screen-dependence.md`
- ScreenQ (Hutton et al., 2020) — device access, background media, co-viewing, content quality
- PSUS (2023) — parent-driven screen use as childcare substitute
- PMUM-SF (Domoff et al., 2019) — tolerance and withdrawal markers
- MEPA (Vacek et al., 2021) — active vs. passive mediation
- SCREENS-Q (Klakk et al., 2020) — socio-ecological context
- DSEQ — displacement effects
- DREAMER framework — whole-family media ecology

## Open Questions / Future Considerations
- Anna should re-test to see if the rewrite fixes her experience
- Other 13 quizzes need same treatment (research-backed rewrite) — this is the test case
