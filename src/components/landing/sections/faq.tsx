import type React from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FaqItem } from "@/content/landing/content";

export interface LandingFaqProps {
  id?: string;
  items: readonly FaqItem[];
}

export function LandingFaq({ id, items }: LandingFaqProps): React.JSX.Element {
  return (
    <section id={id} className="py-14">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-semibold tracking-tight">FAQ</h2>
        <div className="mt-6">
          <Accordion type="single" collapsible>
            {items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-7">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

