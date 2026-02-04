"use client";

import type React from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export type MediaDialogMedia =
  | { kind: "video"; src: string; posterSrc?: string }
  | { kind: "image"; src: string; alt: string }
  | { kind: "none" };

export interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  media: MediaDialogMedia;
}

export function MediaDialog({
  open,
  onOpenChange,
  title,
  media,
}: MediaDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>{title}</DialogTitle>
        <div className="mt-4">
          {media.kind === "video" ? (
            <video
              className="w-full rounded-md"
              controls
              playsInline
              preload="metadata"
              poster={media.posterSrc}
            >
              <source src={media.src} />
            </video>
          ) : null}
          {media.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="w-full rounded-md"
              src={media.src}
              alt={media.alt}
            />
          ) : null}
          {media.kind === "none" ? null : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

