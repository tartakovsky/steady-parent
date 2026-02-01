"use client";

import { useEffect } from "react";

const NAVBAR_HEIGHT = 90;

export function HashScrollHandler(): null {
  useEffect(() => {
    const scrollToHash = (): void => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          const elementTop = element.getBoundingClientRect().top + window.scrollY;
          const scrollTarget = elementTop - NAVBAR_HEIGHT;
          window.scrollTo({ top: scrollTarget, behavior: "smooth" });
        }
      }
    };

    const waitForImagesAndScroll = (): void => {
      const images = document.querySelectorAll("img");
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
      });

      Promise.all(imagePromises).then(() => {
        // Additional delay after images load to ensure layout is stable
        setTimeout(scrollToHash, 50);
      });
    };

    // Wait for document to be fully loaded, then wait for images
    if (document.readyState === "complete") {
      waitForImagesAndScroll();
    } else {
      window.addEventListener("load", waitForImagesAndScroll);
    }

    // Also listen for hash changes (for same-page navigation)
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return null;
}
