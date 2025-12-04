import { Resend } from 'resend';
import { NewStoryNotificationEmail } from '@/components/emails/new-story-notification';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendNewStoryNotificationParams {
  to: string | string[];
  storyTitle: string;
  storyExcerpt: string;
  charityName: string;
  charityLogo?: string;
  donorName: string;
  impactMetrics?: {
    label: string;
    value: string | number;
  }[];
  storyUrl: string;
  featuredImageUrl?: string;
}

/**
 * Send a new story notification email to corporate donors
 */
export async function sendNewStoryNotification(params: SendNewStoryNotificationParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ImpactusAll <onboarding@resend.dev>',
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: `New Impact Story: ${params.storyTitle}`,
      react: NewStoryNotificationEmail({
        storyTitle: params.storyTitle,
        storyExcerpt: params.storyExcerpt,
        charityName: params.charityName,
        charityLogo: params.charityLogo,
        donorName: params.donorName,
        impactMetrics: params.impactMetrics,
        storyUrl: params.storyUrl,
        featuredImageUrl: params.featuredImageUrl,
      }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Exception sending email:', error);
    return { success: false, error };
  }
}

/**
 * Get all corporate donor emails for a specific donor
 */
export async function getCorporateDonorEmails(donorId: string): Promise<string[]> {
  const { prisma } = await import('@/lib/db');
  
  try {
    // Check if donor has email notifications enabled
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      select: {
        emailPreferences: true,
      },
    });

    // If donor has disabled new story notifications, return empty array
    if (donor?.emailPreferences) {
      const prefs = donor.emailPreferences as any;
      if (prefs.newStories === false) {
        console.log('New story notifications disabled for this donor');
        return [];
      }
    }

    // Get all users associated with this donor
    const users = await prisma.user.findMany({
      where: {
        donorId: donorId,
        role: 'CORPORATE_DONOR',
      },
      select: {
        email: true,
      },
    });

    return users.map(user => user.email);
  } catch (error) {
    console.error('Error fetching corporate donor emails:', error);
    return [];
  }
}
