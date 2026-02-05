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
      return { color: "#d97706", bg: "#fffbeb", accent: "#fde68a" };
    case "not-yet":
      return { color: "#ea580c", bg: "#fff7ed", accent: "#fed7aa" };
    default:
      return { color: "#6366f1", bg: "#f5f3ff", accent: "#c4b5fd" };
  }
}

const DOMAIN_COLORS = ["#0d9488", "#6366f1", "#e11d48"];

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
          padding: "50px 60px",
        }}
      >
        {/* Top row: brand + quiz name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "30px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              SP
            </div>
            <span
              style={{ fontSize: "20px", fontWeight: 600, color: "#9ca3af" }}
            >
              Steady Parent
            </span>
          </div>
          <span style={{ fontSize: "18px", color: "#9ca3af" }}>
            {quiz.meta.shortTitle}
          </span>
        </div>

        {/* Main content: score + result */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "50px",
          }}
        >
          {/* Score ring */}
          <div
            style={{
              position: "relative",
              width: "200px",
              height: "200px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="14"
              />
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke={theme.color}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 85}`}
                strokeDashoffset={`${2 * Math.PI * 85 * (1 - result.percentage / 100)}`}
                transform="rotate(-90 100 100)"
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
                  fontSize: "52px",
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1,
                }}
              >
                {result.percentage}%
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#9ca3af",
                  letterSpacing: "0.1em",
                  marginTop: "4px",
                }}
              >
                READINESS
              </span>
            </div>
          </div>

          {/* Result text + domains */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px",
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
                fontSize: "48px",
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
                fontSize: "22px",
                color: "#6b7280",
                lineHeight: 1.3,
              }}
            >
              {result.subheadline}
            </div>

            {/* Domain bars */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              {result.domains.map((domain, i) => (
                <div
                  key={domain.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    <span>{domain.name}</span>
                    <span style={{ color: DOMAIN_COLORS[i % 3] }}>
                      {domain.percentage}%
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      height: "8px",
                      borderRadius: "4px",
                      backgroundColor: "#e5e7eb",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${domain.percentage}%`,
                        height: "100%",
                        borderRadius: "4px",
                        backgroundColor: DOMAIN_COLORS[i % 3],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              backgroundColor: theme.color,
              color: "white",
              padding: "14px 32px",
              borderRadius: "12px",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            Take the quiz
          </div>
          <span style={{ fontSize: "18px", color: "#9ca3af" }}>
            steady-parent.com
          </span>
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
          backgroundColor: "#fafafa",
          padding: "60px 70px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
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
            }}
          >
            Steady Parent
          </span>
        </div>
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
              backgroundColor: "#16a34a",
              color: "white",
              padding: "16px 36px",
              borderRadius: "12px",
              fontSize: "22px",
              fontWeight: 700,
              display: "flex",
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
    { ...SIZE }
  );
}
