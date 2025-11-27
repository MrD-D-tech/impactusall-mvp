import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

async function getStories() {
  const stories = await prisma.story.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    include: {
      charity: { select: { name: true, logoUrl: true } },
      _count: { select: { likes: true } },
    },
  });

  return stories;
}

export default async function StoriesPage() {
  const stories = await getStories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-orange-500" />
              <span className="text-2xl font-bold text-gradient">ImpactusAll</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/stories" className="text-orange-500 font-semibold">
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

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-teal-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Impact Stories</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Discover how corporate generosity is transforming lives across the UK
          </p>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {stories?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No stories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                          className="object-contain p-1"
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
        )}
      </div>
    </div>
  );
}
