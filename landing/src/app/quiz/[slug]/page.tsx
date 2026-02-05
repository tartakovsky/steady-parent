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

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);

  if (!quiz) {
    return { title: "Quiz Not Found" };
  }

  return {
    title: quiz.meta.title,
    description: quiz.meta.description,
    openGraph: {
      title: quiz.meta.shortTitle,
      description: quiz.meta.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: quiz.meta.shortTitle,
      description: quiz.meta.description,
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
    <main className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-4xl">
        <QuizContainer quiz={quiz} />
      </div>
    </main>
  );
}
