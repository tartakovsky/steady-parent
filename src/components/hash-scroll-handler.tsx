"use client";

import { useEffect } from "react";

export function HashScrollHandler(): null {
  useEffect(() => {
    const scrollToHash = (): void => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    // Wait for document to be fully loaded (including images)
    if (document.readyState === "complete") {
      setTimeout(scrollToHash, 50);
    } else {
      window.addEventListener("load", () => setTimeout(scrollToHash, 50));
    }

    // Also listen for hash changes (for same-page navigation)
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return null;
}
