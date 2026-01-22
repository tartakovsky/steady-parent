# Landing Page Blocks to Implement

## 1. Navbar

**Purpose:** Sticky navigation with branding and single CTA.

**Requirements:**
- Sticky/fixed at top
- Logo on left
- Single CTA button on right ("Join the Waitlist")
- CTA links to waitlist URL
- Mobile: hamburger optional, but CTA must always be visible
- No price displayed here

---

## 2. Hero Section

**Purpose:** First impression, headline, and primary call to action.

**Requirements:**
- Strong headline (pain-focused or outcome-focused)
- Subheadline with supporting context
- Primary CTA button ("Join the Waitlist for March 1st Cohort")
- Optional secondary CTA (e.g., "See what's inside")
- NO price in hero section
- Mobile-first, responsive
- Optional: background image or gradient

---

## 3. Recognition Section ("You recognize this...")

**Purpose:** Connect with the reader's current pain and frustration.

**Requirements:**
- Small eyebrow text (e.g., "Sound familiar?")
- Title/headline
- 3-5 bullet points describing painful situations parents face
- Closing line that validates ("You're not alone" / "It doesn't have to be this way")
- Text-focused, optional support for one image
- No em dashes in copy

---

## 4. Possibility Section ("Now imagine...")

**Purpose:** Paint the desired outcome, the "after" state.

**Requirements:**
- Small eyebrow text (e.g., "What if...")
- Title/headline
- 3-5 bullet points describing the transformed state
- Aspirational, emotional tone
- Text-focused, optional support for one image
- No em dashes in copy

---

## 5. Promise Section ("What you get")

**Purpose:** Concrete deliverables and course structure.

**Requirements:**
- Small eyebrow text (e.g., "Inside the course")
- Title/headline
- 3-5 bullet points with specific deliverables
- May include icons next to bullets
- No em dashes in copy

---

## 6. Product Reveal

**Purpose:** Present the offer with pricing and cohort details.

**Requirements:**
- Course name prominently displayed
- Cohort start date: March 1st
- Price: $99
- Community value callout (e.g., "Includes free access to Skool community, $120/year value")
- Primary CTA button ("Join the Waitlist")
- Optional: money-back guarantee or risk reversal

---

## 7. Authority Carousel

**Purpose:** Establish credibility through research backing.

**Requirements:**
- Horizontal scrollable carousel
- Cards with: portrait image, name, credentials, description
- Use exact Tilda content and images (in `public/landing/authority/`):
  - Stephen W. Porges, PhD (Polyvagal Theory)
  - Dr. Adele Diamond, PhD (Executive function)
  - Bruce D. Perry, MD, PhD (Neurosequential model)
  - Bruce E. Compas, PhD (Coping research)
  - John Bowlby, M.D. (Attachment theory)
  - Frame 278 image (additional authority)
- **UX Requirements:**
  - Trackpad horizontal scroll controls carousel (not browser back/forward)
  - Frame-by-frame snap (Instagram-like)
  - 1 full card + next card peeking on mobile
  - Multiple cards visible on desktop
  - Prev/next arrow buttons
  - Use already implemented carousel from src/components/carousel

---

## 8. Testimonials Carousel

**Purpose:** Social proof from real parents.

**Requirements:**
- Horizontal scrollable carousel
- 9:16 aspect ratio cards (reel-style)
- Cards contain: video poster or image, person name, short quote
- Click opens media dialog with video player or full image
- **UX Requirements:**
  - Same carousel behavior as Authority section src/components/carousel
  - Frame-by-frame snap, no weird inertia
  - Trackpad horizontal scroll controls carousel
  - 1 full card + peek on mobile
  - Cards sized appropriately on desktop (not tiny, not 3 screens tall)
  - Aspect ratio must never distort when viewport changes
  

---

## 9. FAQ Section

**Purpose:** Address objections and common questions.

**Requirements:**
- Accordion-style (click to expand/collapse)
- 3-5 questions minimum:
  - "What age is this for?" (3-7, can help outside that range)
  - "Is this a course or a PDF?" (Cohort-based course in Skool with community)
  - "Will this work for a neurodivergent child?" (Many report it helps, every child different)
- Additional questions as needed
- No em dashes in copy

---

## 10. Lead Magnet Section

**Purpose:** Capture emails with a free resource (NOT the waitlist).

**Requirements:**
- Headline (e.g., "Not ready for the full course?")
- Description (e.g., "Get the free 3-step meltdown cheat sheet")
- Email input field
- Submit button ("Get the cheat sheet")
- Form posts to freebie delivery URL (separate from waitlist) (stub for now)
- This is NOT for joining the waitlist

---

## 11. Footer

**Purpose:** Standard page footer.

**Requirements:**
- Must be present (don't skip it)
- Logo or site name
- Copyright
- Optional: links to privacy policy, terms, social icons
- Keep it simple

---

## Global Requirements

- **Mobile-first, responsive design**
- **Page should NEVER scroll horizontally**
- **Buttons must visually look like buttons** (not plain text links)
- **No em dashes in copy**
- **Price does NOT appear in hero section**
- **Carousels:** trackpad horizontal scroll controls the carousel, not browser navigation
