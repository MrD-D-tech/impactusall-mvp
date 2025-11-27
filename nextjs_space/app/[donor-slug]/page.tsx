import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AnimatedCounter } from '@/components/animated-counter';

interface DonorHubPageProps {
  params: {
    'donor-slug': string;
  };
}

export default async function DonorHubPage({ params }: DonorHubPageProps) {
  const donorSlug = params['donor-slug'];

  // Fetch donor with their stories
  const donor = await prisma.donor.findUnique({
    where: { slug: donorSlug },
    include: {
      stories: {
        where: { status: 'PUBLISHED' },
        include: {
          charity: true,
          _count: {
            select: {
              likes: true,
              reactions: true,
              comments: { where: { status: 'APPROVED' } },
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
      },
    },
  });

  if (!donor) {
    notFound();
  }

  // Calculate aggregate impact metrics from all stories
  const aggregateMetrics = donor.stories.reduce(
    (acc: { families: number; hours: number; meals: number; jobs: number }, story: any) => {
      const metrics = story.impactMetrics as any;
      if (metrics) {
        acc.families += metrics.families_helped || 0;
        acc.hours += metrics.hours_of_care || 0;
        acc.meals += metrics.meals_provided || 0;
        acc.jobs += metrics.jobs_created || 0;
      }
      return acc;
    },
    { families: 0, hours: 0, meals: 0, jobs: 0 }
  );

  const totalLikes = donor.stories.reduce((sum: number, story: any) => sum + story._count.likes, 0);
  const totalReactions = donor.stories.reduce((sum: number, story: any) => sum + story._count.reactions, 0);
  const totalComments = donor.stories.reduce((sum: number, story: any) => sum + story._count.comments, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Donor-Branded Hero Section */}
      <div
        className="relative py-16 px-4 sm:px-6 lg:px-8"
        style={{
          background: `linear-gradient(135deg, ${donor.primaryColor || '#ea580c'} 0%, ${donor.secondaryColor || '#14b8a6'} 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* Donor Logo */}
          {donor.logoUrl && (
            <div className="mb-6 flex justify-center">
              <div className="relative w-24 h-24 bg-white rounded-full p-3 shadow-lg">
                <Image
                  src={donor.logoUrl}
                  alt={`${donor.name} logo`}
                  fill
                  className="object-contain p-2"
                />
              </div>
            </div>
          )}

          {/* Donor Name & Tagline */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {donor.name}
          </h1>
          {donor.tagline && (
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              {donor.tagline}
            </p>
          )}
        </div>
      </div>

      {/* Impact Metrics with Animated Counters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">
            Our Impact Together
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {aggregateMetrics.families > 0 && (
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: donor.primaryColor || '#ea580c' }}>
                  <AnimatedCounter end={aggregateMetrics.families} duration={2000} />
                </div>
                <div className="text-sm text-slate-600">Families Helped</div>
              </div>
            )}
            {aggregateMetrics.hours > 0 && (
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: donor.primaryColor || '#ea580c' }}>
                  <AnimatedCounter end={aggregateMetrics.hours} duration={2000} />
                </div>
                <div className="text-sm text-slate-600">Hours of Care</div>
              </div>
            )}
            {aggregateMetrics.meals > 0 && (
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: donor.primaryColor || '#ea580c' }}>
                  <AnimatedCounter end={aggregateMetrics.meals} duration={2000} />
                </div>
                <div className="text-sm text-slate-600">Meals Provided</div>
              </div>
            )}
            {aggregateMetrics.jobs > 0 && (
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: donor.primaryColor || '#ea580c' }}>
                  <AnimatedCounter end={aggregateMetrics.jobs} duration={2000} />
                </div>
                <div className="text-sm text-slate-600">Jobs Created</div>
              </div>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  <AnimatedCounter end={totalLikes + totalReactions} duration={2000} />
                </div>
                <div className="text-xs text-slate-600">Supporter Reactions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  <AnimatedCounter end={totalComments} duration={2000} />
                </div>
                <div className="text-xs text-slate-600">Comments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  <AnimatedCounter end={donor.stories.length} duration={2000} />
                </div>
                <div className="text-xs text-slate-600">Impact Stories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stories Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-3xl font-bold mb-8 text-slate-800">Impact Stories</h2>
        {donor.stories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-slate-600">No stories published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donor.stories.map((story: any) => (
              <Link
                key={story.id}
                href={`/${donorSlug}/${story.slug}`}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Story Image */}
                {story.featuredImageUrl && (
                  <div className="relative aspect-video bg-muted">
                    <Image
                      src={story.featuredImageUrl}
                      alt={story.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Charity Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                      {story.charity.logoUrl && (
                        <div className="relative w-5 h-5">
                          <Image
                            src={story.charity.logoUrl}
                            alt={story.charity.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <span className="text-xs font-medium text-slate-700">
                        {story.charity.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Story Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
                    {story.title}
                  </h3>
                  {story.excerpt && (
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                      {story.excerpt}
                    </p>
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>❤️ {story._count.likes + story._count.reactions}</span>
                    <span>💬 {story._count.comments}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-600">
          <p>
            Powered by <strong className="text-slate-800">ImpactusAll</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}
