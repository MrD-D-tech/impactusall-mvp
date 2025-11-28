import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { prisma } from '@/lib/db';
import { StoryTimeline } from '@/components/story-timeline';
import { ThankYouMessages } from '@/components/thank-you-messages';
import { AnimatedCounter } from '@/components/animated-counter';
import { DonorStoryActions } from '@/components/donor-story-actions';

interface StoryPageProps {
  params: {
    'donor-slug': string;
    slug: string;
  };
}

export default async function DonorStoryPage({ params }: StoryPageProps) {
  const donorSlug = params['donor-slug'];
  const storySlug = params.slug;

  // Fetch donor
  const donor = await prisma.donor.findUnique({
    where: { slug: donorSlug },
  });

  if (!donor) {
    notFound();
  }

  // Fetch story with all related data
  const story = await prisma.story.findFirst({
    where: {
      slug: storySlug,
      donorId: donor.id,
      status: 'PUBLISHED',
    },
    include: {
      charity: true,
      donor: true,
      _count: {
        select: {
          likes: true,
          reactions: true,
        },
      },
      milestones: {
        orderBy: { date: 'asc' },
      },
      thankYouMessages: {
        where: { featured: true },
        orderBy: { displayOrder: 'asc' },
      },
      comments: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!story) {
    notFound();
  }

  // Get reaction counts by type
  const reactionCounts = await prisma.reaction.groupBy({
    by: ['reactionType'],
    where: { storyId: story.id },
    _count: { reactionType: true },
  });

  const reactions = {
    LOVE: reactionCounts.find((r: any) => r.reactionType === 'LOVE')?._count.reactionType || 0,
    APPLAUSE: reactionCounts.find((r: any) => r.reactionType === 'APPLAUSE')?._count.reactionType || 0,
    MOVED: reactionCounts.find((r: any) => r.reactionType === 'MOVED')?._count.reactionType || 0,
    INSPIRED: reactionCounts.find((r: any) => r.reactionType === 'INSPIRED')?._count.reactionType || 0,
    GRATEFUL: reactionCounts.find((r: any) => r.reactionType === 'GRATEFUL')?._count.reactionType || 0,
  };

  const impactMetrics = story.impactMetrics as any;

  // Create contextual labels for impact metrics
  const getMetricLabel = (key: string): string => {
    const labelMap: Record<string, string> = {
      'families_helped': 'Families Supported',
      'hours_of_care': 'Hours of Care Provided',
      'memory_making_sessions': 'Memory-Making Sessions',
      'counselling_sessions': 'Counselling Sessions Delivered',
      'people_helped': 'People Helped',
      'nights_of_shelter': 'Nights of Shelter Provided',
      'employment_training_hours': 'Hours of Training',
      'jobs_created': 'Jobs Secured',
      'jobs_secured': 'Jobs Secured',
      'people_supported': 'People Supported',
      'housing_units_secured': 'Homes Found',
      'families_housed': 'Families Housed',
      'integration_programmes': 'Integration Programmes',
      'language_classes': 'Language Classes Delivered',
      'young_people_supported': 'Young People Supported',
      'counselling_hours': 'Hours of Counselling',
      'peer_support_sessions': 'Peer Support Sessions',
      'lives_changed': 'Lives Changed',
      'meals_provided': 'Meals Provided',
    };
    
    return labelMap[key] || key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  const storyUrl = `https://impactusall.abacusai.app/${donorSlug}/${storySlug}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Donor-Branded Header - Sticky */}
      <div
        className="sticky top-0 z-50 py-3 px-4 sm:px-6 lg:px-8 shadow-md backdrop-blur-sm bg-opacity-95"
        style={{
          background: `linear-gradient(90deg, ${donor.primaryColor || '#ea580c'} 0%, ${donor.secondaryColor || '#14b8a6'} 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href={`/${donorSlug}`}
            className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity group"
          >
            {donor.logoUrl && (
              <div className="relative w-12 h-12 bg-white rounded-lg p-2 group-hover:scale-105 transition-transform">
                <Image
                  src={donor.logoUrl}
                  alt={donor.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
            )}
            <div>
              <span className="text-sm opacity-90">Return to</span>
              <div className="font-bold text-lg">{donor.name}</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Hero Section - Full Width Featured Image */}
      {story.featuredImageUrl && (
        <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
          <Image
            src={story.featuredImageUrl}
            alt={story.title}
            fill
            priority
            className="object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          {/* Story Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-4xl mx-auto">
              {/* Badges */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {/* Charity Badge */}
                <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl">
                  {story.charity.logoUrl && (
                    <div className="relative w-6 h-6">
                      <Image
                        src={story.charity.logoUrl}
                        alt={story.charity.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-700">{story.charity.name}</span>
                </div>
                
                {/* Donation Badge */}
                <div 
                  className="inline-flex items-center px-4 py-2 rounded-full shadow-xl font-bold text-sm backdrop-blur-sm"
                  style={{
                    backgroundColor: `${donor.primaryColor || '#DA291C'}`,
                    color: 'white',
                  }}
                >
                  £25,000 Donation
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl leading-tight">
                {story.title}
              </h1>

              {/* Date */}
              {story.publishedAt && (
                <div className="flex items-center gap-2 text-white/90 text-lg">
                  <Calendar className="w-5 h-5" />
                  <time dateTime={story.publishedAt.toISOString()}>
                    {new Date(story.publishedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Story Content Area */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Impact Metrics - Prominent Display */}
        {impactMetrics && Object.keys(impactMetrics).length > 0 && (
          <div 
            className="mb-16 p-8 md:p-12 rounded-2xl shadow-xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${donor.primaryColor || '#DA291C'}08 0%, ${donor.secondaryColor || '#FBE122'}08 100%)`,
            }}
          >
            {/* Decorative element */}
            <div 
              className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{
                background: donor.primaryColor || '#DA291C',
              }}
            />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-10">
                The Impact of This Story
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(impactMetrics).map(([key, value]: [string, any]) => {
                  if (typeof value === 'number' && value > 0) {
                    const label = getMetricLabel(key);
                    return (
                      <div key={key} className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-shadow">
                        <div 
                          className="text-4xl md:text-5xl font-black mb-2"
                          style={{ color: donor.primaryColor || '#DA291C' }}
                        >
                          <AnimatedCounter end={value} duration={2500} />
                        </div>
                        <div className="text-sm md:text-base font-semibold text-slate-700">{label}</div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Story Content */}
        <div
          className="prose prose-xl max-w-none mb-16 
                     prose-headings:font-bold prose-headings:text-slate-800 
                     prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-lg
                     prose-strong:text-slate-900 prose-strong:font-semibold
                     prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: story.content }}
        />

        {/* Timeline Section */}
        {story.milestones && story.milestones.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-12">
              The Journey
            </h2>
            <StoryTimeline 
              milestones={story.milestones.map((m: any) => ({
                id: m.id,
                title: m.title,
                description: m.description,
                date: m.date.toISOString(),
                displayOrder: m.displayOrder,
              }))} 
            />
          </div>
        )}

        {/* Thank You Messages */}
        {story.thankYouMessages && story.thankYouMessages.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-12">
              In Their Own Words
            </h2>
            <ThankYouMessages messages={story.thankYouMessages} />
          </div>
        )}

        {/* Engagement Section */}
        <div className="mb-12">
          <DonorStoryActions
            storyId={story.id}
            title={story.title}
            url={storyUrl}
            initialReactions={[
              { type: 'LOVE', count: reactions.LOVE },
              { type: 'APPLAUSE', count: reactions.APPLAUSE },
              { type: 'MOVED', count: reactions.MOVED },
              { type: 'INSPIRED', count: reactions.INSPIRED },
              { type: 'GRATEFUL', count: reactions.GRATEFUL },
            ]}
            initialComments={story.comments.map((c: any) => ({
              id: c.id,
              userName: c.user?.name || c.userName,
              content: c.content,
              createdAt: c.createdAt.toISOString(),
            }))}
          />
        </div>

        {/* Back to Hub - Prominent CTA */}
        <div className="text-center py-12">
          <Link
            href={`/${donorSlug}`}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-lg transition-all hover:shadow-2xl hover:scale-105 transform"
            style={{
              background: `linear-gradient(135deg, ${donor.primaryColor || '#ea580c'} 0%, ${donor.secondaryColor || '#14b8a6'} 100%)`,
            }}
          >
            <span>←</span>
            <span>Read More Stories from {donor.name}</span>
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-600">
          <p>
            Powered by <strong className="text-slate-800">ImpactusAll</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}
