import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Heart, 
  Share2, 
  MessageCircle, 
  Eye, 
  Calendar,
  Users,
  Clock,
  FileText
} from 'lucide-react';
import EngagementChart from './engagement-chart';

export const dynamic = 'force-dynamic';

export default async function CorporateDashboardPage() {
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

  // Calculate aggregate impact metrics from all stories
  const impactMetrics = stories.reduce(
    (acc, story) => {
      const metrics = story.impactMetrics as any;
      if (metrics) {
        acc.familiesHelped += metrics.families_helped || 0;
        acc.hoursOfCare += metrics.hours_of_care || 0;
        acc.memorySessions += metrics.memory_making_sessions || 0;
        acc.counsellingSessions += metrics.counselling_sessions || 0;
        acc.employmentTraining += metrics.employment_training_hours || 0;
        acc.peopleReached += metrics.people_reached || 0;
      }
      return acc;
    },
    {
      familiesHelped: 0,
      hoursOfCare: 0,
      memorySessions: 0,
      counsellingSessions: 0,
      employmentTraining: 0,
      peopleReached: 0,
    }
  );

  // Calculate engagement metrics
  const engagementMetrics = stories.reduce(
    (acc, story) => {
      acc.totalLikes += story._count.likes;
      acc.totalComments += story._count.comments;
      acc.totalReactions += story._count.reactions;
      return acc;
    },
    { totalLikes: 0, totalComments: 0, totalReactions: 0 }
  );

  // Get analytics data for charts
  const analyticsData = await prisma.analytics.findMany({
    where: {
      donorId: user.donor.id,
    },
    orderBy: {
      date: 'asc',
    },
    take: 30, // Last 30 days
  });

  // Aggregate analytics by date
  const chartData = analyticsData.reduce((acc: any[], analytics) => {
    const dateStr = analytics.date.toISOString().split('T')[0];
    const existing = acc.find(item => item.date === dateStr);
    
    if (existing) {
      existing.views += analytics.views;
      existing.likes += analytics.likes;
      existing.shares += analytics.shares;
      existing.comments += analytics.comments;
    } else {
      acc.push({
        date: dateStr,
        views: analytics.views,
        likes: analytics.likes,
        shares: analytics.shares,
        comments: analytics.comments,
      });
    }
    return acc;
  }, []);

  // Get social media breakdown
  const socialShares = analyticsData.reduce(
    (acc, analytics) => {
      acc.twitter += analytics.sharesTwitter;
      acc.facebook += analytics.sharesFacebook;
      acc.linkedin += analytics.sharesLinkedin;
      acc.instagram += analytics.sharesInstagram;
      acc.whatsapp += analytics.sharesWhatsapp;
      return acc;
    },
    { twitter: 0, facebook: 0, linkedin: 0, instagram: 0, whatsapp: 0 }
  );

  const totalShares = Object.values(socialShares).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Impact Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Real-time insights into your donation's impact
        </p>
      </div>

      {/* Impact Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Impact Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Families Helped</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: user.donor.primaryColor || '#ea580c' }}>
                {impactMetrics.familiesHelped.toLocaleString('en-GB')}
              </div>
              <p className="text-xs text-gray-500 mt-1">Across {stories.length} stories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Hours of Care</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: user.donor.primaryColor || '#ea580c' }}>
                {impactMetrics.hoursOfCare.toLocaleString('en-GB')}
              </div>
              <p className="text-xs text-gray-500 mt-1">Provided to families</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Stories Published</CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: user.donor.primaryColor || '#ea580c' }}>
                {stories.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Impact stories shared</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {engagementMetrics.totalLikes.toLocaleString('en-GB')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Shares</CardTitle>
              <Share2 className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {totalShares.toLocaleString('en-GB')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {engagementMetrics.totalComments.toLocaleString('en-GB')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Reactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {engagementMetrics.totalReactions.toLocaleString('en-GB')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Engagement Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Engagement Trends (Last 30 Days)</CardTitle>
            <CardDescription>Track how your impact stories are performing over time</CardDescription>
          </CardHeader>
          <CardContent>
            <EngagementChart data={chartData} primaryColor={user.donor.primaryColor || '#ea580c'} />
          </CardContent>
        </Card>
      )}

      {/* Recent Stories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Impact Stories</h2>
          <Link href="/corporate-dashboard/stories">
            <Button variant="outline" size="sm">
              View All Stories
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.slice(0, 4).map((story) => (
            <Card key={story.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{story.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {story.charity.name}
                    </CardDescription>
                  </div>
                  <span 
                    className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                    style={{ backgroundColor: user.donor.primaryColor || '#ea580c' }}
                  >
                    £25,000
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">{story.excerpt}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/corporate-dashboard/reports">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </Link>
          <Link href="/corporate-dashboard/stories">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View All Stories
            </Button>
          </Link>
          <Link href={`/manchester-united`}>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              View Public Hub
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
