"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical, Search } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function PageHeader8() {
  return (
    <div className="border-border bg-background border-b py-4 md:py-6">
      <div className="container mx-auto flex flex-col gap-6 px-4 lg:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="w-full md:max-w-xs">
            <Field>
              <FieldLabel htmlFor="ph8-search" className="sr-only">
                Search
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon aria-hidden>
                  <Search className="text-muted-foreground h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="ph8-search"
                  type="search"
                  placeholder="Search"
                />
              </InputGroup>
            </Field>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
          {/* Buttons */}
          <div className="flex flex-row-reverse justify-end gap-2 md:flex-row">
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Share</DropdownMenuItem>
                  <DropdownMenuItem>View</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button variant="outline" className="hidden lg:inline-flex">
              Share
            </Button>
            <Button variant="outline" className="hidden lg:inline-flex">
              View
            </Button>
            <Button variant="outline">Edit</Button>
            <Button>Publish</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
