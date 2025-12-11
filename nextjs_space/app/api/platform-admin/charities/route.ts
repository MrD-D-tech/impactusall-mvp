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
    const { charityId, action, adminId, amount } = await request.json();

    let updatedCharity;
    let activityAction: string = '';

    switch (action) {
      case 'approve':
        updatedCharity = await prisma.charity.update({
          where: { id: charityId },
          data: {
            status: 'APPROVED',
            subscriptionStatus: 'ACTIVE',
          },
        });
        activityAction = 'APPROVED_CHARITY';
        break;

      case 'reject':
        updatedCharity = await prisma.charity.update({
          where: { id: charityId },
          data: { status: 'REJECTED' },
        });
        activityAction = 'REJECTED_CHARITY';
        break;

      case 'suspend':
        updatedCharity = await prisma.charity.update({
          where: { id: charityId },
          data: { subscriptionStatus: 'SUSPENDED' },
        });
        activityAction = 'SUSPENDED_CHARITY';
        break;

      case 'resume':
        updatedCharity = await prisma.charity.update({
          where: { id: charityId },
          data: { subscriptionStatus: 'ACTIVE' },
        });
        activityAction = 'UPDATED_CHARITY';
        break;

      case 'payment':
        if (!amount) {
          return NextResponse.json({ error: 'Payment amount required' }, { status: 400 });
        }

        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        updatedCharity = await prisma.charity.update({
          where: { id: charityId },
          data: {
            lastPaymentDate: new Date(),
            nextPaymentDue: nextMonth,
          },
        });
        activityAction = 'UPDATED_CHARITY';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log the activity
    await logActivity(
      adminId,
      activityAction as any,
      'CHARITY',
      charityId,
      {
        action,
        charityName: updatedCharity.name,
        ...(amount && { amount }),
      }
    );

    return NextResponse.json(updatedCharity);
  } catch (error) {
    console.error('Charity action error:', error);
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
    const charityId = searchParams.get('id');
    const adminId = searchParams.get('adminId');

    if (!charityId || !adminId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const charity = await prisma.charity.findUnique({
      where: { id: charityId },
      select: { name: true },
    });

    if (!charity) {
      return NextResponse.json({ error: 'Charity not found' }, { status: 404 });
    }

    await prisma.charity.delete({
      where: { id: charityId },
    });

    // Log the activity
    await logActivity(
      adminId,
      'DELETED_CHARITY' as any,
      'CHARITY',
      charityId,
      { charityName: charity.name }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Charity deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete charity' },
      { status: 500 }
    );
  }
}
