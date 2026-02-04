"use client";

import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone } from "lucide-react";

export function Card3() {
  return (
    <Card className="mx-auto my-12 max-w-sm pb-0">
      <CardHeader className="px-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-16 w-16 rounded-xl md:h-20 md:w-20">
            <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
          </Avatar>
          <div className="flex flex-col gap-1.5 text-center">
            <h3 className="text-card-foreground font-semibold">Title Text</h3>
            <p className="text-muted-foreground text-sm">
              This is a card description.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardFooter className="flex items-center justify-between gap-2 border-t py-4!">
        <Button variant="ghost" size="sm" className="flex-1">
          <Mail />
          Email
        </Button>
        <Separator orientation="vertical" className="h-5!" />
        <Button variant="ghost" size="sm" className="flex-1">
          <Phone />
          Call
        </Button>
      </CardFooter>
    </Card>
  );
}
