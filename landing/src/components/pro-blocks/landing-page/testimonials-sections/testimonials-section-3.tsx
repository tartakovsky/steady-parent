"use client";

import { Star } from "lucide-react";
import Image from "next/image";

export function TestimonialsSection3() {
  return (
    <section className="bg-muted/40 section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16">
          <Image
            src="https://ui.shadcn.com/placeholder.svg"
            alt="Testimonial image"
            width={1200}
            height={1200}
            className="rounded-xl"
          />
          <div className="flex flex-col items-center gap-8 md:items-start">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-6 w-6 fill-yellow-500 text-yellow-500"
                />
              ))}
            </div>

            <blockquote className="text-foreground text-center text-lg font-medium md:text-left lg:text-2xl">
              &quot;We absolutely love how the Shadcn UI Kit blends
              functionality and aesthetics seamlessly. It fits perfectly into
              our design workflow and gives us the flexibility to create
              stunning, professional and high-quality designs
              effortlessly.&quot;
            </blockquote>

            <div className="flex flex-col items-center space-y-0.5 md:items-start">
              <span className="text-foreground text-base font-semibold">
                Lando Norris
              </span>
              <span className="text-muted-foreground text-base">
                CEO at Acme Inc.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
