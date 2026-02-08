import type React from "react";

import Link from "next/link";

import { blogCategories, blogPosts, postHref } from "@/content/blog/posts";

export default async function BlogIndexPage(): Promise<React.JSX.Element> {
  const posts = await Promise.all(
    blogPosts.map(async (p) => {
      const mod = await p.load();
      const mdxMeta = (mod as { metadata?: unknown }).metadata;
      return {
        ...p.meta,
        mdxMeta,
      };
    }),
  );

  // Newest first
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <header className="flex flex-col gap-4">
            <h1 className="heading-lg text-foreground">Blog</h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Practical scripts, sequences, and explanations you can use in real
              life.
            </p>
          </header>

          <div className="flex flex-wrap gap-2">
            {blogCategories.map((c) => (
              <span
                key={c}
                className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm font-medium"
              >
                {c}
              </span>
            ))}
          </div>

          <section className="flex flex-col gap-4" aria-label="Blog posts">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={postHref(p)}
                className="rounded-xl border bg-card p-5 transition-colors hover:bg-accent"
              >
                <div className="flex flex-col gap-2">
                  <div className="text-muted-foreground text-sm">
                    {p.category} · {p.date}
                  </div>
                  <div className="text-foreground text-xl font-semibold">
                    {p.title}
                  </div>
                  <div className="text-muted-foreground">{p.description}</div>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

