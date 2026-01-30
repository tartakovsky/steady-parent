import type React from "react";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { aboutContent } from "@/content/pages/about/content";

export default async function AboutPage(): Promise<React.JSX.Element> {
  const mod = await aboutContent.load();
  const About = mod.default;

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />
      <div className="section-padding-y">
        <div className="container-padding-x mx-auto max-w-7xl">
          <article className="mx-auto flex max-w-2xl flex-col gap-8">
            <header className="flex flex-col gap-3">
              <h1 className="heading-lg text-foreground">{aboutContent.meta.title}</h1>
              <p className="text-muted-foreground text-lg/8 text-pretty">
                {aboutContent.meta.description}
              </p>
            </header>

            <div className="flex flex-col gap-6">
              <About />
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  );
}

