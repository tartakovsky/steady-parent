"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { ValidationBadge } from "@/components/admin/validation-badge";

interface ArticleDetail {
  id: number;
  slug: string;
  categorySlug: string;
  title: string;
  description: string | null;
  date: string | null;
  category: string | null;
  wordCount: number;
  h2Count: number;
  ctaCount: number;
  linkCount: number;
  internalLinkCount: number;
  imageCount: number;
  faqQuestionCount: number;
  isRegistered: boolean;
  hasTldr: boolean;
  hasFaq: boolean;
  validationErrors: string[];
  validationWarnings: string[];
  links: { anchor: string; url: string }[];
  ctaComponents: {
    type: string;
    eyebrow?: string;
    title?: string;
    body?: string;
    buttonText?: string;
    href?: string;
  }[];
  imageDescriptions: string[];
}

// ---------------------------------------------------------------------------
// Kit integration metadata (static — from kit-config.ts + category_ctas.json)
// ---------------------------------------------------------------------------

const freebieConfig: Record<string, string[]> = {
  "blog/tantrums": ["lead", "freebie-tantrums"],
  "blog/aggression": ["lead", "freebie-aggression"],
  "blog/sleep": ["lead", "freebie-sleep"],
  "blog/siblings": ["lead", "freebie-siblings"],
  "blog/anxiety": ["lead", "freebie-anxiety"],
  "blog/discipline": ["lead", "freebie-discipline"],
  "blog/staying-calm": ["lead", "freebie-staying-calm"],
  "blog/breaking-the-cycle": ["lead", "freebie-breaking-the-cycle"],
  "blog/big-feelings": ["lead", "freebie-big-feelings"],
  "blog/potty-training": ["lead", "freebie-potty-training"],
  "blog/eating": ["lead", "freebie-eating"],
  "blog/screens": ["lead", "freebie-screens"],
  "blog/social-skills": ["lead", "freebie-social-skills"],
  "blog/body-safety": ["lead", "freebie-body-safety"],
  "blog/new-parent": ["lead", "freebie-new-parent"],
  "blog/teens": ["lead", "freebie-teens"],
  "blog/transitions": ["lead", "freebie-transitions"],
  "blog/spirited-kids": ["lead", "freebie-spirited-kids"],
  "blog/parenting-approach": ["lead", "freebie-parenting-approach"],
  "blog/parenting-science": ["lead", "freebie-parenting-science"],
};

const categoryCtas: Record<string, { course_name: string; course_url: string; freebie_name: string; freebie_promise: string }> = {
  "tantrums": { course_name: "The Tantrum Toolkit", course_url: "/course/tantrum-toolkit/", freebie_name: "The 3-Step Tantrum Script Cheat Sheet", freebie_promise: "A one-page printable with the exact phrases for validate, boundary, and redirect." },
  "aggression": { course_name: "Beyond Hitting", course_url: "/course/beyond-hitting/", freebie_name: "The Hitting Response Flowchart", freebie_promise: "A printable decision tree for what to say and do when your child gets physical." },
  "sleep": { course_name: "Sleep Solutions", course_url: "/course/sleep-solutions/", freebie_name: "Bedtime Routine Cards by Age", freebie_promise: "Printable visual step-by-step routine cards for toddlers, preschoolers, and school-age kids." },
  "siblings": { course_name: "Sibling Harmony", course_url: "/course/sibling-harmony/", freebie_name: "The Sibling Conflict Script Card", freebie_promise: "A printable card with exact phrases for when they're fighting, and when to step in versus stay out." },
  "anxiety": { course_name: "Childhood Anxiety", course_url: "/course/childhood-anxiety/", freebie_name: "The Worry Time Toolkit", freebie_promise: "A printable worry journal page and worry time rules card for kids." },
  "discipline": { course_name: "Discipline Without Punishment", course_url: "/course/discipline-without-punishment/", freebie_name: "The Boundary Scripts Cheat Sheet", freebie_promise: "A one-page printable with exact phrases for setting limits in the ten most common situations." },
  "staying-calm": { course_name: "The Calm Parent", course_url: "/course/calm-parent/", freebie_name: "The Parent Calm-Down Card", freebie_promise: "A printable pocket card with your personal regulation steps for when you're about to lose it." },
  "breaking-the-cycle": { course_name: "Breaking the Cycle", course_url: "/course/breaking-the-cycle/", freebie_name: "The Trigger Map Worksheet", freebie_promise: "A printable worksheet for identifying your parenting triggers and planning alternative responses." },
  "big-feelings": { course_name: "Big Feelings", course_url: "/course/big-feelings/", freebie_name: "The Feelings Vocabulary Poster", freebie_promise: "A printable poster with age-appropriate feeling words kids can point to when they can't find the words." },
  "potty-training": { course_name: "Potty Training", course_url: "/course/potty-training/", freebie_name: "The Potty Training Readiness Checklist", freebie_promise: "A one-page printable with readiness signs to watch for and a first-week starter plan." },
  "eating": { course_name: "Peaceful Mealtimes", course_url: "/course/peaceful-mealtimes/", freebie_name: "The No-Pressure Meal Planner", freebie_promise: "A printable one-week meal planning template with division of responsibility reminders built in." },
  "screens": { course_name: "Screen Sanity", course_url: "/course/screen-sanity/", freebie_name: "The Family Screen Agreement", freebie_promise: "A printable fill-in-the-blank screen time agreement the whole family signs together." },
  "social-skills": { course_name: "Social Skills", course_url: "/course/social-skills/", freebie_name: "The Playdate Prep Card", freebie_promise: "A printable card with what to practice before playdates and scripts for common social conflicts." },
  "body-safety": { course_name: "Body Safety Conversations", course_url: "/course/body-safety/", freebie_name: "Body Safety Conversation Starters", freebie_promise: "A printable set of age-appropriate scripts for starting body safety conversations with your child." },
  "new-parent": { course_name: "New Parent Survival", course_url: "/course/new-parent/", freebie_name: "The First 30 Days Survival Card", freebie_promise: "A one-page printable with the feeding, sleep, and crying essentials for the first month." },
  "teens": { course_name: "Parenting Teens", course_url: "/course/parenting-teens/", freebie_name: "Teen Conversation Starters", freebie_promise: "A printable list of ten non-interrogation questions that actually get teenagers talking." },
  "transitions": { course_name: "Life Transitions", course_url: "/course/life-transitions/", freebie_name: "The Transition Prep Checklist", freebie_promise: "A printable step-by-step checklist for preparing your child for any big change." },
  "spirited-kids": { course_name: "Spirited Kids", course_url: "/course/spirited-kids/", freebie_name: "The Spirited Child Temperament Map", freebie_promise: "A printable worksheet for mapping your child's intensity patterns and finding what calms them." },
  "parenting-approach": { course_name: "Intentional Parenting", course_url: "/course/intentional-parenting/", freebie_name: "The Parenting Values Worksheet", freebie_promise: "A printable worksheet for clarifying what matters most to your family and turning it into daily practice." },
  "parenting-science": { course_name: "The Science of Parenting", course_url: "/course/parenting-science/", freebie_name: "The Research Decoder Card", freebie_promise: "A printable guide for reading parenting studies without getting tricked by headlines." },
};

function getKitMetadata(categorySlug: string) {
  const freebieSlug = `blog/${categorySlug}`;
  const tagNames = freebieConfig[freebieSlug];
  const canonical = categoryCtas[categorySlug];
  return { freebieSlug, tagNames: tagNames ?? null, canonical: canonical ?? null };
}

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.["slug"] as string | undefined;
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch("/api/admin/articles")
      .then((r) => r.json() as Promise<ArticleDetail[]>)
      .then((rows) => {
        const found = rows.find((r) => r.slug === slug);
        setArticle(found ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!article) return <p className="text-red-500">Article not found: {slug}</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/articles"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to articles
        </Link>
        <h1 className="text-2xl font-bold">{article.title}</h1>
        <div className="mt-1 flex items-center gap-3">
          <span className="rounded bg-muted px-2 py-0.5 text-xs">
            {article.categorySlug}
          </span>
          <ValidationBadge
            errors={article.validationErrors.length}
            warnings={article.validationWarnings.length}
          />
          {article.isRegistered && (
            <span className="text-xs text-emerald-600">Registered</span>
          )}
          <a
            href={`/blog/${article.categorySlug}/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View live <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 text-sm sm:grid-cols-7">
        {[
          ["Words", article.wordCount],
          ["H2s", article.h2Count],
          ["CTAs", article.ctaCount],
          ["Links", article.linkCount],
          ["Internal", article.internalLinkCount],
          ["Images", article.imageCount],
          ["FAQ Qs", article.faqQuestionCount],
        ].map(([label, val]) => (
          <div key={label as string} className="rounded border p-2 text-center">
            <div className="text-xs text-muted-foreground">{label as string}</div>
            <div className="text-lg font-semibold">{val as number}</div>
          </div>
        ))}
      </div>

      {/* Validation Errors */}
      {article.validationErrors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
          <h2 className="mb-2 font-semibold text-red-700 dark:text-red-400">
            Errors ({article.validationErrors.length})
          </h2>
          <ul className="space-y-1 text-sm text-red-600 dark:text-red-300">
            {article.validationErrors.map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation Warnings */}
      {article.validationWarnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
          <h2 className="mb-2 font-semibold text-amber-700 dark:text-amber-400">
            Warnings ({article.validationWarnings.length})
          </h2>
          <ul className="space-y-1 text-sm text-amber-600 dark:text-amber-300">
            {article.validationWarnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Links */}
      <div>
        <h2 className="mb-2 text-lg font-semibold">
          Links ({article.links.length})
        </h2>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Anchor</th>
                <th className="px-3 py-2 text-left font-medium">URL</th>
              </tr>
            </thead>
            <tbody>
              {article.links.map((link, i) => (
                <tr key={i} className="border-b">
                  <td className="px-3 py-1.5">{link.anchor || "—"}</td>
                  <td className="px-3 py-1.5 font-mono text-xs">
                    {link.url}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Components */}
      <div>
        <h2 className="mb-2 text-lg font-semibold">
          CTA Components ({article.ctaComponents.length})
        </h2>
        <div className="space-y-3">
          {article.ctaComponents.map((cta, i) => {
            const kitMeta = cta.type === "FreebieCTA" ? getKitMetadata(article.categorySlug) : null;
            const courseMeta = cta.type === "CourseCTA" ? categoryCtas[article.categorySlug] : null;
            return (
              <div key={i} className="rounded border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                    cta.type === "FreebieCTA"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : cta.type === "CourseCTA"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  }`}>
                    {cta.type}
                  </span>
                  {cta.type === "FreebieCTA" && kitMeta?.canonical && cta.title !== kitMeta.canonical.freebie_name && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      title mismatch
                    </span>
                  )}
                  {cta.type === "CourseCTA" && courseMeta && cta.title !== courseMeta.course_name && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      title mismatch
                    </span>
                  )}
                </div>
                <div className="mt-2 grid gap-1">
                  {cta.eyebrow && (
                    <p>
                      <span className="text-muted-foreground">eyebrow:</span>{" "}
                      <span className="italic">{cta.eyebrow}</span>
                    </p>
                  )}
                  {cta.title && (
                    <p>
                      <span className="text-muted-foreground">title:</span>{" "}
                      <span className="font-medium">{cta.title}</span>
                    </p>
                  )}
                  {cta.body && (
                    <p>
                      <span className="text-muted-foreground">body:</span>{" "}
                      {cta.body}
                    </p>
                  )}
                  {cta.buttonText && (
                    <p>
                      <span className="text-muted-foreground">buttonText:</span>{" "}
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{cta.buttonText}</span>
                    </p>
                  )}
                  {cta.href && (
                    <p className="font-mono text-xs text-muted-foreground">
                      href: {cta.href}
                    </p>
                  )}
                </div>

                {/* Kit integration metadata for FreebieCTA */}
                {cta.type === "FreebieCTA" && kitMeta && (
                  <div className="mt-2 rounded bg-emerald-50 p-2 dark:bg-emerald-950/20">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Kit Integration</p>
                    <div className="mt-1 grid gap-0.5 text-xs">
                      <p>
                        <span className="text-muted-foreground">freebie slug:</span>{" "}
                        <code className="rounded bg-muted px-1">{kitMeta.freebieSlug}</code>
                      </p>
                      {kitMeta.tagNames && (
                        <p>
                          <span className="text-muted-foreground">tags assigned:</span>{" "}
                          {kitMeta.tagNames.map((t) => (
                            <code key={t} className="mr-1 rounded bg-muted px-1">{t}</code>
                          ))}
                        </p>
                      )}
                      {kitMeta.canonical && (
                        <>
                          <p>
                            <span className="text-muted-foreground">canonical freebie:</span>{" "}
                            {kitMeta.canonical.freebie_name}
                          </p>
                          <p>
                            <span className="text-muted-foreground">freebie promise:</span>{" "}
                            <span className="italic">{kitMeta.canonical.freebie_promise}</span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Canonical metadata for CourseCTA */}
                {cta.type === "CourseCTA" && courseMeta && (
                  <div className="mt-2 rounded bg-blue-50 p-2 dark:bg-blue-950/20">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Canonical Course</p>
                    <div className="mt-1 grid gap-0.5 text-xs">
                      <p>
                        <span className="text-muted-foreground">canonical name:</span>{" "}
                        {courseMeta.course_name}
                      </p>
                      <p>
                        <span className="text-muted-foreground">canonical URL:</span>{" "}
                        <code className="rounded bg-muted px-1">{courseMeta.course_url}</code>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Descriptions */}
      <div>
        <h2 className="mb-2 text-lg font-semibold">
          Images ({article.imageDescriptions.length})
        </h2>
        <ul className="space-y-1 text-sm">
          {article.imageDescriptions.map((desc, i) => (
            <li key={i} className="rounded border p-2 text-muted-foreground">
              {i === 0 ? "Cover: " : `Inline ${i}: `}
              {desc}
            </li>
          ))}
        </ul>
      </div>

      {/* Description */}
      {article.description && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">AI Answer Block</h2>
          <p className="text-sm text-muted-foreground">{article.description}</p>
        </div>
      )}
    </div>
  );
}
