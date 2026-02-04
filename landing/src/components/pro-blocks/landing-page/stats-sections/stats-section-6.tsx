"use client";

export function StatsSection6() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:gap-12">
          <div className="flex flex-col gap-6 text-center md:gap-8 lg:flex-row">
            <div className="flex flex-col gap-2 md:gap-3">
              <p className="text-foreground heading-md">124%</p>
              <p className="text-muted-foreground text-pretty">
                Each stat should include a bold numerical figure followed by a
                brief, compelling description.
              </p>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
              <p className="text-foreground heading-md">88%</p>
              <p className="text-muted-foreground text-pretty">
                Each stat should include a bold numerical figure followed by a
                brief, compelling description.
              </p>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
              <p className="text-foreground heading-md">25%</p>
              <p className="text-muted-foreground text-pretty">
                Each stat should include a bold numerical figure followed by a
                brief, compelling description.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
