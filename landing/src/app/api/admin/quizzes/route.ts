import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import { QuizTaxonomySchema } from "@steady-parent/content-spec";

/** Slugs of quizzes that have JSON definitions deployed in landing/src/lib/quiz/ */
const DEPLOYED_SLUGS = new Set([
  "parenting-style",
  "emotional-intelligence",
  "calm-down-toolkit",
]);

function getResearchPath(filename: string): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", filename);
  }
  return path.join(process.cwd(), "..", "research", filename);
}

export async function GET() {
  try {
    const raw = await fs.readFile(
      getResearchPath("quiz_taxonomy.json"),
      "utf-8",
    );
    const taxonomy = QuizTaxonomySchema.parse(JSON.parse(raw));
    const entries = taxonomy.entries.map((q) => ({
      ...q,
      isDeployed: DEPLOYED_SLUGS.has(q.slug),
    }));
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json([]);
  }
}
