"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Rocket } from "lucide-react";

export function Button3() {
  return (
    <div className="mx-auto my-10 w-fit">
      <ButtonGroup>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2"
        >
          <Rocket />
          Publish
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex w-9 items-center justify-center p-2"
            >
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <span>Menu Item 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Menu Item 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Menu Item 3</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  );
}
