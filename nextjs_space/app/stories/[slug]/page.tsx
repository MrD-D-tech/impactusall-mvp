import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Heart, ArrowLeft, Calendar } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { StoryActions } from '@/components/story-actions';

async function getStory(slug: string) {
  const story = await prisma.story.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      charity: true,
      donor: true,
      _count: { select: { likes: true } },
    },
  });

  if (!story) return null;

  // Get related stories from the same charity
  const relatedStories = await prisma.story.findMany({
    where: {
      charityId: story.charityId,
      status: 'PUBLISHED',
      NOT: { id: story.id },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    include: {
      charity: { select: { name: true, logoUrl: true } },
      _count: { select: { likes: true } },
    },
  });

  return { story, relatedStories };
}

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const data = await getStory(params.slug);

  if (!data) {
    notFound();
  }

  const { story, relatedStories } = data;
  const impactMetrics = story?.impactMetrics as Record<string, string | number> || {};

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
              <Link href="/stories" className="text-gray-700 hover:text-gray-900 font-medium">
                Stories
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Story Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/stories" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Stories
        </Link>

        {/* Featured Image */}
        {story?.featuredImageUrl && (
          <div className="relative aspect-video bg-gray-200 rounded-2xl overflow-hidden mb-8">
            <Image
              src={story.featuredImageUrl}
              alt={story?.title ?? 'Story image'}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Charity Info */}
        <div className="flex items-center gap-4 mb-6">
          {story?.charity?.logoUrl && (
            <div className="relative w-16 h-16 bg-white rounded-full p-2 shadow-md">
              <Image
                src={story.charity.logoUrl}
                alt={story?.charity?.name ?? 'Charity logo'}
                fill
                className="object-contain p-2"
              />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{story?.charity?.name}</h3>
            {story?.charity?.location && (
              <p className="text-sm text-gray-600">{story.charity.location}</p>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          {story?.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-8 pb-8 border-b">
          {story?.publishedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(story.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {story?._count?.likes ?? 0} likes
          </div>
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: story?.content ?? '' }}
        />

        {/* Impact Metrics */}
        {Object.keys(impactMetrics ?? {}).length > 0 && (
          <div className="bg-gradient-to-br from-orange-50 to-teal-50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Impact Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(impactMetrics ?? {})?.map(([key, value]) => (
                <div key={key} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-gradient mb-2">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <StoryActions
          storyId={story?.id ?? ''}
          initialLikes={story?._count?.likes ?? 0}
          title={story?.title ?? ''}
          url={`/stories/${story?.slug}`}
        />

        {/* Related Stories */}
        {relatedStories?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedStories?.map((relatedStory) => (
                <Link
                  key={relatedStory?.id}
                  href={`/stories/${relatedStory?.slug}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden"
                >
                  {relatedStory?.featuredImageUrl && (
                    <div className="relative aspect-video bg-gray-200">
                      <Image
                        src={relatedStory.featuredImageUrl}
                        alt={relatedStory?.title ?? 'Story image'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      {relatedStory?.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {relatedStory?.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
