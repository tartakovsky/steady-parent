import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { getQuizBySlug } from "@/lib/quiz";
import { QuizEngine } from "@/lib/quiz/quiz-engine";
import { decodeAnswers } from "@/lib/quiz/quiz-url";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

const R2_PUBLIC_BASE_URL: string | undefined =
  process.env["NEXT_PUBLIC_R2_PUBLIC_BASE_URL"];

function r2Url(path: string): string {
  if (typeof R2_PUBLIC_BASE_URL === "string" && R2_PUBLIC_BASE_URL.length > 0) {
    return `${R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  }
  return path;
}

const LOGO_SRC = r2Url("sdp_logo_big_text.png");

function getTheme(resultId: string) {
  switch (resultId) {
    case "ready":
      return { color: "#16a34a", bg: "#f0fdf4" };
    case "almost":
      return { color: "#16a34a", bg: "#f0fdf4" };
    case "not-yet":
      return { color: "#ea580c", bg: "#fff7ed" };
    default:
      return { color: "#6366f1", bg: "#f5f3ff" };
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

  const RING = 280;
  const R = 118;
  const STROKE = 18;
  const circumference = 2 * Math.PI * R;
  const offset = circumference * (1 - result.percentage / 100);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: theme.bg,
          fontFamily: "system-ui, sans-serif",
          padding: "65px 200px",
          position: "relative",
        }}
      >
        {/* Logo — bottom right */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_SRC}
          alt=""
          width={280}
          style={{ position: "absolute", bottom: "20px", right: "20px" }}
        />

        {/* Quiz title — top */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: 800,
            color: "#111827",
            textAlign: "center" as const,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          {quiz.meta.shortTitle}
        </div>

        {/* Middle — vertically centered between title and CTA */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Inner — ring and text top-aligned */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "32px",
            }}
          >
            {/* Score ring */}
            <div
              style={{
                position: "relative",
                width: `${RING}px`,
                height: `${RING}px`,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width={RING}
                height={RING}
                viewBox={`0 0 ${RING} ${RING}`}
                style={{ position: "absolute", top: 0, left: 0 }}
              >
                <circle
                  cx={RING / 2}
                  cy={RING / 2}
                  r={R}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth={STROKE}
                />
                <circle
                  cx={RING / 2}
                  cy={RING / 2}
                  r={R}
                  fill="none"
                  stroke={theme.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${offset}`}
                  transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
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
                    fontSize: "84px",
                    fontWeight: 800,
                    color: "#111827",
                    lineHeight: 1,
                  }}
                >
                  {result.percentage}%
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#9ca3af",
                    letterSpacing: "0.12em",
                    marginTop: "3px",
                  }}
                >
                  READINESS
                </span>
              </div>
            </div>

            {/* Result info — top-aligned with ring */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                paddingTop: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
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
                  fontSize: "52px",
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                }}
              >
                {result.headline}
              </div>
              <div
                style={{
                  fontSize: "26px",
                  color: "#6b7280",
                  lineHeight: 1.35,
                  maxWidth: "420px",
                }}
              >
                {result.subheadline}
              </div>
            </div>
          </div>
        </div>

        {/* CTA — bottom */}
        <div
          style={{
            backgroundColor: "#16a34a",
            color: "white",
            fontSize: "32px",
            fontWeight: 700,
            padding: "24px 80px",
            borderRadius: "18px",
            letterSpacing: "-0.01em",
            flexShrink: 0,
            display: "flex",
          }}
        >
          Take the Quiz Yourself →
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
          padding: "65px 200px",
          fontFamily: "system-ui, sans-serif",
          gap: "20px",
          position: "relative",
        }}
      >
        {/* Logo — bottom right */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_SRC}
          alt=""
          width={280}
          style={{ position: "absolute", bottom: "20px", right: "20px" }}
        />

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
            padding: "24px 80px",
            borderRadius: "18px",
            fontSize: "32px",
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
