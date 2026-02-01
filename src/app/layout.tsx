import type React from "react";
import type { ReactNode } from "react";

import "./globals.css";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { HashScrollHandler } from "@/components/hash-scroll-handler";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background">
        <HashScrollHandler />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

