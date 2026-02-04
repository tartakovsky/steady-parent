"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function TestimonialsSection5() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="testimonial-title"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg flex max-w-xl flex-col items-center text-center md:items-start md:text-left">
            <Tagline>Testimonial section</Tagline>
            <h2 id="testimonial-title" className="heading-lg text-foreground">
              Focus on trust and results
            </h2>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:gap-12">
            <div className="flex flex-col gap-8">
              <p className="text-foreground text-center text-lg/8 font-medium text-pretty md:text-left">
                &quot;Shadcn UI Kit for Figma has completely transformed our
                design process. It&apos;s incredibly intuitive and saves us so
                much time. The components are beautifully crafted and
                customizable.&quot;
              </p>

              <div className="flex flex-col items-center gap-5 md:flex-row">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Lando Norris"
                  />
                  <AvatarFallback>LN</AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-1 text-center md:text-left">
                  <p className="text-foreground text-base leading-6 font-semibold">
                    Lando Norris
                  </p>
                  <p className="text-muted-foreground text-base leading-6">
                    Founder at Acme Inc.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-border hidden w-[1px] self-stretch md:block" />
            <Separator
              className="bg-border md:hidden"
              orientation="horizontal"
            />

            <div className="flex flex-col gap-8">
              <p className="text-foreground text-center text-lg/8 font-medium text-pretty md:text-left">
                &quot;Shadcn UI Kit for Figma has completely transformed our
                design process. It&apos;s incredibly intuitive and saves us so
                much time. The components are beautifully crafted and
                customizable.&quot;
              </p>

              <div className="flex flex-col items-center gap-5 md:flex-row">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Lando Norris"
                  />
                  <AvatarFallback>LN</AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-1 text-center md:text-left">
                  <p className="text-foreground text-base leading-6 font-semibold">
                    Lando Norris
                  </p>
                  <p className="text-muted-foreground text-base leading-6">
                    Founder at Acme Inc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
