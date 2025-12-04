import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

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

    // Update charity status to APPROVED
    const charity = await prisma.charity.update({
      where: { id: charityId },
      data: {
        status: 'APPROVED',
      },
      include: {
        users: {
          where: {
            role: 'CHARITY_ADMIN',
          },
        },
      },
    });

    // Verify the admin user's email
    if (charity.users.length > 0) {
      await prisma.user.update({
        where: { id: charity.users[0].id },
        data: {
          emailVerified: new Date(),
        },
      });
    }

    // TODO: Send welcome email to charity admin with login credentials
    console.log('Charity approved:', {
      charityId: charity.id,
      charityName: charity.name,
      adminEmail: charity.users[0]?.email,
    });

    // Redirect back to platform admin page
    return NextResponse.redirect(new URL('/platform-admin', request.url));
  } catch (error) {
    console.error('Error approving charity:', error);
    return NextResponse.json(
      { error: 'Failed to approve charity' },
      { status: 500 }
    );
  }
}
