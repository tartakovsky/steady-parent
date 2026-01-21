"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function StatsSection4() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg flex max-w-2xl flex-col">
            <Tagline>Stats section</Tagline>
            <h2 className="heading-lg text-foreground">
              Data-driven highlights that showcase impact
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Add a concise value statement that explains how your metrics
              demonstrate success and growth. Focus on transformation and
              measurable outcomes.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:gap-6 lg:flex-row">
            <Card className="rounded-xl p-6">
              <CardContent className="flex flex-col gap-2 p-0 md:gap-3">
                <h3 className="text-primary font-medium">Stat title</h3>
                <span className="text-foreground heading-md">2,400%</span>

                <p className="text-muted-foreground text-base text-pretty">
                  Each stat should include a bold numerical figure followed by a
                  brief, compelling description.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl p-6">
              <CardContent className="flex flex-col gap-2 p-0 md:gap-3">
                <h3 className="text-primary font-medium">Stat title</h3>
                <span className="text-foreground text-3xl font-semibold md:text-4xl">
                  $410K
                </span>
                <p className="text-muted-foreground text-base text-pretty">
                  Each stat should include a bold numerical figure followed by a
                  brief, compelling description.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl p-6">
              <CardContent className="flex flex-col gap-2 p-0 md:gap-3">
                <h3 className="text-primary font-medium">Stat title</h3>
                <span className="text-foreground text-3xl font-semibold md:text-4xl">
                  11,000
                </span>
                <p className="text-muted-foreground text-base text-pretty">
                  Each stat should include a bold numerical figure followed by a
                  brief, compelling description.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
