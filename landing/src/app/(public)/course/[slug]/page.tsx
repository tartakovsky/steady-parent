import type React from "react";

import { notFound } from "next/navigation";

import { getAllWaitlists, getWaitlistBySlug } from "@/lib/cta-catalog";
import { CourseHero } from "@/components/course/course-hero";

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const waitlists = await getAllWaitlists();
  return waitlists
    .filter((c) => c.url?.startsWith("/course/"))
    .map((c) => {
      const slug = c.url!.replace("/course/", "").replace(/\/$/, "");
      return { slug };
    });
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const waitlist = await getWaitlistBySlug(slug);
  if (!waitlist) notFound();

  const title = waitlist.name;
  const eyebrow = waitlist.cta_copy?.eyebrow ?? "";
  const body = waitlist.cta_copy?.body ?? waitlist.what_it_is ?? "";
  const bullets = [
    "Audio lessons you can listen to during nap time",
    "Illustrated guides for quick reference",
    "Practical scripts you can use today",
  ];

  return (
    <main>
      <CourseHero
        eyebrow={eyebrow}
        title={title}
        body={body}
        bullets={bullets}
      />
    </main>
  );
}
