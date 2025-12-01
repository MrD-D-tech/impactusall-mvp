import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'CORPORATE_DONOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's donor information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        donor: true,
      },
    });

    if (!user?.donor) {
      return NextResponse.json({ error: 'No donor associated' }, { status: 404 });
    }

    // Get all team members for this donor
    const teamMembers = await prisma.user.findMany({
      where: {
        donorId: user.donor.id,
        role: 'CORPORATE_DONOR',
      },
      select: {
        id: true,
        name: true,
        email: true,
        corporateRole: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({
      donor: user.donor,
      teamMembers,
    });
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
