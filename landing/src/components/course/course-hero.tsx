"use client";

import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2 } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { FieldDescription } from "@/components/ui/field";

const STORAGE_KEY = "sp_subscriber_email";

function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "";
  }
}

interface CourseHeroProps {
  eyebrow: string;
  title: string;
  body: string;
  bullets: readonly string[];
  category: string;
}

export function CourseHero({
  eyebrow,
  title,
  body,
  bullets,
  category,
}: CourseHeroProps): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          category,
          timezone: getBrowserTimezone(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Subscription failed");
      }

      localStorage.setItem(STORAGE_KEY, email);
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex w-full max-w-2xl flex-1 flex-col gap-6 lg:max-w-none lg:gap-8">
          <div className="section-title-gap-xl flex flex-col">
            <Tagline>{eyebrow}</Tagline>
            <h1 id="hero-heading" className="heading-xl">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty whitespace-pre-line">
              {body}
            </p>
            {bullets.length > 0 ? (
              <div className="flex flex-col gap-2">
                {bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3">
                    <Check className="text-primary size-5" />
                    <span className="text-muted-foreground leading-5 font-medium">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <form
              className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
              onSubmit={handleSubmit}
              aria-label="Course waitlist signup"
            >
              <Input
                placeholder="Your email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                className="min-h-14 flex-1 text-lg md:text-lg"
              />
              <Button
                type="submit"
                size="lg"
                disabled={status === "loading"}
                className="h-14 px-10 text-lg"
              >
                {status === "loading" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Reserve your spot"
                )}
              </Button>
            </form>
            {status === "success" && (
              <p className="text-sm font-medium text-green-600">
                You're on the list — check your inbox for a confirmation email.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm font-medium text-destructive">
                {errorMsg}
              </p>
            )}
            {status !== "success" && status !== "error" && (
              <FieldDescription className="text-sm leading-tight">
                No charge. We'll notify you when the course launches.
              </FieldDescription>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
