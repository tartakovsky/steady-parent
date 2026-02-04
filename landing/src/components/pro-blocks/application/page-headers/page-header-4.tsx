"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

export function PageHeader4() {
  return (
    <div className="border-border bg-background border-b py-4 md:py-6">
      <div className="container mx-auto flex flex-col gap-6 px-4 lg:px-6">
        {/* Breadcrumb navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs/components">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Project alpha</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main content */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Project alpha
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Manage your project's details such as name, image, description and
              settings.
            </p>
          </div>
          {/* Search */}
          <div className="w-full md:max-w-xs">
            <Field>
              <FieldLabel htmlFor="ph4-search" className="sr-only">
                Search
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon aria-hidden>
                  <Search className="text-muted-foreground h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="ph4-search"
                  type="search"
                  placeholder="Search"
                />
              </InputGroup>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}
