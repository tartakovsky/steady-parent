# Fix word count regex bug that stripped all lowercase letters

**Date:** 2026-02-09 10:10
**Scope:** content-spec/src/parser/mdx-parser.ts, content-spec/src/validate-plans.ts

## Summary
Fixed a critical regex character range bug in the MDX parser's word count function that was stripping all lowercase letters from article content, causing word counts to be undercounted by ~60%.

## Context & Problem
The admin dashboard reported word count validation errors on all deployed articles (e.g., bedtime-routines-by-age showed ~926 words instead of ~2177). The article detail page confirmed the articles had substantially more content than the parser was counting.

Root cause: In `wordCount()`, the regex `/[#*_>\\-|]/g` intended to strip markdown formatting characters. However, `\\-|` created a character range from backslash (code 92) to pipe (code 124), which includes ALL lowercase letters a-z (codes 97-122). Every lowercase letter was being replaced with a space before word splitting.

A secondary issue: structural element removal (metadata block, MDX comments, JSX components) was ordered AFTER the markdown char strip, so those regex patterns couldn't match their targets since their lowercase letters had already been destroyed.

## Decisions Made

### Fix the character class range
- **Chose:** Move hyphen to end of character class: `/[#*_>\\|-]/g`
- **Why:** Hyphen at end (or start) of a character class is literal, not a range operator. This is the standard regex idiom.

### Reorder operations
- **Chose:** Move structural removal (metadata, comments, JSX) before the markdown char strip
- **Why:** Structural patterns contain lowercase letters and must match before those letters are stripped. The previous order was: strip markdown chars → remove structures (broken). New order: remove structures → strip markdown chars → count words.

## Verification
After fix + re-sync via admin dashboard:
- bedtime-routines-by-age: 926 → 2177 words
- handle-tantrum-scripts: ~1839 words (was failing, now passes)
- childhood-fears-by-age: ~2000 words (was failing, now passes)
- specific-phobias: ~1938 words (was failing, now passes)
- Total errors: 13 → 9 (all 9 from placeholder "welcome" article, which is a stub)

## Key Files for Context
- `content-spec/src/parser/mdx-parser.ts` — the MDX parser with the fixed wordCount function
- `.worklogs/2026-02-09-095511-clickable-error-warning-cards.md` — prior worklog (dashboard cards that surfaced this bug)
