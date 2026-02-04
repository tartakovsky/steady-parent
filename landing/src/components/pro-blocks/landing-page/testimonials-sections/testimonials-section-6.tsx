"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
export function TestimonialsSection6() {
  return (
    <section className="bg-secondary section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <Image
            src="https://ui.shadcn.com/placeholder.svg"
            alt="Placeholder image"
            width={460}
            height={460}
            className="aspect-square w-full rounded-xl object-cover lg:max-w-lg"
          />

          <div className="flex flex-col gap-8 lg:gap-12">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <Tagline>Testimonials Section</Tagline>
                <blockquote className="text-secondary-foreground text-xl font-semibold lg:text-2xl">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Vivamus interdum hendrerit ex vitae sodales. Donec id leo
                  ipsum. Phasellus volutpat aliquet mauris, et blandit nulla
                  laoreet vitae. Quisque ante dui, porta eu felis nec,
                  scelerisque pharetra turpis."
                </blockquote>
                <cite className="font-medium not-italic">
                  Brandon Richards
                  <br />
                  CEO of CompanyName
                </cite>
              </div>
            </div>

            <div>
              <Button variant="outline">
                Learn more
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
