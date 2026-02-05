import { notFound } from "next/navigation";
import { QuizContainer } from "@/components/quiz";
import { getQuizBySlug, getAllQuizSlugs } from "@/lib/quiz";

// Disable dynamic params - only pre-generated slugs are valid
export const dynamicParams = false;

// Generate static params for all quizzes at build time
export async function generateStaticParams() {
  const slugs = getAllQuizSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for SEO — reads searchParams for result-specific OG
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const quiz = getQuizBySlug(slug);

  if (!quiz) {
    return { title: "Quiz Not Found" };
  }

  // Build OG image URL — include answers if present for result-specific image
  const answersParam = typeof sp["a"] === "string" ? sp["a"] : undefined;
  const isShared = sp["s"] === "1";
  const ogParams = new URLSearchParams({ slug });
  if (answersParam) {
    ogParams.set("a", answersParam);
  }
  const ogImageUrl = `/api/og?${ogParams.toString()}`;

  // Build canonical URL — include s=1 so shared links stay shared
  let canonicalUrl = `/quiz/${slug}`;
  if (answersParam) {
    canonicalUrl += `?a=${answersParam}${isShared ? "&s=1" : ""}`;
  }

  return {
    title: quiz.meta.title,
    description: quiz.meta.description,
    openGraph: {
      title: quiz.meta.shortTitle,
      description: quiz.meta.description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: quiz.meta.shortTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: quiz.meta.shortTitle,
      description: quiz.meta.description,
      images: [ogImageUrl],
    },
  };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);

  if (!quiz) {
    notFound();
  }

  return (
    <main className="bg-background py-6 md:py-10 lg:py-12">
      <div className="container-padding-x mx-auto max-w-4xl">
        <QuizContainer quiz={quiz} />
      </div>
    </main>
  );
}
