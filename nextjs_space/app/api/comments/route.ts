import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// POST - Submit a new comment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { storyId, content, guestName } = await request.json();

    if (!storyId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    // For guest users, require a name
    if (!session?.user && !guestName?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Determine comment status: Auto-approve authenticated users, moderate guests
    const commentStatus = session?.user ? 'APPROVED' : 'PENDING';

    // Create comment
    await prisma.comment.create({
      data: {
        storyId,
        userId: session?.user?.id || null,
        userName: session?.user ? (session.user.name || 'Anonymous') : guestName.trim(),
        userEmail: session?.user?.email || undefined,
        content: content.trim(),
        status: commentStatus,
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
