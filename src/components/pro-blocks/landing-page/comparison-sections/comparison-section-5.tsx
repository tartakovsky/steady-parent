"use client";

import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import { Check, X, Box, Info } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ComparisonRow = {
  feature: string;
  description: string;
  our: boolean | string;
  theirs: boolean | string;
};

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Projects",
    description: "Maximum active projects per workspace.",
    our: "Unlimited",
    theirs: "10",
  },
  {
    feature: "Custom components",
    description: "Create and re-use your own UI blocks.",
    our: true,
    theirs: true,
  },
  {
    feature: "Design tokens",
    description: "Theme tokens for color, radius and typography.",
    our: true,
    theirs: true,
  },
  {
    feature: "Team permissions",
    description: "Role-based access and granular controls.",
    our: true,
    theirs: false,
  },
  {
    feature: "Audit logs",
    description: "Track changes and sensitive actions.",
    our: true,
    theirs: false,
  },
];

export function ComparisonSection5() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-6 lg:gap-16">
          {/* Title block */}
          <div className="section-title-gap-lg col-span-1 mx-auto flex max-w-xl flex-col items-center text-center lg:col-span-2 lg:mx-0 lg:items-start lg:text-left">
            <Tagline>Comparison Section</Tagline>
            <h2 className="heading-lg text-foreground">
              You vs. your competitor
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Explain in one or two concise sentences how your solution compares
              to a competitor. Keep it clear and compelling.
            </p>
          </div>

          {/* Comparison grid */}
          {/* Desktop/tablet (md+) table */}
          <div className="col-span-1 hidden overflow-x-auto lg:col-span-4 lg:block">
            <Table>
              <TableHeader>
                <TableRow className="h-14">
                  <TableHead className="w-[40%]"></TableHead>
                  <TableHead className="w-[30%]">
                    <div className="relative flex items-center justify-center">
                      <Logo className="size-6" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[30%]">
                    <div className="flex items-center justify-center">
                      <Box className="size-6" aria-hidden="true" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_ROWS.map((row, idx) => (
                  <TableRow key={idx} className="h-14">
                    <TableCell className="text-base font-medium">
                      <span className="flex items-center gap-2">
                        {row.feature}
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info
                                className="text-muted-foreground size-4"
                                aria-hidden="true"
                              />
                            </TooltipTrigger>
                            <TooltipContent>{row.description}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="relative flex items-center justify-center">
                        <div className="text-base">
                          {typeof row.our === "boolean" ? (
                            row.our ? (
                              <Check className="size-5" aria-hidden="true" />
                            ) : (
                              <X
                                className="text-muted-foreground size-5"
                                aria-hidden="true"
                              />
                            )
                          ) : (
                            row.our
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center text-base">
                        {typeof row.theirs === "boolean" ? (
                          row.theirs ? (
                            <Check className="size-5" aria-hidden="true" />
                          ) : (
                            <X
                              className="text-muted-foreground size-5"
                              aria-hidden="true"
                            />
                          )
                        ) : (
                          row.theirs
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile (< md) stacked rows */}
          <div className="lg:hidden">
            <div className="mb-4 grid grid-cols-2 text-sm font-medium">
              <div className="relative flex items-center justify-center py-2">
                <div className="bg-muted/50 absolute inset-0 -z-10" />
                <Logo className="size-6" />
              </div>
              <div className="flex items-center justify-center py-2">
                <Box className="size-6" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-3">
              {COMPARISON_ROWS.map((row, idx) => (
                <div key={idx} className="rounded-md border">
                  <div className="px-4 py-3 text-sm font-medium">
                    <span className="flex items-center gap-2">
                      {row.feature}
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info
                              className="text-muted-foreground size-4"
                              aria-hidden="true"
                            />
                          </TooltipTrigger>
                          <TooltipContent>{row.description}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                  </div>
                  <Separator role="presentation" />
                  <div className="grid grid-cols-2">
                    <div className="relative flex items-center justify-center py-3">
                      <div className="bg-muted/50 absolute inset-0 -z-10" />
                      <div className="text-sm">
                        {typeof row.our === "boolean" ? (
                          row.our ? (
                            <Check className="size-4" aria-hidden="true" />
                          ) : (
                            <X
                              className="text-muted-foreground size-4"
                              aria-hidden="true"
                            />
                          )
                        ) : (
                          row.our
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-center py-3 text-sm">
                      {typeof row.theirs === "boolean" ? (
                        row.theirs ? (
                          <Check className="size-4" aria-hidden="true" />
                        ) : (
                          <X
                            className="text-muted-foreground size-4"
                            aria-hidden="true"
                          />
                        )
                      ) : (
                        row.theirs
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
