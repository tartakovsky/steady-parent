---
name: Landing Page Blocks Plan
overview: Define the landing page section sequence for a cohort-based course launch, mapping each section to existing Pro Blocks and shadcn/ui primitives, and identifying the few custom components we must build (authority carousel, testimonial carousel with video).
todos:
  - id: choose-blocks
    content: Pick specific Pro Blocks for each section (navbar, hero, recognition, possibility, promise, product reveal, whats inside, faq, risk reversal, final cta, footer) and list them in a single mapping table.
    status: pending
  - id: landing-route
    content: Create the main landing page composition for / (either src/app/page.tsx or a route group like src/app/(landing)/page.tsx that still maps to /).
    status: pending
    dependencies:
      - choose-blocks
  - id: content-carousel
    content: Implement one shared ContentCarousel module (shadcn/ui carousel and optional dialog) that can render different card types for Authority and ReelTestimonial, etc.
    status: pending
    dependencies:
      - choose-blocks
  - id: content-assets
    content: Create repo-local content schema and placeholder assets folder layout for authority and testimonials.
    status: pending
    dependencies:
      - choose-blocks
---

# Landing page block plan (course cohort launch)

## Inputs and constraints

- Product: Skool course priced at $99, includes Skool community access (do not put price in hero).
- Cohort launch framing: next cohort starts March 1st, primary CTA is waitlist.
- CTA destination: external email waitlist.
- Assets: testimonials and authority assets stored in repo (under `public/`).
- Copy rule: never use em dashes.

## Proposed page sequence (blocks)

### 1) Top navbar

- **What should be there**: logo, 3 to 5 anchor links, primary button "Join the waitlist".
- **Tech**: server component with client-only mobile menu if needed.
- **Components**:
- shadcn/ui: `button`, `sheet` (mobile menu), `separator`.
- Pro Blocks: use an LP navbar as a starting point.
- **Where from**:
- Pro Blocks: `src/components/pro-blocks/landing-page/lp-navbars/lp-navbar-1.tsx` through `lp-navbar-7.tsx`.
- **Re-implement**: likely minor edit only.

### 2) Hero (intent match, no price)

- **What should be there**: headline, subhead, cohort date "Starts March 1st", primary CTA "Join the waitlist", secondary CTA "See what’s inside" (scroll), 1 to 3 trust cues (money-back, lifetime access, community value) without price.
- **Tech**: mostly server component.
- **Components**:
- shadcn/ui: `button`, optionally `badge`.
- **Where from**:
- Pro Blocks: start with an existing hero that supports 2 CTAs and a date line.
- Installed options: `src/components/pro-blocks/landing-page/hero-sections/hero-section-10.tsx`, `hero-section-11.tsx`, `hero-section-12.tsx`.
- Missing options (tracked in `missing_blocks.md`): `hero-section-13`, `hero-section-14`, `hero-section-15`.
- **Re-implement**: no.

### 3) Recognition + Permission (problem framing)

- **What should be there**: 3 to 6 short bullets describing the moment, plus a reframing paragraph.
- **Tech**: server component.
- **Components**: plain layout, optionally `card`.
- **Where from**:
- Pro Blocks: `src/components/pro-blocks/landing-page/feature-sections/feature-section-*` and/or `rich-text-sections/rich-text-section-*` for image + text.
- **Re-implement**: no.

### 4) Possibility (before/after)

- **What should be there**: “what if” statement plus a before and after contrast, 2 to 4 outcomes.
- **Tech**: server component.
- **Components**: `card` optional.
- **Where from**:
- Pro Blocks: feature or comparison sections.
- Candidates: `src/components/pro-blocks/landing-page/comparison-sections/comparison-section-*`.
- **Re-implement**: no.

### 5) Promise and mechanism

- **What should be there**: 3 to 5 bullets describing the method, what they’ll be able to do in 60 seconds, what’s different vs random advice.
- **Tech**: server component.
- **Where from**:
- Pro Blocks: `src/components/pro-blocks/landing-page/cta-sections/` or `feature-sections/`.
- **Re-implement**: no.

### 6) Product reveal (first time price appears)

- **What should be there**: course name, cohort date, what they get (course + community), price $99, value framing ($120 per year community), CTA to external waitlist, what happens after joining waitlist.
- **Tech**: server component.
- **Components**:
- shadcn/ui: `card`, `button`, `badge`, `separator`.
- **Where from**:
- Pro Blocks: pricing section or a product-style card layout.
- Candidates: `src/components/pro-blocks/landing-page/pricing-sections/pricing-section-1.tsx` through `pricing-section-5.tsx`.
- **Re-implement**: no.

### 7) What’s inside (curriculum preview)

- **What should be there**: module list (accordion), plus screenshots or sample lesson clips.
- **Tech**: server component with a carousel optional.
- **Components**:
- shadcn/ui: `accordion`, `carousel`, `button`.
- **Where from**:
- Pro Blocks: gallery sections and rich text sections.
- Candidates: `src/components/pro-blocks/landing-page/gallery-sections/gallery-section-*`.
- **Re-implement**: no.

### 8) Authority carousel (custom, Tilda-like)

- **What should be there**: horizontal carousel of expert cards, each with portrait, name, credentials, 1 to 2 lines of relevance.
- **Tech**: client component.
- **Components**:
- shadcn/ui: `carousel`, `card`, `button`.
- **Where from**:
- Structure reference: Tilda uses a horizontal card carousel.
- Implementation: use the shared `ContentCarousel` module with an `AuthorityCard` renderer.
- **Re-implement**: yes.

### 9) Help evaluate (objection handling)

- **What should be there**: accordion Q and A from `landing_guide.md`, short and specific.
- **Tech**: server component.
- **Components**: shadcn/ui `accordion`.
- **Where from**:
- Pro Blocks: `src/components/pro-blocks/landing-page/faq-sections/faq-section-*`.
- **Re-implement**: no.

### 10) Testimonials carousel (custom, supports mixed media)

- **What should be there**: carousel of testimonial cards, each card can be one of:
- Vertical video (9:16)
- Horizontal video (16:9 or 4:3)
- Text and image card
- Text-only card
Clicking a card opens a dialog with an embedded player.
- **Tech**: client component.
- **Components**:
- shadcn/ui: `carousel`, `dialog`, `card`, `button`.
- Media: HTML5 `<video controls>` for local mp4/webm, optionally YouTube embed via iframe for external URLs.
- **Where from**:
- Tilda reference: embedded carousel widget.
- Implementation: use the shared `ContentCarousel` module with a `ReelTestimonialCard` renderer and a `MediaDialog` that plays video on click.
- **Re-implement**: yes.

### 11) Risk reversal and logistics

- **What should be there**: 3 icon cards: instant access, one-time payment, guarantee.
- **Tech**: server component.
- **Where from**:
- Pro Blocks: `src/components/pro-blocks/landing-page/stats-sections/` or `feature-sections/` for icon cards.
- **Re-implement**: no.

### 12) Final CTA section

- **What should be there**: condensed summary, cohort date, price reminder, CTA.
- **Tech**: server component.
- **Where from**:
- Pro Blocks: `src/components/pro-blocks/landing-page/cta-sections/cta-section-*`.
- **Re-implement**: no.

### 13) Lead magnet downsell

- **What should be there**: email capture for free cheat sheet.
- **Tech**: client component (form state, validation, success state), embedded into the page composition.
- **Components**:
- shadcn/ui: `input`, `button`, `card`.
- **Where from**:
- Pro Blocks: any CTA section with input.
- **Re-implement**: maybe, depending on desired UX.

### 14) Footer

- **What should be there**: contact email, socials, legal links.
- **Tech**: server component.
- **Where from**:
- Pro Blocks: `src/components/pro-blocks/landing-page/footers/footer-*`.
- **Re-implement**: no.

## Content system (repo-local)

- Store copy and structured data in repo:
- `src/content/landing/` as `content.ts` or `content.json` with:
  - cohort date, CTA URL, pricing, modules, FAQ entries
  - authority items
  - testimonial items with `type: video|text|mixed` and media metadata
- Assets under `public/landing/authority/` and `public/landing/testimonials/`.

## Implementation todos

- Create the main landing page composition for `/` (either `src/app/page.tsx` or a route group like `src/app/(landing)/page.tsx` that still maps to `/`).
- Select concrete Pro Blocks for each non-custom section and adapt copy.
- Implement one shared `ContentCarousel` module (shadcn/ui `carousel` and optional `dialog`) and reuse it for both Authority and Testimonials by swapping card renderers.
- Add repo-local content and assets structure for authority and testimonials.