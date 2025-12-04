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
    const video = formData.get('video') as File | null;

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
        console.error('Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json(
          { error: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}` },
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

    // Handle video upload if provided
    if (video && video.size > 0) {
      try {
        const buffer = Buffer.from(await video.arrayBuffer());
        const fileName = `videos/${Date.now()}-${video.name.replace(/\s+/g, '-')}`;
        const videoS3Key = await uploadFile(buffer, fileName, video.type);
        
        // Generate signed URL for video
        const { getSignedDownloadUrl } = await import('@/lib/s3');
        const videoUrl = await getSignedDownloadUrl(videoS3Key, 86400 * 365); // 1 year expiry
        
        // Create Media record for the video
        await prisma.media.create({
          data: {
            storyId: story.id,
            fileUrl: videoUrl,
            fileType: 'VIDEO',
            fileSize: video.size,
            fileName: video.name,
            displayOrder: 0,
          },
        });
      } catch (error) {
        console.error('Error uploading video:', error);
        // Don't fail the story creation if video upload fails
        // The story is already created at this point
      }
    }

    // Send email notification if story is published and has a donor
    if (status === 'PUBLISHED' && donorId) {
      try {
        const { sendNewStoryNotification, getCorporateDonorEmails } = await import('@/lib/email');
        
        // Get donor and charity details
        const donor = await prisma.donor.findUnique({
          where: { id: donorId },
        });

        if (donor) {
          // Get all corporate donor emails
          const recipientEmails = await getCorporateDonorEmails(donorId);

          if (recipientEmails.length > 0) {
            // Format impact metrics for email
            const emailMetrics = impactMetrics
              ? Object.entries(impactMetrics)
                  .filter(([_, value]) => value)
                  .map(([key, value]) => ({
                    label: key
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase()),
                    value: value as string | number,
                  }))
              : undefined;

            // Send notification email
            await sendNewStoryNotification({
              to: recipientEmails,
              storyTitle: title,
              storyExcerpt: excerpt || content.substring(0, 200) + '...',
              charityName: user.charity.name,
              charityLogo: user.charity.logoUrl || undefined,
              donorName: donor.name,
              impactMetrics: emailMetrics,
              storyUrl: `https://impactusall.abacusai.app/${donor.slug}/${finalSlug}`,
              featuredImageUrl: featuredImageUrl || undefined,
            });

            console.log(`Email notification sent to ${recipientEmails.length} recipients`);
          }
        }
      } catch (error) {
        console.error('Error sending email notification:', error);
        // Don't fail the story creation if email fails
      }
    }

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
