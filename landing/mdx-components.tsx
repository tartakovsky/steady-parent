import type { MDXComponents } from "mdx/types";

import { CourseCTA } from "@/components/blog/course-cta";
import { CommunityCTA } from "@/components/blog/community-cta";
import { FreebieCTA } from "@/components/blog/freebie-cta";
import { Callout } from "@/components/blog/callout";

const components: MDXComponents = {
  CourseCTA,
  CommunityCTA,
  FreebieCTA,
  Callout,
  a: ({ href, children }) => (
    <a
      href={typeof href === "string" ? href : undefined}
      className="text-blue-700/70 visited:text-purple-700/60 underline underline-offset-4 decoration-blue-700/30 hover:decoration-blue-700/60 hover:text-blue-700/90"
      target={typeof href === "string" && href.startsWith("/") ? undefined : "_blank"}
      rel={typeof href === "string" && href.startsWith("/") ? undefined : "noreferrer"}
    >
      {children}
    </a>
  ),
  h1: ({ children }) => <h1 className="heading-xl mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="heading-lg mt-10">{children}</h2>,
  h3: ({ children }) => <h3 className="heading-md mt-8">{children}</h3>,
  p: ({ children }) => <p className="text-muted-foreground text-lg/8">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-border pl-5 italic text-foreground/90">
      <div className="text-lg/8 [&_p]:text-foreground/90">{children}</div>
    </blockquote>
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : undefined}
      alt={typeof alt === "string" ? alt : ""}
      className="my-6 aspect-3/2 w-full rounded-xl border border-border object-cover"
      loading="lazy"
    />
  ),
  ul: ({ children }) => (
    <ul className="text-muted-foreground list-disc pl-6 text-lg/8">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-muted-foreground list-decimal pl-6 text-lg/8">{children}</ol>
  ),
  li: ({ children }) => <li className="my-1">{children}</li>,
  table: ({ children }) => (
    <div className="my-8 w-full overflow-x-auto">
      <table className="w-full border-collapse text-base">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-2 align-top">{children}</td>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
