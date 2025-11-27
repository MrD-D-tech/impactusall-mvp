'use client';

import { LikeButton } from './like-button';
import { ShareButton } from './share-button';

interface StoryActionsProps {
  storyId: string;
  initialLikes: number;
  title: string;
  url: string;
}

export function StoryActions({ storyId, initialLikes, title, url }: StoryActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-12 pb-12 border-b">
      <LikeButton storyId={storyId} initialLikes={initialLikes} />
      <ShareButton title={title} url={url} />
    </div>
  );
}
