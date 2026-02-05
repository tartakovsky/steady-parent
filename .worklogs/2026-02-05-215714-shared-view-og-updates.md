# Shared View & OG Image Updates

## Changes

### Shared quiz result view (`&s=1` param)
- Share link now appends `&s=1` to the URL
- Visitors from shared links see a green "Take the Quiz Yourself" CTA as the first block
- Action buttons (share, PDF, retake) hidden on shared view
- `og:url` includes `&s=1` so Facebook crawlers preserve the shared context

### Quiz result page improvements
- "Share Results" is now the primary green CTA button on the result page
- Domain breakdown cards colored by readiness level: green (high), amber (medium), orange (low)
- Reduced top padding on quiz page for tighter layout

### OG image updates
- Domain bars in OG image now use level-based colors (green/amber/orange) instead of fixed rotation
- "Take the quiz" CTA button always green
- "almost" result theme changed from harsh amber to softer green

## Files Modified
- `landing/src/components/quiz/quiz-result.tsx`
- `landing/src/components/quiz/quiz-container.tsx`
- `landing/src/app/quiz/[slug]/page.tsx`
- `landing/src/app/api/og/route.tsx`
