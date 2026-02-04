"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function HeroSection5() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:gap-8 lg:text-left">
          <div className="section-title-gap-xl flex flex-col items-center text-center lg:items-start lg:text-left">
            <Tagline variant="link">
              <span className="size-1.5 rounded-full bg-green-500" />
              <span className="hidden lg:inline">What's new · </span>
              <span className="lg:text-muted-foreground">
                Just shipped v2.0
              </span>
              <ArrowUpRight />
            </Tagline>
            <h1 id="hero-heading" className="heading-xl">
              Solve your user's main problem
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Follow with one or two sentences that expand on your value
              proposition and focus on key benefits.
            </p>
          </div>

          <form
            className="flex w-full flex-col gap-3 md:max-w-sm md:flex-row"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Email signup form"
          >
            <Field className="flex-1">
              <FieldLabel htmlFor="hero5-email" className="sr-only">
                Email
              </FieldLabel>
              <InputGroup className="h-12 md:h-auto">
                <InputGroupInput
                  id="hero5-email"
                  placeholder="Your email"
                  type="email"
                  required
                  aria-required="true"
                />
              </InputGroup>
            </Field>
            <Button className="h-12 md:h-auto">
              Sign up
              <ArrowRight />
            </Button>
          </form>
        </div>
        <div className="w-full flex-1">
          <AspectRatio ratio={4 / 3}>
            <video
              className="h-full w-full rounded-lg object-cover"
              controls
              preload="none"
              aria-label="Product demonstration video"
            >
              <source src="/path/to/video.mp4" type="video/mp4" />
              <track
                src="/path/to/captions.vtt"
                kind="subtitles"
                srcLang="en"
                label="English"
              />
              Your browser does not support the video tag.
            </video>
          </AspectRatio>
        </div>
      </div>
    </section>
  );
}
