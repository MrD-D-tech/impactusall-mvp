'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  BarChart3,
  UserCog,
  Settings,
  Briefcase,
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Overview',
    href: '/platform-admin',
    icon: LayoutDashboard,
    description: 'Dashboard overview and key metrics',
  },
  {
    name: 'Charities',
    href: '/platform-admin/charities',
    icon: Building2,
    description: 'Manage charity applications and subscriptions',
  },
  {
    name: 'Donors',
    href: '/platform-admin/donors',
    icon: Briefcase,
    description: 'Manage corporate donors',
  },
  {
    name: 'Content',
    href: '/platform-admin/content',
    icon: FileText,
    description: 'Moderate stories and comments',
  },
  {
    name: 'Analytics',
    href: '/platform-admin/analytics',
    icon: BarChart3,
    description: 'Platform analytics and insights',
  },
  {
    name: 'Users',
    href: '/platform-admin/users',
    icon: Users,
    description: 'Manage user accounts',
  },
  {
    name: 'Settings',
    href: '/platform-admin/settings',
    icon: Settings,
    description: 'Platform settings and configuration',
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || 
                        (item.href !== '/platform-admin' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100',
              isActive
                ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                : 'text-gray-700 hover:text-gray-900'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 shrink-0',
                isActive ? 'text-teal-600' : 'text-gray-500 group-hover:text-gray-700'
              )}
            />
            <div className="flex flex-col">
              <span>{item.name}</span>
              {isActive && (
                <span className="text-xs text-teal-600/70">{item.description}</span>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
