import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { SidebarNav } from '@/components/platform-admin/sidebar-nav';

export default async function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is a platform admin
  if (!session?.user) {
    redirect('/login?callbackUrl=/platform-admin');
  }

  if (session.user.role !== 'PLATFORM_ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Admin</h1>
            <p className="text-sm text-gray-500">ImpactusAll Management Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.name}</span>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
              Admin
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 border-r bg-white p-6">
          <SidebarNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
