"use client";

import type React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import type { CurriculumContent } from "@/content/landing/types";

interface CourseCurriculumSectionProps {
  content: CurriculumContent;
}

function splitCurriculumBody(body: string): { content: string; outcome: string } {
  const contentRegex =
    /(?:Teaches|Content):\s*([\s\S]*?)(?:\s+Outcome:\s*|$)/i;
  const outcomeRegex = /Outcome:\s*([\s\S]*)/i;

  const contentMatch = contentRegex.exec(body);
  const outcomeMatch = outcomeRegex.exec(body);

  const contentText = contentMatch?.[1]?.trim() ?? body.trim();
  const outcomeText = outcomeMatch?.[1]?.trim() ?? "";

  return { content: contentText, outcome: outcomeText };
}

function capitalizeFirstLetter(value: string): string {
  if (value.length === 0) return value;
  const first = value[0];
  if (first === undefined) return value;
  return first.toUpperCase() + value.slice(1);
}

function splitLessonTitle(title: string): { title: string; subtitle: string } {
  const regex = /^(.*?)\s*\(([^)]+)\)\s*$/;
  const match = regex.exec(title);
  if (!match) return { title, subtitle: "" };

  return {
    title: match[1]?.trim() ?? title,
    subtitle: capitalizeFirstLetter(match[2]?.trim() ?? ""),
  };
}

export function CourseCurriculumSection({
  content,
}: CourseCurriculumSectionProps): React.JSX.Element {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="curriculum-heading"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="section-title-gap-lg flex flex-1 flex-col">
            <Tagline>{content.eyebrow}</Tagline>
            <h2 id="curriculum-heading" className="heading-lg text-foreground">
              {content.title}
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              {content.body}
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-8">
            <Accordion
              type="single"
              collapsible
              aria-label="Course lessons"
              defaultValue="lesson-1"
            >
              {content.lessons.map((lesson, index) => (
                <AccordionItem
                  key={`${lesson.title}-${index}`}
                  value={`lesson-${index + 1}`}
                >
                  <AccordionTrigger className="text-left">
                    <div className="flex items-start gap-3">
                      <span className="text-muted-foreground w-6 shrink-0 text-right tabular-nums">
                        {index + 1}.
                      </span>
                      <span className="flex flex-col">
                        {(() => {
                          const { title, subtitle } = splitLessonTitle(lesson.title);
                          return (
                            <>
                              <span className="text-foreground font-medium">
                                {title}
                              </span>
                              {subtitle !== "" ? (
                                <span className="text-muted-foreground text-sm font-normal">
                                  {subtitle}
                                </span>
                              ) : null}
                            </>
                          );
                        })()}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {(() => {
                      const { content: contentText, outcome } = splitCurriculumBody(
                        lesson.body,
                      );

                      return (
                        <div className="flex flex-col gap-3">
                          <p>
                            <span className="text-foreground font-semibold">
                              Content:
                            </span>{" "}
                            {contentText}
                          </p>
                          <p>
                            <span className="text-foreground font-semibold">
                              Outcome:
                            </span>{" "}
                            {outcome}
                          </p>
                        </div>
                      );
                    })()}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
