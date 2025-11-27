import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, platform } = body;

    if (!url || !platform) {
      return NextResponse.json(
        { error: 'URL and platform are required' },
        { status: 400 }
      );
    }

    // Extract story slug from URL
    const slugMatch = url.match(/\/stories\/([^/?]+)/);
    if (!slugMatch) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const slug = slugMatch[1];

    // Find story by slug
    const story = await prisma.story.findFirst({
      where: { slug },
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Update analytics for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const platformField = `shares${platform.charAt(0).toUpperCase() + platform.slice(1)}`;

    await prisma.analytics.upsert({
      where: {
        storyId_date: {
          storyId: story.id,
          date: today,
        },
      },
      update: {
        shares: {
          increment: 1,
        },
        [platformField]: {
          increment: 1,
        },
      },
      create: {
        storyId: story.id,
        date: today,
        shares: 1,
        [platformField]: 1,
        views: 0,
        likes: 0,
        uniqueVisitors: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Share tracking error:', error);
    // Don't fail the request if analytics tracking fails
    return NextResponse.json({ success: true });
  }
}
