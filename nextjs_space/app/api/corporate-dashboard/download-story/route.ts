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

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
    }

    // Get user's donor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { donor: true },
    });

    if (!user?.donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    // Get story
    const story = await prisma.story.findFirst({
      where: {
        id: storyId,
        donorId: user.donor.id,
        status: 'PUBLISHED',
      },
      include: {
        charity: true,
        donor: true,
        milestones: {
          orderBy: { date: 'asc' },
        },
        thankYouMessages: {
          where: { featured: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const impactMetrics = story.impactMetrics as any;

    // Create HTML content
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${story.title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background: #fff;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding: 20px;
          background: linear-gradient(90deg, ${story.donor?.primaryColor || '#ea580c'} 0%, ${story.donor?.secondaryColor || '#14b8a6'} 100%);
          color: white;
          border-radius: 8px;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 32px;
        }
        .header .donor {
          font-size: 18px;
          opacity: 0.9;
        }
        .charity-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 20px 0;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        .section {
          margin: 30px 0;
        }
        .section h2 {
          color: ${story.donor?.primaryColor || '#ea580c'};
          border-bottom: 2px solid ${story.donor?.primaryColor || '#ea580c'};
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .featured-image {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          border-radius: 8px;
          margin: 20px 0;
        }
        .content {
          font-size: 16px;
          text-align: justify;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
        .metric-card {
          padding: 15px;
          background: #f8f9fa;
          border-left: 4px solid ${story.donor?.primaryColor || '#ea580c'};
          border-radius: 4px;
        }
        .metric-value {
          font-size: 28px;
          font-weight: bold;
          color: ${story.donor?.primaryColor || '#ea580c'};
        }
        .metric-label {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        .timeline-item {
          position: relative;
          padding-bottom: 20px;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -23px;
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${story.donor?.primaryColor || '#ea580c'};
        }
        .timeline-item::after {
          content: '';
          position: absolute;
          left: -18px;
          top: 17px;
          width: 2px;
          height: calc(100% - 12px);
          background: #ddd;
        }
        .timeline-item:last-child::after {
          display: none;
        }
        .timeline-date {
          font-weight: bold;
          color: ${story.donor?.primaryColor || '#ea580c'};
        }
        .thank-you {
          background: linear-gradient(135deg, #fff7ed 0%, #d1fae5 100%);
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid ${story.donor?.primaryColor || '#ea580c'};
        }
        .thank-you-message {
          font-style: italic;
          font-size: 16px;
          margin: 10px 0;
        }
        .thank-you-author {
          font-weight: bold;
          text-align: right;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #eee;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="donor">${story.donor?.name || 'Manchester United'}</div>
        <h1>${story.title}</h1>
        <div style="font-size: 16px; opacity: 0.9;">Published: ${story.publishedAt ? new Date(story.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</div>
      </div>

      <div class="charity-info">
        <div>
          <strong>Supported Charity:</strong> ${story.charity.name}
          ${story.charity.websiteUrl ? `<br><a href="${story.charity.websiteUrl}" target="_blank">${story.charity.websiteUrl}</a>` : ''}
        </div>
      </div>

      ${story.featuredImageUrl ? `<img src="${story.featuredImageUrl}" alt="${story.title}" class="featured-image" />` : ''}

      <div class="section">
        <h2>Story</h2>
        <div class="content">
          ${story.content || story.excerpt || ''}
        </div>
      </div>

      ${impactMetrics && Object.keys(impactMetrics).length > 0 ? `
      <div class="section">
        <h2>Impact Metrics</h2>
        <div class="metrics-grid">
          ${Object.entries(impactMetrics)
            .filter(([_, value]) => value && value !== 0)
            .map(([key, value]) => {
              const label = key.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              return `
              <div class="metric-card">
                <div class="metric-value">${typeof value === 'number' ? value.toLocaleString('en-GB') : value}</div>
                <div class="metric-label">${label}</div>
              </div>
              `;
            }).join('')}
        </div>
      </div>
      ` : ''}

      ${story.milestones && story.milestones.length > 0 ? `
      <div class="section">
        <h2>Impact Timeline</h2>
        <div class="timeline">
          ${story.milestones.map((milestone: any) => `
            <div class="timeline-item">
              <div class="timeline-date">${new Date(milestone.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <strong>${milestone.title}</strong>
              <p>${milestone.description}</p>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${story.thankYouMessages && story.thankYouMessages.length > 0 ? `
      <div class="section">
        <h2>Thank You Messages</h2>
        ${story.thankYouMessages.map((message: any) => `
          <div class="thank-you">
            <div class="thank-you-message">"${message.message}"</div>
            <div class="thank-you-author">— ${message.authorName}${message.authorRole ? `, ${message.authorRole}` : ''}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="footer">
        <p><strong>Donation Amount:</strong> £25,000</p>
        <p>This impact story is brought to you by ${story.donor?.name || 'Manchester United'}</p>
        <p>Story URL: https://impactusall.abacusai.app/${story.donor?.slug || 'manchester-united'}/${story.slug}</p>
      </div>
    </body>
    </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${story.slug}-story.html"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating story download:', error);
    return NextResponse.json(
      { error: 'Failed to generate story download' },
      { status: 500 }
    );
  }
}
