import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  FileBarChart,
  Users, 
  Settings,
  LogOut,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function CorporateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect if not logged in
  if (!session?.user) {
    redirect('/login?callbackUrl=/corporate-dashboard');
  }

  // Redirect if not a corporate donor
  if (session.user.role !== 'CORPORATE_DONOR') {
    redirect('/');
  }

  // Get user's donor information
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      donor: true,
    },
  });

  if (!user?.donor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Donor Organization Assigned</h1>
          <p className="text-gray-600">Your account is not associated with a donor organization. Please contact support.</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/corporate-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/corporate-dashboard/stories', icon: FileText, label: 'Content Library' },
    { href: '/corporate-dashboard/reports', icon: FileBarChart, label: 'Reports' },
    { href: '/corporate-dashboard/team', icon: Users, label: 'Team' },
    { href: '/corporate-dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        {/* Logo/Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <TrendingUp className="h-8 w-8" style={{ color: user.donor.primaryColor || '#ea580c' }} />
          <div className="ml-3">
            <h1 className="font-bold text-lg text-gray-900">ImpactusAll</h1>
            <p className="text-xs text-gray-500">Corporate Portal</p>
          </div>
        </div>

        {/* Donor Info */}
        <div 
          className="px-6 py-4 border-b border-gray-200"
          style={{ 
            background: `linear-gradient(to right, ${user.donor.primaryColor || '#ea580c'}15, ${user.donor.secondaryColor || '#14b8a6'}15)` 
          }}
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Your Organization</p>
          <p className="font-semibold text-gray-900">{user.donor.name}</p>
          <p className="text-xs text-gray-600 mt-1">
            £{Number(user.donor.donationAmount).toLocaleString('en-GB')} donated
          </p>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 w-64 border-t border-gray-200 bg-white">
          <div className="px-6 py-4">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs font-medium mt-1" style={{ color: user.donor.primaryColor || '#ea580c' }}>
              {user.corporateRole || 'ADMIN'}
            </p>
            <form action="/api/auth/signout" method="POST" className="mt-3">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
