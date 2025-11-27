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
  const storyUrl = `https://impactusall.abacusai.app/${donorSlug}/${storySlug}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Donor-Branded Header */}
      <div
        className="py-4 px-4 sm:px-6 lg:px-8 shadow-sm"
        style={{
          background: `linear-gradient(90deg, ${donor.primaryColor || '#ea580c'} 0%, ${donor.secondaryColor || '#14b8a6'} 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href={`/${donorSlug}`}
            className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity"
          >
            {donor.logoUrl && (
              <div className="relative w-10 h-10 bg-white rounded-full p-1.5">
                <Image
                  src={donor.logoUrl}
                  alt={donor.name}
                  fill
                  className="object-contain p-0.5"
                />
              </div>
            )}
            <span className="font-semibold">{donor.name}</span>
          </Link>
        </div>
      </div>

      {/* Story Content */}
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Charity Badge */}
        <div className="mb-6 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
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
          <span className="text-sm font-medium text-slate-700">{story.charity.name}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          {story.title}
        </h1>

        {/* Date */}
        {story.publishedAt && (
          <div className="flex items-center gap-2 text-slate-600 mb-8">
            <Calendar className="w-4 h-4" />
            <time dateTime={story.publishedAt.toISOString()}>
              {new Date(story.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          </div>
        )}

        {/* Featured Image */}
        {story.featuredImageUrl && (
          <div className="relative aspect-video bg-muted rounded-xl overflow-hidden shadow-lg mb-8">
            <Image
              src={story.featuredImageUrl}
              alt={story.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Impact Metrics */}
        {impactMetrics && Object.keys(impactMetrics).length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Impact at a Glance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {impactMetrics.families_helped > 0 && (
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    <AnimatedCounter end={impactMetrics.families_helped} duration={2000} />
                  </div>
                  <div className="text-xs text-slate-600">Families Helped</div>
                </div>
              )}
              {impactMetrics.hours_of_care > 0 && (
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-3xl font-bold text-teal-600 mb-1">
                    <AnimatedCounter end={impactMetrics.hours_of_care} duration={2000} />
                  </div>
                  <div className="text-xs text-slate-600">Hours of Care</div>
                </div>
              )}
              {impactMetrics.meals_provided > 0 && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    <AnimatedCounter end={impactMetrics.meals_provided} duration={2000} />
                  </div>
                  <div className="text-xs text-slate-600">Meals Provided</div>
                </div>
              )}
              {impactMetrics.jobs_created > 0 && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    <AnimatedCounter end={impactMetrics.jobs_created} duration={2000} />
                  </div>
                  <div className="text-xs text-slate-600">Jobs Created</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Story Content */}
        <div
          className="prose prose-lg max-w-none mb-12 bg-white rounded-xl shadow-md p-8"
          dangerouslySetInnerHTML={{ __html: story.content }}
        />

        {/* Timeline Section */}
        {story.milestones && story.milestones.length > 0 && (
          <div className="mb-12">
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
          <div className="mb-12">
            <ThankYouMessages messages={story.thankYouMessages} />
          </div>
        )}

        {/* Engagement Section */}
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

        {/* Back to Hub */}
        <div className="text-center py-8">
          <Link
            href={`/${donorSlug}`}
            className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${donor.primaryColor || '#ea580c'} 0%, ${donor.secondaryColor || '#14b8a6'} 100%)`,
            }}
          >
            ← Back to {donor.name} Impact Hub
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
