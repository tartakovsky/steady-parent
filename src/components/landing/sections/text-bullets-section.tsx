import type React from "react";

export interface TextBulletsSectionProps {
  id?: string;
  eyebrow: string;
  title: string;
  bullets: readonly string[];
  close?: string;
}

export function TextBulletsSection({
  id,
  eyebrow,
  title,
  bullets,
  close,
}: TextBulletsSectionProps): React.JSX.Element {
  return (
    <section id={id} className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="space-y-3">
            <div className="text-muted-foreground text-sm">{eyebrow}</div>
            <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          </div>
          <div className="space-y-4">
            <ul className="space-y-2 text-base leading-7">
              {bullets.map((b) => (
                <li key={b} className="text-muted-foreground">
                  • {b}
                </li>
              ))}
            </ul>
            {close !== undefined && close !== "" ? (
              <p className="text-muted-foreground text-base leading-7">{close}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

