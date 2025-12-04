import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { storyId } = body;

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // For logged-in users, check if they already liked and create a Like record
    if (session?.user?.id) {
      const existingLike = await prisma.like.findFirst({
        where: {
          storyId,
          userId: session.user.id,
        },
      });

      if (existingLike) {
        return NextResponse.json({ error: 'Already liked' }, { status: 400 });
      }

      // Create like record for authenticated user
      await prisma.like.create({
        data: {
          storyId,
          userId: session.user.id,
        },
      });
    }

    // For both logged-in and anonymous users, update analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.analytics.upsert({
      where: {
        storyId_date: {
          storyId,
          date: today,
        },
      },
      update: {
        likes: {
          increment: 1,
        },
      },
      create: {
        storyId,
        date: today,
        likes: 1,
        views: 0,
        shares: 0,
        uniqueVisitors: 0,
      },
    });

    // Get updated like count from analytics (includes both authenticated and anonymous likes)
    const analyticsData = await prisma.analytics.findMany({
      where: { storyId },
    });
    const totalLikes = analyticsData.reduce((sum, record) => sum + (record.likes || 0), 0);

    return NextResponse.json({ success: true, likes: totalLikes });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json(
      { error: 'Failed to like story' },
      { status: 500 }
    );
  }
}
