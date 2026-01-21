"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import React from "react";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Getting Started with shadcn/ui: A Complete Guide",
    description:
      "Learn how to set up and maximize your development workflow with shadcn/ui's powerful component library.",
    date: "Mar 15, 2024",
    category: "Tutorial",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
  {
    id: 2,
    title: "Building Dark Mode with Next.js and Tailwind CSS",
    description:
      "Implement a seamless dark mode toggle in your Next.js application using Tailwind CSS and shadcn/ui.",
    date: "Mar 12, 2024",
    category: "Development",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
  {
    id: 3,
    title: "Mastering React Server Components",
    description:
      "Deep dive into React Server Components and learn how they can improve your application's performance.",
    date: "Mar 8, 2024",
    category: "Advanced",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
];

export function BlogSection3() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="blog-section-heading"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col items-start gap-10 md:gap-12">
          <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
            <Tagline>Blog section</Tagline>
            <h1 id="blog-section-heading" className="heading-lg">
              Learn what's new
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Add a concise value statement that captures your reader's interest
              and previews your content value.
            </p>
          </div>

          <div
            className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6"
            role="list"
          >
            {BLOG_POSTS.map((post) => (
              <React.Fragment key={post.id}>
                <Card
                  className="group flex cursor-pointer flex-col justify-between gap-6 rounded-none border-none bg-transparent p-0 shadow-none"
                  role="listitem"
                >
                  <CardContent className="flex flex-col gap-3 p-0">
                    <div className="flex items-center gap-2 text-left">
                      <span className="text-muted-foreground text-sm">
                        {post.date}
                      </span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm">
                        {post.category}
                      </span>
                    </div>

                    <h3 className="font-semibold tracking-tight hover:underline">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground line-clamp-2">
                      {post.description}
                    </p>
                  </CardContent>

                  <CardFooter className="p-0">
                    <AspectRatio
                      ratio={4 / 3}
                      className="w-full overflow-hidden rounded-xl"
                    >
                      <Image
                        src={post.image}
                        alt={`${post.title} thumbnail`}
                        fill
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </AspectRatio>
                  </CardFooter>
                </Card>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
