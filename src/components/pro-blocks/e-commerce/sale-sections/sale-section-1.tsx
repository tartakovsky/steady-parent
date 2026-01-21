"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SaleSection2Props {
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

export default function SaleSection({
  title = "Flash Sale! 33% off!",
  subtitle = "Hurry up! The offer ends soon.",
  buttonText = "Shop now",
  buttonHref = "#",
  endDate,
}: SaleSection2Props) {
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
    <section className="section-padding-y relative overflow-hidden bg-[url('https://ui.shadcn.com/placeholder.svg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/80" />
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="relative mx-auto max-w-xl items-center text-center">
          {/* Title */}
          <h2 className="heading-lg mb-3 text-white">{title}</h2>

          {/* Subtitle */}
          <p className="mb-6 text-base text-white sm:text-lg">{subtitle}</p>

          {/* Countdown Timer */}
          <div className="mb-8 flex items-center justify-center gap-1">
            {/* Days */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex min-h-[48px] min-w-[48px] items-center justify-center bg-white/10 text-xl font-semibold text-white md:min-h-[60px] md:min-w-[60px] md:text-3xl">
                {String(timeRemaining.days).padStart(2, "0")}
              </div>
              <span className="text-xs font-medium text-white uppercase">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex min-h-[48px] min-w-[48px] items-center justify-center bg-white/10 text-xl font-semibold text-white md:min-h-[60px] md:min-w-[60px] md:text-3xl">
                {String(timeRemaining.hours).padStart(2, "0")}
              </div>
              <span className="text-xs font-medium text-white uppercase">
                Hours
              </span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex min-h-[48px] min-w-[48px] items-center justify-center bg-white/10 text-xl font-semibold text-white md:min-h-[60px] md:min-w-[60px] md:text-3xl">
                {String(timeRemaining.minutes).padStart(2, "0")}
              </div>
              <span className="text-xs font-medium text-white uppercase">
                Min
              </span>
            </div>

            {/* Seconds */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex min-h-[48px] min-w-[48px] items-center justify-center bg-white/10 text-xl font-semibold text-white md:min-h-[60px] md:min-w-[60px] md:text-3xl">
                {String(timeRemaining.seconds).padStart(2, "0")}
              </div>
              <span className="text-xs font-medium text-white uppercase">
                Sec
              </span>
            </div>
          </div>

          {/* Button */}
          <Button asChild size="lg">
            <Link href={buttonHref}>{buttonText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
