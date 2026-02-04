"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Card2() {
  return (
    <Card className="mx-auto my-12 max-w-sm">
      <CardContent className="px-6">
        <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="User avatar"
            />
          </Avatar>

          <div className="space-y-0.5">
            <h3 className="text-card-foreground text-base leading-6 font-semibold">
              Title Text
            </h3>
            <p className="text-muted-foreground text-sm leading-5 font-normal">
              This is a card description.
            </p>
          </div>

          <Badge className="absolute top-0 right-0">Admin</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
