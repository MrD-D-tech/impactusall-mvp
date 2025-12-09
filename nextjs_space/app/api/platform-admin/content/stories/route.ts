import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { storyId, action, adminId, flagReason } = await request.json();

    let updatedStory;
    let activityAction: string = '';

    switch (action) {
      case 'flag':
        updatedStory = await prisma.story.update({
          where: { id: storyId },
          data: {
            isFlagged: true,
            flagReason: flagReason || 'Flagged by admin',
            flaggedAt: new Date(),
            flaggedBy: adminId,
          },
        });
        activityAction = 'FLAGGED_STORY';
        break;

      case 'unflag':
        updatedStory = await prisma.story.update({
          where: { id: storyId },
          data: {
            isFlagged: false,
            flagReason: null,
            flaggedAt: null,
            flaggedBy: null,
          },
        });
        activityAction = 'UNFLAGGED_STORY';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log the activity
    await logActivity(
      adminId,
      activityAction as any,
      'STORY',
      storyId,
      {
        action,
        storyTitle: updatedStory.title,
        ...(flagReason && { flagReason }),
      }
    );

    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error('Story action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { storyId, adminId } = await request.json();

    if (!storyId || !adminId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { title: true },
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    await prisma.story.delete({
      where: { id: storyId },
    });

    // Log the activity
    await logActivity(
      adminId,
      'DELETED_STORY',
      'STORY',
      storyId,
      { storyTitle: story.title }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Story deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}
