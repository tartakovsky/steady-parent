"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function HeaderSection17() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("npx shadcn@latest init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="page-heading"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <div className="section-title-gap-xl mx-auto flex max-w-xl flex-col items-center text-center">
            <Tagline>Header section</Tagline>
            <h1 id="page-heading" className="heading-xl text-foreground">
              Header section title
            </h1>
            <p
              className="text-muted-foreground text-base lg:text-lg"
              aria-description="page description"
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit interdum
              hendrerit ex vitae sodales.
            </p>
          </div>
          <InputGroup className="w-full max-w-xs">
            <InputGroupAddon align="inline-start">
              <InputGroupText>$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="header17-command"
              value="npx shadcn@latest init"
              type="text"
              required
              aria-required="true"
              readOnly
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label={copied ? "Copied" : "Copy command"}
                onClick={handleCopy}
              >
                {copied ? <Check /> : <Copy />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </section>
  );
}
