"use client";

import type React from "react";

import Marquee from "react-fast-marquee";

export interface AutoMarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number;
  gapClassName?: string;
}

export function AutoMarquee({
  children,
  direction = "left",
  speed = 40,
  gapClassName = "gap-6",
}: AutoMarqueeProps): React.JSX.Element {
  return (
    <Marquee
      direction={direction}
      speed={speed}
      gradient={false}
      pauseOnHover={false}
      pauseOnClick={false}
      autoFill
    >
      <div className={`flex items-stretch ${gapClassName}`}>{children}</div>
    </Marquee>
  );
}

