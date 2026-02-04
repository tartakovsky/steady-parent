"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Rocket } from "lucide-react";
import Link from "next/link";

interface FeatureCardItem {
  title: string;
  description: string;
  link: string;
  IconComponent: React.ElementType;
}

interface FeatureTabItem {
  id: string;
  triggerTitle: string;
  cards: FeatureCardItem[];
}

const featureTabsData: FeatureTabItem[] = [
  {
    id: "feature1",
    triggerTitle: "Feature set 1",
    cards: [
      {
        title: "Feature 1",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/",
        IconComponent: Rocket,
      },
      {
        title: "Feature 2",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature1-card2",
        IconComponent: Rocket,
      },
      {
        title: "Feature 3",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature1-card3",
        IconComponent: Rocket,
      },
      {
        title: "Feature 4",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature1-card4",
        IconComponent: Rocket,
      },
      {
        title: "Feature 5",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature1-card5",
        IconComponent: Rocket,
      },
      {
        title: "Feature 6",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature1-card6",
        IconComponent: Rocket,
      },
    ],
  },
  {
    id: "feature2",
    triggerTitle: "Feature set 2",
    cards: [
      {
        title: "Feature 7",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature2-card1",
        IconComponent: Rocket,
      },
      {
        title: "Feature 8",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature2-card2",
        IconComponent: Rocket,
      },
      {
        title: "Feature 9",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature2-card3",
        IconComponent: Rocket,
      },
      {
        title: "Feature 10",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature2-card4",
        IconComponent: Rocket,
      },
      {
        title: "Feature 11",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature2-card5",
        IconComponent: Rocket,
      },
      {
        title: "Feature 12",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature2-card6",
        IconComponent: Rocket,
      },
    ],
  },
  {
    id: "feature3",
    triggerTitle: "Feature set 3",
    cards: [
      {
        title: "Feature 13",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature3-card1",
        IconComponent: Rocket,
      },
      {
        title: "Feature 14",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature3-card2",
        IconComponent: Rocket,
      },
      {
        title: "Feature 15",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature3-card3",
        IconComponent: Rocket,
      },
      {
        title: "Feature 16",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature3-card4",
        IconComponent: Rocket,
      },
      {
        title: "Feature 17",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature3-card5",
        IconComponent: Rocket,
      },
      {
        title: "Feature 18",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature3-card6",
        IconComponent: Rocket,
      },
    ],
  },
  {
    id: "feature4",
    triggerTitle: "Feature set 4",
    cards: [
      {
        title: "Feature 19",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature4-card1",
        IconComponent: Rocket,
      },
      {
        title: "Feature 20",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature4-card2",
        IconComponent: Rocket,
      },
      {
        title: "Feature 21",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature4-card3",
        IconComponent: Rocket,
      },
      {
        title: "Feature 22",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature4-card4",
        IconComponent: Rocket,
      },
      {
        title: "Feature 23",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature4-card5",
        IconComponent: Rocket,
      },
      {
        title: "Feature 24",
        description:
          "Shortly describe how this feature solves a specific user problem. Focus on benefits not on technical details.",
        link: "/feature4-card6",
        IconComponent: Rocket,
      },
    ],
  },
];

export function FeatureSection19() {
  return (
    <section className="bg-muted/40 section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-10 px-6 md:gap-12">
        <div className="section-title-gap-lg mx-auto flex flex-col items-center text-center md:max-w-xl">
          <Tagline>Feature section</Tagline>
          <h2 className="heading-lg text-foreground">
            Show your solution's impact on user success
          </h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            Explain in one or two concise sentences how your solution transforms
            users' challenges into positive outcomes.
          </p>
        </div>

        <Tabs
          defaultValue={featureTabsData.length > 0 ? featureTabsData[0].id : ""}
          className="w-full gap-6"
        >
          <TabsList className="bg-muted h-10 w-full justify-start overflow-x-auto rounded-full lg:mx-auto lg:w-fit">
            {featureTabsData.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-full px-4"
              >
                {tab.triggerTitle}
              </TabsTrigger>
            ))}
          </TabsList>

          {featureTabsData.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              {tab.cards.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {tab.cards.map((card, index) => (
                    <Link href={card.link} key={index}>
                      <Card className="shadow-xs">
                        <CardHeader>
                          <div className="bg-primary/5 mb-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                            <card.IconComponent className="text-primary h-5 w-5" />
                          </div>
                          <h3 className="heading-sm">{card.title}</h3>
                          <p className="text-muted-foreground text-pretty">
                            {card.description}
                          </p>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <p>No items to display for {tab.triggerTitle}.</p>
                  <p className="text-sm">
                    Please add card data to <code>featureTabsData</code> for
                    this tab.
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
