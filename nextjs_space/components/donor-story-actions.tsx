'use client';

import { ReactionButtons } from './reaction-buttons';
import { CommentsSection } from './comments-section';
import { ShareButton } from './share-button';

interface ReactionCount {
  type: 'LOVE' | 'APPLAUSE' | 'MOVED' | 'INSPIRED' | 'GRATEFUL';
  count: number;
}

interface Comment {
  id: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface DonorStoryActionsProps {
  storyId: string;
  title: string;
  url: string;
  initialReactions: ReactionCount[];
  initialComments: Comment[];
}

export function DonorStoryActions({
  storyId,
  title,
  url,
  initialReactions,
  initialComments,
}: DonorStoryActionsProps) {
  return (
    <>
      {/* Engagement Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Share Your Response</h3>
        <div className="flex flex-col gap-4">
          {/* Reactions */}
          <div>
            <ReactionButtons storyId={storyId} initialReactions={initialReactions} />
          </div>

          {/* Share Button */}
          <div>
            <ShareButton title={title} url={url} />
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mb-8">
        <CommentsSection storyId={storyId} initialComments={initialComments} />
      </div>
    </>
  );
}
