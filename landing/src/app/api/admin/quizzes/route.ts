import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import {
  QuizTaxonomySchema,
  QuizPageTypesSchema,
  validateQuiz,
} from "@steady-parent/content-spec";

function getResearchPath(filename: string): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", filename);
  }
  return path.join(process.cwd(), "..", "research", filename);
}

function getQuizJsonDir(): string {
  return path.join(process.cwd(), "src", "lib", "quiz");
}

interface QuizValidationResult {
  detectedType: string;
  errors: string[];
  warnings: string[];
}

export async function GET() {
  try {
    const [taxonomyRaw, pageTypesRaw] = await Promise.all([
      fs.readFile(getResearchPath("quiz_taxonomy.json"), "utf-8"),
      fs.readFile(getResearchPath("quiz_page_types.json"), "utf-8"),
    ]);

    const taxonomy = QuizTaxonomySchema.parse(JSON.parse(taxonomyRaw));
    const quizPageTypes = QuizPageTypesSchema.parse(JSON.parse(pageTypesRaw));

    // Discover deployed quiz JSON files
    const quizDir = getQuizJsonDir();
    let deployedFiles: string[] = [];
    try {
      const files = await fs.readdir(quizDir);
      deployedFiles = files.filter(
        (f) => f.endsWith(".json") && !f.includes(".raw."),
      );
    } catch {
      // quiz dir doesn't exist in prod — that's fine
    }

    const deployedSlugs = new Set(
      deployedFiles.map((f) => f.replace(/\.json$/, "")),
    );

    // Validate each deployed quiz
    const validationResults = new Map<string, QuizValidationResult>();
    for (const file of deployedFiles) {
      const slug = file.replace(/\.json$/, "");
      try {
        const raw = await fs.readFile(path.join(quizDir, file), "utf-8");
        const data: unknown = JSON.parse(raw);
        const result = validateQuiz(data, quizPageTypes);
        validationResults.set(slug, result);
      } catch (e) {
        validationResults.set(slug, {
          detectedType: "unknown",
          errors: [
            `Failed to read/parse: ${e instanceof Error ? e.message : String(e)}`,
          ],
          warnings: [],
        });
      }
    }

    const entries = taxonomy.entries.map((q) => {
      const isDeployed = deployedSlugs.has(q.slug);
      const validation = validationResults.get(q.slug);
      return {
        ...q,
        isDeployed,
        validation: validation ?? null,
      };
    });

    return NextResponse.json(entries);
  } catch {
    return NextResponse.json([]);
  }
}
