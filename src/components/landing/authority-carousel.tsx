"use client";

import Image from "next/image";
import type React from "react";

import { ContentCarousel } from "@/components/carousel/content-carousel";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

interface AuthorityCard {
  /** Unique identifier for carousel items. */
  id: string;
  /** Person name. */
  title: string;
  /** Credential line. */
  subtitle: string;
  /** Supporting description. */
  body: string;
  /** Avatar image URL. */
  imageUrl: string;
  /** Avatar alt text. */
  imageAlt: string;
}

interface AuthorityContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** List of authority cards. */
  cards: readonly AuthorityCard[];
}

const authorityContent: AuthorityContent = {
  eyebrow: "Authority",
  title: "Evidence-backed voices guiding the approach",
  body:
    "Learn from the researchers and clinicians whose work shapes how we build emotional regulation in children.",
  cards: [
    {
      id: "bruce-d-perry",
      title: "Bruce D. Perry",
      subtitle: "M.D., Ph.D. in Neuroscience",
      body:
        'Psychiatrist behind the neurosequential model and the critical "Regulate, Relate, Reason" sequence used to connect with distressed children.',
      imageUrl:
        "/landing/authority/tild6236-3232-4738-a139-333763343163__bruce_d_perry_md_phd.png",
      imageAlt: "Bruce D. Perry",
    },
    {
      id: "daniel-siegel-tina-payne-bryson",
      title: "Daniel Siegel & Tina Payne Bryson",
      subtitle: "M.D. in Psychiatry & Ph.D. in Social Work",
      body:
        "Authors of The Whole-Brain Child, providing foundational strategies for integrating logic and emotion to nurture developing minds.",
      imageUrl:
        "/landing/authority/tild3666-3839-4532-b566-353562373437__frame_278.png",
      imageAlt: "Daniel Siegel and Tina Payne Bryson",
    },
    {
      id: "stephen-w-porges",
      title: "Stephen W. Porges",
      subtitle: "Ph.D. in Psychophysiology",
      body:
        "Creator of Polyvagal Theory, identifying the distinct nervous system states of safety, fight/flight mobilization, and shutdown.",
      imageUrl:
        "/landing/authority/tild3434-3836-4434-a638-633934616332__stephen_w_porges_phd.png",
      imageAlt: "Stephen W. Porges",
    },
    {
      id: "adele-diamond",
      title: "Adele Diamond",
      subtitle: "Ph.D. in Developmental Cognitive Neuroscience",
      body:
        "Neuroscientist specializing in executive functions, defining the biological developmental limits of impulse control and reasoning in young children.",
      imageUrl:
        "/landing/authority/tild3565-6664-4666-a330-643038313164__dr_adele_diamond_phd.png",
      imageAlt: "Adele Diamond",
    },
    {
      id: "bruce-e-compas",
      title: "Bruce E. Compas",
      subtitle: "Ph.D. in Clinical Psychology",
      body:
        "Researcher on coping styles, distinguishing between helpful regulation and harmful strategies like suppression, avoidance, and rumination.",
      imageUrl:
        "/landing/authority/tild6531-3435-4265-b036-333135333861__bruce_e_compas_phd.png",
      imageAlt: "Bruce E. Compas",
    },
    {
      id: "john-bowlby",
      title: "John Bowlby",
      subtitle: "M.D. in Psychiatry",
      body:
        "The father of attachment theory, establishing that secure emotional bonds are the absolute prerequisite for independent emotional regulation.",
      imageUrl:
        "/landing/authority/tild6430-3366-4265-b531-356564313762__john_bowlby_md.png",
      imageAlt: "John Bowlby",
    },
  ],
};

export function AuthorityCarousel(): React.JSX.Element {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-10">
        <div className="flex flex-col gap-4">
          <Tagline>{authorityContent.eyebrow}</Tagline>
          <h2 className="heading-lg text-foreground">
            {authorityContent.title}
          </h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            {authorityContent.body}
          </p>
        </div>

        <ContentCarousel
          items={authorityContent.cards}
          className="w-full"
          contentClassName="w-full overflow-visible"
          itemClassName="flex-shrink-0 !w-[80vw] sm:!w-[60vw] md:!w-[40vw] lg:!w-[33vw]"
          spaceBetween={16}
          renderCard={(item) => (
            <div className="flex h-full flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
              <div className="flex items-center gap-4">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full border">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </div>
          )}
        />
      </div>
    </section>
  );
}
