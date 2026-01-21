"use client";

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

interface FeatureItem {
  heading: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: "left" | "right";
}

interface TabData {
  id: string;
  label: string;
  items: FeatureItem[];
}

interface FeatureSection17Props {
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
    items: [
      {
        heading: "Feature 1",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum hendrerit ex vitae sodales. Donec id leo ipsum. Phasellus volutpat aliquet mauris, et blandit nulla laoreet vitae.",
        imageSrc: "https://ui.shadcn.com/placeholder.svg",
        imageAlt: "Image",
        imagePosition: "right",
      },
      {
        heading: "Feature 2",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum hendrerit ex vitae sodales. Donec id leo ipsum. Phasellus volutpat aliquet mauris, et blandit nulla laoreet vitae. Quisque ante dui, porta eu felis nec, scelerisque pharetra turpis.",
        imageSrc: "https://ui.shadcn.com/placeholder.svg",
        imageAlt: "Image",
        imagePosition: "left",
      },
      {
        heading: "Feature 3",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum hendrerit ex vitae sodales. Donec id leo ipsum. Phasellus volutpat aliquet mauris, et blandit nulla laoreet vitae.",
        imageSrc: "https://ui.shadcn.com/placeholder.svg",
        imageAlt: "Image",
        imagePosition: "right",
      },
    ],
  },
  {
    id: "tab2",
    label: "Feature set 2",
    items: [
      {
        heading: "Feature 5",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum hendrerit ex vitae sodales. Donec id leo ipsum. Phasellus volutpat aliquet mauris, et blandit nulla laoreet vitae. Quisque ante dui, porta eu felis nec, scelerisque pharetra turpis.",
        imageSrc: "https://ui.shadcn.com/placeholder.svg",
        imageAlt: "Image",
        imagePosition: "right",
      },
      {
        heading: "Feature 6",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum hendrerit ex vitae sodales. Donec id leo ipsum. Phasellus volutpat aliquet mauris, et blandit nulla laoreet vitae.",
        imageSrc: "https://ui.shadcn.com/placeholder.svg",
        imageAlt: "Image",
        imagePosition: "left",
      },
      {
        heading: "Feature 7",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum hendrerit ex vitae sodales. Donec id leo ipsum. Phasellus volutpat aliquet mauris, et blandit nulla laoreet vitae. Quisque ante dui, porta eu felis nec, scelerisque pharetra turpis.",
        imageSrc: "https://ui.shadcn.com/placeholder.svg",
        imageAlt: "Image",
        imagePosition: "right",
      },
    ],
  },
  {
    id: "tab3",
    label: "Feature set 3",
    items: [
      {
        heading: "Feature 9",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum hendrerit ex vitae sodales. Donec id leo ipsum. Phasellus volutpat aliquet mauris, et blandit nulla laoreet vitae. Quisque ante dui, porta eu felis nec, scelerisque pharetra turpis.",
        imageSrc: "https://ui.shadcn.com/placeholder.svg",
        imageAlt: "Image",
        imagePosition: "right",
      },
      {
        heading: "Feature 10",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum hendrerit ex vitae sodales. Donec id leo ipsum. Phasellus volutpat aliquet mauris, et blandit nulla laoreet vitae.",
        imageSrc: "https://ui.shadcn.com/placeholder.svg",
        imageAlt: "Image",
        imagePosition: "left",
      },
      {
        heading: "Feature 11",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum hendrerit ex vitae sodales. Donec id leo ipsum. Phasellus volutpat aliquet mauris, et blandit nulla laoreet vitae. Quisque ante dui, porta eu felis nec, scelerisque pharetra turpis.",
        imageSrc: "https://ui.shadcn.com/placeholder.svg",
        imageAlt: "Image",
        imagePosition: "right",
      },
    ],
  },
  {
    id: "tab4",
    label: "Feature set 4",
    items: [
      {
        heading: "Feature 13",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum hendrerit ex vitae sodales. Donec id leo ipsum. Phasellus volutpat aliquet mauris, et blandit nulla laoreet vitae. Quisque ante dui, porta eu felis nec, scelerisque pharetra turpis.",
        imageSrc: "https://ui.shadcn.com/placeholder.svg",
        imageAlt: "Image",
        imagePosition: "right",
      },
      {
        heading: "Feature 14",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum hendrerit ex vitae sodales. Donec id leo ipsum. Phasellus volutpat aliquet mauris, et blandit nulla laoreet vitae. Quisque ante dui, porta eu felis nec, scelerisque pharetra turpis.",
        imageSrc: "https://ui.shadcn.com/placeholder.svg",
        imageAlt: "Image",
        imagePosition: "left",
      },
      {
        heading: "Feature 15",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum hendrerit ex vitae sodales. Donec id leo ipsum. Phasellus volutpat aliquet mauris, et blandit nulla laoreet vitae. Quisque ante dui, porta eu felis nec, scelerisque pharetra turpis.",
        imageSrc: "https://ui.shadcn.com/placeholder.svg",
        imageAlt: "Image",
        imagePosition: "right",
      },
    ],
  },
];

export function FeatureSection17({
  tagline = "Feature section",
  heading = "Show your solution's impact on user success",
  description = "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
  defaultTab = "tab1",
  tabs = defaultTabs,
}: FeatureSection17Props) {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 md:gap-12">
        <div className="section-title-gap-lg mx-auto flex flex-col items-start lg:max-w-xl lg:items-center lg:text-center">
          <Tagline>{tagline}</Tagline>
          <h2 className="heading-lg text-foreground">{heading}</h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            {description}
          </p>
        </div>

        <Tabs defaultValue={defaultTab || tabs[0]?.id} className="w-full">
          <TabsList className="bg-muted mb-8 flex h-10 w-full justify-start overflow-x-auto rounded-full lg:mx-auto lg:w-fit">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="w-full rounded-full px-4 text-left lg:w-fit"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="w-full">
              <div className="flex flex-col gap-12">
                {tab.items.map((item, index) => {
                  const isImageLeft = item.imagePosition === "left";

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-8 md:gap-16 lg:grid-cols-2"
                    >
                      <div className="flex flex-col items-start justify-center gap-4">
                        <h3 className="text-foreground heading-md">
                          {item.heading}
                        </h3>
                        <p className="text-muted-foreground text-base/7 text-pretty">
                          {item.description}
                        </p>
                      </div>
                      <Image
                        src={item.imageSrc}
                        alt={item.imageAlt}
                        height={1200}
                        width={1200}
                        className={`aspect-[4/3] rounded-xl object-cover ${
                          isImageLeft ? "order-last lg:order-first" : ""
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
