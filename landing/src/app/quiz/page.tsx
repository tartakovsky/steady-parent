import Link from "next/link";
import { getAllQuizzes } from "@/lib/quiz";

export const metadata = {
  title: "Parenting Quizzes",
  description:
    "Research-backed parenting quizzes to help you understand your child's development.",
};

export default function QuizIndexPage() {
  const quizzes = getAllQuizzes();

  return (
    <main className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="heading-lg">Parenting Quizzes</h1>
          <p className="text-muted-foreground">
            Research-backed quizzes to help you understand where your child is
            and what they need.
          </p>
        </div>

        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.meta.slug}
              href={`/quiz/${quiz.meta.slug}`}
              className="block rounded-lg border p-6 hover:bg-muted/50 transition-colors space-y-2"
            >
              <h2 className="text-xl font-semibold">{quiz.meta.title}</h2>
              <p className="text-muted-foreground">{quiz.meta.description}</p>
              <p className="text-sm text-muted-foreground">
                {quiz.meta.questionCount} questions &middot;{" "}
                {quiz.meta.estimatedTime}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
