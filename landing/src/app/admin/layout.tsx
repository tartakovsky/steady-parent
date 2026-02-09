import type React from "react";
import { type ReactNode, Suspense } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex h-dvh">
      <Suspense>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
