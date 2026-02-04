"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

interface FreebieCTAProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  inputPlaceholder?: string;
  buttonText?: string;
  fullWidth?: boolean;
  variant?: "primary" | "secondary";
}

const defaults = {
  eyebrow: "Not ready for a course yet?",
  title: "Get the Tantrum Reset cheat sheet",
  body: "A 60-second reset you can use mid-tantrum. What to say, what to do, and what to avoid.",
  inputPlaceholder: "Email address",
  buttonText: "Send me the sheet",
};

export function FreebieCTA({
  eyebrow = defaults.eyebrow,
  title = defaults.title,
  body = defaults.body,
  inputPlaceholder = defaults.inputPlaceholder,
  buttonText = defaults.buttonText,
  fullWidth = false,
  variant = "primary",
}: FreebieCTAProps): React.JSX.Element {
  const isPrimary = variant === "primary";

  if (fullWidth) {
    return (
      <section
        className={
          isPrimary
            ? "bg-primary section-padding-y"
            : "bg-background section-padding-y border-y border-border"
        }
      >
        <div className="container-padding-x mx-auto max-w-4xl">
          <div className="flex flex-col gap-8">
            <div className="section-title-gap-lg flex flex-col">
              <Tagline className={isPrimary ? "text-foreground/70" : ""}>
                {eyebrow}
              </Tagline>
              <h2 className="heading-lg text-foreground">{title}</h2>
              <p className="text-muted-foreground text-lg/8 text-pretty">{body}</p>
            </div>
            <form
              className="flex w-full flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <Input
                placeholder={inputPlaceholder}
                type="email"
                required
                className="h-14 flex-1 text-lg"
              />
              <Button
                type="submit"
                variant={isPrimary ? "outline" : "default"}
                size="lg"
                className="h-14 px-10 text-lg"
              >
                {buttonText}
              </Button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={
        isPrimary
          ? "not-prose my-8 rounded-lg bg-primary p-6 md:p-8"
          : "not-prose my-8 rounded-lg border border-border bg-background p-6 md:p-8"
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Tagline className={isPrimary ? "text-foreground/70" : ""}>
            {eyebrow}
          </Tagline>
          <h3 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {title}
          </h3>
          <p className="text-muted-foreground text-base/7 text-pretty">{body}</p>
        </div>

        <form
          className="flex w-full flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <Input
            placeholder={inputPlaceholder}
            type="email"
            required
            className="h-12 flex-1 text-base"
          />
          <Button
            type="submit"
            variant={isPrimary ? "outline" : "default"}
            size="lg"
            className="h-12 px-6 text-base"
          >
            {buttonText}
          </Button>
        </form>
      </div>
    </section>
  );
}
