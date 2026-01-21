"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "Shadcn UI Kit for Figma has completely transformed our design process. It's incredibly intuitive and saves us so much time. The components are beautifully crafted and customizable.",
    author: "Lando Norris",
    position: "CEO at Acme Inc.",
    avatar: "https://github.com/shadcn.png",
  },
  {
    quote:
      "The attention to detail in Shadcn UI is remarkable. We've improved our product delivery timeline by 40% since implementing it in our workflow.",
    author: "Jane Cooper",
    position: "Design Lead at TechFlow",
    avatar: "https://github.com/shadcn.png",
  },
  {
    quote:
      "After switching to Shadcn UI, our designer-developer handoff has never been smoother. The consistency across components makes implementation a breeze.",
    author: "Alex Morgan",
    position: "Frontend Developer at StartHub",
    avatar: "https://github.com/shadcn.png",
  },
];

export function TestimonialsSection7() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section
      className="bg-muted container-padding-x section-padding-y flex flex-col items-center"
      aria-labelledby="testimonial-carousel"
    >
      <div className="w-full max-w-4xl">
        <Carousel className="relative mx-auto" setApi={setApi}>
          <div className="pointer-events-none absolute inset-y-0 right-0 left-0 z-10 hidden items-center justify-between md:flex">
            <div className="pointer-events-auto">
              <CarouselPrevious className="relative left-[-1rem] h-10 w-10" />
            </div>
            <div className="pointer-events-auto">
              <CarouselNext className="relative right-[-1rem] h-10 w-10" />
            </div>
          </div>

          <CarouselContent className="px-2 sm:px-4">
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="pt-4 md:pt-6">
                <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-2 md:gap-8 md:px-4">
                  <blockquote className="text-foreground text-center text-base/7 font-medium text-pretty sm:text-lg md:text-xl">
                    &quot;{testimonial.quote}&quot;
                  </blockquote>

                  <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
                    <Avatar className="h-10 w-10 rounded-xl md:h-12 md:w-12 lg:h-14 lg:w-14">
                      <AvatarImage
                        src={testimonial.avatar}
                        alt={testimonial.author}
                      />
                    </Avatar>

                    <div className="flex flex-col items-center gap-0.5 md:items-start">
                      <span className="text-foreground font-medium">
                        {testimonial.author}
                      </span>
                      <span className="text-muted-foreground">
                        {testimonial.position}
                      </span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-8 flex justify-center gap-1.5 md:hidden">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  current === i ? "bg-primary w-4" : "bg-muted-foreground/20",
                )}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  );
}
