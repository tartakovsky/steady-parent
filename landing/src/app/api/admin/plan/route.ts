import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import { db } from "@/lib/db";
import { linkPlanEntries } from "@/lib/db/schema";
import { QuizTaxonomySchema } from "@steady-parent/content-spec";

function getResearchPath(filename: string): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", filename);
  }
  return path.join(process.cwd(), "..", "research", filename);
}

function getQuizJsonDir(): string {
  return path.join(process.cwd(), "src", "lib", "quiz");
}

export async function GET() {
  // Articles from DB
  const articles = await db.select().from(linkPlanEntries);

  // Quizzes from taxonomy + deployed check
  let quizzes: {
    slug: string;
    title: string;
    url: string;
    isDeployed: boolean;
  }[] = [];

  try {
    const taxonomyRaw = await fs.readFile(
      getResearchPath("quiz_taxonomy.json"),
      "utf-8",
    );
    const taxonomy = QuizTaxonomySchema.parse(JSON.parse(taxonomyRaw));

    // Check which quizzes have deployed JSON files
    const quizDir = getQuizJsonDir();
    let deployedFiles: string[] = [];
    try {
      const files = await fs.readdir(quizDir);
      deployedFiles = files.filter(
        (f) => f.endsWith(".json") && !f.includes(".raw."),
      );
    } catch {
      // quiz dir doesn't exist — fine
    }
    const deployedSlugs = new Set(
      deployedFiles.map((f) => f.replace(/\.json$/, "")),
    );

    quizzes = taxonomy.entries.map((q) => ({
      slug: q.slug,
      title: q.title,
      url: q.url,
      isDeployed: deployedSlugs.has(q.slug),
    }));
  } catch {
    // quiz data unavailable — continue with articles only
  }

  return NextResponse.json({ articles, quizzes });
}
