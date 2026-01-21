"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

interface BlogPost {
  id: number;
  title: string;
  date: string;
  category: string;
  image: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Getting Started with shadcn/ui: A Complete Guide",
    date: "Mar 15, 2024",
    category: "Tutorial",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
  {
    id: 2,
    title: "Building Dark Mode with Next.js and Tailwind CSS",
    date: "Mar 12, 2024",
    category: "Development",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
  {
    id: 3,
    title: "Mastering React Server Components",
    date: "Mar 8, 2024",
    category: "Advanced",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
  {
    id: 4,
    title: "The Future of Web Development in 2024",
    date: "Mar 5, 2024",
    category: "Insights",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
];

export function BlogSection4() {
  return (
    <section
      className="bg-muted section-padding-y"
      aria-labelledby="blog-section-heading"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex max-w-lg flex-col items-start gap-8">
            <div className="section-title-gap-lg flex flex-col">
              <Tagline>Blog section</Tagline>
              <h2 id="blog-section-heading" className="heading-lg">
                Learn what's new
              </h2>
              <p className="text-muted-foreground text-lg/8 text-pretty">
                Add a concise value statement that captures your reader's
                interest and previews your content value.
              </p>
            </div>
            <Button variant="outline" className="w-fit">
              View all articles
            </Button>
          </div>

          <div
            className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2"
            role="list"
          >
            {BLOG_POSTS.map((post) => (
              <Card
                key={post.id}
                className="group cursor-pointer gap-0 overflow-hidden rounded-lg border p-0 shadow-xs"
                role="listitem"
              >
                <AspectRatio ratio={4 / 3} className="overflow-hidden">
                  <Image
                    src={post.image}
                    alt={`${post.title} thumbnail`}
                    fill
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </AspectRatio>
                <CardContent className="flex flex-col justify-between gap-3 p-6">
                  <h3 className="font-semibold tracking-tight">{post.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm leading-none">
                    <span className="text-muted-foreground">{post.date}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {post.category}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
