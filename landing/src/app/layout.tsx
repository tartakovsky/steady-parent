import type React from "react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { YandexMetricaProvider } from "next-yandex-metrica";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://steady-parent.com"),
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background">
        <YandexMetricaProvider
          tagID={106767018}
          initParameters={{
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
          }}
          router="app"
        >
          {children}
        </YandexMetricaProvider>
      </body>
    </html>
  );
}
