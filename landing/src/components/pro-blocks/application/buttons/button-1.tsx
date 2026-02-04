"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Minus, Plus } from "lucide-react";

export function Button1() {
  const [value, setValue] = React.useState(23);

  const increment = () => setValue((prev) => Math.min(prev + 1, 99));
  const decrement = () => setValue((prev) => Math.max(prev - 1, 0));

  return (
    <div className="mx-auto my-10 w-fit">
      <ButtonGroup aria-label="Counter controls">
        <Button
          variant="outline"
          size="icon"
          className="flex items-center justify-center"
          onClick={decrement}
          disabled={value === 0}
          aria-label="Decrease value"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <ButtonGroupText
          aria-live="polite"
          aria-label="Current value"
          className="bg-background w-10 justify-center px-2"
        >
          {value}
        </ButtonGroupText>

        <Button
          variant="outline"
          size="icon"
          className="flex items-center justify-center"
          onClick={increment}
          disabled={value === 99}
          aria-label="Increase value"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </ButtonGroup>
    </div>
  );
}
