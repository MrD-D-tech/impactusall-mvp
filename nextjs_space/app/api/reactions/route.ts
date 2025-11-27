import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

type ReactionType = 'LOVE' | 'APPLAUSE' | 'MOVED' | 'INSPIRED' | 'GRATEFUL';

// GET - Fetch user's reactions for a story
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ userReactions: [] });
    }

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    const reactions = await prisma.reaction.findMany({
      where: {
        storyId,
        userId: session.user.id,
      },
      select: {
        reactionType: true,
      },
    });

    return NextResponse.json({
      userReactions: reactions.map((r) => r.reactionType),
    });
  } catch (error) {
    console.error('Error fetching user reactions:', error);
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
  }
}

// POST - Add a reaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId, reactionType } = await request.json();

    if (!storyId || !reactionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if reaction already exists
    const existing = await prisma.reaction.findFirst({
      where: {
        storyId,
        userId: session.user.id,
        reactionType,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Reaction already exists' }, { status: 400 });
    }

    // Create reaction
    await prisma.reaction.create({
      data: {
        storyId,
        userId: session.user.id,
        reactionType,
      },
    });

    // Update analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.analytics.upsert({
      where: {
        storyId_date: {
          storyId,
          date: today,
        },
      },
      create: {
        storyId,
        date: today,
        reactions: 1,
      },
      update: {
        reactions: {
          increment: 1,
        },
      },
    });

    // Get updated reaction counts
    const reactions = await getReactionCounts(storyId);

    return NextResponse.json({ reactions });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}

// DELETE - Remove a reaction
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId, reactionType } = await request.json();

    if (!storyId || !reactionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Delete reaction
    await prisma.reaction.deleteMany({
      where: {
        storyId,
        userId: session.user.id,
        reactionType,
      },
    });

    // Update analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.analytics.updateMany({
      where: {
        storyId,
        date: today,
      },
      data: {
        reactions: {
          decrement: 1,
        },
      },
    });

    // Get updated reaction counts
    const reactions = await getReactionCounts(storyId);

    return NextResponse.json({ reactions });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
  }
}

// Helper function to get reaction counts
async function getReactionCounts(storyId: string) {
  const reactionCounts = await prisma.reaction.groupBy({
    by: ['reactionType'],
    where: { storyId },
    _count: true,
  });

  return reactionCounts.map((rc) => ({
    type: rc.reactionType,
    count: rc._count,
  }));
}
