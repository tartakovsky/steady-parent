"use client";

import { MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
export function ContactSection5() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="contact-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-12 md:items-center md:gap-16 lg:flex-row">
        <div className="order-2 w-full flex-1 lg:order-1">
          <AspectRatio ratio={1}>
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Contact section image"
              fill
              className="rounded-xl object-cover"
            />
          </AspectRatio>
        </div>

        <div className="order-1 flex flex-1 flex-col gap-6 md:gap-8 lg:order-2">
          <div className="section-title-gap-lg mx-auto flex flex-col">
            <Tagline>Contact Section</Tagline>
            <h1 id="contact-heading" className="heading-lg">
              Get in touch
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Write one or two welcoming sentences that encourage contact and
              include your response time commitment.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="#" className="flex items-start gap-3 hover:underline">
              <div className="pt-0.5">
                <Phone className="text-primary size-5" />
              </div>
              <span className="text-card-foreground text-base leading-6 font-medium">
                (406) 555-0120
              </span>
            </Link>

            <Link href="#" className="flex items-start gap-3 hover:underline">
              <div className="pt-0.5">
                <Mail className="text-primary size-5" />
              </div>
              <span className="text-card-foreground text-base leading-6 font-medium">
                hello@example.com
              </span>
            </Link>

            <Link href="#" className="flex items-start gap-3 hover:underline">
              <div className="pt-0.5">
                <MapPin className="text-primary size-5" />
              </div>
              <span className="text-card-foreground text-base leading-6 font-medium">
                192 Griffin Street, Gilbert, AZ 32521
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
