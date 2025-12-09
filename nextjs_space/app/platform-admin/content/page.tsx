import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { SidebarNav } from '@/components/platform-admin/sidebar-nav';
import { ContentModeration } from '@/components/platform-admin/content-moderation';

export default async function ContentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    redirect('/login');
  }

  // Fetch all stories and comments with related data
  const [stories, comments] = await Promise.all([
    prisma.story.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        charity: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            reactions: true,
          },
        },
      },
    }),
    prisma.comment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        story: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

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
        <ContentModeration 
          initialStories={stories}
          initialComments={comments}
          adminId={session.user.id}
        />
      </main>
    </div>
  );
}
