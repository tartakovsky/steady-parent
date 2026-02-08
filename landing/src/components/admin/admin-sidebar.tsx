"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Tag,
  Map,
  Network,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/kit", label: "Kit Tags", icon: Tag },
  { href: "/admin/plan", label: "Plan vs Reality", icon: Map },
  { href: "/admin/links", label: "Link Graph", icon: Network },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r bg-muted/30 p-4">
      <Link href="/admin" className="mb-6 block text-lg font-semibold">
        Admin
      </Link>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
