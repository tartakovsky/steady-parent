"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search, Plus, Download } from "lucide-react";

export function TableHeader3() {
  return (
    <div className="bg-background container mx-auto flex w-full flex-col justify-between gap-4 p-6">
      {/* Title and description */}
      <div className="flex flex-col gap-1">
        <h2 className="text-foreground text-lg leading-7 font-semibold lg:text-xl">
          Table name
        </h2>
        <p className="text-muted-foreground text-sm leading-5">
          Read and write directly to databases and stores from your projects.
        </p>
      </div>

      {/* Search and buttons */}
      <div className="flex flex-col justify-between gap-3 lg:flex-row">
        <div className="order-2 w-full lg:order-1 lg:max-w-[280px]">
          <Field>
            <FieldLabel htmlFor="th3-search" className="sr-only">
              Search
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon aria-hidden>
                <Search className="text-muted-foreground h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="th3-search"
                className="h-10"
                type="search"
                placeholder="Search"
              />
            </InputGroup>
          </Field>
        </div>
        <div className="order-1 flex gap-3 lg:order-2">
          <Button variant="outline" className="order-2 lg:order-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="order-1 lg:order-2">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>
    </div>
  );
}
