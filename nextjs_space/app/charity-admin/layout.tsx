import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function CharityAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect if not logged in
  if (!session?.user) {
    redirect('/login?callbackUrl=/charity-admin');
  }

  // Redirect if not a charity admin
  if (session.user.role !== 'CHARITY_ADMIN') {
    redirect('/');
  }

  // Get user's charity information
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      charity: true,
    },
  });

  if (!user?.charity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Charity Assigned</h1>
          <p className="text-gray-600">Your account is not associated with a charity. Please contact support.</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/charity-admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/charity-admin/stories', icon: FileText, label: 'Stories' },
    { href: '/charity-admin/donors', icon: Users, label: 'Donors' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        {/* Logo/Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Heart className="h-8 w-8 text-[#ea580c]" />
          <div className="ml-3">
            <h1 className="font-bold text-lg text-gray-900">ImpactusAll</h1>
            <p className="text-xs text-gray-500">Charity Admin</p>
          </div>
        </div>

        {/* Charity Info */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-teal-50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Your Charity</p>
          <p className="font-semibold text-gray-900">{user.charity.name}</p>
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
