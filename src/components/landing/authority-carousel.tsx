"use client";

import Image from "next/image";
import type React from "react";

import { ContentCarousel } from "@/components/carousel/content-carousel";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

const authorityItems = [
  {
    id: "bruce-d-perry",
    name: "Bruce D. Perry",
    credentials: "M.D., Ph.D. in Neuroscience",
    description:
      'Psychiatrist behind the neurosequential model and the critical "Regulate, Relate, Reason" sequence used to connect with distressed children.',
    imageSrc:
      "/landing/authority/tild6236-3232-4738-a139-333763343163__bruce_d_perry_md_phd.png",
    imageAlt: "Bruce D. Perry",
  },
  {
    id: "daniel-siegel-tina-payne-bryson",
    name: "Daniel Siegel & Tina Payne Bryson",
    credentials: "M.D. in Psychiatry & Ph.D. in Social Work",
    description:
      "Authors of The Whole-Brain Child, providing foundational strategies for integrating logic and emotion to nurture developing minds.",
    imageSrc:
      "/landing/authority/tild3666-3839-4532-b566-353562373437__frame_278.png",
    imageAlt: "Daniel Siegel and Tina Payne Bryson",
  },
  {
    id: "stephen-w-porges",
    name: "Stephen W. Porges",
    credentials: "Ph.D. in Psychophysiology",
    description:
      "Creator of Polyvagal Theory, identifying the distinct nervous system states of safety, fight/flight mobilization, and shutdown.",
    imageSrc:
      "/landing/authority/tild3434-3836-4434-a638-633934616332__stephen_w_porges_phd.png",
    imageAlt: "Stephen W. Porges",
  },
  {
    id: "adele-diamond",
    name: "Adele Diamond",
    credentials: "Ph.D. in Developmental Cognitive Neuroscience",
    description:
      "Neuroscientist specializing in executive functions, defining the biological developmental limits of impulse control and reasoning in young children.",
    imageSrc:
      "/landing/authority/tild3565-6664-4666-a330-643038313164__dr_adele_diamond_phd.png",
    imageAlt: "Adele Diamond",
  },
  {
    id: "bruce-e-compas",
    name: "Bruce E. Compas",
    credentials: "Ph.D. in Clinical Psychology",
    description:
      "Researcher on coping styles, distinguishing between helpful regulation and harmful strategies like suppression, avoidance, and rumination.",
    imageSrc:
      "/landing/authority/tild6531-3435-4265-b036-333135333861__bruce_e_compas_phd.png",
    imageAlt: "Bruce E. Compas",
  },
  {
    id: "john-bowlby",
    name: "John Bowlby",
    credentials: "M.D. in Psychiatry",
    description:
      "The father of attachment theory, establishing that secure emotional bonds are the absolute prerequisite for independent emotional regulation.",
    imageSrc:
      "/landing/authority/tild6430-3366-4265-b531-356564313762__john_bowlby_md.png",
    imageAlt: "John Bowlby",
  },
] as const;

export function AuthorityCarousel(): React.JSX.Element {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-10">
        <div className="flex flex-col gap-4">
          <Tagline>Authority</Tagline>
          <h2 className="heading-lg text-foreground">
            Evidence-backed voices guiding the approach
          </h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            Learn from the researchers and clinicians whose work shapes how we
            build emotional regulation in children.
          </p>
        </div>

        <ContentCarousel
          items={authorityItems}
          className="w-full"
          contentClassName="w-full overflow-visible"
          itemClassName="flex-shrink-0 !w-[80vw] sm:!w-[60vw] md:!w-[40vw] lg:!w-[33vw]"
          spaceBetween={16}
          renderCard={(item) => (
            <div className="flex h-full flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
              <div className="flex items-center gap-4">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full border">
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.credentials}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          )}
        />
      </div>
    </section>
  );
}
