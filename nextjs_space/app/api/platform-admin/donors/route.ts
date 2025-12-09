import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const donorId = searchParams.get('id');
    const adminId = searchParams.get('adminId');

    if (!donorId || !adminId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      select: { name: true },
    });

    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    await prisma.donor.delete({
      where: { id: donorId },
    });

    // Log the activity
    await logActivity(
      adminId,
      'DELETED_DONOR',
      'DONOR',
      donorId,
      { donorName: donor.name }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Donor deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete donor' },
      { status: 500 }
    );
  }
}
