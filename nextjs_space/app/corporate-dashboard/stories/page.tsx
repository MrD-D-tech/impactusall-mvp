import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  MessageCircle, 
  Calendar,
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ContentLibraryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'CORPORATE_DONOR') {
    redirect('/login');
  }

  // Get user's donor information
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      donor: true,
    },
  });

  if (!user?.donor) {
    redirect('/login');
  }

  // Get all stories funded by this donor
  const stories = await prisma.story.findMany({
    where: {
      donorId: user.donor.id,
      status: 'PUBLISHED',
    },
    include: {
      charity: true,
      media: true,
      _count: {
        select: {
          likes: true,
          comments: true,
          reactions: true,
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
        <p className="text-gray-600 mt-1">
          All impact stories funded by {user.donor.name}
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: user.donor.primaryColor || '#ea580c' }}>
              {stories.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: user.donor.primaryColor || '#ea580c' }}>
              {stories.filter(s => s.featuredImageUrl).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: user.donor.primaryColor || '#ea580c' }}>
              {stories.reduce((acc, s) => acc + s.media.filter(m => m.fileType === 'VIDEO').length, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: user.donor.primaryColor || '#ea580c' }}>
              {stories.reduce((acc, s) => acc + s._count.likes + s._count.comments + s._count.reactions, 0).toLocaleString('en-GB')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No stories published yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => {
            const hasVideo = story.media.some(m => m.fileType === 'VIDEO');
            const publicUrl = `/${user.donor?.slug || 'manchester-united'}/${story.slug}`;

            return (
              <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Story Image */}
                {story.featuredImageUrl && (
                  <div className="relative w-full aspect-video bg-gray-100">
                    <Image
                      src={story.featuredImageUrl}
                      alt={story.title}
                      fill
                      className="object-cover"
                    />
                    {hasVideo && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                        VIDEO
                      </div>
                    )}
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {story.charity.name}
                      </CardDescription>
                    </div>
                    <span 
                      className="px-2 py-1 text-xs font-semibold rounded-full text-white whitespace-nowrap"
                      style={{ backgroundColor: user.donor?.primaryColor || '#ea580c' }}
                    >
                      £25,000
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 line-clamp-3">{story.excerpt}</p>

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {story._count.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {story._count.comments}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString('en-GB', { 
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={publicUrl} target="_blank" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        View Public
                      </Button>
                    </Link>
                    <a 
                      href={`/api/corporate-dashboard/download-story?storyId=${story.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button 
                        variant="outline" 
                        size="sm"
                        title="Download complete story as HTML"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Download All Button */}
      {stories.length > 0 && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Download All Assets</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Download all photos and videos from your impact stories
                </p>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download ZIP
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
