import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ActivityFeed } from '@/components/platform-admin/activity-feed';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  FileText,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  Flag,
  Activity,
  UserCheck,
  Server,
  Info,
} from 'lucide-react';

export default async function PlatformAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    redirect('/login');
  }

  // Log admin dashboard view
  await logActivity(
    session.user.id,
    'VIEWED_DASHBOARD',
    'SYSTEM',
    null,
    { timestamp: new Date() }
  );

  // Fetch comprehensive stats
  const [
    charitiesStats,
    donorsCount,
    storiesStats,
    usersCount,
    engagementMetrics,
    subscriptionStats,
    overduePayments,
    inactiveCharities,
    flaggedContent,
    recentActivities,
    recentActivityCount,
    lastSystemActivity,
  ] = await Promise.all([
    // Charities stats
    prisma.charity.groupBy({
      by: ['status'],
      _count: true,
    }),
    
    // Active donors
    prisma.donor.count(),
    
    // Stories stats
    prisma.story.groupBy({
      by: ['status'],
      _count: true,
    }),
    
    // Total users count
    prisma.user.count(),
    
    // Engagement metrics (likes + reactions + comments)
    prisma.$transaction([
      prisma.like.count(),
      prisma.reaction.count(),
      prisma.comment.count(),
    ]),
    
    // Subscription stats
    prisma.charity.aggregate({
      _count: {
        id: true,
      },
      _sum: {
        monthlyFee: true,
      },
      where: {
        subscriptionStatus: 'ACTIVE',
      },
    }),
    
    // Overdue payments
    prisma.charity.findMany({
      where: {
        nextPaymentDue: {
          lt: new Date(),
        },
        status: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        nextPaymentDue: true,
        monthlyFee: true,
      },
      take: 5,
    }),
    
    // Inactive charities (no stories in 30+ days)
    prisma.$queryRaw<Array<{ id: string; name: string; lastStoryDate: Date | null }>>`
      SELECT c.id, c.name, MAX(s."publishedAt") as "lastStoryDate"
      FROM "Charity" c
      LEFT JOIN "Story" s ON s."charityId" = c.id AND s.status = 'PUBLISHED'
      WHERE c.status = 'APPROVED'
      GROUP BY c.id, c.name
      HAVING MAX(s."publishedAt") < NOW() - INTERVAL '30 days' OR MAX(s."publishedAt") IS NULL
      LIMIT 5
    `,
    
    // Flagged content
    prisma.$transaction([
      prisma.story.count({ where: { isFlagged: true } }),
      prisma.comment.count({ where: { isFlagged: true } }),
    ]),
    
    // Recent activities
    prisma.activityLog.findMany({
      take: 20,
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        id: true,
        userId: true,
        action: true,
        entityType: true,
        entityId: true,
        details: true,
        timestamp: true,
      },
    }),
    
    // Recent activity count (last 24 hours)
    prisma.activityLog.count({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
    
    // Last system activity (for system health)
    prisma.activityLog.findFirst({
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        timestamp: true,
      },
    }),
  ]);

  // Process stats
  const totalCharities = charitiesStats.reduce((acc, curr) => acc + curr._count, 0);
  const pendingCharities = charitiesStats.find(s => s.status === 'PENDING')?._count || 0;
  const approvedCharities = charitiesStats.find(s => s.status === 'APPROVED')?._count || 0;
  const rejectedCharities = charitiesStats.find(s => s.status === 'REJECTED')?._count || 0;

  const totalStories = storiesStats.reduce((acc, curr) => acc + curr._count, 0);
  const draftStories = storiesStats.find(s => s.status === 'DRAFT')?._count || 0;
  const publishedStories = storiesStats.find(s => s.status === 'PUBLISHED')?._count || 0;
  const archivedStories = storiesStats.find(s => s.status === 'ARCHIVED')?._count || 0;

  const totalEngagement = engagementMetrics[0] + engagementMetrics[1] + engagementMetrics[2];
  const monthlyRevenue = subscriptionStats._sum.monthlyFee || 0;
  const activeSubscriptions = subscriptionStats._count.id || 0;

  const [flaggedStories, flaggedComments] = flaggedContent;
  const totalFlaggedContent = flaggedStories + flaggedComments;

  // Calculate system health based on last activity
  const getSystemHealth = () => {
    if (!lastSystemActivity) {
      return { status: 'red', label: 'No Activity', description: 'No system activity recorded' };
    }
    
    const hoursSinceLastActivity = (Date.now() - new Date(lastSystemActivity.timestamp).getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastActivity < 24) {
      return { status: 'green', label: 'Healthy', description: 'Active in last 24 hours' };
    } else if (hoursSinceLastActivity < 72) {
      return { status: 'yellow', label: 'Warning', description: `Last activity ${Math.round(hoursSinceLastActivity)} hours ago` };
    } else {
      return { status: 'red', label: 'Critical', description: `No activity for ${Math.round(hoursSinceLastActivity / 24)} days` };
    }
  };

  const systemHealth = getSystemHealth();

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Morning Briefing Dashboard</h1>
        <p className="text-gray-600 mt-1">Your daily overview of key metrics and platform health</p>
      </div>

        {/* Alert Banners */}
        {(overduePayments.length > 0 || inactiveCharities.length > 0 || totalFlaggedContent > 0 || recentActivityCount > 0) && (
          <div className="space-y-4 mb-8">
            {/* Recent Activity Alert */}
            {recentActivityCount > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">Recent Activity (Last 24 Hours)</AlertTitle>
                <AlertDescription className="text-blue-800">
                  {recentActivityCount} {recentActivityCount === 1 ? 'action has' : 'actions have'} been performed on the platform in the last 24 hours.
                </AlertDescription>
              </Alert>
            )}
            {/* Overdue Payments Alert */}
            {overduePayments.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Overdue Payments Detected</AlertTitle>
                <AlertDescription>
                  {overduePayments.length} {overduePayments.length === 1 ? 'charity has' : 'charities have'} overdue payments:
                  <ul className="mt-2 list-disc list-inside">
                    {overduePayments.slice(0, 3).map((charity) => (
                      <li key={charity.id}>
                        <strong>{charity.name}</strong> - Due{' '}
                        {new Date(charity.nextPaymentDue!).toLocaleDateString('en-GB')}
                        {charity.monthlyFee && ` (£${charity.monthlyFee})`}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Inactive Charities Alert */}
            {inactiveCharities.length > 0 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Inactive Charities</AlertTitle>
                <AlertDescription>
                  {inactiveCharities.length} approved {inactiveCharities.length === 1 ? 'charity has' : 'charities have'} not published stories in 30+ days:
                  <ul className="mt-2 list-disc list-inside">
                    {inactiveCharities.slice(0, 3).map((charity) => (
                      <li key={charity.id}>
                        <strong>{charity.name}</strong>
                        {charity.lastStoryDate 
                          ? ` - Last story on ${new Date(charity.lastStoryDate).toLocaleDateString('en-GB')}`
                          : ' - No stories yet'
                        }
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Flagged Content Alert */}
            {totalFlaggedContent > 0 && (
              <Alert>
                <Flag className="h-4 w-4" />
                <AlertTitle>Flagged Content Requires Review</AlertTitle>
                <AlertDescription>
                  {flaggedStories} {flaggedStories === 1 ? 'story' : 'stories'} and{' '}
                  {flaggedComments} {flaggedComments === 1 ? 'comment' : 'comments'} have been flagged for review.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {/* Total Charities */}
          <Link href="/platform-admin/charities" className="block transition-transform hover:scale-105">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Charities
                </CardTitle>
                <Building2 className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalCharities}</div>
                <div className="mt-2 flex gap-2 text-sm flex-wrap">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {pendingCharities} Pending
                  </Badge>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {approvedCharities} Approved
                  </Badge>
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    {rejectedCharities} Rejected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Active Donors */}
          <Link href="/platform-admin/donors" className="block transition-transform hover:scale-105">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Donors
                </CardTitle>
                <Users className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{donorsCount}</div>
                <p className="text-sm text-gray-600 mt-2">Corporate donors on platform</p>
              </CardContent>
            </Card>
          </Link>

          {/* Total Stories */}
          <Link href="/platform-admin/content" className="block transition-transform hover:scale-105">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Stories
                </CardTitle>
                <FileText className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalStories}</div>
                <div className="mt-2 flex gap-2 text-sm flex-wrap">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {draftStories} Draft
                  </Badge>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {publishedStories} Published
                  </Badge>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                    {archivedStories} Archived
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Total Users */}
          <Link href="/platform-admin/users" className="block transition-transform hover:scale-105">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Users
                </CardTitle>
                <UserCheck className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{usersCount}</div>
                <p className="text-sm text-gray-600 mt-2">All platform users</p>
              </CardContent>
            </Card>
          </Link>

          {/* Monthly Revenue */}
          <Link href="/platform-admin/charities?tab=payments" className="block transition-transform hover:scale-105">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Monthly Revenue
                </CardTitle>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  £{Number(monthlyRevenue).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-gray-600 mt-2">From {activeSubscriptions} active subscriptions</p>
              </CardContent>
            </Card>
          </Link>

          {/* System Health */}
          <Card className={`h-full ${
            systemHealth.status === 'green' ? 'border-green-200 bg-green-50' :
            systemHealth.status === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
            'border-red-200 bg-red-50'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${
                systemHealth.status === 'green' ? 'text-green-800' :
                systemHealth.status === 'yellow' ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                System Health
              </CardTitle>
              <Server className={`h-5 w-5 ${
                systemHealth.status === 'green' ? 'text-green-500' :
                systemHealth.status === 'yellow' ? 'text-yellow-500' :
                'text-red-500'
              }`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                systemHealth.status === 'green' ? 'text-green-900' :
                systemHealth.status === 'yellow' ? 'text-yellow-900' :
                'text-red-900'
              }`}>
                {systemHealth.label}
              </div>
              <p className={`text-sm mt-2 ${
                systemHealth.status === 'green' ? 'text-green-700' :
                systemHealth.status === 'yellow' ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                {systemHealth.description}
              </p>
            </CardContent>
          </Card>

          {/* Engagement Metrics */}
          <Link href="/platform-admin/content" className="block transition-transform hover:scale-105">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Engagement
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalEngagement.toLocaleString()}</div>
                <p className="text-sm text-gray-600 mt-2">
                  {engagementMetrics[0]} likes · {engagementMetrics[1]} reactions · {engagementMetrics[2]} comments
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Pending Charities Quick Stat */}
          {pendingCharities > 0 && (
            <Link href="/platform-admin/charities?status=PENDING" className="block transition-transform hover:scale-105">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full border-yellow-200 bg-yellow-50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800">
                    Pending Review
                  </CardTitle>
                  <Clock className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-900">{pendingCharities}</div>
                  <p className="text-sm text-yellow-700 mt-2">
                    {pendingCharities === 1 ? 'Charity awaiting' : 'Charities awaiting'} approval
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

      {/* Activity Feed */}
      <ActivityFeed initialActivities={recentActivities} />
    </>
  );
}
