import type React from "react";
import type { ReactNode } from "react";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
