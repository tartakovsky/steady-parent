"use client";

import type React from "react";
import { useCallback, useMemo, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
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
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = (): void => {
    setIsMenuOpen((prev) => !prev);
  };

  const scrollToCourse = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault();
      if (pathname === "/") {
        const element = document.getElementById("course");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        router.push("/#course");
      }
      setIsMenuOpen(false);
    },
    [pathname, router]
  );

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
    <nav className="bg-background sticky top-0 isolate z-50 py-3.5 md:py-4">
      <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 md:flex-row md:items-center md:gap-6">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Go to homepage">
            <Logo className="size-7" />
          </Link>
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
          <Button onClick={scrollToCourse}>Join Course</Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="flex w-full flex-col justify-end gap-5 pb-2.5 md:hidden">
            <NavMenuItems items={menuItems} />
            <Button className="w-full" onClick={scrollToCourse}>
              Join Course
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
