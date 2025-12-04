import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Globe,
  MapPin,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default async function PlatformAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    redirect('/login');
  }

  // Fetch all charities with their admin users
  const charities = await prisma.charity.findMany({
    include: {
      users: {
        where: {
          role: 'CHARITY_ADMIN',
        },
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          stories: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' }, // PENDING first
      { createdAt: 'desc' },
    ],
  });

  const pendingCount = charities.filter(c => c.status === 'PENDING').length;
  const approvedCount = charities.filter(c => c.status === 'APPROVED').length;
  const rejectedCount = charities.filter(c => c.status === 'REJECTED').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Administration</h1>
          <p className="text-gray-600 mt-1">Manage charity applications and approvals</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-yellow-600" />
                <span className="text-3xl font-bold text-gray-900">{pendingCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">{approvedCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-8 w-8 text-red-600" />
                <span className="text-3xl font-bold text-gray-900">{rejectedCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charities List */}
        <Card>
          <CardHeader>
            <CardTitle>All Charities</CardTitle>
            <CardDescription>
              Review and manage charity applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {charities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No charity applications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {charities.map((charity) => (
                  <div
                    key={charity.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <Building2 className="h-6 w-6 text-gray-400 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {charity.name}
                          </h3>
                          {charity.registrationNumber && (
                            <p className="text-sm text-gray-600">
                              Reg. No: {charity.registrationNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={charity.status === 'APPROVED' ? 'default' : charity.status === 'PENDING' ? 'secondary' : 'destructive'}
                      >
                        {charity.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {charity.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {charity.location}
                        </div>
                      )}
                      {charity.websiteUrl && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="h-4 w-4" />
                          <a
                            href={charity.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:underline"
                          >
                            {charity.websiteUrl}
                          </a>
                        </div>
                      )}
                      {charity.focusArea && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="h-4 w-4" />
                          {charity.focusArea}
                        </div>
                      )}
                      {charity.users[0] && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          {charity.users[0].email}
                        </div>
                      )}
                    </div>

                    {charity.description && (
                      <p className="text-sm text-gray-700 mb-4">
                        {charity.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{charity._count.stories}</span> stories published
                        {' • '}
                        Applied {new Date(charity.createdAt).toLocaleDateString('en-GB')}
                      </div>
                      <div className="flex gap-2">
                        {charity.status === 'PENDING' && (
                          <>
                            <form action="/api/platform-admin/approve-charity" method="POST">
                              <input type="hidden" name="charityId" value={charity.id} />
                              <Button
                                type="submit"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </form>
                            <form action="/api/platform-admin/reject-charity" method="POST">
                              <input type="hidden" name="charityId" value={charity.id} />
                              <Button
                                type="submit"
                                size="sm"
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </form>
                          </>
                        )}
                        {charity.status === 'APPROVED' && (
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
