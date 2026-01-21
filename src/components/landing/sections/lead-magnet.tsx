"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface LeadMagnetProps {
  id?: string;
  title: string;
  description: string;
  submitLabel: string;
  formActionUrl: string;
}

export function LeadMagnet({
  id,
  title,
  description,
  submitLabel,
  formActionUrl,
}: LeadMagnetProps): React.JSX.Element {
  const [email, setEmail] = useState<string>("");

  return (
    <section id={id} className="py-14">
      <div className="mx-auto max-w-3xl px-4">
        <Card>
          <CardHeader>
            <div className="text-2xl font-semibold">{title}</div>
            <div className="text-muted-foreground">{description}</div>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = formActionUrl;
              }}
            >
              <Input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder="Email"
                type="email"
                required
              />
              <Button type="submit">{submitLabel}</Button>
            </form>
            <div className="text-muted-foreground mt-3 text-xs">
              You will get the download link by email.
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

