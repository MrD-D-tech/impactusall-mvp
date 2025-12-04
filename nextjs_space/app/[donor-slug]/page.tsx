import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AnimatedCounter } from '@/components/animated-counter';
import { resolveImageUrl } from '@/lib/s3';

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
    (acc: { families: number; hours: number; meals: number; jobs: number; livesImpacted: number }, story: any) => {
      const metrics = story.impactMetrics as any;
      if (metrics) {
        acc.families += metrics.families_helped || 0;
        acc.hours += metrics.hours_of_care || 0;
        acc.meals += metrics.meals_provided || 0;
        acc.jobs += metrics.jobs_created || 0;
        // Calculate lives impacted (sum of all people-based metrics)
        acc.livesImpacted += (metrics.families_helped || 0) + (metrics.jobs_created || 0);
      }
      return acc;
    },
    { families: 0, hours: 0, meals: 0, jobs: 0, livesImpacted: 0 }
  );

  const totalLikes = donor.stories.reduce((sum: number, story: any) => sum + story._count.likes, 0);
  const totalReactions = donor.stories.reduce((sum: number, story: any) => sum + story._count.reactions, 0);
  const totalComments = donor.stories.reduce((sum: number, story: any) => sum + story._count.comments, 0);
  
  // Fetch share counts from analytics
  const analyticsData = await prisma.analytics.findMany({
    where: {
      story: {
        donorId: donor.id
      }
    }
  });
  
  const totalShares = analyticsData.reduce((sum, record) => sum + (record.shares || 0), 0);

  // Resolve S3 keys to signed URLs for all story images
  const storiesWithResolvedImages = await Promise.all(
    donor.stories.map(async (story: any) => ({
      ...story,
      featuredImageUrl: await resolveImageUrl(story.featuredImageUrl),
      charity: {
        ...story.charity,
        logoUrl: await resolveImageUrl(story.charity.logoUrl),
      },
    }))
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Immersive Hero Section with Full-Width Background Image */}
      <div className="relative h-[70vh] min-h-[600px] w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/man-united-hero.jpg"
            alt="Manchester United Impact"
            fill
            priority
            className="object-cover"
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${donor.primaryColor}20 0%, ${donor.primaryColor}90 100%)`,
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          {/* Donor Logo */}
          {donor.logoUrl && (
            <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl w-40 h-40 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={donor.logoUrl}
                  alt={`${donor.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* Donor Name */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-tight">
            {donor.name}
          </h1>

          {/* Tagline */}
          {donor.tagline && (
            <p className="text-2xl md:text-3xl text-white font-medium max-w-4xl mx-auto mb-8 drop-shadow-lg">
              {donor.tagline}
            </p>
          )}

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Metrics - Floating Card */}
      <div className="relative z-10 -mt-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-t-4" style={{ borderColor: donor.primaryColor || '#DA291C' }}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
                Real Impact, Real Lives Changed
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Every number represents a person, a family, a life transformed
              </p>
            </div>

            {/* Main Impact Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10">
              {aggregateMetrics.families > 0 && (
                <div className="text-center transform hover:scale-105 transition-transform duration-300">
                  <div 
                    className="text-5xl md:text-6xl font-black mb-3" 
                    style={{ color: donor.primaryColor || '#DA291C' }}
                  >
                    <AnimatedCounter end={aggregateMetrics.families} duration={2500} />
                  </div>
                  <div className="text-base md:text-lg font-semibold text-slate-700">Families Helped</div>
                </div>
              )}
              {aggregateMetrics.livesImpacted > 0 && (
                <div className="text-center transform hover:scale-105 transition-transform duration-300">
                  <div 
                    className="text-5xl md:text-6xl font-black mb-3" 
                    style={{ color: donor.primaryColor || '#DA291C' }}
                  >
                    <AnimatedCounter end={aggregateMetrics.livesImpacted} duration={2500} />
                  </div>
                  <div className="text-base md:text-lg font-semibold text-slate-700">Lives Impacted</div>
                </div>
              )}
              {aggregateMetrics.meals > 0 && (
                <div className="text-center transform hover:scale-105 transition-transform duration-300">
                  <div 
                    className="text-5xl md:text-6xl font-black mb-3" 
                    style={{ color: donor.primaryColor || '#DA291C' }}
                  >
                    <AnimatedCounter end={aggregateMetrics.meals} duration={2500} />
                  </div>
                  <div className="text-base md:text-lg font-semibold text-slate-700">Meals Provided</div>
                </div>
              )}
              {aggregateMetrics.jobs > 0 && (
                <div className="text-center transform hover:scale-105 transition-transform duration-300">
                  <div 
                    className="text-5xl md:text-6xl font-black mb-3" 
                    style={{ color: donor.primaryColor || '#DA291C' }}
                  >
                    <AnimatedCounter end={aggregateMetrics.jobs} duration={2500} />
                  </div>
                  <div className="text-base md:text-lg font-semibold text-slate-700">Jobs Secured</div>
                </div>
              )}
            </div>

            {/* Engagement Stats */}
            <div className="pt-8 border-t-2 border-slate-100">
              <div className="grid grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">
                    <AnimatedCounter end={totalLikes + totalReactions} duration={2000} />
                  </div>
                  <div className="text-sm md:text-base text-slate-600 font-medium">Reactions</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">
                    <AnimatedCounter end={totalComments} duration={2000} />
                  </div>
                  <div className="text-sm md:text-base text-slate-600 font-medium">Comments</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">
                    <AnimatedCounter end={totalShares} duration={2000} />
                  </div>
                  <div className="text-sm md:text-base text-slate-600 font-medium">Shares</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">
                    <AnimatedCounter end={donor.stories.length} duration={2000} />
                  </div>
                  <div className="text-sm md:text-base text-slate-600 font-medium">Impact Stories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stories Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Stories That Change Hearts
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Read the inspiring journeys of people whose lives have been transformed through your support
          </p>
        </div>

        {storiesWithResolvedImages.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl">
            <p className="text-xl text-slate-600">No stories published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {storiesWithResolvedImages.map((story: any) => (
              <Link
                key={story.id}
                href={`/${donorSlug}/${story.slug}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Story Image */}
                {story.featuredImageUrl && (
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <Image
                      src={story.featuredImageUrl}
                      alt={story.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Charity Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl flex items-center gap-2 transform group-hover:scale-105 transition-transform duration-300">
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
                      <span className="text-sm font-semibold text-slate-700">
                        {story.charity.name}
                      </span>
                    </div>

                    {/* Donation Badge */}
                    <div 
                      className="absolute top-4 right-4 px-4 py-2 rounded-full shadow-xl font-bold text-sm backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-300"
                      style={{
                        backgroundColor: `${donor.primaryColor || '#DA291C'}`,
                        color: 'white',
                      }}
                    >
                      £25,000
                    </div>
                  </div>
                )}

                {/* Story Content */}
                <div className="p-8">
                  <h3 
                    className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-300"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${donor.primaryColor || '#DA291C'} 0%, ${donor.secondaryColor || '#FBE122'} 100%)`,
                    }}
                  >
                    {story.title}
                  </h3>
                  {story.excerpt && (
                    <p className="text-slate-600 text-base md:text-lg leading-relaxed line-clamp-3 mb-6">
                      {story.excerpt}
                    </p>
                  )}

                  {/* Engagement Stats & CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">❤️</span>
                        <span className="font-medium">{story._count.likes + story._count.reactions}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">💬</span>
                        <span className="font-medium">{story._count.comments}</span>
                      </span>
                    </div>
                    <span 
                      className="text-sm font-bold px-4 py-2 rounded-lg transition-all duration-300"
                      style={{
                        color: donor.primaryColor || '#DA291C',
                        backgroundColor: `${donor.primaryColor || '#DA291C'}10`,
                      }}
                    >
                      Read Story →
                    </span>
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
