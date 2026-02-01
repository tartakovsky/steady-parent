"use client";

import { useEffect } from "react";

export function HashScrollHandler(): null {
  useEffect(() => {
    const scrollToHash = (): void => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element instanceof HTMLElement) {
          // Use the element's computed scroll-margin-top to match CSS
          const scrollMargin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
          const elementTop = element.getBoundingClientRect().top + window.scrollY;
          const scrollTarget = elementTop - scrollMargin;
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
        setTimeout(scrollToHash, 50);
      });
    };

    if (document.readyState === "complete") {
      waitForImagesAndScroll();
    } else {
      window.addEventListener("load", waitForImagesAndScroll);
    }

    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return null;
}
