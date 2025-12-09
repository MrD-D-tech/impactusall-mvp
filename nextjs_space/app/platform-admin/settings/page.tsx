import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { SidebarNav } from '@/components/platform-admin/sidebar-nav';
import { PlatformSettings } from '@/components/platform-admin/platform-settings';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    redirect('/login');
  }

  // Fetch platform stats for system info
  const [totalUsers, totalCharities, totalDonors, totalStories] = await Promise.all([
    prisma.user.count(),
    prisma.charity.count(),
    prisma.donor.count(),
    prisma.story.count(),
  ]);

  const systemInfo = {
    totalUsers,
    totalCharities,
    totalDonors,
    totalStories,
    databaseUrl: process.env.DATABASE_URL?.split('@')[1] || 'Not configured',
    nodeVersion: process.version,
    platform: process.platform,
  };

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
        <PlatformSettings systemInfo={systemInfo} adminId={session.user.id} />
      </main>
    </div>
  );
}
