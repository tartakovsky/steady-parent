import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { getQuizBySlug } from "@/lib/quiz";
import { QuizEngine } from "@/lib/quiz/quiz-engine";
import { decodeAnswers } from "@/lib/quiz/quiz-url";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

function getTheme(resultId: string) {
  switch (resultId) {
    case "ready":
      return { color: "#16a34a", bg: "#f0fdf4", accent: "#bbf7d0" };
    case "almost":
      return { color: "#16a34a", bg: "#f0fdf4", accent: "#bbf7d0" };
    case "not-yet":
      return { color: "#ea580c", bg: "#fff7ed", accent: "#fed7aa" };
    default:
      return { color: "#6366f1", bg: "#f5f3ff", accent: "#c4b5fd" };
  }
}

function getDomainColor(level: string): string {
  switch (level) {
    case "high":
      return "#16a34a";
    case "medium":
      return "#d97706";
    case "low":
      return "#ea580c";
    default:
      return "#6b7280";
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get("slug");
  const answersRaw = searchParams.get("a");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const quiz = getQuizBySlug(slug);
  if (!quiz) {
    return new Response("Quiz not found", { status: 404 });
  }

  // If no answers or incomplete, render generic card
  if (!answersRaw || answersRaw.length !== quiz.questions.length) {
    return renderGenericCard(quiz);
  }

  // Decode answers and compute result
  const answers = decodeAnswers(answersRaw, quiz.questions);
  if (!answers) {
    return renderGenericCard(quiz);
  }

  const engine = new QuizEngine(quiz);
  const result = engine.assembleResult(answers);
  const theme = getTheme(result.resultId);

  // Safe zone: center ~800x500 of 1200x630
  // Padding: 200px left/right, 65px top/bottom
  // ALL content must be inside the safe zone

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.bg,
          fontFamily: "system-ui, sans-serif",
          padding: "30px 200px",
        }}
      >
        {/* Brand — centered, inside safe zone */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            SP
          </div>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#9ca3af" }}>
            Steady Parent
          </span>
          <span style={{ fontSize: "16px", color: "#d1d5db" }}>·</span>
          <span style={{ fontSize: "16px", color: "#9ca3af" }}>
            {quiz.meta.shortTitle}
          </span>
        </div>

        {/* Hero row: ring LEFT + text RIGHT (like the result page) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
            flex: 1,
          }}
        >
          {/* Score ring */}
          <div
            style={{
              position: "relative",
              width: "180px",
              height: "180px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <circle
                cx="90"
                cy="90"
                r="76"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="13"
              />
              <circle
                cx="90"
                cy="90"
                r="76"
                fill="none"
                stroke={theme.color}
                strokeWidth="13"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 76}`}
                strokeDashoffset={`${2 * Math.PI * 76 * (1 - result.percentage / 100)}`}
                transform="rotate(-90 90 90)"
              />
            </svg>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "48px",
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1,
                }}
              >
                {result.percentage}%
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#9ca3af",
                  letterSpacing: "0.1em",
                  marginTop: "3px",
                }}
              >
                READINESS
              </span>
            </div>
          </div>

          {/* Text: headline + subheadline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: theme.color,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
              }}
            >
              My result
            </div>
            <div
              style={{
                fontSize: "42px",
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {result.headline}
            </div>
            <div
              style={{
                fontSize: "20px",
                color: "#6b7280",
                lineHeight: 1.3,
              }}
            >
              {result.subheadline}
            </div>
          </div>
        </div>

        {/* Domain bars — stacked vertically for readability */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "16px",
          }}
        >
          {result.domains.map((domain) => {
            const barColor = getDomainColor(domain.level);
            return (
              <div
                key={domain.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#374151",
                    width: "220px",
                    flexShrink: 0,
                  }}
                >
                  {domain.name}
                </span>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    height: "10px",
                    borderRadius: "5px",
                    backgroundColor: "#e5e7eb",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(domain.percentage, 3)}%`,
                      height: "100%",
                      borderRadius: "5px",
                      backgroundColor: barColor,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: barColor,
                    width: "40px",
                    textAlign: "right" as const,
                  }}
                >
                  {domain.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    ),
    { ...SIZE }
  );
}

function renderGenericCard(quiz: ReturnType<typeof getQuizBySlug>) {
  if (!quiz) return new Response("Not found", { status: 404 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa",
          padding: "30px 200px",
          fontFamily: "system-ui, sans-serif",
          gap: "20px",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            SP
          </div>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#9ca3af" }}>
            Steady Parent
          </span>
        </div>

        <div
          style={{
            fontSize: "18px",
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
            fontSize: "48px",
            fontWeight: 800,
            color: "#111827",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            textAlign: "center" as const,
          }}
        >
          {quiz.meta.title}
        </div>
        <div
          style={{
            fontSize: "22px",
            color: "#6b7280",
            lineHeight: 1.4,
            textAlign: "center" as const,
          }}
        >
          {quiz.meta.description}
        </div>
        <div
          style={{
            display: "flex",
            gap: "20px",
            fontSize: "16px",
            color: "#9ca3af",
          }}
        >
          <span>{quiz.meta.questionCount} questions</span>
          <span>·</span>
          <span>{quiz.meta.estimatedTime}</span>
        </div>
        <div
          style={{
            backgroundColor: "#16a34a",
            color: "white",
            padding: "12px 32px",
            borderRadius: "10px",
            fontSize: "18px",
            fontWeight: 700,
            display: "flex",
            marginTop: "4px",
          }}
        >
          Take the quiz →
        </div>
      </div>
    ),
    { ...SIZE }
  );
}
