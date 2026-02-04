import type React from "react";

import Image from "next/image";

import type { TrustBadgesContent } from "@/content/landing/types";

interface TrustBadgesProps {
  content: TrustBadgesContent;
}

export function TrustBadges({ content }: TrustBadgesProps): React.JSX.Element {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
          {content.items.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-4 text-center"
            >
              {typeof badge.icon === "string" ? (
                <Image
                  src={badge.icon}
                  alt={badge.title}
                  width={128}
                  height={128}
                  className="size-32 rounded-full aspect-square object-contain"
                />
              ) : (
                <div className="bg-muted flex size-32 items-center justify-center rounded-full">
                  <badge.icon className="text-primary size-16" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <p className="text-foreground text-base font-semibold">
                  {badge.title}
                </p>
                <p className="text-muted-foreground text-sm whitespace-pre-line">
                  {badge.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
