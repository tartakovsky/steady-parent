"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Search, LayoutGrid, Activity, ShieldCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

interface AccordionItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

const tabsData: TabItem[] = [
  {
    id: "set-1",
    title: "Feature set 1",
    description: "This is the description for feature set 1.",
    icon: Search,
  },
  {
    id: "set-2",
    title: "Feature set 2",
    description: "This is the description for feature set 2.",
    icon: LayoutGrid,
  },
  {
    id: "set-3",
    title: "Feature set 3",
    description: "This is the description for feature set 3.",
    icon: Activity,
  },
  {
    id: "set-4",
    title: "Feature set 4",
    description: "This is the description for feature set 4.",
    icon: ShieldCheck,
  },
];

const accordionData: Record<string, AccordionItem[]> = {
  "set-1": [
    {
      id: "item-1",
      title: "Item 1",
      description: "This is the description for item 1.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
    {
      id: "item-2",
      title: "Item 2",
      description: "This is the description for item 2.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
    {
      id: "item-3",
      title: "Item 3",
      description: "This is the description for item 3.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
    {
      id: "item-4",
      title: "Item 4",
      description: "This is the description for item 4.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
  ],
  "set-2": [
    {
      id: "item-5",
      title: "Item 5",
      description: "This is the description for item 5.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
    {
      id: "item-6",
      title: "Item 6",
      description: "This is the description for item 6.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
    {
      id: "item-7",
      title: "Item 7",
      description: "This is the description for item 7.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
    {
      id: "item-8",
      title: "Item 8",
      description: "This is the description for item 8.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
  ],
  "set-3": [
    {
      id: "item-9",
      title: "Item 9",
      description: "This is the description for item 9.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
    {
      id: "item-10",
      title: "Item 10",
      description: "This is the description for item 10.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
    {
      id: "item-11",
      title: "Item 11",
      description: "This is the description for item 11.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
    {
      id: "item-12",
      title: "Item 12",
      description: "This is the description for item 12.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
  ],
  "set-4": [
    {
      id: "item-13",
      title: "Item 13",
      description: "This is the description for item 13.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
    {
      id: "item-14",
      title: "Item 14",
      description: "This is the description for item 14.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
    {
      id: "item-15",
      title: "Item 15",
      description:
        "Stay compliant with GDPR, CCPA, and other regulations automatically.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
    {
      id: "item-16",
      title: "Item 16",
      description: "This is the description for item 16.",
      image: "https://ui.shadcn.com/placeholder.svg",
    },
  ],
};

export function FeatureSection20() {
  const [activeTab, setActiveTab] = useState(tabsData[0].id);
  const initialAccordionItems = accordionData[tabsData[0].id] || [];
  const [expandedItem, setExpandedItem] = useState<string>(
    initialAccordionItems[0]?.id || "",
  );

  const currentAccordionItems = accordionData[activeTab] || [];
  const activeAccordionItem = currentAccordionItems.find(
    (item) => item.id === expandedItem,
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const newAccordionItems = accordionData[tabId] || [];
    setExpandedItem(newAccordionItems[0]?.id || "");
  };

  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col">
        {/* Header */}
        <div className="section-title-gap-lg mx-auto mb-8 flex max-w-xl flex-col items-center text-center md:mb-12">
          <Tagline>Feature section</Tagline>
          <h2 className="heading-lg text-foreground">
            Show your solution's impact on user success
          </h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            Explain in one or two sentences how your solution transforms users'
            challenges into positive outcomes.
          </p>
        </div>

        {/* Tab Triggers */}
        <div className="mb-6 grid grid-cols-1 gap-1 md:gap-3 lg:grid-cols-4">
          {tabsData.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "hover:bg-accent flex items-center gap-4 rounded-lg p-2 text-left transition-all md:flex-col md:items-start md:rounded-xl md:p-4",
                  isActive ? "bg-accent" : "bg-background hover:bg-accent/50",
                )}
              >
                <div
                  className={cn(
                    "bg-background border-border flex size-8 shrink-0 items-center justify-center rounded-md border md:size-10",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <h3
                    className={cn(
                      "text-base font-semibold md:text-lg",
                      isActive ? "text-foreground" : "text-foreground",
                    )}
                  >
                    {tab.title}
                  </h3>
                  <p className="text-muted-foreground hidden text-sm md:block">
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-muted grid grid-cols-1 gap-8 rounded-2xl p-6 md:p-10 lg:grid-cols-2 lg:gap-12">
          {/* Accordion */}
          <Accordion
            key={activeTab}
            type="single"
            collapsible
            value={expandedItem}
            onValueChange={(value) => {
              if (value) {
                setExpandedItem(value);
              }
            }}
            className="flex flex-col"
          >
            {currentAccordionItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-border"
              >
                <AccordionTrigger>
                  <h3 className="heading-sm">{item.title}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4 pb-2">
                    <p className="text-muted-foreground text-base/7 text-pretty">
                      {item.description}
                    </p>
                    <Button variant="outline" size="sm" className="w-fit">
                      Learn more
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Image Display */}
          <div className="flex items-center justify-center">
            <Image
              src={
                activeAccordionItem?.image ||
                "https://ui.shadcn.com/placeholder.svg"
              }
              alt="Feature preview"
              width={800}
              height={500}
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
