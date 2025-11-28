import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';

/**
 * POST /api/charity-admin/stories
 * Create a new story
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'CHARITY_ADMIN') {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // Get user's charity
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { charity: true },
    });

    if (!user?.charity) {
      return NextResponse.json(
        { error: 'User not associated with a charity' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const donorIdRaw = formData.get('donorId') as string;
    const status = formData.get('status') as string;
    const impactMetricsRaw = formData.get('impactMetrics') as string;
    const featuredImage = formData.get('featuredImage') as File | null;

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Handle donor ID ("none" means no donor)
    const donorId = donorIdRaw && donorIdRaw !== 'none' ? donorIdRaw : null;

    // Parse impact metrics
    let impactMetrics = null;
    if (impactMetricsRaw) {
      try {
        impactMetrics = JSON.parse(impactMetricsRaw);
      } catch (e) {
        console.error('Failed to parse impact metrics:', e);
      }
    }

    // Handle featured image upload
    let featuredImageUrl = null;
    if (featuredImage && featuredImage.size > 0) {
      try {
        const buffer = Buffer.from(await featuredImage.arrayBuffer());
        const fileName = `stories/${Date.now()}-${featuredImage.name.replace(/\s+/g, '-')}`;
        const s3Key = await uploadFile(buffer, fileName, featuredImage.type);
        
        // Generate signed URL for immediate access
        const { getSignedDownloadUrl } = await import('@/lib/s3');
        featuredImageUrl = await getSignedDownloadUrl(s3Key, 86400 * 365); // 1 year expiry
      } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 }
        );
      }
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists for this charity
    const existingStory = await prisma.story.findFirst({
      where: {
        slug,
        charityId: user.charity.id,
      },
    });

    // If slug exists, append a number
    const finalSlug = existingStory
      ? `${slug}-${Date.now()}`
      : slug;

    // Create story
    const story = await prisma.story.create({
      data: {
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        content,
        featuredImageUrl,
        impactMetrics,
        status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        charityId: user.charity.id,
        donorId,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      story,
    });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}
