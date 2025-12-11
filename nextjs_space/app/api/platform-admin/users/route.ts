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
    const { userId, action, adminId, newRole } = await request.json();

    let updatedUser;
    let activityAction: string = '';

    switch (action) {
      case 'changeRole':
        if (!newRole) {
          return NextResponse.json({ error: 'New role required' }, { status: 400 });
        }

        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role: newRole },
        });
        activityAction = 'CHANGED_USER_ROLE';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log the activity
    await logActivity(
      adminId,
      activityAction as any,
      'USER',
      userId,
      {
        action,
        userName: updatedUser.name,
        userEmail: updatedUser.email,
        ...(newRole && { oldRole: session.user.role, newRole }),
      }
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('User action error:', error);
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
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('id');
    const adminId = searchParams.get('adminId');

    if (!userId || !adminId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Prevent deleting self
    if (userId === adminId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    // Log the activity
    await logActivity(
      adminId,
      'DELETED_USER',
      'USER',
      userId,
      { userName: user.name, userEmail: user.email }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
