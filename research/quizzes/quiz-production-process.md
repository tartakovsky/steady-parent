# Quiz Production Process

## Step 1: Topic Generation
Generate interesting, shareable quiz topics that connect to our content categories.
**Status:** DONE — see `quiz-ideas.md` (24 topics: 10 identity, 14 assessment)

## Step 2: Research Validated Instruments
For each quiz topic, find what validated psychometric instruments already exist. Adapt from those, don't invent.
**Status:** DONE — 14 research briefs in `research/quizzes/research/`, synthesis in `_synthesis.md`

## Step 3: Quiz Architecture
**Status:** IN PROGRESS — documented below

## Step 4: Quiz Content Generation
Adapt validated instruments into our JSON format. Generation prompt references specific instruments and their domains.
**Status:** BLOCKED on Step 3

## Step 5: Testing
Manual cognitive testing — have real parents take quizzes and give feedback (Anna-style).
**Status:** BLOCKED on Step 4

---

# Step 3: Architecture (Detail)

## Constraints

- **8-15 questions** per quiz, **3-5 answer options** each
- All result content is **pre-written** in the JSON — no dynamic generation
- The scoring/routing is a **deterministic logical tree**: any combination of answers maps to a specific pre-authored result
- Results must be **engaging, positive, viral, shareable** — no one shares "you're failing"
- Questions adapted from validated instruments, not invented
- Options describe **concrete real situations**, not severity grades, unless source tests explicitely require that and we have no better scientifically-valid option (no "always/sometimes/never")

## Core Architecture

### How It Works

```
Questions → Routing Logic → Pre-Written Result Blocks
```

The quiz engine collects answers, applies routing logic, and assembles a result page from pre-authored content blocks stored in the JSON. Everything the user sees on the result page was written by a human (or carefully prompted AI) beforehand. The engine just decides which blocks to show.

### Three Routing Modes

#### Route A — Score-to-Tier
**Used by:** Potty training, solid foods, kindergarten, sleepover, drop-the-nap, bedtime routine, parenting battery, screen dependence, communication safety, emotional intelligence

How it works:
1. Each question belongs to one domain
2. Each answer option has a point value (e.g., 0, 1, 2, or 3)
3. Points are summed per domain AND overall
4. Overall score lands in a range → selects one of 3-4 **tier results** (e.g., "Green Light" / "Yellow Light" / "Not Yet")
5. Per-domain score crosses a threshold → selects **domain content** at high/medium/low level
6. Result page shows BOTH: the overall tier headline + per-domain insights

This is what our current engine already does.

#### Route B — Score-to-Profile
**Used by:** Social confidence (and later: all 10 identity quizzes)

How it works:
1. Each answer option distributes points across multiple **profile types** (not domains)
2. After all questions, the profile type with the highest score wins
3. That profile's **pre-written result** is displayed
4. Optional: show blend percentages across all profiles
5. All profiles are positive — there is no bad result

Example for Social Confidence:
- Q: "At a birthday party with kids they don't know well, your child typically..."
  - "Joins in right away, introduces themselves" → Social Butterfly +3, Selective Connector +1
  - "Watches for a while, then joins one or two kids" → Selective Connector +3, Quiet Observer +1
  - "Stays close to you but seems interested" → Quiet Observer +3, Solo Explorer +1
  - "Is happy doing their own thing, doesn't seek out other kids" → Solo Explorer +3

Result: "Your child is a **Selective Connector** — they choose their people carefully, and those friendships run deep."

#### Route C — Domain Composition (no overall tier)
**Used by:** Calm-down toolkit, age-appropriate chores

How it works:
1. Each question belongs to a domain (same as Route A)
2. Points summed per domain, thresholds applied → high/medium/low per domain
3. There is NO overall score or tier
4. The result page is ENTIRELY composed from domain-level content blocks
5. The unique combination of domain levels IS the personalized result

Example for Calm-Down Toolkit:
- Domain "reactivity-style" scores HIGH → shows content block for "Big Reactor" profile
- Domain "coping-channel" scores suggest PHYSICAL → shows physical calming strategies
- Domain "sensory-preference" scores suggest SEEKING → shows sensory-seeking toolkit items
- The assembled page = "Your child is a Big Reactor who calms best through physical movement and sensory input. Here are 6 strategies matched to their profile: ..."

All those content blocks are pre-written. The engine just picks which ones to assemble.

### What's the Same Across All Routes

- Questions are always: text + optional subtext + 3-5 options
- Options always have some scoring mechanism (points, type distribution, or both)
- All result content is pre-authored in JSON
- Result pages always have: headline, explanation, actionable next steps
- Every quiz has a disclaimer: "This is not a clinical assessment"

---

## Result Page Design (What the User Sees)

### What's Actually Shared Across All Routes

Only the outer shell is shared:
- Share/Save/Retake buttons
- Disclaimer ("This is not a clinical assessment")
- Sources footer
- Shared-view stripping logic (`?s=1`)

The entire middle of the page — hero, body, action section — is **different per route**. There is no universal layout.

---

### Route A Result Page — Score-to-Tier

```
1. HERO
   - Score ring (animated, colored by tier)
   - Percentage counter
   - Tier headline ("Green Light!" / "Yellow Light" / "Not Quite Yet")
   - Subheadline (one-sentence summary)
   - Comparative context ("Most parents in this range...")

2. DOMAIN BREAKDOWN
   - Each domain as a card:
     - Domain name + icon + level badge ("Strong" / "Building" / "Emerging")
     - Score bar (visual, colored by level)
     - Score as fraction (8/10)
     - 2-3 sentence insight for their level
     - Strength highlight (green) or growth area (warm-toned)

3. ACTION PLAN
   - 3-5 specific next steps
   - "Watch out for" callout

4. ENCOURAGEMENT + FOOTER
   - Validating closing message
   - Retake advice if applicable
   - Link to related quiz / course / article
```

Example (Kindergarten Readiness, scoring "Almost There"):
```
┌─────────────────────────────────────┐
│ 🧠 Self-Regulation          Strong  │
│ ████████████████████░░░░  8/10      │
│ Your child can wait their turn and  │
│ manage transitions well. This is    │
│ the #1 predictor of school success. │
├─────────────────────────────────────┤
│ 💬 Language & Literacy    Building  │
│ █████████████░░░░░░░░░░░  5/10      │
│ Your child recognizes some letters  │
│ and loves being read to, but isn't  │
│ yet connecting letters to sounds.   │
│ This develops rapidly at this age.  │
└─────────────────────────────────────┘
```

**Variant: Parenting Battery** — Battery gauge icon instead of score ring. Percentage with color zones (green >75%, yellow 50-74%, orange 25-49%, red <25%). No tier headline — the battery level IS the headline.

**Variant: Traffic lights** (potty, solid foods, kindergarten, sleepover, drop-the-nap) — Colored circle (green/yellow/red) instead of percentage ring. Tier headline dominates.

---

### Route B Result Page — Profile

No score. No percentage. No domains. The result IS the profile.

```
1. HERO
   - Profile icon or illustration
   - Profile name large ("The Selective Connector")
   - Profile tagline (one line)

2. PROFILE CARD
   - 3-4 sentence profile description
   - "Your child's strengths" (2-3 bullets)
   - "How to support them" (2-3 bullets)

3. BLEND CHART (optional)
   - Bar chart showing % match to all profile types
   - "You're also a bit of a Quiet Observer (28%)"

4. FOOTER
   - Share / Retake
   - Related quiz link
```

Example (Social Confidence → "Quiet Observer"):
```
┌─────────────────────────────────────┐
│         🔭 Quiet Observer           │
│                                     │
│  "They see everything, say little,  │
│   and when they do connect — it     │
│   means something."                 │
│                                     │
│  Your child takes in the social     │
│  world before engaging. They're     │
│  building a rich internal map of    │
│  how relationships work.            │
│                                     │
│  Strengths:                         │
│  • Deeply observant of social cues  │
│  • Empathetic once comfortable      │
│  • Low-drama friendships            │
│                                     │
│  How to support:                    │
│  • Arrive early to social events    │
│  • Don't narrate their quietness    │
│  • Let them warm up on their terms  │
└─────────────────────────────────────┘
```

---

### Route C Result Page — Assembled Toolkit / Recommendations

No overall score. No tier. No single "result." The page is composed entirely from domain-level content blocks. The unique combination of domain levels IS the personalized result.

```
1. HERO
   - Assembled headline from domain labels
     ("Big Reactor + Physical + Cozy Nest")
   - Or: "Your Child's [Topic] Profile"

2. DOMAIN PROFILES (the body)
   - Each domain rendered as a labeled block:
     - Domain label at their level (e.g., "Reactivity: 🌊 Big Waves")
     - 1-2 sentence description
   - These blocks stack to form the "profile"

3. PERSONALIZED RECOMMENDATIONS
   - Ranked list of strategies / tasks / suggestions
   - Selected based on the combination of domain levels
   - All pre-written in the JSON

4. ANTI-RECOMMENDATIONS (optional)
   - "Less likely to work for your child: ..."
   - Based on the profile mismatch

5. FOOTER
   - Share / Retake
```

Example (Calm-Down Toolkit):
```
┌─────────────────────────────────────┐
│  Your Child's Calm-Down Profile     │
│                                     │
│  Reactivity: 🌊 Big Waves          │
│  "Emotions hit hard and fast."      │
│                                     │
│  Best Channel: 💪 Physical          │
│  "Movement is how their body        │
│   processes big feelings."          │
│                                     │
│  Environment: 🏕️ Cozy Nest         │
│  "They calm best in small, dim,     │
│   enclosed spaces."                 │
├─────────────────────────────────────┤
│  Your Personalized Toolkit          │
│                                     │
│  1. Heavy work — before the storm   │
│  2. Crash pad or pillow pile        │
│  3. Calm corner with blankets       │
│  4. Bear hugs or weighted lap pad   │
│  5. Stomping walk outside           │
│                                     │
│  Less likely to work:               │
│  Talking it through during the      │
│  storm, deep breathing (try these   │
│  AFTER the wave passes)             │
└─────────────────────────────────────┘
```

Example (Age-Appropriate Chores):
```
┌─────────────────────────────────────┐
│  Chores Your Child Can Handle       │
│  (Age 4, mostly independent)        │
│                                     │
│  ✅ Already mastered:               │
│  • Put dirty clothes in hamper      │
│  • Clear own plate after meals      │
│  • Pick up toys with reminder       │
│                                     │
│  🌱 Ready to try:                   │
│  • Set the table (with guidance)    │
│  • Water plants                     │
│  • Sort laundry by color            │
│                                     │
│  🔜 Coming soon (age 5-6):         │
│  • Make own bed                     │
│  • Unload dishwasher (non-sharp)    │
│  • Feed pets independently          │
├─────────────────────────────────────┤
│  Your Scaffolding Style: Guide      │
│  You give reminders but let them    │
│  figure it out. This builds real    │
│  competence — keep going.           │
└─────────────────────────────────────┘
```

---

## Shared vs. Owner View

**Owner view** (default): Full result — hero, insights, domain breakdown, action plan, encouragement.

**Shared view** (`?s=1`): Stripped down to create intrigue:
- Hero (same)
- Shareable summary (same)
- BIG CTA: "Take This Quiz Yourself"
- Domain breakdown visible but collapsed (bars show, detail hidden)
- No action plan, no encouragement — those are private

The shared view is an ad for the quiz, not a free result.

---

## Quiz JSON Schema

### Route A (score-to-tier)
```json
{
  "quizType": "assessment",
  "routingMode": "score-to-tier",
  "meta": { "id", "slug", "title", "shortTitle", "description", "intro", "estimatedTime", "questionCount", "ageRange?", "sources" },
  "domains": {
    "domain-id": { "id", "name", "maxPoints", "thresholds": { "high": N, "medium": N }, "weight?": N }
  },
  "questions": [
    { "id", "domain", "text", "subtext?", "source", "options": [
      { "id", "text", "points": N }
    ]}
  ],
  "domainContent": {
    "domain-id": {
      "high": { "level", "headline", "detail", "strength?" },
      "medium": { "level", "headline", "detail", "concern?" },
      "low": { "level", "headline", "detail", "concern?" }
    }
  },
  "results": {
    "result-id": { "id", "scoreRange": { "min", "max" }, "headline", "subheadline", "explanation", "nextSteps": [], "watchOutFor", "encouragement", "comparativeContext", "retakeAdvice?" }
  }
}
```

### Route B (score-to-profile)
```json
{
  "quizType": "profile",
  "routingMode": "score-to-profile",
  "meta": { ... },
  "profileTypes": {
    "type-id": { "id", "name", "tagline", "description", "strengths": [], "supportTips": [], "shareText" }
  },
  "questions": [
    { "id", "text", "subtext?", "source", "options": [
      { "id", "text", "distribution": { "type-id": N, "type-id": N } }
    ]}
  ]
}
```

### Route C (domain-composition)
```json
{
  "quizType": "toolkit",
  "routingMode": "domain-composition",
  "meta": { ... },
  "domains": {
    "domain-id": { "id", "name", "maxPoints", "thresholds": { "high": N, "medium": N } }
  },
  "questions": [
    { "id", "domain", "text", "subtext?", "source", "options": [
      { "id", "text", "points": N }
    ]}
  ],
  "domainContent": {
    "domain-id": {
      "high": { "label", "headline", "detail", "strategies?": [], "tasks?": [] },
      "medium": { "label", "headline", "detail", "strategies?": [], "tasks?": [] },
      "low": { "label", "headline", "detail", "strategies?": [], "tasks?": [] }
    }
  },
  "toolkitRules?": {
    "alwaysInclude": ["strategy-id"],
    "neverCombine": [["strategy-a", "strategy-b"]],
    "maxStrategies": 6
  }
}
```

---

## Engine Features Needed

### Already built (Route A)
- Questions with single-domain point scoring
- Per-domain sum + threshold → high/medium/low
- Total score → tier result selection
- Domain content at 3 levels
- Result page with hero, domain insights, action plan

### Needs to be added

| Feature | For | Effort |
|---------|-----|--------|
| Multi-dimensional option scoring (distribution across types) | Route B (profiles) | Medium — new option schema, new scoring logic |
| Profile result selection (highest type wins) | Route B | Small — simple max() |
| Profile result page component | Route B | Medium — new component |
| Domain-composition-only mode (no overall tier) | Route C (toolkits) | Small — skip tier selection, only render domain content |
| Toolkit/recommendation result page component | Route C | Medium — new component |
| Domain weighting | Kindergarten (social-emotional > academic), Drop the Nap (daytime functioning weighted) | Small — multiply domain score by weight before summing |
| Age input field (pre-quiz) | 5 quizzes | Small — one new input component, stored as context |
| Age guardrail (hard gate to alternate result) | Solid foods (under 4mo) | Small — conditional check before scoring |
| Battery gauge result component | Parenting battery | Small — one new visual component |

---

## What Makes This Different From Our Current Quizzes

| Aspect | Current (v1) | New (v2) |
|--------|-------------|----------|
| **Where questions come from** | AI invented them from topic description | Adapted from validated psychometric instruments |
| **What domains measure** | Made-up categories | Research-backed factors from published scales |
| **Answer options** | Severity grades ("Yes/Sometimes/No") | Concrete situations describing different real families |
| **Who the quiz assesses** | Assumes child behavior | Captures the actual dynamic (parent-driven, child-driven, situational) |
| **Result framing** | Score-based judgment | Pattern description — "here's what's happening" not "here's your grade" |
| **Result content source** | AI-generated results | Pre-written by editorial, grounded in instrument findings |
