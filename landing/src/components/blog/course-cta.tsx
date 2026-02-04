"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

interface CourseCTAProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  buttonText?: string;
  href?: string;
  fullWidth?: boolean;
  variant?: "primary" | "secondary";
}

const defaults = {
  eyebrow: "Ready to start?",
  title: "Join the Steady Parent Method",
  body: "A system for parenting without losing it. Get fewer blowups, firm boundaries, and a kid who still wants you.",
  buttonText: "Join the course",
  href: "/#course",
};

export function CourseCTA({
  eyebrow = defaults.eyebrow,
  title = defaults.title,
  body = defaults.body,
  buttonText = defaults.buttonText,
  href = defaults.href,
  fullWidth = false,
  variant = "primary",
}: CourseCTAProps): React.JSX.Element {
  const isPrimary = variant === "primary";
  const isExternal = !href.startsWith("/") && !href.startsWith("#");

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
              <Tagline className={isPrimary ? "text-primary-foreground/80" : ""}>
                {eyebrow}
              </Tagline>
              <h2
                className={
                  isPrimary
                    ? "heading-lg text-primary-foreground"
                    : "heading-lg text-foreground"
                }
              >
                {title}
              </h2>
              <p
                className={
                  isPrimary
                    ? "text-primary-foreground/80 text-lg/8 text-pretty"
                    : "text-muted-foreground text-lg/8 text-pretty"
                }
              >
                {body}
              </p>
            </div>
            <Button
              asChild
              className={
                isPrimary
                  ? "bg-primary-foreground text-primary hover:bg-primary-foreground/80 w-fit"
                  : "w-fit"
              }
            >
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                {buttonText}
                <ArrowRight />
              </a>
            </Button>
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
      <div className="flex flex-col items-start gap-6">
        <div className="flex flex-col gap-3">
          <Tagline className={isPrimary ? "text-primary-foreground/80" : ""}>
            {eyebrow}
          </Tagline>
          <h3
            className={
              isPrimary
                ? "text-2xl font-bold tracking-tight text-primary-foreground md:text-3xl"
                : "text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            }
          >
            {title}
          </h3>
          <p
            className={
              isPrimary
                ? "text-primary-foreground/80 text-base/7 text-pretty"
                : "text-muted-foreground text-base/7 text-pretty"
            }
          >
            {body}
          </p>
        </div>

        <Button
          asChild
          className={
            isPrimary
              ? "bg-primary-foreground text-primary hover:bg-primary-foreground/80"
              : ""
          }
        >
          <a
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
          >
            {buttonText}
            <ArrowRight />
          </a>
        </Button>
      </div>
    </section>
  );
}
