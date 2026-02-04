"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function HeaderSection15() {
  return (
    <section
      className="bg-background pt-6 pb-16 lg:pb-24"
      aria-labelledby="page-heading"
    >
      <div className="container-padding-x relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:gap-16">
        <Breadcrumb aria-label="Page navigation">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Header Sections</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Header Section Fourteen</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex max-w-xl flex-1 flex-col gap-6 lg:gap-8">
          <div className="section-title-gap-xl flex flex-col">
            <Tagline>Header section</Tagline>
            <h1 id="page-heading" className="heading-xl text-foreground">
              Header section title
            </h1>
            <p
              className="text-muted-foreground text-lg/8 text-pretty"
              aria-description="page description"
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit interdum
              hendrerit ex vitae sodales.
            </p>
          </div>
          <form
            className="flex w-full max-w-sm gap-2"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Email signup form"
          >
            <Field className="flex-1">
              <FieldLabel htmlFor="header14-email" className="sr-only">
                Email
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="header14-email"
                  placeholder="Your email"
                  type="email"
                  required
                  aria-required="true"
                />
              </InputGroup>
            </Field>
            <Button>
              Sign up
              <ArrowRight className="hidden md:block" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
