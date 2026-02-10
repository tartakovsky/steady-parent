"use client";

import type React from "react";
import { useMemo } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

interface MenuItem {
  label: string;
  href: string;
}

interface NavMenuItemsProps {
  items: readonly MenuItem[];
  className?: string;
  onItemClick?: () => void;
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

function NavMenuItems({
  items,
  className,
  onItemClick,
}: NavMenuItemsProps): React.JSX.Element {
  return (
    <div className={`flex flex-row items-center gap-1 ${className ?? ""}`}>
      {items.map(({ label, href }) => (
        <Link key={label} href={href}>
          <Button
            variant="ghost"
            className="h-9 px-3 text-sm md:h-10 md:px-4 md:text-base"
            onClick={onItemClick}
          >
            {label}
          </Button>
        </Link>
      ))}
    </div>
  );
}

export function Navbar(): React.JSX.Element {
  const pathname = usePathname();

  const menuItems: readonly MenuItem[] = useMemo(() => {
    const isHome = pathname === "/";
    const isAbout = pathname === "/about";
    const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
    const isQuiz = pathname === "/quiz" || pathname.startsWith("/quiz/");

    if (isHome) return [{ label: "About us", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Quizzes", href: "/quiz" }];
    if (isAbout) return [{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "Quizzes", href: "/quiz" }];
    if (isBlog) return [{ label: "Home", href: "/" }, { label: "About us", href: "/about" }, { label: "Quizzes", href: "/quiz" }];
    if (isQuiz) return [{ label: "Home", href: "/" }, { label: "About us", href: "/about" }, { label: "Blog", href: "/blog" }];

    return [
      { label: "Home", href: "/" },
      { label: "About us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Quizzes", href: "/quiz" },
    ];
  }, [pathname]);

  return (
    <nav className="bg-background sticky top-0 isolate z-50 h-16 md:h-18">
      <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-6">
        <div className="flex items-center">
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
        </div>

        <div className="flex items-center justify-end gap-2">
          <NavMenuItems items={menuItems} />
          <Button asChild className="h-9 px-4 text-sm md:h-10 md:px-5 md:text-base">
            <a href="/#course">Join Course</a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
