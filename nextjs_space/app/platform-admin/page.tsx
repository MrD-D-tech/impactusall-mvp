import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import { SidebarNav } from '@/components/platform-admin/sidebar-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
    engagementMetrics,
    subscriptionStats,
    overduePayments,
    inactiveCharities,
    flaggedContent,
    recentActivities,
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

  // Get admin names for activity log
  const adminIds = [...new Set(recentActivities.map(a => a.userId))];
  const admins = await prisma.user.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, name: true },
  });
  const adminMap = new Map(admins.map(a => [a.id, a.name]));

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">Platform Admin</h2>
          <p className="text-sm text-gray-600 mt-1">God Mode Dashboard</p>
        </div>
        <SidebarNav />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Overview Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your platform at a glance</p>
        </div>

        {/* Alert Banners */}
        {(overduePayments.length > 0 || inactiveCharities.length > 0 || totalFlaggedContent > 0) && (
          <div className="space-y-4 mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Charities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Charities
              </CardTitle>
              <Building2 className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalCharities}</div>
              <div className="mt-2 flex gap-2 text-sm">
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

          {/* Active Donors */}
          <Card>
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

          {/* Total Stories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Stories
              </CardTitle>
              <FileText className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalStories}</div>
              <div className="mt-2 flex gap-2 text-sm">
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

          {/* Engagement Metrics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Engagement Metrics
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

          {/* Monthly Revenue */}
          <Card>
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
              <p className="text-sm text-gray-600 mt-2">From active subscriptions</p>
            </CardContent>
          </Card>

          {/* Active Subscriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Subscriptions
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{activeSubscriptions}</div>
              <p className="text-sm text-gray-600 mt-2">Charities with active subscriptions</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-600" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>
              Last 20 admin actions on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity to display</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 border-l-2 border-teal-500 pl-3 py-2"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {(adminMap.get(activity.userId) as string | undefined) || 'Unknown Admin'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {activity.action.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.entityType} {activity.entityId && `· ID: ${activity.entityId.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString('en-GB', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
