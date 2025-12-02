import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { FileText, Users, Eye, Heart, MessageCircle, Info, Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CharityAdminDashboard() {
  const session = await getServerSession(authOptions);
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { charity: true },
  });

  if (!user?.charity) {
    return null;
  }

  // Get statistics
  const [totalStories, publishedStories, draftStories, uniqueDonors] = await Promise.all([
    prisma.story.count({
      where: { charityId: user.charity.id },
    }),
    prisma.story.count({
      where: { 
        charityId: user.charity.id,
        status: 'PUBLISHED',
      },
    }),
    prisma.story.count({
      where: { 
        charityId: user.charity.id,
        status: 'DRAFT',
      },
    }),
    prisma.story.findMany({
      where: { charityId: user.charity.id },
      distinct: ['donorId'],
      select: { donorId: true },
    }).then(results => results.filter(r => r.donorId).length),
  ]);

  // Get recent stories
  const recentStories = await prisma.story.findMany({
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
    take: 5,
  });

  const stats = [
    {
      title: 'Total Stories',
      value: totalStories,
      icon: FileText,
      description: `${publishedStories} published, ${draftStories} draft`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Donors',
      value: uniqueDonors,
      icon: Users,
      description: 'Corporate partners',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Engagement',
      value: recentStories.reduce((sum, s) => sum + s._count.likes + s._count.comments, 0),
      icon: Heart,
      description: 'Likes and comments',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name}!</p>
        </div>
        <Link href="/charity-admin/stories/new">
          <Button size="lg" className="gradient-primary">
            <FileText className="mr-2 h-5 w-5" />
            Create New Story
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Stories */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stories</CardTitle>
          <CardDescription>Your latest impact stories</CardDescription>
        </CardHeader>
        <CardContent>
          {recentStories.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No stories yet</h3>
              <p className="mt-2 text-sm text-gray-500">Get started by creating your first impact story.</p>
              <Link href="/charity-admin/stories/new">
                <Button className="mt-4 gradient-primary">
                  Create Your First Story
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentStories.map((story) => (
                <div
                  key={story.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{story.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          story.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {story.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {story.donor && (
                        <span>Donor: {story.donor.name}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {story._count.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {story._count.comments}
                      </span>
                    </div>
                  </div>
                  <Link href={`/charity-admin/stories/${story.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              ))}
              <div className="pt-4">
                <Link href="/charity-admin/stories">
                  <Button variant="link" className="text-[#ea580c]">
                    View All Stories →
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Guidance Card */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Info className="h-5 w-5" />
            Story Creation & Sharing Guide
          </CardTitle>
          <CardDescription>
            Quick reference for managing your impact stories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Creating Compelling Stories</h4>
                <p className="text-sm text-gray-700 mt-1">
                  Focus on personal narratives with real impact. Include names, specific outcomes, and emotional moments.
                  Add high-quality photos and videos to bring stories to life. Aim for 300-500 words per story.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Share2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Sharing on Social Media</h4>
                <p className="text-sm text-gray-700 mt-1">
                  Once published, your story appears on the public impact hub. Copy the story URL and share it on:
                </p>
                <ul className="text-sm text-gray-700 mt-2 space-y-1 ml-4">
                  <li><strong>Instagram:</strong> Copy the link and paste it in your bio or use the link sticker in Stories</li>
                  <li><strong>LinkedIn:</strong> Share as a post with the URL - LinkedIn will auto-generate a preview card</li>
                  <li><strong>Twitter:</strong> Tweet the URL with hashtags like #CommunityImpact #Manchester</li>
                  <li><strong>Facebook:</strong> Post the URL - Facebook will create a rich preview automatically</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">When Donors Request New Stories</h4>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>1. Create Story:</strong> Click "Create New Story" and fill in all details including impact metrics<br />
                  <strong>2. Tag Donor:</strong> Select the requesting corporate partner from the dropdown<br />
                  <strong>3. Save as Draft:</strong> Review with your team before publishing<br />
                  <strong>4. Publish:</strong> Once approved, click "Publish" to make it live on their impact hub<br />
                  <strong>5. Notify:</strong> The corporate partner will be automatically notified of the new story
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Monitoring Engagement</h4>
                <p className="text-sm text-gray-700 mt-1">
                  Track how your stories perform through likes, comments, and reactions. High-engagement stories can be
                  repurposed for newsletters, grant applications, and annual reports.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <p className="text-xs text-gray-600 italic">
              💡 <strong>Pro Tip:</strong> Stories with emotional depth and specific metrics (e.g., "12 families supported") 
              perform 3x better than general updates. Always include a call-to-action at the end.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
