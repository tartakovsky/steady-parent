"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SaleSection1Props {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  endDate?: Date;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function SaleSection5({
  title = "Flash Sale! 33% off!",
  subtitle = "Hurry up! The offer ends soon.",
  buttonText = "Shop now",
  buttonHref = "#",
  endDate,
}: SaleSection1Props) {
  const defaultEndDate = useMemo(
    () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    [],
  );
  const targetDate = endDate ?? defaultEndDate;

  const endTimestamp = useMemo(() => targetDate.getTime(), [targetDate]);

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const difference = endTimestamp - now;

      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    calculateTimeRemaining();

    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endTimestamp]);

  return (
    <section className="bg-primary/10 section-padding-y">
      <div className="container-padding-x mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2">
        <div className="bg-background relative max-w-xl rounded-lg p-6">
          {/* Title */}
          <h2 className="heading-lg text-foreground mb-3">{title}</h2>
          {/* Subtitle */}
          <p className="text-muted-foreground mb-6 text-base sm:text-lg">
            {subtitle}
          </p>
          {/* Button */}
          <Button asChild size="lg">
            <Link href={buttonHref}>{buttonText}</Link>
          </Button>
        </div>
        {/* Countdown Timer */}
        <div className="flex items-stretch gap-3">
          {/* Days */}
          <div className="flex h-full w-1/4 flex-col items-center gap-2">
            <div className="bg-background text-foreground heading-lg flex h-full min-h-[100px] w-full items-center justify-center rounded-lg">
              {String(timeRemaining.days).padStart(2, "0")}
            </div>
            <span className="text-muted-foreground text-sm font-medium uppercase">
              Days
            </span>
          </div>

          {/* Hours */}
          <div className="flex h-full w-1/4 flex-col items-center gap-2">
            <div className="bg-background text-foreground heading-lg flex h-full min-h-[100px] w-full items-center justify-center rounded-lg">
              {String(timeRemaining.hours).padStart(2, "0")}
            </div>
            <span className="text-muted-foreground text-sm font-medium uppercase">
              Hours
            </span>
          </div>

          {/* Minutes */}
          <div className="flex h-full w-1/4 flex-col items-center gap-2">
            <div className="bg-background text-foreground heading-lg flex h-full min-h-[100px] w-full items-center justify-center rounded-lg">
              {String(timeRemaining.minutes).padStart(2, "0")}
            </div>
            <span className="text-muted-foreground text-sm font-medium uppercase">
              Minutes
            </span>
          </div>

          {/* Seconds */}
          <div className="flex h-full w-1/4 flex-col items-center gap-2">
            <div className="bg-background text-foreground heading-lg flex h-full min-h-[100px] w-full items-center justify-center rounded-lg">
              {String(timeRemaining.seconds).padStart(2, "0")}
            </div>
            <span className="text-muted-foreground text-sm font-medium uppercase">
              Seconds
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
