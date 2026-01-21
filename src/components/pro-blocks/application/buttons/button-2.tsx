"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { ThumbsUp } from "lucide-react";

export function Button2() {
  const [isLiked, setIsLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(24);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prevCount) => (isLiked ? prevCount - 1 : prevCount + 1));
  };

  return (
    <div className="mx-auto my-10 w-fit">
      <ButtonGroup aria-label="Like button">
        <Button
          variant="outline"
          onClick={toggleLike}
          aria-pressed={isLiked}
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          <ThumbsUp />
          <span>{isLiked ? "Liked" : "Like"}</span>
        </Button>

        <ButtonGroupText
          aria-label={`${likeCount} likes`}
          className={`bg-background text-foreground px-3`}
        >
          <span>{likeCount}</span>
        </ButtonGroupText>
      </ButtonGroup>
    </div>
  );
}
