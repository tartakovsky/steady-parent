import type React from "react";

import { aboutContent } from "@/content/pages/about/content";

export default async function AboutPage(): Promise<React.JSX.Element> {
  const mod = await aboutContent.load();
  const About = mod.default;

  return (
    <main>
      <div className="section-padding-y">
        <div className="container-padding-x mx-auto max-w-4xl">
          <article className="flex flex-col gap-6">
            <About />
          </article>
        </div>
      </div>
    </main>
  );
}

