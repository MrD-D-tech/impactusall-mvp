import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Heart, Users, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';

async function getHomeData() {
  const stories = await prisma.story.findMany({
    where: { status: 'PUBLISHED' },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    include: {
      charity: { select: { name: true, logoUrl: true } },
      _count: { select: { likes: true } },
    },
  });

  const totalImpact = await prisma.story.aggregate({
    where: { status: 'PUBLISHED' },
    _count: true,
  });

  return { stories, totalStories: totalImpact._count ?? 0 };
}

export default async function HomePage() {
  const { stories, totalStories } = await getHomeData();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-orange-500" />
              <span className="text-2xl font-bold text-gradient">ImpactusAll</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/stories" className="text-gray-700 hover:text-gray-900 font-medium">
                Stories
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium">
                Log In
              </Link>
              <Link
                href="/register"
                className="gradient-primary text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 to-teal-500 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-semibold">Transforming Generosity Into Impact Stories</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            See the Real Impact of<br />Corporate Donations
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover authentic stories from UK charities showing how corporate generosity transforms lives in communities across the country.
          </p>
          
          <Link
            href="/stories"
            className="inline-block bg-white text-orange-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors"
          >
            Explore Impact Stories
          </Link>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{totalStories}+</div>
              <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">Stories Shared</div>
              <p className="text-sm text-gray-600">Real impact documented</p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-teal-500" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">1,000+</div>
              <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">Families Helped</div>
              <p className="text-sm text-gray-600">Lives transformed</p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">5,000+</div>
              <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">Hours of Care</div>
              <p className="text-sm text-gray-600">Support provided</p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-teal-500" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">3</div>
              <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">UK Charities</div>
              <p className="text-sm text-gray-600">Making a difference</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Impact Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover how corporate donations are transforming lives across the UK
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {stories?.map((story) => (
              <Link
                key={story?.id}
                href={`/stories/${story?.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden"
              >
                {story?.featuredImageUrl && (
                  <div className="relative aspect-video bg-gray-200">
                    <Image
                      src={story.featuredImageUrl}
                      alt={story?.title ?? 'Story image'}
                      fill
                      className="object-cover"
                    />
                    {story?.charity?.logoUrl && (
                      <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full p-2 shadow-md">
                        <Image
                          src={story.charity.logoUrl}
                          alt={story?.charity?.name ?? 'Charity logo'}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {story?.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {story?.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{story?.charity?.name}</span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {story?._count?.likes ?? 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/stories"
              className="inline-block gradient-primary text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              View All Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Heart className="w-6 h-6 text-orange-500" />
              <span className="text-xl font-bold">ImpactusAll</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 ImpactusAll. Transforming generosity into impact stories.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
