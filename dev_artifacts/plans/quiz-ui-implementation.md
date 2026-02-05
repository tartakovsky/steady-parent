# Quiz UI Implementation Plan

## Overview

Build a Typeform-style quiz component using shadcn/ui + Framer Motion that integrates with our existing quiz scoring engine. The component should display one question at a time with smooth animations and produce shareable results.

---

## Codebase-Specific Rules (MUST FOLLOW)

### Prerequisites - Missing Dependencies

**1. Card Component (MISSING)**
The `@/components/ui/card` component is imported by 35+ ProBlocks but does not exist. Must add from shadcn:

```bash
cd landing && npx shadcn@latest add card
```

Expected exports: `Card`, `CardHeader`, `CardFooter`, `CardContent`, `CardTitle`, `CardDescription`

**2. Framer Motion (NOT INSTALLED)**
```bash
npm install framer-motion -w landing
```

### Component Patterns (from existing codebase)

**File Structure:**
```typescript
// All components must follow this pattern
"use client"; // Only if using hooks/interactivity

import { cn } from "@/lib/utils";

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // Custom props
  children?: React.ReactNode;
}

export function Component({ className, children, ...props }: ComponentProps) {
  return (
    <div className={cn("default-classes", className)} {...props}>
      {children}
    </div>
  );
}
```

**Variant System (CVA):**
```typescript
import { cva, type VariantProps } from "class-variance-authority";

const componentVariants = cva("base-classes", {
  variants: {
    variant: {
      default: "variant-default-classes",
      secondary: "variant-secondary-classes",
    },
    size: {
      default: "size-default-classes",
      lg: "size-lg-classes",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

export function Component({ className, variant, size, ...props }: ComponentProps) {
  return <div className={cn(componentVariants({ variant, size }), className)} {...props} />;
}
```

### Page Creation Pattern

**Route:** `/landing/src/app/quiz/[slug]/page.tsx`

```typescript
// Page structure pattern (from blog/[slug]/page.tsx)
import { notFound } from "next/navigation";

// For static generation
export const dynamicParams = false;

export async function generateStaticParams() {
  // Return array of { slug: string }
  return quizzes.map((q) => ({ slug: q.meta.slug }));
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Load quiz data...
}
```

**Page Wrapper Pattern:**
```tsx
<main className="bg-background section-padding-y">
  <div className="container-padding-x mx-auto max-w-4xl">
    {/* Quiz content */}
  </div>
</main>
```

### CSS Utility Classes (from globals.css)

**MUST USE these instead of raw Tailwind:**
- `.section-padding-y` - Vertical section padding (`py-16 md:py-20 lg:py-24`)
- `.container-padding-x` - Horizontal padding (`px-6 sm:px-10 ... 2xl:px-40`)
- `.heading-xl` / `.heading-lg` / `.heading-md` - Responsive typography
- `.section-title-gap-xl` / `.section-title-gap-lg` - Consistent spacing

### Import Patterns

```typescript
// UI Components
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Icons
import { Check, AlertTriangle, ArrowLeft, Share2 } from "lucide-react";

// Utilities
import { cn } from "@/lib/utils";

// Quiz Engine (from content/)
import { QuizEngine } from "@content/quizzes/quiz-engine";
import type { QuizData, QuizResult } from "@content/quizzes/quiz-engine";
```

### Existing Components to Reuse

| Need | Existing Component | Location |
|------|-------------------|----------|
| Progress bar | `Progress` | `@/components/ui/progress` |
| Buttons | `Button` | `@/components/ui/button` |
| Input fields | `Input` | `@/components/ui/input` |
| Toggle selection | `Toggle`, `ToggleGroup` | `@/components/ui/toggle`, `toggle-group` |
| Accordion (FAQ) | `Accordion` | `@/components/ui/accordion` |
| Form fields | `Field`, `FieldLabel` | `@/components/ui/field` |

---

## Architecture

```
+---------------------------------------------------------------------+
|                        QuizContainer                                 |
|  - Loads quiz JSON data                                              |
|  - Manages state (current question, answers)                         |
|  - Orchestrates animations                                           |
|                                                                      |
|  +---------------------------------------------------------------+   |
|  |  QuizProgress                                                 |   |
|  |  - Visual progress bar (reuse Progress component)             |   |
|  |  - Shows current position (e.g., "3 of 10")                   |   |
|  +---------------------------------------------------------------+   |
|                                                                      |
|  +---------------------------------------------------------------+   |
|  |  QuizQuestion (animated with Framer Motion)                   |   |
|  |  - Question text (heading-lg class)                           |   |
|  |  - Optional subtext/hint (text-muted-foreground)              |   |
|  |  - Answer options (as clickable cards)                        |   |
|  |  - Auto-advances on selection                                 |   |
|  +---------------------------------------------------------------+   |
|                                                                      |
|  +---------------------------------------------------------------+   |
|  |  QuizNavigation                                               |   |
|  |  - Back button (Button variant="ghost")                       |   |
|  +---------------------------------------------------------------+   |
|                                                                      |
+---------------------------------------------------------------------+
                              |
                    On quiz completion
                              v
+---------------------------------------------------------------------+
|                        QuizResult                                    |
|  - Uses QuizEngine to calculate scores                               |
|  - Displays headline + subheadline                                   |
|  - Shows domain breakdowns with Progress bars                        |
|  - Lists strengths and concerns                                      |
|  - Provides next steps                                               |
|  - Share buttons                                                     |
+---------------------------------------------------------------------+
```

---

## Components to Build

### 1. QuizContainer
**File:** `landing/src/components/quiz/quiz-container.tsx`

**Responsibilities:**
- Accept quiz data (JSON) as prop
- Manage state: `currentIndex`, `answers`, `isComplete`
- Handle answer selection and auto-advance
- Trigger result calculation on completion
- Control animation direction (forward/back)

**Props:**
```typescript
interface QuizContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  quiz: QuizData;
  onComplete?: (result: QuizResult) => void;
}
```

**State:**
```typescript
const [currentIndex, setCurrentIndex] = useState(0);
const [answers, setAnswers] = useState<Record<string, string>>({});
const [direction, setDirection] = useState<1 | -1>(1);
const [isComplete, setIsComplete] = useState(false);
```

---

### 2. QuizProgress
**File:** `landing/src/components/quiz/quiz-progress.tsx`

**Responsibilities:**
- Show visual progress through quiz
- Reuse existing `Progress` component from ui/

**Props:**
```typescript
interface QuizProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  current: number;
  total: number;
}
```

**Implementation:**
- Use `<Progress value={(current / total) * 100} />` from `@/components/ui/progress`
- Add text label: "Question {current} of {total}"

---

### 3. QuizQuestion
**File:** `landing/src/components/quiz/quiz-question.tsx`

**Responsibilities:**
- Display question text and subtext
- Render answer options using QuizOption
- Animate in/out with Framer Motion

**Props:**
```typescript
interface QuizQuestionProps {
  question: QuizQuestion;
  selectedAnswer?: string;
  onSelect: (optionId: string) => void;
  direction: 1 | -1;
}
```

**Animation (Framer Motion):**
```typescript
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};
```

---

### 4. QuizOption
**File:** `landing/src/components/quiz/quiz-option.tsx`

**Responsibilities:**
- Single answer option as a card
- Hover and focus states
- Selected state with checkmark
- Click handler

**Props:**
```typescript
interface QuizOptionProps extends React.HTMLAttributes<HTMLButtonElement> {
  option: { id: string; text: string };
  isSelected: boolean;
  onSelect: () => void;
}
```

**Styling (using Card + cn):**
```typescript
<button
  onClick={onSelect}
  className={cn(
    "w-full rounded-lg border-2 p-4 text-left transition-all",
    "hover:border-primary hover:bg-accent",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    isSelected && "border-primary bg-primary/10"
  )}
>
  <span className="flex items-center justify-between">
    <span>{option.text}</span>
    {isSelected && <Check className="h-5 w-5 text-primary" />}
  </span>
</button>
```

---

### 5. QuizResult
**File:** `landing/src/components/quiz/quiz-result.tsx`

**Responsibilities:**
- Display calculated result from QuizEngine
- Show headline, explanation, domain scores
- Render strengths and concerns
- Display next steps

**Props:**
```typescript
interface QuizResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: QuizResult;
  quizMeta: { title: string; shortTitle: string };
  onRetake?: () => void;
}
```

**Sections:**
1. **Hero** - Headline (heading-lg) + subheadline with result indicator
2. **Domain Breakdown** - Progress bars for each domain
3. **Strengths** - List with Check icons (text-green-600)
4. **Concerns** - List with AlertTriangle icons (text-amber-600)
5. **Next Steps** - Numbered action items
6. **Encouragement** - Supportive closing message
7. **Actions** - Retake button, share buttons

---

## File Structure

```
landing/src/
├── app/
│   └── quiz/
│       └── [slug]/
│           └── page.tsx          # Quiz page route
├── components/
│   ├── quiz/
│   │   ├── index.ts              # Barrel exports
│   │   ├── quiz-container.tsx    # Main orchestrator
│   │   ├── quiz-progress.tsx     # Progress indicator
│   │   ├── quiz-question.tsx     # Question with animation
│   │   ├── quiz-option.tsx       # Individual answer option
│   │   └── quiz-result.tsx       # Results display
│   └── ui/
│       └── card.tsx              # ADD: shadcn card component
└── content/
    └── quizzes/
        ├── quiz-engine.ts        # EXISTS: Scoring engine
        ├── potty-training-readiness.json  # EXISTS: Quiz data
        └── index.ts              # ADD: Quiz registry
```

---

## Implementation Steps

### Phase 0: Prerequisites
1. [ ] Add Card component: `cd landing && npx shadcn@latest add card`
2. [ ] Install framer-motion: `npm install framer-motion -w landing`
3. [ ] Create quiz registry at `content/quizzes/index.ts`

### Phase 1: Core Components
4. [ ] Create `landing/src/components/quiz/` directory
5. [ ] Build QuizProgress (wraps existing Progress)
6. [ ] Build QuizOption (button with selection state)
7. [ ] Build QuizQuestion (Framer Motion animation)
8. [ ] Build QuizContainer (state management)
9. [ ] Create barrel export `index.ts`

### Phase 2: Results Display
10. [ ] Build QuizResult layout sections
11. [ ] Build domain score visualization (Progress bars)
12. [ ] Build strengths/concerns lists
13. [ ] Build next steps section
14. [ ] Add retake functionality

### Phase 3: Page Integration
15. [ ] Create quiz registry (`content/quizzes/index.ts`)
16. [ ] Create page route `app/quiz/[slug]/page.tsx`
17. [ ] Wire up generateStaticParams for static generation
18. [ ] Test with potty-training-readiness quiz

### Phase 4: Polish
19. [ ] Add keyboard navigation (arrow keys, Enter)
20. [ ] Ensure mobile responsiveness (min-h-[48px] touch targets)
21. [ ] Add share functionality (navigator.share API)
22. [ ] Test accessibility (focus states, screen readers)

---

## Technical Decisions

### Animation Approach
Using Framer Motion's `AnimatePresence` with custom variants for direction-aware slide animations. Questions slide in from right when advancing, from left when going back.

### State Management
Keep it simple with React useState. No need for zustand/redux for a single quiz flow.

### Auto-Advance Behavior
On option selection:
1. Mark option as selected (visual feedback)
2. Wait 400ms (let user see their selection)
3. Advance to next question (or show results if last)

### Mobile Considerations
- Large touch targets (min 48px height for options)
- Full-width cards on mobile
- Progress visible without scrolling

---

## Integration Points

### Quiz Data
Quiz JSON files live in `content/quizzes/`. Create a registry:

```typescript
// content/quizzes/index.ts
import pottyTraining from './potty-training-readiness.json';
import type { QuizData } from './quiz-engine';

export const quizzes: Record<string, QuizData> = {
  'is-my-toddler-ready-for-potty-training': pottyTraining as QuizData,
};

export function getQuizBySlug(slug: string): QuizData | undefined {
  return quizzes[slug];
}

export function getAllQuizSlugs(): string[] {
  return Object.keys(quizzes);
}
```

### Scoring Engine
Import and use the `QuizEngine` class:

```typescript
import { QuizEngine } from '@content/quizzes/quiz-engine';

const engine = new QuizEngine(quizData);
const result = engine.assembleResult(answers);
```

---

## Success Criteria

- [ ] Quiz displays one question at a time
- [ ] Smooth animations between questions
- [ ] Progress is clearly visible
- [ ] Answer selection feels responsive
- [ ] Results show personalized domain breakdowns
- [ ] Works on mobile (touch-friendly)
- [ ] Accessible (keyboard nav, screen readers)
- [ ] Integrates with existing quiz engine
- [ ] Matches site design system (uses utility classes)
- [ ] Page route works: `/quiz/is-my-toddler-ready-for-potty-training`
