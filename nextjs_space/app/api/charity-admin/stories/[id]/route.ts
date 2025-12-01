import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { uploadFile, deleteFile } from '@/lib/s3';

/**
 * PUT /api/charity-admin/stories/[id]
 * Update an existing story
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify story belongs to user's charity
    const existingStory = await prisma.story.findFirst({
      where: {
        id: params.id,
        charityId: user.charity.id,
      },
    });

    if (!existingStory) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const donorIdRaw = formData.get('donorId') as string;
    const status = formData.get('status') as string;
    const impactMetricsRaw = formData.get('impactMetrics') as string;
    const featuredImage = formData.get('featuredImage') as File | null;
    const existingImageUrl = formData.get('existingImageUrl') as string | null;
    const video = formData.get('video') as File | null;

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Handle donor ID
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
    let featuredImageUrl = existingImageUrl || existingStory.featuredImageUrl;
    if (featuredImage && featuredImage.size > 0) {
      try {
        const buffer = Buffer.from(await featuredImage.arrayBuffer());
        const fileName = `stories/${Date.now()}-${featuredImage.name.replace(/\s+/g, '-')}`;
        const s3Key = await uploadFile(buffer, fileName, featuredImage.type);
        
        // Generate signed URL
        const { getSignedDownloadUrl } = await import('@/lib/s3');
        featuredImageUrl = await getSignedDownloadUrl(s3Key, 86400 * 365); // 1 year expiry

        // Note: In a production app, you'd want to delete the old image from S3 here
        // But for simplicity, we'll skip that in Phase 1A
      } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 }
        );
      }
    }

    // Update slug if title changed
    let slug = existingStory.slug;
    if (title !== existingStory.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if new slug already exists
      const slugExists = await prisma.story.findFirst({
        where: {
          slug,
          charityId: user.charity.id,
          id: { not: params.id },
        },
      });

      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Update story
    const updatedStory = await prisma.story.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        featuredImageUrl,
        impactMetrics,
        status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        publishedAt:
          status === 'PUBLISHED' && !existingStory.publishedAt
            ? new Date()
            : existingStory.publishedAt,
        donorId,
        updatedById: session.user.id,
      },
    });

    // Handle video upload if provided
    if (video && video.size > 0) {
      try {
        const buffer = Buffer.from(await video.arrayBuffer());
        const fileName = `videos/${Date.now()}-${video.name.replace(/\s+/g, '-')}`;
        const videoS3Key = await uploadFile(buffer, fileName, video.type);
        
        // Generate signed URL for video
        const { getSignedDownloadUrl } = await import('@/lib/s3');
        const videoUrl = await getSignedDownloadUrl(videoS3Key, 86400 * 365); // 1 year expiry
        
        // Delete existing video media record if any
        await prisma.media.deleteMany({
          where: {
            storyId: params.id,
            fileType: 'VIDEO',
          },
        });
        
        // Create new Media record for the video
        await prisma.media.create({
          data: {
            storyId: params.id,
            fileUrl: videoUrl,
            fileType: 'VIDEO',
            fileSize: video.size,
            fileName: video.name,
            displayOrder: 0,
          },
        });
      } catch (error) {
        console.error('Error uploading video:', error);
        // Don't fail the story update if video upload fails
      }
    }

    return NextResponse.json({
      success: true,
      story: updatedStory,
    });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/charity-admin/stories/[id]
 * Delete a story
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify story belongs to user's charity
    const story = await prisma.story.findFirst({
      where: {
        id: params.id,
        charityId: user.charity.id,
      },
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Delete the story (cascade will handle related records)
    await prisma.story.delete({
      where: { id: params.id },
    });

    // Note: In production, you'd also want to delete the S3 image here
    // But for simplicity, we'll skip that in Phase 1A

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}
