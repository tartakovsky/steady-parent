import { ImageResponse } from "next/og";
import { getQuizBySlug, getAllQuizSlugs } from "@/lib/quiz";

export const alt = "Quiz Result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generate for all known slugs
export function generateStaticParams() {
  return getAllQuizSlugs().map((slug) => ({ slug }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);

  if (!quiz) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fafafa",
            fontSize: 48,
            fontWeight: 700,
            color: "#111",
          }}
        >
          Quiz Not Found
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fafafa",
          padding: "60px 70px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            SP
          </div>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "-0.01em",
            }}
          >
            Steady Parent
          </span>
        </div>

        {/* Middle: quiz title */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#16a34a",
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
            }}
          >
            Interactive Quiz
          </div>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: "900px",
            }}
          >
            {quiz.meta.title}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#6b7280",
              lineHeight: 1.4,
              maxWidth: "800px",
              marginTop: "8px",
            }}
          >
            {quiz.meta.description}
          </div>
        </div>

        {/* Bottom: CTA + meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              backgroundColor: "#16a34a",
              color: "white",
              padding: "16px 36px",
              borderRadius: "12px",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            Take the quiz
          </div>
          <div
            style={{
              display: "flex",
              gap: "24px",
              fontSize: "20px",
              color: "#9ca3af",
            }}
          >
            <span>{quiz.meta.questionCount} questions</span>
            <span>{quiz.meta.estimatedTime}</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
