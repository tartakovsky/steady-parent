"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TreePalm, MapPin, User } from "lucide-react";

export function Card4() {
  return (
    <Card className="mx-auto my-12 max-w-xl">
      <CardHeader className="px-6">
        <div className="relative">
          <Badge>In progress</Badge>

          <h3 className="text-card-foreground my-2 text-lg font-semibold">
            Summer Camp
          </h3>

          <div className="absolute top-0 right-0 flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <Avatar
                key={i}
                className="border-card bg-background h-5 w-5 border-[1px]"
              >
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt={`User ${i + 1}`}
                />
              </Avatar>
            ))}
          </div>

          <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <div className="flex items-center gap-1">
              <TreePalm className="h-4 w-4" />
              <span>Camp</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>London, Great Britain</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Alex Johnson</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardFooter className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-6">
        <span className="text-card-foreground text-sm">
          Pre-Production (2/4)
        </span>
        <Separator orientation="vertical" className="h-5" />
        <span className="text-muted-foreground text-sm">Updated 4h ago</span>
      </CardFooter>
    </Card>
  );
}
