# OG Image: Simplified Layout with Logo

## Changes

### Simplified result OG layout
- Removed domain progress bars entirely for a cleaner, more impactful design
- Quiz title centered at top (48px)
- Score ring (280px) + result info (eyebrow, headline, body text) centered vertically in middle
- Ring and text top-aligned to each other via two-level flex structure
- Large green CTA button at bottom (32px font, generous padding)

### Added Steady Parent logo
- Logo image (`sdp_logo_big_text.png`) from R2 bucket positioned absolutely in bottom-right corner
- R2 URL helper added to route (same pattern as navbar)

### Updated generic quiz card
- Matching bigger CTA button and safe-zone padding
- Logo added to generic card as well

## Why
The previous layout with domain bars was too busy for an OG image. A simpler layout with the score ring, result headline, and body text is more impactful and shareable. The logo adds brand recognition.

## Files Modified
- `landing/src/app/api/og/route.tsx`
