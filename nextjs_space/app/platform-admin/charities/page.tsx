import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { SidebarNav } from '@/components/platform-admin/sidebar-nav';
import { CharityManagement } from '@/components/platform-admin/charity-management';

export default async function CharitiesPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    redirect('/login');
  }

  // Fetch all charities with related data
  const charities = await prisma.charity.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      stories: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

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
        <CharityManagement 
          initialCharities={charities} 
          initialTab={searchParams.tab}
          adminId={session.user.id}
        />
      </main>
    </div>
  );
}
