import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const charityId = formData.get('charityId') as string;

    if (!charityId) {
      return NextResponse.json({ error: 'Missing charity ID' }, { status: 400 });
    }

    // Update charity status to REJECTED
    const charity = await prisma.charity.update({
      where: { id: charityId },
      data: {
        status: 'REJECTED',
      },
      include: {
        users: {
          where: {
            role: 'CHARITY_ADMIN',
          },
        },
      },
    });

    // TODO: Send rejection email to charity admin
    console.log('Charity rejected:', {
      charityId: charity.id,
      charityName: charity.name,
      adminEmail: charity.users[0]?.email,
    });

    // Redirect back to platform admin page
    return NextResponse.redirect(new URL('/platform-admin', request.url));
  } catch (error) {
    console.error('Error rejecting charity:', error);
    return NextResponse.json(
      { error: 'Failed to reject charity' },
      { status: 500 }
    );
  }
}
