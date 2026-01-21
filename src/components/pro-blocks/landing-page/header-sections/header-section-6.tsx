"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function HeaderSection6() {
  return (
    <section
      className="bg-zinc-950 pt-4 pb-16 lg:pb-24"
      aria-labelledby="page-heading"
    >
      <div className="container-padding-x relative z-10 mx-auto flex max-w-7xl flex-col gap-8 lg:gap-16">
        <Breadcrumb aria-label="Page navigation">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="text-white/80">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/50" />
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="text-white/80">
                Header Sections
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/50" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white/90">
                Header Section Six
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="section-title-gap-xl flex max-w-xl flex-1 flex-col">
          <div className="section-title-gap-xl flex flex-col">
            <Tagline className="text-white/80">Header section</Tagline>
            <h1 id="page-heading" className="heading-xl text-white">
              Header section title
            </h1>
            <p
              className="text-lg/8 text-pretty text-white/80"
              aria-description="page description"
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit interdum
              hendrerit ex vitae sodales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
