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
                    {index + 1}. {lesson.title}
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
