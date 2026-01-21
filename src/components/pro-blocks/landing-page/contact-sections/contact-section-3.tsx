"use client";

import { MapPin, Phone, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import {
  SiFacebook,
  SiInstagram,
  SiGithub,
  SiDribbble,
} from "@icons-pack/react-simple-icons";

export function ContactSection3() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="contact-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-8 text-center md:items-start md:text-left">
            <div className="section-title-gap-lg mx-auto flex flex-col items-center md:items-start">
              <Tagline>Contact Section</Tagline>
              <h1 id="contact-heading" className="heading-lg">
                Get in touch
              </h1>
              <p className="text-muted-foreground text-lg/8 text-pretty">
                Write one or two welcoming sentences that encourage contact and
                include your response time commitment.
              </p>
            </div>
            <div className="flex flex-row gap-5">
              <Link
                href="#"
                className="text-foreground transition-all duration-300 hover:scale-110"
              >
                <SiFacebook className="size-5" />
              </Link>
              <Link
                href="#"
                className="text-foreground transition-all duration-300 hover:scale-110"
              >
                <SiInstagram className="size-5" />
              </Link>
              <Link
                href="#"
                className="text-foreground transition-all duration-300 hover:scale-110"
              >
                <SiGithub className="size-5" />
              </Link>
              <Link
                href="#"
                className="text-foreground transition-all duration-300 hover:scale-110"
              >
                <SiDribbble className="size-5" />
              </Link>
            </div>
          </div>
        </div>

        <Separator className="block md:hidden" />

        <div className="md:bg-muted/40 flex w-full flex-1 flex-col items-center rounded-xl md:items-start md:p-12">
          <div className="flex flex-1 flex-col gap-8 md:gap-12">
            <Link
              href="#"
              className="flex cursor-pointer flex-col items-center gap-5 md:flex-row md:items-start"
            >
              <div className="bg-background flex h-10 w-10 items-center justify-center rounded-md border shadow-xs">
                <Phone className="text-primary h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1 text-center md:text-left">
                <h3 className="text-card-foreground text-base leading-6 font-semibold">
                  Call us
                </h3>
                <span className="text-muted-foreground text-base underline">
                  +1 400 500 600
                </span>
              </div>
            </Link>

            <Link
              href="#"
              className="flex cursor-pointer flex-col items-center gap-5 md:flex-row md:items-start"
            >
              <div className="bg-background flex h-10 w-10 items-center justify-center rounded-md border shadow-xs">
                <Mail className="text-primary h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1 text-center md:text-left">
                <h3 className="text-card-foreground text-base leading-6 font-semibold">
                  Write an email
                </h3>
                <span className="text-muted-foreground text-base underline">
                  hello@example.com
                </span>
              </div>
            </Link>

            <Link
              href="#"
              className="flex cursor-pointer flex-col items-center gap-5 md:flex-row md:items-start"
            >
              <div className="bg-background flex h-10 w-10 items-center justify-center rounded-md border shadow-xs">
                <MapPin className="text-primary h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1 text-center md:text-left">
                <h3 className="text-card-foreground text-base leading-6 font-semibold">
                  Visit our office
                </h3>
                <span className="text-muted-foreground text-base underline">
                  192 Griffin Street, Gilbert, AZ 32521
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
