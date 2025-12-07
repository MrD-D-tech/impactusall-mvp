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
      from: 'ImpactusAll <notifications@impactus-all.com>',
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

interface SendNewCommentNotificationParams {
  storyTitle: string;
  storySlug: string;
  commenterName: string;
  commentContent: string;
  charityId: string;
  donorId: string | null;
  donorSlug: string | null;
}

/**
 * Send a new comment notification email to charity and/or corporate donor
 */
export async function sendNewCommentNotification(params: SendNewCommentNotificationParams) {
  const { prisma } = await import('@/lib/db');
  
  try {
    const recipients: string[] = [];

    // Get charity admin emails
    const charityUsers = await prisma.user.findMany({
      where: {
        charityId: params.charityId,
        role: 'CHARITY_ADMIN',
      },
      select: {
        email: true,
      },
    });
    recipients.push(...charityUsers.map(user => user.email));

    // Get corporate donor emails if story has a donor
    if (params.donorId) {
      const donorEmails = await getCorporateDonorEmails(params.donorId);
      recipients.push(...donorEmails);
    }

    // Remove duplicates
    const uniqueRecipients = Array.from(new Set(recipients));

    if (uniqueRecipients.length === 0) {
      console.log('No recipients for comment notification');
      return { success: false, error: 'No recipients' };
    }

    // Build story URL
    const storyUrl = params.donorSlug 
      ? `https://impactusall.abacusai.app/${params.donorSlug}/${params.storySlug}`
      : `https://impactusall.abacusai.app/stories/${params.storySlug}`;

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'ImpactusAll <notifications@impactus-all.com>',
      to: uniqueRecipients,
      subject: `New Comment on "${params.storyTitle}"`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #f97316 0%, #14b8a6 100%); padding: 30px 40px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">New Comment Received</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px;">
                <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                  Someone just left a comment on your impact story:
                </p>
                
                <div style="background-color: #f9fafb; border-left: 4px solid #f97316; padding: 20px; margin: 20px 0; border-radius: 4px;">
                  <h2 style="margin: 0 0 10px; color: #111827; font-size: 18px; font-weight: 600;">${params.storyTitle}</h2>
                </div>
                
                <div style="background-color: #ffffff; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
                  <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #f97316 0%, #14b8a6 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 600; font-size: 16px; margin-right: 12px;">
                      ${params.commenterName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style="margin: 0; color: #111827; font-weight: 600; font-size: 15px;">${params.commenterName}</p>
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Just now</p>
                    </div>
                  </div>
                  <p style="margin: 12px 0 0; color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${params.commentContent}</p>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0 20px;">
                  <a href="${storyUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 15px; transition: all 0.2s;">
                    View Story & Comments
                  </a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                  ImpactusAll · Connecting Compassion with Impact
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending comment notification email:', error);
      return { success: false, error };
    }

    console.log('Comment notification email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Exception sending comment notification email:', error);
    return { success: false, error };
  }
}
