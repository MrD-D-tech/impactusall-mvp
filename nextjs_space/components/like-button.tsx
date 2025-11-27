'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface LikeButtonProps {
  storyId: string;
  initialLikes: number;
}

export function LikeButton({ storyId, initialLikes }: LikeButtonProps) {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!session?.user) {
      toast.error('Please log in to like stories');
      router.push('/login');
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
      disabled={isLiking}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-teal-500 text-white rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      <Heart className="w-5 h-5" />
      <span>Like ({likes})</span>
    </button>
  );
}
