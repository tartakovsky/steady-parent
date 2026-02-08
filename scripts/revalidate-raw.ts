/**
 * Re-validate a .raw.json quiz file against the current schema.
 * Applies auto-fixes for readiness quizzes. Detects quiz type automatically.
 *
 * Usage: npx tsx scripts/revalidate-raw.ts <quiz-key>
 */
import { readFileSync, writeFileSync } from "fs";
import { ReadinessQuizDataSchema, IdentityQuizDataSchema } from "../landing/src/lib/quiz/quiz-schema";

const quizKey = process.argv[2];
if (!quizKey) {
  console.error("Usage: npx tsx scripts/revalidate-raw.ts <quiz-key>");
  process.exit(1);
}

const rawPath = `landing/src/lib/quiz/${quizKey}.json.raw.json`;
const outPath = `landing/src/lib/quiz/${quizKey}.json`;

const parsed = JSON.parse(readFileSync(rawPath, "utf8"));

const isIdentity = parsed.quizType === "identity";

if (!isIdentity) {
  // Auto-fix domain maxPoints
  if (parsed.domains && parsed.questions) {
    const calculated: Record<string, number> = {};
    for (const q of parsed.questions) {
      const maxPts = Math.max(...q.options.map((o: any) => o.points));
      calculated[q.domain] = (calculated[q.domain] || 0) + maxPts;
    }
    for (const [id, domain] of Object.entries(parsed.domains) as [string, any][]) {
      if (calculated[id] !== undefined && domain.maxPoints !== calculated[id]) {
        console.log(`Auto-fixed ${id} maxPoints: ${domain.maxPoints} → ${calculated[id]}`);
        domain.maxPoints = calculated[id];
      }
    }
  }

  // Auto-fix result score ranges
  if (parsed.domains && parsed.results) {
    const totalMax = Object.values(parsed.domains).reduce((s: number, d: any) => s + d.maxPoints, 0);
    const results = Object.values(parsed.results) as any[];
    results.sort((a: any, b: any) => a.scoreRange.min - b.scoreRange.min);
    const highestResult = results[results.length - 1];
    if (highestResult && highestResult.scoreRange.max !== totalMax) {
      console.log(`Auto-fixed top result max: ${highestResult.scoreRange.max} → ${totalMax}`);
      highestResult.scoreRange.max = totalMax;
    }
  }
}

const schema = isIdentity ? IdentityQuizDataSchema : ReadinessQuizDataSchema;
const result = schema.safeParse(parsed);
if (!result.success) {
  console.error("Validation errors:");
  for (const issue of result.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

const json = JSON.stringify(result.data, null, 2);
writeFileSync(outPath, json + "\n");
console.log(`Written: ${outPath} (${isIdentity ? "identity" : "readiness"})`);
console.log(`Questions: ${result.data.questions.length}`);

// Platitude scan
const banned = [
  "you're not alone", "you are not alone", "you're doing great",
  "that matters", "not a reflection", "not weak", "just by being here",
  "mama", "you've got this", "every moment is a gift",
];
const lower = json.toLowerCase();
const found = banned.filter((p) => lower.includes(p));
if (found.length > 0) {
  console.log(`PLATITUDE CHECK FAILED: ${found.join(", ")}`);
} else {
  console.log("Platitude check passed");
}

// Citation scan
const cites = json.match(/\([A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s*\d{4}\)/g);
if (cites) {
  console.log(`CITATION CHECK FAILED: ${cites.join(", ")}`);
} else {
  console.log("Citation check passed");
}
