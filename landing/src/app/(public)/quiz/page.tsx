import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Compass,
  MoonStar,
  Repeat,
  ShieldAlert,
  Heart,
  Eye,
  Zap,
  AlarmClock,
  Clock,
  Users,
  Baby,
  GraduationCap,
  Apple,
  Sun,
  Tent,
  UserPlus,
  Battery,
  Smartphone,
  Brain,
  MessageCircle,
  Shield,
  Sunset,
  ClipboardList,
  Wind,
} from "lucide-react";
import { getAllQuizzes, type AnyQuizData } from "@/lib/quiz";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Parenting Quizzes — Steady Parent",
  description:
    "24 research-backed parenting quizzes: discover your parenting style, check readiness milestones, and build personalized toolkits for your family.",
};

// ── Icon + accent color per quiz ────────────────────────────────────────────

const quizVisuals: Record<string, { icon: LucideIcon; accent: string }> = {
  "parenting-style":       { icon: Compass,       accent: "bg-amber-100 text-amber-700" },
  "bedtime-battle-style":  { icon: MoonStar,      accent: "bg-indigo-100 text-indigo-700" },
  "parents-patterns":      { icon: Repeat,         accent: "bg-rose-100 text-rose-700" },
  "worried-parent":        { icon: ShieldAlert,    accent: "bg-orange-100 text-orange-700" },
  "parenting-love-language": { icon: Heart,        accent: "bg-pink-100 text-pink-700" },
  "kid-describe-you":      { icon: Eye,            accent: "bg-violet-100 text-violet-700" },
  "parenting-superpower":  { icon: Zap,            accent: "bg-yellow-100 text-yellow-700" },
  "parent-at-2am":         { icon: AlarmClock,     accent: "bg-slate-100 text-slate-700" },
  "parenting-era":         { icon: Clock,          accent: "bg-teal-100 text-teal-700" },
  "co-parent-team":        { icon: Users,          accent: "bg-sky-100 text-sky-700" },
  "potty-training-readiness": { icon: Baby,        accent: "bg-emerald-100 text-emerald-700" },
  "kindergarten-readiness": { icon: GraduationCap, accent: "bg-blue-100 text-blue-700" },
  "solid-foods-readiness": { icon: Apple,          accent: "bg-lime-100 text-lime-700" },
  "drop-the-nap":          { icon: Sun,            accent: "bg-amber-100 text-amber-700" },
  "sleepover-readiness":   { icon: Tent,           accent: "bg-cyan-100 text-cyan-700" },
  "second-child-readiness": { icon: UserPlus,      accent: "bg-fuchsia-100 text-fuchsia-700" },
  "parenting-battery":     { icon: Battery,        accent: "bg-red-100 text-red-700" },
  "screen-dependence":     { icon: Smartphone,     accent: "bg-zinc-100 text-zinc-700" },
  "emotional-intelligence": { icon: Brain,         accent: "bg-purple-100 text-purple-700" },
  "social-confidence":     { icon: MessageCircle,  accent: "bg-sky-100 text-sky-700" },
  "communication-safety":  { icon: Shield,         accent: "bg-green-100 text-green-700" },
  "bedtime-routine":       { icon: Sunset,         accent: "bg-indigo-100 text-indigo-700" },
  "age-appropriate-chores": { icon: ClipboardList, accent: "bg-orange-100 text-orange-700" },
  "calm-down-toolkit":     { icon: Wind,           accent: "bg-teal-100 text-teal-700" },
};

// ── Group quizzes by purpose ────────────────────────────────────────────────

interface QuizGroup {
  title: string;
  description: string;
  slugs: string[];
}

const groups: QuizGroup[] = [
  {
    title: "Discover Your Parenting Style",
    description: "Fun personality-style quizzes that reveal how you parent — no right or wrong answers.",
    slugs: [
      "parenting-style",
      "bedtime-battle-style",
      "parents-patterns",
      "worried-parent",
      "parenting-love-language",
      "kid-describe-you",
      "parenting-superpower",
      "parent-at-2am",
      "parenting-era",
      "co-parent-team",
    ],
  },
  {
    title: "Is Your Child Ready?",
    description: "Evidence-based readiness checks for key milestones and transitions.",
    slugs: [
      "potty-training-readiness",
      "kindergarten-readiness",
      "solid-foods-readiness",
      "drop-the-nap",
      "sleepover-readiness",
      "second-child-readiness",
    ],
  },
  {
    title: "Family Check-Ups",
    description: "Quick assessments of how things are going — for you and your child.",
    slugs: [
      "parenting-battery",
      "screen-dependence",
      "emotional-intelligence",
      "social-confidence",
      "communication-safety",
    ],
  },
  {
    title: "Build a Toolkit",
    description: "Get personalized strategies and routines based on your answers.",
    slugs: [
      "calm-down-toolkit",
      "bedtime-routine",
      "age-appropriate-chores",
    ],
  },
];

// ── Components ──────────────────────────────────────────────────────────────

function QuizCard({ quiz }: { quiz: AnyQuizData }) {
  const slug = quiz.meta.slug;
  const visual = quizVisuals[slug];
  const Icon = visual?.icon ?? Compass;
  const accent = visual?.accent ?? "bg-muted text-muted-foreground";

  return (
    <Link
      href={`/quiz/${slug}`}
      className="group flex flex-col rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <div className={cn("shrink-0 rounded-lg p-2.5", accent)}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary-foreground/80">
            {quiz.meta.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {quiz.meta.description}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {quiz.meta.questionCount} questions &middot; {quiz.meta.estimatedTime}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function QuizIndexPage() {
  const allQuizzes = getAllQuizzes();
  const quizBySlug = new Map(allQuizzes.map((q) => [q.meta.slug, q]));

  return (
    <main className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-6xl space-y-14">
        {/* Page header */}
        <header className="mx-auto max-w-2xl space-y-3 text-center">
          <h1 className="heading-lg">Parenting Quizzes</h1>
          <p className="text-muted-foreground text-lg/7 text-pretty">
            24 research-backed quizzes to understand your parenting style, check
            readiness milestones, and get personalized strategies for your family.
          </p>
        </header>

        {/* Quiz groups */}
        {groups.map((group) => {
          const quizzes = group.slugs
            .map((s) => quizBySlug.get(s))
            .filter((q): q is AnyQuizData => q != null);

          if (quizzes.length === 0) return null;

          return (
            <section key={group.title} className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {group.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {group.description}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz) => (
                  <QuizCard key={quiz.meta.slug} quiz={quiz} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
