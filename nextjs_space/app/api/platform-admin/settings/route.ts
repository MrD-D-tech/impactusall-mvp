import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { logActivity } from '@/lib/activity-log';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { adminId, settings } = await request.json();

    // In a real implementation, you would save these settings to a database
    // For now, we'll just log the activity and return success
    
    // Log the activity
    await logActivity(
      adminId,
      'SYSTEM_CONFIG_CHANGED',
      'SYSTEM',
      null,
      {
        settings,
        timestamp: new Date(),
      }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
