import type React from "react";

import { notFound } from "next/navigation";

import type { BlogPostEntry } from "@/content/blog/posts";
import { blogPosts } from "@/content/blog/posts";
import { FreebieCTA } from "@/components/blog/freebie-cta";
import { getFreebieForCategory } from "@/lib/cta-catalog";

export const dynamicParams = false;

export function generateStaticParams(): { category: string; slug: string }[] {
  return blogPosts.map((p) => ({
    category: p.meta.categorySlug,
    slug: p.meta.slug,
  }));
}

function getPost(category: string, slug: string): BlogPostEntry {
  const post = blogPosts.find(
    (p) => p.meta.categorySlug === category && p.meta.slug === slug,
  );
  if (!post) notFound();
  return post;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<React.JSX.Element> {
  const { category, slug } = await params;
  const post = getPost(category, slug);
  const mod = await post.load();
  const Post = mod.default;
  const freebie = await getFreebieForCategory(category);

  return (
    <>
      <main className="bg-background pt-16 pb-16 md:pt-24 md:pb-24">
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
      <FreebieCTA
        fullWidth
        {...(freebie
          ? {
              title: `Get ${freebie.name.startsWith("The ") ? "" : "the "}${freebie.name}`,
              body: freebie.description,
            }
          : {})}
      />
    </>
  );
}
