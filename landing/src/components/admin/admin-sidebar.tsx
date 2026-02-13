"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  List,
  FileType,
  Link2,
  Megaphone,
  Mail,
  ShieldCheck,
  FileText,
  Brain,
  Map,
  Network,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Nav data
// ---------------------------------------------------------------------------

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { label: string; icon: LucideIcon; children: NavItem[] };
type NavEntry = NavItem | NavGroup;

function isGroup(e: NavEntry): e is NavGroup {
  return "children" in e;
}

const nav: NavEntry[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Spec",
    icon: BookOpen,
    children: [
      { href: "/admin/spec?tab=taxonomy", label: "Taxonomy", icon: List },
      { href: "/admin/spec?tab=pageTypes", label: "Page Types", icon: FileType },
      { href: "/admin/spec?tab=crossLinks", label: "Cross-Linking", icon: Link2 },
      { href: "/admin/spec?tab=ctas", label: "CTAs", icon: Megaphone },
      { href: "/admin/spec?tab=mailing", label: "Mailing Forms", icon: Mail },
      { href: "/admin/spec/mailing", label: "Mailing (validated)", icon: ShieldCheck },
    ],
  },
  {
    label: "Validation",
    icon: ShieldCheck,
    children: [
      { href: "/admin/articles", label: "Articles", icon: FileText },
      { href: "/admin/quizzes", label: "Quizzes", icon: Brain },
      { href: "/admin/plan", label: "Plan vs Reality", icon: Map },
      { href: "/admin/ctas", label: "CTAs", icon: Megaphone },
      { href: "/admin/mailing", label: "Mailing Forms", icon: Mail },
    ],
  },
  { href: "/admin/links", label: "Link Graph", icon: Network },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function isActive(href: string): boolean {
    const qIdx = href.indexOf("?");
    const path = qIdx >= 0 ? href.slice(0, qIdx) : href;
    const qs = qIdx >= 0 ? href.slice(qIdx + 1) : null;
    if (path === "/admin") return pathname === "/admin";
    if (!pathname.startsWith(path)) return false;
    if (!qs) return true;
    // Match query param (e.g. tab=taxonomy)
    const params = new URLSearchParams(qs);
    for (const [key, value] of params) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  }

  const linkCls = (active: boolean) =>
    `flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
      active
        ? "bg-primary/10 font-medium text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <aside className="w-56 shrink-0 border-r bg-muted/30 p-4">
      <Link href="/admin" className="mb-6 block text-lg font-semibold">
        Admin
      </Link>
      <nav className="flex flex-col gap-0.5">
        {nav.map((entry) => {
          if (isGroup(entry)) {
            return (
              <div key={entry.label} className="mt-4 first:mt-0">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  <entry.icon className="h-3.5 w-3.5" />
                  {entry.label}
                </div>
                <div className="flex flex-col gap-0.5">
                  {entry.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`${linkCls(isActive(child.href))} pl-8`}
                    >
                      <child.icon className="h-3.5 w-3.5" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={linkCls(isActive(entry.href))}
            >
              <entry.icon className="h-4 w-4" />
              {entry.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
