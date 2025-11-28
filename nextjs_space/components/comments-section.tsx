'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MessageCircle, Send } from 'lucide-react';

interface Comment {
  id: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface CommentsSectionProps {
  storyId: string;
  initialComments: Comment[];
}

export function CommentsSection({ storyId, initialComments }: CommentsSectionProps) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'loading') return;

    // Check if guest name is provided when not logged in
    if (!session && !guestName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          content: newComment.trim(),
          guestName: !session ? guestName.trim() : undefined,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success('Comment submitted for moderation');
      setNewComment('');
      setGuestName('');
    } catch (error) {
      toast.error('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-orange-500" />
        <h3 className="text-2xl font-bold">Comments ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!session && (
          <div>
            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        )}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Share your thoughts
          </label>
          <textarea
            id="comment"
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="
            inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold
            bg-gradient-to-r from-orange-500 to-teal-500
            hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          "
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : 'Post Comment'}
        </button>
        <p className="text-sm text-gray-500">
          Comments are moderated and will appear after approval.
        </p>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{comment.userName}</p>
                    <span className="text-gray-400">•</span>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
