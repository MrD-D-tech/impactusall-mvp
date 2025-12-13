import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// Manual type definitions for Vercel compatibility
// These match the Prisma schema but don't rely on @prisma/client type exports
// which can fail in Vercel's build environment

interface Charity {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  focusArea: string | null;
  registrationNumber: string | null;
  status: string; // 'PENDING' | 'APPROVED' | 'REJECTED'
  monthlyFee: any | null; // Decimal type from Prisma
  subscriptionStatus: string | null; // 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CANCELLED'
  lastPaymentDate: Date | null;
  nextPaymentDue: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Story {
  id: string;
  charityId: string;
  donorId: string | null;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  impactMetrics: any | null; // JSON type from Prisma
  status: string; // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: Date | null;
  isFlagged: boolean;
  flagReason: string | null;
  flaggedAt: Date | null;
  flaggedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  updatedById: string | null;
}

// Define the type for a story with charity relation and counts
interface StoryWithRelations extends Story {
  charity: Charity;
  _count: {
    likes: number;
    comments: number;
    reactions: number;
  };
}

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
    const stories: StoryWithRelations[] = await prisma.story.findMany({
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

    // Calculate donation amount per story (£25,000 per story for Manchester United)
    const donationPerStory = 25000;
    
    // Add donationAmount and createdAt to each story
    const storiesWithDonation = stories.map((story: StoryWithRelations) => ({
      ...story,
      donationAmount: donationPerStory,
      createdAt: story.createdAt.toISOString(), // Convert Date to string for serialization
    }));

    return NextResponse.json({
      donor: user.donor,
      stories: storiesWithDonation,
    });
  } catch (error) {
    console.error('Error fetching report data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
