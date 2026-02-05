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

  // Safe zone: center 800x500 of 1200x630
  // That means ~200px horizontal margin, ~65px vertical margin
  // All critical content must be inside the safe zone
  // Brand + URL can live in the outer sacrificial area

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
          padding: "40px 60px",
        }}
      >
        {/* Brand bar — sacrificial, can be cropped */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              SP
            </div>
            <span style={{ fontSize: "18px", fontWeight: 600, color: "#9ca3af" }}>
              Steady Parent
            </span>
          </div>
          <span style={{ fontSize: "16px", color: "#9ca3af" }}>
            steady-parent.com
          </span>
        </div>

        {/* ── Safe zone content: centered vertically ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 140px",
          }}
        >
          {/* Score ring — centered */}
          <div
            style={{
              position: "relative",
              width: "160px",
              height: "160px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="160"
              height="160"
              viewBox="0 0 160 160"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke={theme.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 68}`}
                strokeDashoffset={`${2 * Math.PI * 68 * (1 - result.percentage / 100)}`}
                transform="rotate(-90 80 80)"
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
                  fontSize: "44px",
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1,
                }}
              >
                {result.percentage}%
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#9ca3af",
                  letterSpacing: "0.1em",
                  marginTop: "2px",
                }}
              >
                READINESS
              </span>
            </div>
          </div>

          {/* Headline + subheadline — centered */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "16px",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontSize: "44px",
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                textAlign: "center" as const,
              }}
            >
              {result.headline}
            </div>
            <div
              style={{
                fontSize: "20px",
                color: "#6b7280",
                lineHeight: 1.3,
                textAlign: "center" as const,
              }}
            >
              {result.subheadline}
            </div>
          </div>

          {/* Domain bars — centered, constrained width */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "24px",
              width: "100%",
              maxWidth: "700px",
            }}
          >
            {result.domains.map((domain) => {
              const barColor = getDomainColor(domain.level);
              return (
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
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    <span>{domain.name}</span>
                    <span style={{ color: barColor }}>
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
                        width: `${Math.max(domain.percentage, 2)}%`,
                        height: "100%",
                        borderRadius: "4px",
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom — sacrificial, can be cropped */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#16a34a",
              color: "white",
              padding: "10px 28px",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            Take the quiz yourself →
          </div>
        </div>
      </div>
    ),
    { ...SIZE }
  );
}

function renderGenericCard(quiz: ReturnType<typeof getQuizBySlug>) {
  if (!quiz) return new Response("Not found", { status: 404 });

  // Same safe-zone approach: critical content centered
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fafafa",
          padding: "40px 60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Brand — sacrificial */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              SP
            </div>
            <span style={{ fontSize: "18px", fontWeight: 600, color: "#9ca3af" }}>
              Steady Parent
            </span>
          </div>
          <span style={{ fontSize: "16px", color: "#9ca3af" }}>
            steady-parent.com
          </span>
        </div>

        {/* ── Safe zone content ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 140px",
            gap: "16px",
          }}
        >
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
              marginTop: "4px",
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
              marginTop: "4px",
            }}
          >
            <span>{quiz.meta.questionCount} questions</span>
            <span>·</span>
            <span>{quiz.meta.estimatedTime}</span>
          </div>
        </div>

        {/* Bottom CTA — sacrificial */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              backgroundColor: "#16a34a",
              color: "white",
              padding: "10px 28px",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: 700,
              display: "flex",
            }}
          >
            Take the quiz →
          </div>
        </div>
      </div>
    ),
    { ...SIZE }
  );
}
