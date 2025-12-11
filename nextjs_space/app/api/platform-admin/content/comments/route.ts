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
    const { commentId, action, adminId, flagReason } = await request.json();

    let updatedComment;
    let activityAction: string = '';

    switch (action) {
      case 'flag':
        updatedComment = await prisma.comment.update({
          where: { id: commentId },
          data: {
            isFlagged: true,
            flagReason: flagReason || 'Flagged by admin',
            flaggedAt: new Date(),
            flaggedBy: adminId,
          },
        });
        activityAction = 'FLAGGED_COMMENT';
        break;

      case 'unflag':
        updatedComment = await prisma.comment.update({
          where: { id: commentId },
          data: {
            isFlagged: false,
            flagReason: null,
            flaggedAt: null,
            flaggedBy: null,
          },
        });
        activityAction = 'UNFLAGGED_COMMENT';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log the activity
    await logActivity(
      adminId,
      activityAction as any,
      'COMMENT',
      commentId,
      {
        action,
        commentContent: updatedComment.content.slice(0, 100),
        ...(flagReason && { flagReason }),
      }
    );

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Comment action error:', error);
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
    const { commentId, adminId } = await request.json();

    if (!commentId || !adminId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { content: true },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    // Log the activity
    await logActivity(
      adminId,
      'DELETED_COMMENT',
      'COMMENT',
      commentId,
      { commentContent: comment.content.slice(0, 100) }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
