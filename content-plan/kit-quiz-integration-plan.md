# Kit (ConvertKit) Integration for Quiz Email Gate

## Context

All 24 quizzes are deployed. The quiz flow shows a preview (teaser) of results with an email gate — users must enter their email to see full results. Currently the email form (`FreebieCTA`) does nothing (`onSubmit` just calls `e.preventDefault()`). We need to:

1. Wire the form to Kit's API to collect emails
2. Have Kit email the user their personalized results URL
3. Skip the email gate for returning subscribers (localStorage)

**Kit account state:** 24 quiz tags ready, 3 forms (none quiz-related), 0 custom fields, 0 sequences, 0 automations.

---

## Architecture

### Kit-side setup (one-time, via MCP tools)

1. **Create custom field** `quiz_result_url` — stores the personalized full-results URL per subscriber
2. **Create one Kit form** `quiz-results` — the single form all 24 quizzes submit to
3. **Create one Kit automation/sequence** — triggers when subscriber is added to the `quiz-results` form → sends one email template containing a button that links to `{{ subscriber.quiz_result_url }}`

### Frontend flow

```
User completes quiz
  → quiz-container shows QuizPreview (teaser)
  → user enters email, clicks "Send my results"
  → POST to /api/quiz-subscribe (Next.js API route)
      → Kit API: add subscriber to form, set quiz_result_url field, add quiz tag
      → return success
  → localStorage.setItem('sp_subscriber_email', email)
  → show full results immediately (don't wait for email)

User takes ANOTHER quiz later
  → quiz-container checks localStorage for sp_subscriber_email
  → email exists → skip preview, show full results directly
  → fire background POST to /api/quiz-subscribe (add new quiz tag, update quiz_result_url)
```

### The results URL

The full results URL is the current quiz page URL with all answer params already present. Example:
```
https://steadyparent.com/quiz/parenting-style?a=3420143210...
```
This URL contains everything needed to reconstruct and display full results. No server-side storage of answers needed.

---

## Files to Create

### `landing/src/app/api/quiz-subscribe/route.ts` — API route

Server-side route that calls Kit API (keeps API key secret). Accepts:
```ts
{ email: string, quizSlug: string, resultUrl: string }
```

Does:
1. Subscribe to the `quiz-results` Kit form (creates subscriber if new)
2. Set `quiz_result_url` custom field to `resultUrl`
3. Add tag `quiz-{quizSlug}` (look up tag ID from a map or fetch from Kit API)
4. Return `{ success: true }`

Environment variable: `KIT_API_SECRET` (Kit API secret, NOT the public key)

### `landing/src/lib/quiz/quiz-subscribe.ts` — client helper

```ts
export async function subscribeForQuizResults(
  email: string,
  quizSlug: string,
  resultUrl: string
): Promise<boolean>
```

Calls `/api/quiz-subscribe`, returns success/failure. Used by both the email form submission and the background re-tag for returning subscribers.

## Files to Modify

### `landing/src/components/blog/freebie-cta.tsx`

Add:
- `onSubmit?: (email: string) => Promise<void>` prop
- Loading state during submission
- Success state after submission ("Check your email!")
- Error state if submission fails
- Wire the form's `onSubmit` to call the prop

Keep backward compatible — existing usages without `onSubmit` prop still render the form (just non-functional, as today).

### `landing/src/components/quiz/quiz-preview.tsx`

Pass an `onEmailSubmit` callback to `FreebieCTA` that:
1. Calls `subscribeForQuizResults(email, slug, window.location.href)`
2. On success: saves email to localStorage, calls a new `onUnlock` callback

### `landing/src/components/quiz/quiz-container.tsx`

Add localStorage check on mount:
- If `sp_subscriber_email` exists in localStorage → set state to show full results (skip preview)
- When showing full results for a returning subscriber → fire background `subscribeForQuizResults` to add the new quiz tag
- New prop flow: `QuizPreview` gets `onUnlock` → when called, transition from preview to full results

---

## Kit Setup Steps (via MCP or dashboard)

1. `kit_create_custom_field` — name: `quiz_result_url`
   - Actually: Kit MCP doesn't have a create_custom_field tool. Check if it's created automatically when first used via API, OR create manually in Kit dashboard.

2. `kit_create_form` or create in Kit dashboard — name: `Quiz Results`, type: embed
   - We only need the form ID to subscribe people to it via API

3. **Kit dashboard automation** (manual):
   - Trigger: "Subscriber joins form Quiz Results"
   - Action: Send email
   - Email template:
     - Subject: "Your [quiz name] results are ready"
     - Body: Brief intro + button linking to `{{ subscriber.quiz_result_url }}`
     - Note: We can use the quiz tag to conditionally customize the email name, or keep it generic

4. Alternative to automation: use Kit's **form auto-responder** (simpler):
   - Each Kit form can have a single incentive email
   - Set the incentive email to include `{{ subscriber.quiz_result_url }}`
   - This fires immediately on form subscription — no automation needed

---

## Tag ID Mapping

The 24 quiz tags already exist in Kit. The API route needs to map slug → tag ID. Two options:

**Option A: Hardcode the map** (simpler, already known):
```ts
const QUIZ_TAG_IDS: Record<string, string> = {
  'parenting-style': '15744953',
  'bedtime-battle-style': '15744954',
  'parents-patterns': '15744955',
  'worried-parent': '15744956',
  'parenting-love-language': '15744957',
  'kid-describe-you': '15744958',
  'parenting-superpower': '15744959',
  'parent-at-2am': '15744960',
  'parenting-era': '15744961',
  'co-parent-team': '15744962',
  'potty-training-readiness': '15744963',
  'kindergarten-readiness': '15744964',
  'solid-foods-readiness': '15744965',
  'drop-the-nap': '15744966',
  'sleepover-readiness': '15744967',
  'second-child-readiness': '15744968',
  'parenting-battery': '15744969',
  'screen-dependence': '15744970',
  'emotional-intelligence': '15744971',
  'social-confidence': '15744972',
  'communication-safety': '15744973',
  'bedtime-routine': '15744974',
  'age-appropriate-chores': '15744975',
  'calm-down-toolkit': '15744976',
};
```

**Option B: Fetch at runtime** — call Kit API to list tags, find by name `quiz-{slug}`. More flexible but slower.

Recommend Option A — tags are stable, we know all IDs.

---

## localStorage Strategy

**Key:** `sp_subscriber_email`
**Value:** the subscriber's email address (needed for background re-tagging)

**Set:** after successful Kit API submission
**Read:** on quiz-container mount, before deciding preview vs full results
**Never cleared** by our code (persists until user clears browser data)

**Why store the email, not just a boolean:**
- Need the email to fire background re-tag calls for subsequent quizzes
- Kit deduplicates by email, so re-submitting the same email just updates fields/tags

---

## Implementation Order

1. Kit setup: create custom field + form (via dashboard or API)
2. Create `/api/quiz-subscribe` route + `quiz-subscribe.ts` client helper
3. Wire `FreebieCTA` to accept and handle `onSubmit`
4. Wire `QuizPreview` to call subscribe + save localStorage + unlock
5. Wire `quiz-container` to check localStorage and skip preview for returning subscribers
6. Set up Kit form auto-responder email with results link
7. Test end-to-end: new subscriber flow + returning subscriber flow

---

## Verification

1. Take quiz → see preview → enter email → Kit subscriber created with correct tag + custom field
2. Email arrives with correct personalized results URL
3. Click URL in email → see full results
4. Take a different quiz → full results shown immediately (no email gate)
5. Check Kit dashboard: subscriber has both quiz tags
6. Incognito/new browser → email gate appears again (localStorage cleared)
7. Re-entering same email → Kit deduplicates, new tag added, new email sent
