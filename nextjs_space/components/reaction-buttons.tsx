'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type ReactionType = 'LOVE' | 'APPLAUSE' | 'MOVED' | 'INSPIRED' | 'GRATEFUL';

interface ReactionCount {
  type: ReactionType;
  count: number;
}

interface ReactionButtonsProps {
  storyId: string;
  initialReactions: ReactionCount[];
}

const REACTIONS = [
  { type: 'LOVE' as ReactionType, emoji: '❤️', label: 'Love' },
  { type: 'APPLAUSE' as ReactionType, emoji: '👏', label: 'Applause' },
  { type: 'MOVED' as ReactionType, emoji: '😢', label: 'Moved' },
  { type: 'INSPIRED' as ReactionType, emoji: '✨', label: 'Inspired' },
  { type: 'GRATEFUL' as ReactionType, emoji: '🙏', label: 'Grateful' },
];

export function ReactionButtons({ storyId, initialReactions }: ReactionButtonsProps) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [reactions, setReactions] = useState<ReactionCount[]>(initialReactions);
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  // Fetch user's reactions on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/reactions?storyId=${storyId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.userReactions) {
            setUserReactions(data.userReactions);
          }
        })
        .catch(() => {});
    }
  }, [storyId, session?.user?.id]);

  const handleReaction = async (type: ReactionType) => {
    if (status === 'loading') return;

    if (!session) {
      toast.error('Please log in to react to stories');
      router.push('/login');
      return;
    }

    setLoading(type);

    try {
      const isRemoving = userReactions.includes(type);
      const method = isRemoving ? 'DELETE' : 'POST';

      const response = await fetch('/api/reactions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, reactionType: type }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();

      // Update reactions count
      setReactions(data.reactions);

      // Update user reactions
      if (isRemoving) {
        setUserReactions(userReactions.filter((r) => r !== type));
        toast.success(`Reaction removed`);
      } else {
        setUserReactions([...userReactions, type]);
        toast.success(`Reaction added!`);
      }
    } catch (error) {
      toast.error('Failed to update reaction');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {REACTIONS.map(({ type, emoji, label }) => {
        const reaction = reactions.find((r) => r.type === type);
        const count = reaction?.count || 0;
        const isActive = userReactions.includes(type);
        const isLoading = loading === type;

        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={isLoading}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200 transform hover:scale-105
              ${isActive 
                ? 'bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow-lg' 
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-600'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={`${label} - ${count} ${count === 1 ? 'person' : 'people'}`}
          >
            <span className="text-lg">{emoji}</span>
            {count > 0 && (
              <span className="font-semibold">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
