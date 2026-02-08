/**
 * Kit (ConvertKit) integration config.
 *
 * Two-layer mapping:
 *   1. kitTags — human-readable tag names → Kit tag IDs
 *   2. freebieConfig — freebie slug (derived from page URL) → tag names to apply
 *
 * The API route resolves: freebie slug → tag names → tag IDs → Kit API calls.
 *
 * Freebie slug derivation from URL:
 *   /blog/tantrums/handle-tantrum-scripts → "blog/tantrums"
 *   /quiz/parenting-battery              → "quiz/parenting-battery"
 */

// ---------------------------------------------------------------------------
// Layer 1: Tag names → Kit tag IDs
// ---------------------------------------------------------------------------

export const kitTags: Record<string, number> = {
  // Global
  "lead":                       14523789,
  "customer":                   14523791,

  // Blog category freebies (20)
  "freebie-tantrums":           15744933,
  "freebie-aggression":         15744934,
  "freebie-sleep":              15744935,
  "freebie-siblings":           15744936,
  "freebie-anxiety":            15744937,
  "freebie-discipline":         15744938,
  "freebie-staying-calm":       15744939,
  "freebie-breaking-the-cycle": 15744940,
  "freebie-big-feelings":       15744941,
  "freebie-potty-training":     15744942,
  "freebie-eating":             15744943,
  "freebie-screens":            15744944,
  "freebie-social-skills":      15744945,
  "freebie-body-safety":        15744946,
  "freebie-new-parent":         15744947,
  "freebie-teens":              15744948,
  "freebie-transitions":        15744949,
  "freebie-spirited-kids":      15744950,
  "freebie-parenting-approach": 15744951,
  "freebie-parenting-science":  15744952,

  // Quiz freebies (24)
  "quiz-parenting-style":          15744953,
  "quiz-bedtime-battle-style":     15744954,
  "quiz-parents-patterns":         15744955,
  "quiz-worried-parent":           15744956,
  "quiz-parenting-love-language":  15744957,
  "quiz-kid-describe-you":         15744958,
  "quiz-parenting-superpower":     15744959,
  "quiz-parent-at-2am":            15744960,
  "quiz-parenting-era":            15744961,
  "quiz-co-parent-team":           15744962,
  "quiz-potty-training-readiness": 15744963,
  "quiz-kindergarten-readiness":   15744964,
  "quiz-solid-foods-readiness":    15744965,
  "quiz-drop-the-nap":            15744966,
  "quiz-sleepover-readiness":      15744967,
  "quiz-second-child-readiness":   15744968,
  "quiz-parenting-battery":        15744969,
  "quiz-screen-dependence":        15744970,
  "quiz-emotional-intelligence":   15744971,
  "quiz-social-confidence":        15744972,
  "quiz-communication-safety":     15744973,
  "quiz-bedtime-routine":          15744974,
  "quiz-age-appropriate-chores":   15744975,
  "quiz-calm-down-toolkit":        15744976,
};

// ---------------------------------------------------------------------------
// Layer 2: Freebie slug (from URL) → tag names to apply
// ---------------------------------------------------------------------------

export const freebieConfig: Record<string, string[]> = {
  // Blog categories — all articles in a category share the same freebie
  "blog/tantrums":           ["lead", "freebie-tantrums"],
  "blog/aggression":         ["lead", "freebie-aggression"],
  "blog/sleep":              ["lead", "freebie-sleep"],
  "blog/siblings":           ["lead", "freebie-siblings"],
  "blog/anxiety":            ["lead", "freebie-anxiety"],
  "blog/discipline":         ["lead", "freebie-discipline"],
  "blog/staying-calm":       ["lead", "freebie-staying-calm"],
  "blog/breaking-the-cycle": ["lead", "freebie-breaking-the-cycle"],
  "blog/big-feelings":       ["lead", "freebie-big-feelings"],
  "blog/potty-training":     ["lead", "freebie-potty-training"],
  "blog/eating":             ["lead", "freebie-eating"],
  "blog/screens":            ["lead", "freebie-screens"],
  "blog/social-skills":      ["lead", "freebie-social-skills"],
  "blog/body-safety":        ["lead", "freebie-body-safety"],
  "blog/new-parent":         ["lead", "freebie-new-parent"],
  "blog/teens":              ["lead", "freebie-teens"],
  "blog/transitions":        ["lead", "freebie-transitions"],
  "blog/spirited-kids":      ["lead", "freebie-spirited-kids"],
  "blog/parenting-approach": ["lead", "freebie-parenting-approach"],
  "blog/parenting-science":  ["lead", "freebie-parenting-science"],

  // Quizzes — each quiz has its own freebie
  "quiz/parenting-style":          ["lead", "quiz-parenting-style"],
  "quiz/bedtime-battle-style":     ["lead", "quiz-bedtime-battle-style"],
  "quiz/parents-patterns":         ["lead", "quiz-parents-patterns"],
  "quiz/worried-parent":           ["lead", "quiz-worried-parent"],
  "quiz/parenting-love-language":  ["lead", "quiz-parenting-love-language"],
  "quiz/kid-describe-you":         ["lead", "quiz-kid-describe-you"],
  "quiz/parenting-superpower":     ["lead", "quiz-parenting-superpower"],
  "quiz/parent-at-2am":            ["lead", "quiz-parent-at-2am"],
  "quiz/parenting-era":            ["lead", "quiz-parenting-era"],
  "quiz/co-parent-team":           ["lead", "quiz-co-parent-team"],
  "quiz/potty-training-readiness": ["lead", "quiz-potty-training-readiness"],
  "quiz/kindergarten-readiness":   ["lead", "quiz-kindergarten-readiness"],
  "quiz/solid-foods-readiness":    ["lead", "quiz-solid-foods-readiness"],
  "quiz/drop-the-nap":            ["lead", "quiz-drop-the-nap"],
  "quiz/sleepover-readiness":      ["lead", "quiz-sleepover-readiness"],
  "quiz/second-child-readiness":   ["lead", "quiz-second-child-readiness"],
  "quiz/parenting-battery":        ["lead", "quiz-parenting-battery"],
  "quiz/screen-dependence":        ["lead", "quiz-screen-dependence"],
  "quiz/emotional-intelligence":   ["lead", "quiz-emotional-intelligence"],
  "quiz/social-confidence":        ["lead", "quiz-social-confidence"],
  "quiz/communication-safety":     ["lead", "quiz-communication-safety"],
  "quiz/bedtime-routine":          ["lead", "quiz-bedtime-routine"],
  "quiz/age-appropriate-chores":   ["lead", "quiz-age-appropriate-chores"],
  "quiz/calm-down-toolkit":        ["lead", "quiz-calm-down-toolkit"],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive the freebie slug from a page pathname.
 *
 *   /blog/tantrums/handle-tantrum-scripts → "blog/tantrums"
 *   /quiz/parenting-battery              → "quiz/parenting-battery"
 *   /quiz/parenting-battery/             → "quiz/parenting-battery"
 */
export function freebieSlugFromPathname(pathname: string): string | null {
  const parts = pathname.replace(/^\/|\/$/g, "").split("/");

  if (parts[0] === "blog" && parts.length >= 2) {
    return `blog/${parts[1]}`;
  }
  if (parts[0] === "quiz" && parts.length >= 2) {
    return `quiz/${parts[1]}`;
  }
  return null;
}

/**
 * Resolve a freebie slug to Kit tag IDs.
 * Returns null if the slug is not in the config.
 */
export function resolveTagIds(freebieSlug: string): number[] | null {
  const tagNames = freebieConfig[freebieSlug];
  if (!tagNames) return null;

  return tagNames.map((name) => {
    const id = kitTags[name];
    if (!id) throw new Error(`Kit tag "${name}" not found in kitTags`);
    return id;
  });
}
