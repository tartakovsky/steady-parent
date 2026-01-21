"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function TeamSection3() {
  const teamMembers = [
    {
      name: "Ricky Smith",
      role: "CEO",
      image: "https://github.com/shadcn.png",
    },
    {
      name: "Kurt Bates",
      role: "Innovation Specialist",
      image: "https://github.com/shadcn.png",
    },
    {
      name: "Dennis Callis",
      role: "Designer",
      image: "https://github.com/shadcn.png",
    },
    {
      name: "Frances Swann",
      role: "UI/UX Designer",
      image: "https://github.com/shadcn.png",
    },
    {
      name: "Corina McCoy",
      role: "Culture Curator",
      image: "https://github.com/shadcn.png",
    },
    {
      name: "Rhonda Rhodes",
      role: "Innovation Specialist",
      image: "https://github.com/shadcn.png",
    },
    {
      name: "Roger Rogers",
      role: "Laziness Expert",
      image: "https://github.com/shadcn.png",
    },
  ];

  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-10 md:gap-12">
          <div className="section-title-gap-lg flex max-w-xl flex-col items-center text-center">
            <Tagline>Team section</Tagline>
            <h2 className="heading-lg text-foreground">
              Showcase that builds connection
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Add a concise value statement that highlights your team's
              expertise and culture while maintaining a professional tone.
            </p>
          </div>

          <div className="flex w-full flex-wrap justify-center gap-12 lg:gap-x-6 lg:gap-y-12">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex w-full flex-col items-center gap-4 text-center md:w-1/3 lg:w-1/5"
              >
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt={member.name}
                    />
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-foreground text-base font-semibold">
                      {member.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
