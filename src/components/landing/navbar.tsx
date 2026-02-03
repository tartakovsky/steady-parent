"use client";

import type React from "react";
import { useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
}

interface NavMenuItemsProps {
  items: readonly MenuItem[];
  className?: string;
}

const R2_PUBLIC_BASE_URL: string | undefined =
  process.env["NEXT_PUBLIC_R2_PUBLIC_BASE_URL"];

function r2Url(path: string): string {
  if (typeof R2_PUBLIC_BASE_URL === "string" && R2_PUBLIC_BASE_URL.length > 0) {
    return `${R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  }
  return path;
}

const NAV_LOGO_SRC = r2Url("sdp_logo_transparent.png");

function NavMenuItems({ items, className }: NavMenuItemsProps): React.JSX.Element {
  return (
    <div className={`flex flex-col gap-1 md:flex-row ${className ?? ""}`}>
      {items.map(({ label, href }) => (
        <Link key={label} href={href}>
          <Button variant="ghost" className="w-full md:w-auto">
            {label}
          </Button>
        </Link>
      ))}
    </div>
  );
}

export function Navbar(): React.JSX.Element {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = (): void => {
    setIsMenuOpen((prev) => !prev);
  };

  const menuItems: readonly MenuItem[] = useMemo(() => {
    const isHome = pathname === "/";
    const isAbout = pathname === "/about";
    const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");

    if (isHome) return [{ label: "About us", href: "/about" }, { label: "Blog", href: "/blog" }];
    if (isAbout) return [{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }];
    if (isBlog) return [{ label: "Home", href: "/" }, { label: "About us", href: "/about" }];

    return [
      { label: "Home", href: "/" },
      { label: "About us", href: "/about" },
      { label: "Blog", href: "/blog" },
    ];
  }, [pathname]);

  return (
    <nav className="bg-background sticky top-0 isolate z-50 h-16 md:h-18">
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-between gap-4 px-6 md:flex-row md:items-center md:gap-6">
        <div className="flex items-center justify-between">
          <a href="/" aria-label="Go to homepage">
            <Image
              src={NAV_LOGO_SRC}
              alt="Steady Parent logo"
              width={64}
              height={64}
              className="h-14 w-auto object-contain md:h-16"
              priority
            />
          </a>
          <Button
            variant="ghost"
            className="flex size-9 items-center justify-center md:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden w-full flex-row justify-end gap-5 md:flex">
          <NavMenuItems items={menuItems} />
          <Button asChild>
            <a href="/#course">Join Course</a>
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="flex w-full flex-col justify-end gap-5 pb-2.5 md:hidden">
            <NavMenuItems items={menuItems} />
            <Button asChild className="w-full">
              <a href="/#course" onClick={() => setIsMenuOpen(false)}>
                Join Course
              </a>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
