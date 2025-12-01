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

    // Get all stories for this donor
    const stories = await prisma.story.findMany({
      where: {
        donorId: user.donor.id,
        status: 'PUBLISHED',
      },
      include: {
        charity: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return NextResponse.json({
      donor: user.donor,
      stories,
    });
  } catch (error) {
    console.error('Error fetching report data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
