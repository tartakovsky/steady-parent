"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function BentoGrid2() {
  return (
    <section className="bg-muted section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-10 md:gap-12">
        <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
          <Tagline>Bento Grid Section</Tagline>
          <h2 className="heading-lg">
            Feature-rich layout that captures attention
          </h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            Add a concise value statement that highlights your product's key
            features and benefits in a visually dynamic grid.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:grid-rows-2">
          <Card className="overflow-hidden rounded-xl p-0 shadow-xs lg:col-span-2">
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Placeholder"
              width={1000}
              height={1000}
              className="h-80 w-full object-cover"
            />
            <CardContent className="flex flex-col gap-2 pb-6">
              <h3 className="heading-sm">Feature title</h3>
              <p className="text-muted-foreground">
                Shortly describe how this feature solves a specific user
                problem. Make sure to keep the description concise and to the
                point.
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-xl p-0 shadow-xs lg:col-span-1">
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Placeholder"
              width={1000}
              height={1000}
              className="h-80 w-full object-cover"
            />
            <CardContent className="flex flex-col gap-2 pb-6">
              <h3 className="heading-sm">Feature title</h3>
              <p className="text-muted-foreground">
                Shortly describe how this feature solves a specific user
                problem.
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-xl p-0 shadow-xs lg:col-span-1">
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Placeholder"
              width={1000}
              height={1000}
              className="h-80 w-full object-cover"
            />
            <CardContent className="flex flex-col gap-2 pb-6">
              <h3 className="heading-sm">Feature title</h3>
              <p className="text-muted-foreground">
                Shortly describe how this feature solves a specific user
                problem.
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-xl p-0 shadow-xs lg:col-span-2">
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Placeholder"
              width={1000}
              height={1000}
              className="h-80 w-full object-cover"
            />
            <CardContent className="flex flex-col gap-2 pb-6">
              <h3 className="heading-sm">Feature title</h3>
              <p className="text-muted-foreground">
                Shortly describe how this feature solves a specific user
                problem. Make sure to keep the description concise and to the
                point.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
