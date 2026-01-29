import type React from "react";

import { notFound } from "next/navigation";

import type { BlogPostEntry } from "@/content/blog/posts";
import { blogPosts } from "@/content/blog/posts";

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return blogPosts.map((p) => ({ slug: p.meta.slug }));
}

function getPostBySlug(slug: string): BlogPostEntry {
  const post = blogPosts.find((p) => p.meta.slug === slug);
  if (!post) notFound();
  return post;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const mod = await post.load();
  const Post = mod.default;

  return (
    <main className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <article className="mx-auto flex max-w-3xl flex-col gap-8">
          <header className="flex flex-col gap-3">
            <div className="text-muted-foreground text-sm">
              {post.meta.category} · {post.meta.date}
            </div>
            <h1 className="heading-lg text-foreground">{post.meta.title}</h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              {post.meta.description}
            </p>
          </header>

          <div className="flex flex-col gap-6">
            <Post />
          </div>
        </article>
      </div>
    </main>
  );
}

