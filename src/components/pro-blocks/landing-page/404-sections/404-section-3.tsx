"use client";

import { ChevronRight, File, Home, Newspaper } from "lucide-react";
import Link from "next/link";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
interface ActionLinkProps {
  label: string;
  href: string;
  description?: string;
  icon: React.ReactNode;
}

const ActionLink = ({
  label,
  href,
  description,
  icon: Icon,
}: ActionLinkProps) => (
  <Link
    href={href}
    className="group hover:bg-foreground/5 flex flex-col items-center gap-5 rounded-lg p-3 transition-colors md:flex-row"
  >
    <div className="border-border bg-background flex h-10 w-10 items-center justify-center rounded-md border shadow-sm">
      {Icon}
    </div>
    <div className="flex flex-1 flex-col gap-2 text-center md:gap-0 md:text-left">
      <span className="text-foreground font-medium underline">{label}</span>
      {description && (
        <span className="text-muted-foreground">{description}</span>
      )}
    </div>
    <ChevronRight className="hidden size-5 transition-transform group-hover:translate-x-1 md:block" />
  </Link>
);

const ACTIONS: ActionLinkProps[] = [
  {
    label: "Go back to homepage",
    href: "/",
    description: "Return to our main page to start fresh",
    icon: <Home className="size-5" />,
  },
  {
    label: "Read our documentation",
    href: "/docs",
    description: "Learn more about our features and capabilities",
    icon: <File className="size-5" />,
  },
  {
    label: "Explore our blog",
    href: "/blog",
    description: "Check out our latest articles and updates",
    icon: <Newspaper className="size-5" />,
  },
];

export function X404Section3() {
  return (
    <section
      className="bg-background section-padding-y relative flex flex-col items-center overflow-hidden"
      aria-labelledby="error-title"
    >
      <div className="container-padding-x container flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-6 lg:gap-8">
          <div className="section-title-gap-xl flex flex-col items-center text-center lg:items-start lg:text-left">
            <Tagline>404 Section</Tagline>
            <h1 id="error-title" className="heading-xl">
              Page not found
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Sorry, we couldn't find the page you're looking for. Here are some
              helpful links instead:
            </p>
          </div>
        </div>

        <div className="bg-muted/40 flex w-full flex-1 flex-col gap-3 rounded-xl p-3 md:p-6">
          {ACTIONS.map((action) => (
            <ActionLink key={action.label} {...action} />
          ))}
        </div>
      </div>
    </section>
  );
}
