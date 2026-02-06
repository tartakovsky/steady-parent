"use client";

import { useEffect, useRef } from "react";
import { motion, animate } from "framer-motion";

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      delay: 0.3,
      onUpdate(v) {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value]);

  return <span ref={ref}>0</span>;
}

function ScoreRing({
  percentage,
  color,
  size = 200,
  strokeWidth = 14,
}: {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-foreground/[0.06]"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline">
          <span className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-foreground">
            <AnimatedCounter value={percentage} />
          </span>
          <span className="text-xl sm:text-2xl font-bold text-foreground/30 ml-0.5">
            %
          </span>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.16em] mt-1">
          Readiness
        </span>
      </div>
    </div>
  );
}

interface ResultHeroProps {
  percentage: number;
  headline: string;
  subheadline: string;
  themeColor: string;
  bgGradient: string;
  shared?: boolean | undefined;
}

export function ResultHero({
  percentage,
  headline,
  subheadline,
  themeColor,
  bgGradient,
  shared,
}: ResultHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-3xl py-12 sm:py-16 px-6 sm:px-8 bg-gradient-to-br ${bgGradient}`}
    >
      {/* Decorative gradient blob */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-[0.07] pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />

      <div className="relative flex flex-col items-center text-center">
        {shared && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm font-medium text-muted-foreground mb-8 tracking-wide"
          >
            Someone shared their results with you
          </motion.p>
        )}

        <ScoreRing percentage={percentage} color={themeColor} />

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground"
        >
          {headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-4 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-md"
        >
          {subheadline}
        </motion.p>
      </div>
    </motion.section>
  );
}
