'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface LikeButtonProps {
  storyId: string;
  initialLikes: number;
}

export function LikeButton({ storyId, initialLikes }: LikeButtonProps) {
  const { data: session } = useSession() || {};
  const [likes, setLikes] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  // Check if user has already liked this story (using localStorage for anonymous users)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const likedStories = JSON.parse(localStorage.getItem('likedStories') || '[]');
      setHasLiked(likedStories.includes(storyId));
    }
  }, [storyId]);

  const handleLike = async () => {
    if (hasLiked) {
      toast.info('You already liked this story!');
      return;
    }

    setIsLiking(true);

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId }),
      });

      const data = await response.json();

      if (response.ok) {
        setLikes(data.likes);
        setHasLiked(true);
        
        // Store in localStorage for anonymous users
        if (typeof window !== 'undefined') {
          const likedStories = JSON.parse(localStorage.getItem('likedStories') || '[]');
          likedStories.push(storyId);
          localStorage.setItem('likedStories', JSON.stringify(likedStories));
        }
        
        toast.success('Story liked!');
      } else {
        toast.error(data.error || 'Failed to like story');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLiking || hasLiked}
      className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
        hasLiked
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
          : 'bg-gradient-to-r from-orange-500 to-teal-500 text-white hover:opacity-90'
      } disabled:opacity-50`}
    >
      <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
      <span>{hasLiked ? 'Liked' : 'Like'} ({likes})</span>
    </button>
  );
}
