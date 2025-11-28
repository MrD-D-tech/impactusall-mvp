import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export default async function DonorsPage() {
  const session = await getServerSession(authOptions);
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { charity: true },
  });

  if (!user?.charity) {
    return null;
  }

  // Get all donors who have funded this charity's stories
  const donors = await prisma.donor.findMany({
    where: {
      stories: {
        some: {
          charityId: user.charity.id,
        },
      },
    },
    include: {
      _count: {
        select: {
          stories: {
            where: {
              charityId: user.charity.id,
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Donors</h1>
        <p className="text-gray-600 mt-1">Corporate partners funding your impact stories</p>
      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {donors.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No donors yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                When you tag stories with donors, they'll appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          donors.map((donor) => (
            <Card key={donor.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{donor.name}</span>
                  <Badge>{donor._count.stories} {donor._count.stories === 1 ? 'story' : 'stories'}</Badge>
                </CardTitle>
                {donor.tagline && (
                  <CardDescription>{donor.tagline}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {donor.donationAmount && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Total Donation:</span> £
                    {parseFloat(donor.donationAmount.toString()).toLocaleString('en-GB')}
                  </div>
                )}
                {donor.websiteUrl && (
                  <a
                    href={donor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#ea580c] hover:underline mt-2 inline-block"
                  >
                    Visit website →
                  </a>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
