"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import { Check, X, Box, Boxes } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ComparisonRow = {
  feature: string;
  ours: boolean | string;
  compA: boolean | string;
  compB: boolean | string;
};

const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: "Projects", ours: "Unlimited", compA: "25", compB: "10" },
  { feature: "Custom components", ours: true, compA: true, compB: false },
  { feature: "Design tokens", ours: true, compA: true, compB: true },
  { feature: "Team permissions", ours: true, compA: false, compB: false },
  { feature: "Audit logs", ours: true, compA: false, compB: false },
];

export function ComparisonSection2() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-6xl flex-col gap-8 md:gap-12">
        {/* Title block */}
        <div className="section-title-gap-lg mx-auto flex flex-col items-center text-center md:max-w-xl">
          <Tagline>Comparison Section</Tagline>
          <h2 className="heading-lg text-foreground">
            You vs. your competitors
          </h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            Explain in one or two concise sentences how your solution compares
            to a competitor. Keep it clear and compelling.
          </p>
        </div>

        {/* Desktop/tablet (md+) table */}
        <div className="hidden overflow-x-auto lg:block">
          <div className="min-w-[920px]">
            <Table>
              <TableHeader>
                <TableRow className="h-14">
                  <TableHead className="w-[34%]"></TableHead>
                  <TableHead className="w-[22%]">
                    <div className="relative flex items-center justify-center">
                      <Logo className="size-6" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[22%]">
                    <div className="flex items-center justify-center">
                      <Box className="size-6" aria-hidden="true" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[22%]">
                    <div className="flex items-center justify-center">
                      <Boxes className="size-6" aria-hidden="true" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_ROWS.map((row, idx) => (
                  <TableRow key={idx} className="h-14">
                    <TableCell className="text-base font-medium">
                      {row.feature}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center text-base">
                        {typeof row.ours === "boolean" ? (
                          row.ours ? (
                            <Check className="size-5" aria-hidden="true" />
                          ) : (
                            <X
                              className="text-muted-foreground size-5"
                              aria-hidden="true"
                            />
                          )
                        ) : (
                          row.ours
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center text-base">
                        {typeof row.compA === "boolean" ? (
                          row.compA ? (
                            <Check className="size-5" aria-hidden="true" />
                          ) : (
                            <X
                              className="text-muted-foreground size-5"
                              aria-hidden="true"
                            />
                          )
                        ) : (
                          row.compA
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center text-base">
                        {typeof row.compB === "boolean" ? (
                          row.compB ? (
                            <Check className="size-5" aria-hidden="true" />
                          ) : (
                            <X
                              className="text-muted-foreground size-5"
                              aria-hidden="true"
                            />
                          )
                        ) : (
                          row.compB
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile (< md) stacked rows */}
        <div className="lg:hidden">
          {/* Logos header */}
          <div className="mb-4 grid grid-cols-3 text-sm font-medium">
            <div className="relative flex items-center justify-center py-2">
              <Logo className="size-6" />
            </div>
            <div className="flex items-center justify-center py-2">
              <Box className="size-6" aria-hidden="true" />
            </div>
            <div className="flex items-center justify-center py-2">
              <Boxes className="size-6" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-3">
            {COMPARISON_ROWS.map((row, idx) => (
              <div key={idx} className="rounded-md border">
                <div className="px-4 py-3 text-sm font-medium">
                  {row.feature}
                </div>
                <Separator role="presentation" />
                <div className="grid grid-cols-3">
                  <div className="flex items-center justify-center py-3 text-sm">
                    {typeof row.ours === "boolean" ? (
                      row.ours ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        <X className="size-4" aria-hidden="true" />
                      )
                    ) : (
                      row.ours
                    )}
                  </div>
                  <div className="flex items-center justify-center py-3 text-sm">
                    {typeof row.compA === "boolean" ? (
                      row.compA ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        <X className="size-4" aria-hidden="true" />
                      )
                    ) : (
                      row.compA
                    )}
                  </div>
                  <div className="flex items-center justify-center py-3 text-sm">
                    {typeof row.compB === "boolean" ? (
                      row.compB ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        <X className="size-4" aria-hidden="true" />
                      )
                    ) : (
                      row.compB
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-center gap-4">
          <Button asChild>
            <Link href="#">Get started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
