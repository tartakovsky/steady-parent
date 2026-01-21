"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Bookmark } from "lucide-react";

export function Button8() {
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [bookmarkCount, setBookmarkCount] = React.useState(24);

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    setBookmarkCount((prevCount) =>
      isBookmarked ? prevCount - 1 : prevCount + 1,
    );
  };

  return (
    <div className="mx-auto my-10 w-fit">
      <ButtonGroup aria-label="Bookmark button">
        <Button
          variant="outline"
          onClick={toggleBookmark}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <Bookmark />
          <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
        </Button>

        <ButtonGroupText
          aria-label={`${bookmarkCount} bookmarks`}
          className={`bg-background text-foreground px-3`}
        >
          <span>{bookmarkCount}</span>
        </ButtonGroupText>
      </ButtonGroup>
    </div>
  );
}
