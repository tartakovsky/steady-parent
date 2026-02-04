"use client";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";
import {
  ArrowRight,
  List,
  LayoutGrid,
  CalendarFold,
  ClipboardList,
  Users,
  Clock,
  LucideIcon,
} from "lucide-react";

interface EmptyCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function EmptyCard({ icon: Icon, title, description }: EmptyCardProps) {
  return (
    <Item variant="outline">
      <ItemMedia variant="icon">
        <Icon className="text-primary h-5 w-5 md:h-6 md:w-6" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="leading-5">{title}</ItemTitle>
        <ItemDescription className="text-sm">{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon" aria-label={`Open ${title}`}>
          <ArrowRight />
        </Button>
      </ItemActions>
    </Item>
  );
}

export function EmptySection2() {
  return (
    <section className="bg-background">
      {" "}
      {/* Add border border-border shadow-sm and rounded-lg class to make this section look like a card */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <div className="space-y-1">
          <h2 className="text-card-foreground text-lg font-semibold md:text-xl">
            Products
          </h2>
          <p className="text-muted-foreground text-sm">
            Create your first project by selecting a template or starting from
            scratch.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <EmptyCard
            icon={List}
            title="Create a list"
            description="Organize tasks into simple lists."
          />
          <EmptyCard
            icon={LayoutGrid}
            title="Create a gallery"
            description="Showcase items visually and neatly."
          />
          <EmptyCard
            icon={CalendarFold}
            title="Create a calendar"
            description="Plan events with clear schedules."
          />
          <EmptyCard
            icon={ClipboardList}
            title="Create a board"
            description="Manage projects with visual boards."
          />
          <EmptyCard
            icon={Users}
            title="Create a team"
            description="Collaborate effectively with your team."
          />
          <EmptyCard
            icon={Clock}
            title="Create a timeline"
            description="Track progress with chronological views."
          />
        </div>
      </div>
    </section>
  );
}
