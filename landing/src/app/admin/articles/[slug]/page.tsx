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
  ctaComponents: { type: string; title?: string; body?: string; href?: string }[];
  imageDescriptions: string[];
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
        <div className="space-y-2">
          {article.ctaComponents.map((cta, i) => (
            <div key={i} className="rounded border p-3 text-sm">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                {cta.type}
              </span>
              {cta.title && (
                <p className="mt-1">
                  <span className="text-muted-foreground">title:</span>{" "}
                  {cta.title}
                </p>
              )}
              {cta.href && (
                <p className="font-mono text-xs text-muted-foreground">
                  href: {cta.href}
                </p>
              )}
            </div>
          ))}
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
