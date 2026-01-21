import type React from "react";

export function LandingFooter(): React.JSX.Element {
  return (
    <footer className="border-t py-10" aria-label="Footer">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm font-semibold">NMP</div>
        <div className="text-muted-foreground text-sm">
          contact@nomythparenting.com
        </div>
        <div className="text-muted-foreground text-sm">
          © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}

