import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Heart, Users, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { AnimatedCounter } from '@/components/animated-counter';

async function getHomeData() {
  const donors = await prisma.donor.findMany({
    include: {
      _count: {
        select: {
          stories: {
            where: { status: 'PUBLISHED' },
          },
        },
      },
    },
  });

  const totalStories = await prisma.story.count({
    where: { status: 'PUBLISHED' },
  });

  return { donors, totalStories };
}

export default async function HomePage() {
  const { donors, totalStories } = await getHomeData();

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
            <span className="text-sm font-semibold">Every Donation Has a Story</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Share Your Corporate Impact<br />With Those Who Care
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            ImpactusAll helps corporate donors create branded hubs to showcase the real human impact of their giving to supporters, customers, and employees.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-block bg-white text-orange-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="inline-block bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/30 transition-colors border-2 border-white/30"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                <AnimatedCounter end={donors.length} duration={2000} />
              </div>
              <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">Corporate Donors</div>
              <p className="text-sm text-gray-600">Sharing their impact</p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-teal-500" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                <AnimatedCounter end={totalStories} duration={2000} />
              </div>
              <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">Impact Stories</div>
              <p className="text-sm text-gray-600">Real stories documented</p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-teal-500" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                <AnimatedCounter end={1247} duration={2000} />
              </div>
              <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">Lives Changed</div>
              <p className="text-sm text-gray-600">Across the UK</p>
            </div>
          </div>
        </div>
      </section>

      {/* Donor Hubs Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Explore Donor Impact Hubs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each corporate donor has their own branded hub showcasing stories funded by their donations
            </p>
          </div>

          {donors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-600">No donor hubs available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {donors.map((donor) => (
                <Link
                  key={donor.id}
                  href={`/${donor.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden"
                >
                  {/* Donor Branded Header */}
                  <div
                    className="h-32 p-6 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${donor.primaryColor || '#ea580c'} 0%, ${donor.secondaryColor || '#14b8a6'} 100%)`,
                    }}
                  >
                    {donor.logoUrl && (
                      <div className="relative w-20 h-20 bg-white rounded-full p-3 shadow-lg">
                        <Image
                          src={donor.logoUrl}
                          alt={donor.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    )}
                  </div>

                  {/* Donor Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                      {donor.name}
                    </h3>
                    {donor.tagline && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {donor.tagline}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        📖 {donor._count.stories} {donor._count.stories === 1 ? 'story' : 'stories'}
                      </span>
                      <span className="text-orange-500 font-medium group-hover:underline">
                        View Hub →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            How ImpactusAll Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Make a Donation
              </h3>
              <p className="text-gray-600">
                Corporate donors support charities through meaningful contributions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Share Impact Stories
              </h3>
              <p className="text-gray-600">
                Charities document real stories of lives changed through your support
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Engage Supporters
              </h3>
              <p className="text-gray-600">
                Share your branded hub with employees, customers, and the public
              </p>
            </div>
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
