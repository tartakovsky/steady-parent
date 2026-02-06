# Remove scroll animations, fix share button

## Changes
- Share button now copies URL to clipboard directly (removed Web Share API)
- Removed all whileInView/scroll animations from non-hero sections
- Only the hero ring + counter + headline still animate on mount

## Files Modified
- `landing/src/components/quiz/quiz-result.tsx`
- `landing/src/components/quiz/result-domain-insight.tsx`
- `landing/src/components/quiz/result-action-plan.tsx`
