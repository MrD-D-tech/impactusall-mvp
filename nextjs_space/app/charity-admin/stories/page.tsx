import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DeleteStoryButton from './delete-story-button';

export default async function StoriesListPage() {
  const session = await getServerSession(authOptions);
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { charity: true },
  });

  if (!user?.charity) {
    return null;
  }

  // Get all stories for this charity
  const stories = await prisma.story.findMany({
    where: { charityId: user.charity.id },
    include: {
      donor: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
          <p className="text-gray-600 mt-1">Manage your impact stories</p>
        </div>
        <Link href="/charity-admin/stories/new">
          <Button size="lg" className="gradient-primary">
            <Plus className="mr-2 h-5 w-5" />
            Create New Story
          </Button>
        </Link>
      </div>

      {/* Stories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Stories ({stories.length})</CardTitle>
          <CardDescription>View and manage all your charity's impact stories</CardDescription>
        </CardHeader>
        <CardContent>
          {stories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No stories created yet. Start by creating your first story!</p>
              <Link href="/charity-admin/stories/new">
                <Button className="mt-4 gradient-primary">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Story
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Donor</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Engagement</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Updated</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stories.map((story) => (
                    <tr key={story.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{story.title}</p>
                          {story.excerpt && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {story.excerpt}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {story.donor ? (
                          <span className="text-sm text-gray-700">{story.donor.name}</span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No donor</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={story.status === 'PUBLISHED' ? 'default' : 'secondary'}
                          className={`${
                            story.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                        >
                          {story.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600">
                          {story._count.likes} likes, {story._count.comments} comments
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(story.updatedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {story.status === 'PUBLISHED' && story.donor && (
                            <Link
                              href={`/${story.donor.slug}/${story.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/charity-admin/stories/${story.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteStoryButton storyId={story.id} storyTitle={story.title} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
