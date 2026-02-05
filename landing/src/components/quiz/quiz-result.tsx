"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, AlertTriangle, RotateCcw, Share2 } from "lucide-react";
import type { QuizResult as QuizResultType } from "@/lib/quiz/quiz-engine";

interface QuizResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: QuizResultType;
  quizMeta: { title: string; shortTitle: string };
  onRetake?: () => void;
}

export function QuizResult({
  result,
  quizMeta,
  onRetake,
  className,
  ...props
}: QuizResultProps) {
  const handleShare = async () => {
    const shareData = {
      title: quizMeta.shortTitle,
      text: `I got "${result.headline}" on the ${quizMeta.shortTitle}!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed - fall back to clipboard
        await navigator.clipboard.writeText(window.location.href);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  // Determine result color based on result ID
  const getResultColor = () => {
    switch (result.resultId) {
      case "ready":
        return "text-green-600";
      case "almost":
        return "text-amber-600";
      case "not-yet":
        return "text-orange-600";
      default:
        return "text-primary";
    }
  };

  return (
    <div className={cn("space-y-8", className)} {...props}>
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className={cn("heading-lg", getResultColor())}>{result.headline}</h1>
        <p className="text-xl text-muted-foreground">{result.subheadline}</p>
        <p className="text-foreground">{result.explanation}</p>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {result.totalScore} of {result.maxScore} points
            </span>
            <span className="font-medium">{result.percentage}%</span>
          </div>
          <Progress value={result.percentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Domain Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Breakdown by Area</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {result.domains.map((domain) => (
            <div key={domain.id} className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{domain.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {domain.headline}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {domain.score}/{domain.maxScore}
                </span>
              </div>
              <Progress value={domain.percentage} className="h-2" />
              <p className="text-sm text-muted-foreground">{domain.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths */}
      {result.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-1 shrink-0 text-green-600" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Concerns */}
      {result.concerns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Areas to Watch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.concerns.map((concern, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-1 shrink-0 text-amber-600" />
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="text-foreground">
                {step}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Watch Out For */}
      {result.watchOutFor && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Watch Out For
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{result.watchOutFor}</p>
          </CardContent>
        </Card>
      )}

      {/* Encouragement */}
      <div className="p-6 bg-primary/5 rounded-lg">
        <p className="text-lg italic text-foreground">{result.encouragement}</p>
      </div>

      {/* Retake Advice */}
      {result.retakeAdvice && (
        <p className="text-muted-foreground">
          {result.retakeAdvice}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetake && (
          <Button variant="outline" onClick={onRetake} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </Button>
        )}
        <Button onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Results
        </Button>
      </div>
    </div>
  );
}
