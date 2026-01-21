"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Button7() {
  const [value, setValue] = React.useState("today");

  return (
    <div className="bg-background mx-auto my-10 flex w-fit items-center gap-0.5 rounded-lg p-0.5">
      {/* Mobile: Select */}
      <div className="sm:hidden">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger
            aria-label="Select range"
            className="min-w-44 font-medium"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: ToggleGroup */}
      <ToggleGroup
        variant="outline"
        type="single"
        value={value}
        onValueChange={setValue}
        className="hidden items-center sm:flex"
      >
        <ToggleGroupItem value="today" className="min-w-24">
          Today
        </ToggleGroupItem>
        <ToggleGroupItem value="week" className="min-w-24">
          This week
        </ToggleGroupItem>
        <ToggleGroupItem value="month" className="min-w-24">
          This month
        </ToggleGroupItem>
        <ToggleGroupItem value="year" className="min-w-24">
          This year
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
