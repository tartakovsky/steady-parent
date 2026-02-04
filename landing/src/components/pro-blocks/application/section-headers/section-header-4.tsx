"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EllipsisVertical, Search } from "lucide-react";

export function SectionHeader4() {
  return (
    <div className="bg-background pt-4 md:pt-6">
      <div className="container mx-auto flex flex-col gap-6 px-4 lg:px-6">
        {/* Title */}
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Storage</h2>
            <p className="text-muted-foreground text-sm">
              Read and write directly to databases and stores from your
              projects.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-3 md:flex-row">
            {/* Actions */}
            <div className="flex flex-row-reverse justify-end gap-2 md:flex-row">
              <div className="w-full md:w-auto md:min-w-[240px]">
                <Field>
                  <FieldLabel htmlFor="sh4-search" className="sr-only">
                    Search
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon aria-hidden>
                      <Search className="text-muted-foreground h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="sh4-search"
                      type="search"
                      placeholder="Search"
                    />
                  </InputGroup>
                </Field>
              </div>
              <div className="absolute top-[-8px] right-[-8px] md:static">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>View</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
