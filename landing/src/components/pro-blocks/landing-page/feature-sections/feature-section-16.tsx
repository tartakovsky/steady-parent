"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface FeatureItem {
  icon: ReactNode;
  heading: string;
  description: string;
  buttonText?: string;
  buttonOnClick?: () => void;
  imageSrc: string;
  imageAlt: string;
}

interface TabData {
  id: string;
  label: string;
  feature: FeatureItem;
}

interface FeatureSection16Props {
  tagline?: string;
  heading?: string;
  description?: string;
  defaultTab?: string;
  tabs?: TabData[];
}

const defaultTabs: TabData[] = [
  {
    id: "tab1",
    label: "Feature set 1",
    feature: {
      icon: <Rocket className="text-primary h-5 w-5" />,
      heading: "Feature 1 headline",
      description:
        "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes. Focus on the end benefits that matter most to your target audience. Keep it clear and compelling.",
      buttonText: "Learn more",
      imageSrc: "https://ui.shadcn.com/placeholder.svg",
      imageAlt: "Feature section image",
    },
  },
  {
    id: "tab2",
    label: "Feature set 2",
    feature: {
      icon: <Rocket className="text-primary h-5 w-5" />,
      heading: "Feature 2 headline",
      description:
        "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes. Focus on the end benefits that matter most to your target audience. Keep it clear and compelling.",
      buttonText: "Learn more",
      imageSrc: "https://ui.shadcn.com/placeholder.svg",
      imageAlt: "Feature section image",
    },
  },
  {
    id: "tab3",
    label: "Feature set 3",
    feature: {
      icon: <Rocket className="text-primary h-5 w-5" />,
      heading: "Feature 3 headline",
      description:
        "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes. Focus on the end benefits that matter most to your target audience. Keep it clear and compelling.",
      buttonText: "Learn more",
      imageSrc: "https://ui.shadcn.com/placeholder.svg",
      imageAlt: "Feature section image",
    },
  },
];

export function FeatureSection16({
  tagline = "Feature section",
  heading = "Show your solution's impact on user success",
  description = "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
  defaultTab = "tab1",
  tabs = defaultTabs,
}: FeatureSection16Props) {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="section-title-gap-lg mx-auto mb-12 flex flex-col items-center text-center lg:max-w-xl">
          <Tagline>{tagline}</Tagline>
          <h2 className="heading-lg text-foreground">{heading}</h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            {description}
          </p>
        </div>
        <Tabs defaultValue={defaultTab || tabs[0]?.id}>
          <TabsList className="bg-muted mx-auto mb-6 flex h-10 w-full justify-start overflow-x-auto rounded-full lg:w-fit">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="w-full rounded-full px-4"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="flex flex-col items-stretch gap-6 lg:flex-row">
                <div className="bg-muted/80 flex flex-1 flex-col gap-4 rounded-lg p-6 lg:max-w-lg lg:justify-between lg:gap-8 lg:p-8">
                  <div className="flex flex-col items-start gap-6">
                    <div className="bg-card flex h-10 w-10 shrink-0 items-center justify-center rounded-md border shadow-xs">
                      {tab.feature.icon}
                    </div>
                    <h3 className="text-foreground heading-md">
                      {tab.feature.heading}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-6">
                    <p className="text-muted-foreground text-base/7 text-pretty">
                      {tab.feature.description}
                    </p>
                    {tab.feature.buttonText && (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button onClick={tab.feature.buttonOnClick}>
                          {tab.feature.buttonText}
                          <ArrowRight />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full flex-1">
                  <Image
                    src={tab.feature.imageSrc}
                    alt={tab.feature.imageAlt}
                    width={1200}
                    height={600}
                    className="max-h-[560px] w-full rounded-lg object-cover"
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
