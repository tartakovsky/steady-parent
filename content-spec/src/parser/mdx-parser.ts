/**
 * MDX article parser — extracts structured data from MDX article files.
 *
 * TypeScript port of the regex patterns from research/validate_article.py.
 * Extracts metadata, links, CTAs, headings, images, FAQ, word count, etc.
 */

import type { ParsedArticle, ParsedMetadata } from "../types";

// ---------------------------------------------------------------------------
// Regex patterns (ported from validate_article.py)
// ---------------------------------------------------------------------------

const MD_LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;
const HEADING_RE = /^(#{1,6})\s+(.+)$/gm;
const JSX_HREF_RE =
  /<(?:CourseCTA|CommunityCTA|FreebieCTA|a)\s[^>]*href="([^"]+)"/g;
// Use [\s\S] instead of . with /s flag (ES2017 target doesn't support /s)
const MDX_IMAGE_RE = /\{\/\*\s*IMAGE:\s*([\s\S]*?)\s*\*\/\}/g;
const CTA_COMPONENT_RE = /<(CourseCTA|CommunityCTA|FreebieCTA)\s/g;
const FAQ_QUESTION_RE = /(?:\*\*[^*]+\?\*\*|###\s+.+\?)/g;

// CTA prop extraction
const CTA_FULL_RE =
  /<(CourseCTA|CommunityCTA|FreebieCTA)\s([^>]*)(?:\/>|>[^<]*<\/\1>)/g;
const PROP_RE = /(\w+)="([^"]*)"/g;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractMetadata(text: string): ParsedMetadata | null {
  const hasMetadata = /export\s+const\s+metadata\s*=/.test(text);
  if (!hasMetadata) return null;

  const title =
    text.match(/title:\s*"((?:[^"\\]|\\.)*)"/)?.[1]?.replace(/\\"/g, '"') ??
    "";
  const description =
    text
      .match(/description:\s*"((?:[^"\\]|\\.)*)"/)?.[1]
      ?.replace(/\\"/g, '"') ?? "";
  const date = text.match(/date:\s*"([^"]*)"/)?.[1] ?? "";
  const category = text.match(/category:\s*"([^"]*)"/)?.[1] ?? "";

  return { title, description, date, category };
}

function extractLinks(text: string): { anchor: string; url: string }[] {
  const links: { anchor: string; url: string }[] = [];
  for (const m of text.matchAll(MD_LINK_RE)) {
    const anchor = m[1];
    const url = m[2];
    if (anchor != null && url != null) {
      links.push({ anchor, url });
    }
  }
  return links;
}

function extractJsxHrefs(text: string): string[] {
  const hrefs: string[] = [];
  for (const m of text.matchAll(JSX_HREF_RE)) {
    const href = m[1];
    if (href != null) hrefs.push(href);
  }
  return hrefs;
}

function extractHeadings(text: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  for (const m of text.matchAll(HEADING_RE)) {
    const hashes = m[1];
    const headingText = m[2];
    if (hashes != null && headingText != null) {
      headings.push({ level: hashes.length, text: headingText.trim() });
    }
  }
  return headings;
}

function extractCtaComponents(
  text: string,
): {
  type: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  buttonText?: string;
  href?: string;
}[] {
  const components: {
    type: string;
    eyebrow?: string;
    title?: string;
    body?: string;
    buttonText?: string;
    href?: string;
  }[] = [];
  for (const m of text.matchAll(CTA_FULL_RE)) {
    const type = m[1];
    const propsStr = m[2];
    if (type == null || propsStr == null) continue;
    const props: Record<string, string> = {};
    for (const pm of propsStr.matchAll(PROP_RE)) {
      const key = pm[1];
      const val = pm[2];
      if (key != null && val != null) {
        props[key] = val;
      }
    }
    const comp: {
      type: string;
      eyebrow?: string;
      title?: string;
      body?: string;
      buttonText?: string;
      href?: string;
    } = { type };
    if (props["eyebrow"] != null) comp.eyebrow = props["eyebrow"];
    if (props["title"] != null) comp.title = props["title"];
    if (props["body"] != null) comp.body = props["body"];
    if (props["buttonText"] != null) comp.buttonText = props["buttonText"];
    if (props["href"] != null) comp.href = props["href"];
    components.push(comp);
  }
  return components;
}

function extractImageDescriptions(text: string): string[] {
  const descs: string[] = [];
  for (const m of text.matchAll(MDX_IMAGE_RE)) {
    const desc = m[1];
    if (desc != null) descs.push(desc.trim());
  }
  return descs;
}

function countFaqQuestions(text: string): number {
  const faqMatch = text.match(/##\s+FAQ/i);
  if (!faqMatch || faqMatch.index == null) return 0;
  const faqText = text.slice(faqMatch.index);
  const questions = faqText.match(FAQ_QUESTION_RE);
  return questions?.length ?? 0;
}

function wordCount(text: string): number {
  let clean = text;
  // Remove structural elements first (before stripping markdown chars)
  clean = clean.replace(/export\s+const\s+metadata\s*=\s*\{[\s\S]*?\};/g, "");
  clean = clean.replace(/\{\/\*[\s\S]*?\*\/\}/g, ""); // MDX comments
  clean = clean.replace(/<\w+[^>]*\/>/g, ""); // JSX self-closing
  clean = clean.replace(/<\w+[^>]*>[\s\S]*?<\/\w+>/g, ""); // JSX with children
  clean = clean.replace(/```[\s\S]*?```/g, ""); // code blocks
  clean = clean.replace(/`[^`]+`/g, ""); // inline code
  clean = clean.replace(/!\[[^\]]*\]\([^)]*\)/g, ""); // images
  clean = clean.replace(
    /\[[^\]]*\]\([^)]*\)/g,
    (m) => m.split("]")[0]?.slice(1) ?? "", // link text only
  );
  // Strip markdown formatting chars (hyphen at end to avoid range)
  clean = clean.replace(/[#*_>\\|-]/g, " ");
  return clean.split(/\s+/).filter((w) => w.length > 0).length;
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

export function parseMdxArticle(
  slug: string,
  content: string,
): ParsedArticle | null {
  const metadata = extractMetadata(content);
  if (!metadata) return null;

  const links = extractLinks(content);
  const jsxHrefs = extractJsxHrefs(content);
  const headings = extractHeadings(content);
  const ctaComponents = extractCtaComponents(content);
  const imageDescriptions = extractImageDescriptions(content);
  const faqQuestionCount = countFaqQuestions(content);

  const h2Texts = headings
    .filter((h) => h.level === 2)
    .map((h) => h.text.toLowerCase());

  const allUrls = [...links.map((l) => l.url), ...jsxHrefs];
  const internalLinkCount = allUrls.filter((u) => u.startsWith("/")).length;

  // Count CTA component instances (not unique types)
  let ctaCount = 0;
  for (const _m of content.matchAll(CTA_COMPONENT_RE)) {
    ctaCount++;
  }

  return {
    slug,
    metadata,
    wordCount: wordCount(content),
    h2Count: headings.filter((h) => h.level === 2).length,
    ctaCount,
    linkCount: allUrls.length,
    internalLinkCount,
    imageCount: imageDescriptions.length,
    faqQuestionCount,
    hasTldr: h2Texts.includes("tldr") || h2Texts.includes("tl;dr"),
    hasFaq: h2Texts.some((t) => t.startsWith("faq")),
    links,
    ctaComponents,
    imageDescriptions,
  };
}
