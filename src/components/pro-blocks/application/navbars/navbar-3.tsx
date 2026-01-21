"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import { Bell, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export function Navbar3() {
  return (
    <nav className="bg-background w-full border-b shadow-sm">
      <div className="relative container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Logo />
        {/* Desktop search */}
        <div className="absolute left-1/2 hidden w-[360px] -translate-x-1/2 md:block">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input type="text" placeholder="Search" className="h-10 pl-9" />
          </div>
        </div>

        <div className="flex gap-3">
          {/* Mobile search */}
          <Button
            size="icon"
            variant="ghost"
            className="text-muted-foreground flex md:hidden [&_svg]:size-5"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground [&_svg]:size-5 md:[&_svg]:size-4"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Badge className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center p-0.5">
              2
            </Badge>
          </div>

          {/* User dropdown */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="User avatar"
                />
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>My Profile</DropdownMenuItem>
              <DropdownMenuItem>Account</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
