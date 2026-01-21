import type React from "react";
import type { ReactNode } from "react";

import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

