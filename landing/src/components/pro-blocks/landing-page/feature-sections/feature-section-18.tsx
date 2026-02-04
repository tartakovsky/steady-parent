"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings2,
  Handshake,
  FileText,
  LockKeyhole,
  CircleCheckBig,
} from "lucide-react";
import { ReactNode } from "react";

// Define the type for a feature item
interface FeatureItem {
  title: string;
  description: string;
}

// Define the type for a tab
interface TabData {
  id: string;
  label: string;
  icon: ReactNode;
  features: FeatureItem[];
}

// Define the component props
interface FeatureTabsSectionProps {
  defaultTab?: string;
  tabs?: TabData[];
  className?: string;
}

const defaultTabs: TabData[] = [
  {
    id: "feature1",
    label: "Feature set 1",
    icon: <Settings2 className="h-6 w-6" />,
    features: [
      {
        title: "Feature title 1",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
      {
        title: "Feature title 2",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
      {
        title: "Feature title 3",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
      {
        title: "Feature title 4",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
    ],
  },
  {
    id: "feature2",
    label: "Feature set 2",
    icon: <FileText className="h-6 w-6" />,
    features: [
      {
        title: "Feature title 5",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
      {
        title: "Feature title 6",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
      {
        title: "Feature title 7",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
      {
        title: "Feature title 8",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
    ],
  },
  {
    id: "feature3",
    label: "Feature set 3",
    icon: <Handshake className="h-6 w-6" />,
    features: [
      {
        title: "Feature title 9",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
      {
        title: "Feature title 10",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
      {
        title: "Feature title 11",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
      {
        title: "Feature title 12",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
    ],
  },
  {
    id: "feature4",
    label: "Feature set 4",
    icon: <LockKeyhole className="h-6 w-6" />,
    features: [
      {
        title: "Feature title 13",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
      {
        title: "Feature title 14",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
      {
        title: "Feature title 15",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
      {
        title: "Feature title 16",
        description:
          "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
      },
    ],
  },
];

export function FeatureSection18({
  defaultTab = "feature1",
  tabs = defaultTabs,
}: FeatureTabsSectionProps) {
  return (
    <section className="bg-background section-padding-y">
      <div className="relative mx-auto max-w-7xl px-6">
        <Tabs
          defaultValue={defaultTab || tabs[0]?.id}
          className="relative flex w-full flex-col items-start gap-8 lg:flex-row lg:gap-16"
        >
          <TabsList className="flex h-auto w-full flex-col lg:max-w-sm">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex w-full items-center justify-start gap-3 p-2 text-base md:p-3"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <div className="md:bg-muted/50 space-y-8 p-0 md:rounded-2xl md:p-12">
                <h2 className="text-foreground heading-md">{tab.label}</h2>

                <div className="space-y-8">
                  {tab.features.map((feature, index) => (
                    <div key={index} className="flex gap-4">
                      <CircleCheckBig className="text-primary size-6 shrink-0" />
                      <div className="space-y-3">
                        <h3 className="text-foreground heading-sm">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-base/7 text-pretty">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
