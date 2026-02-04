"use client";

import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SubMenuItem {
  label: string;
  href: string;
}

interface MenuItemWithSubmenu {
  label: string;
  submenu: readonly SubMenuItem[];
  href?: never; // Ensure href is not present when submenu is
}

interface MenuItemWithHref {
  label: string;
  href: string;
  submenu?: never; // Ensure submenu is not present when href is
}

type MenuItem = MenuItemWithSubmenu | MenuItemWithHref;

const MENU_ITEMS: readonly MenuItem[] = [
  {
    label: "Products",
    submenu: [
      { label: "Analytics Platform", href: "#analytics" },
      { label: "Team Collaboration", href: "#collaboration" },
      { label: "Enterprise Suite", href: "#enterprise" },
    ],
  },
  {
    label: "Use cases",
    submenu: [
      { label: "Sales", href: "#sales" },
      { label: "Marketing", href: "#marketing" },
      { label: "Customer Success", href: "#customer-success" },
    ],
  },
  { label: "Docs", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "FAQ", href: "#" },
] as const;

const DEFAULT_ACTION_BUTTONS = [
  {
    label: "Login",
    href: "#",
    variant: "outline" as const,
  },
  {
    label: "Get started",
    href: "#",
    variant: "default" as const,
  },
] as const;

interface ActionButton {
  label: string;
  href: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
}

interface LpNavbar6Props {
  actionButtons?: readonly ActionButton[];
}

interface NavMenuItemsProps {
  className?: string;
}

const NavMenuItems = ({ className }: NavMenuItemsProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <div className={`-mx-2 flex flex-col gap-1 md:flex-row ${className ?? ""}`}>
      {MENU_ITEMS.map(({ label, href, submenu }) => (
        <div key={label} className="relative">
          {submenu ? (
            <div className="w-full">
              <Button
                variant="ghost"
                className="w-full justify-between px-2 md:w-auto"
                onClick={() => toggleDropdown(label)}
              >
                {label}
                <ChevronDown
                  className={`transition-transform duration-200 ${
                    openDropdown === label ? "rotate-180" : ""
                  }`}
                />
              </Button>
              {openDropdown === label && (
                <div className="bg-background w-full rounded-md p-2 duration-200 md:absolute md:top-full md:min-w-[200px] md:shadow-lg">
                  {submenu.map((item: SubMenuItem) => (
                    <Link key={item.label} href={item.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-3 py-2"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link href={href}>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 md:w-auto"
              >
                {label}
              </Button>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export function LpNavbar6({
  actionButtons = [...DEFAULT_ACTION_BUTTONS],
}: LpNavbar6Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  const renderActionButtons = (className?: string) => (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {actionButtons.map((button, index) => (
        <Link key={index} href={button.href}>
          <Button
            variant={button.variant}
            className={className?.includes("w-full") ? "w-full" : ""}
          >
            {button.label}
          </Button>
        </Link>
      ))}
    </div>
  );

  return (
    <nav className="bg-background sticky top-0 isolate z-50 py-3.5 md:py-4">
      <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 md:flex-row md:items-center md:gap-6">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Go to homepage">
            <Logo className="size-7" />
          </Link>

          {/* Mobile Menu Trigger */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-9 items-center justify-center md:hidden"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex h-full flex-col justify-between p-6 pt-12">
                <div className="flex flex-col gap-5">
                  <NavMenuItems className="flex-col" />
                </div>
                {actionButtons.length > 0 && (
                  <div className="mt-auto flex flex-col gap-2">
                    {renderActionButtons(
                      "w-full flex flex-col gap-2 items-stretch",
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden w-full flex-row justify-end gap-5 md:flex">
          <NavMenuItems />
          {actionButtons.length > 0 && renderActionButtons()}
        </div>
      </div>
    </nav>
  );
}
