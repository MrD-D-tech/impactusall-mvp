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

    return NextResponse.json({
      donor: user.donor,
      user: {
        name: user.name,
        email: user.email,
        corporateRole: user.corporateRole,
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { notifications } = body;
    
    // Update email preferences in the Donor table
    await prisma.donor.update({
      where: { id: user.donor.id },
      data: {
        emailPreferences: {
          newStories: notifications.newStory ?? true,
          weeklyDigest: notifications.weeklyDigest ?? false,
          monthlyReports: notifications.monthlyReport ?? false,
        },
      },
    });

    console.log('Email preferences updated for donor:', user.donor.name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
