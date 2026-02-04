"use client";

import * as React from "react";

import {
  List,
  GalleryThumbnails,
  CalendarFold,
  ChevronRight,
} from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  ItemGroup,
  ItemSeparator,
} from "@/components/ui/item";

export function EmptySection4() {
  const projects = [
    {
      icon: List,
      title: "Create a list",
      description: "Organize tasks into simple lists.",
    },
    {
      icon: GalleryThumbnails,
      title: "Create a gallery",
      description: "Showcase items visually and neatly.",
    },
    {
      icon: CalendarFold,
      title: "Create a calendar",
      description: "Plan events with clear schedules.",
    },
  ];

  return (
    <section className="bg-background py-12">
      {" "}
      {/* Add border border-border shadow-sm and rounded-lg class to make this section look like a card */}
      <div className="mx-auto max-w-xl px-4 md:px-6">
        <div className="mb-8 space-y-1">
          <h2 className="text-foreground text-lg font-semibold md:text-xl">
            Projects
          </h2>
          <p className="text-muted-foreground text-sm">
            Create your first project by selecting a template or starting from
            scratch.
          </p>
        </div>

        <div className="flex flex-col">
          <ItemGroup>
            {projects.map((project, index) => (
              <React.Fragment key={project.title}>
                <Item className="px-0">
                  <ItemMedia variant="icon">
                    <project.icon className="h-6 w-6" />
                  </ItemMedia>
                  <ItemContent className="gap-1">
                    <ItemTitle className="text-base">{project.title}</ItemTitle>
                    <ItemDescription className="text-sm">
                      {project.description}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ChevronRight className="h-5 w-5" />
                  </ItemActions>
                </Item>
                {index !== projects.length - 1 && <ItemSeparator />}
              </React.Fragment>
            ))}
          </ItemGroup>
        </div>
      </div>
    </section>
  );
}
