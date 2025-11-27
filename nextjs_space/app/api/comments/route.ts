import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

// POST - Submit a new comment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId, content } = await request.json();

    if (!storyId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    // Create comment (pending moderation)
    await prisma.comment.create({
      data: {
        storyId,
        userId: session.user.id,
        userName: session.user.name || 'Anonymous',
        userEmail: session.user.email || undefined,
        content: content.trim(),
        status: 'PENDING',
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
        comments: 1,
      },
      update: {
        comments: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
