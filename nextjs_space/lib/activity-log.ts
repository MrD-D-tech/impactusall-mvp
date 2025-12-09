import { prisma } from '@/lib/db';

/**
 * Activity Log Helper
 * 
 * Tracks all platform admin actions in the database for audit trail and activity feed.
 * 
 * Usage:
 *   await logActivity(userId, 'APPROVED_CHARITY', 'CHARITY', charityId, { charityName: 'Example Charity' });
 */

export type EntityType = 'CHARITY' | 'STORY' | 'COMMENT' | 'USER' | 'DONOR' | 'SYSTEM';

export type ActionType = 
  // Charity actions
  | 'APPROVED_CHARITY'
  | 'REJECTED_CHARITY'
  | 'SUSPENDED_CHARITY'
  | 'UPDATED_CHARITY'
  | 'DELETED_CHARITY'
  // Content actions
  | 'FLAGGED_STORY'
  | 'UNFLAGGED_STORY'
  | 'DELETED_STORY'
  | 'UPDATED_STORY'
  | 'FLAGGED_COMMENT'
  | 'UNFLAGGED_COMMENT'
  | 'DELETED_COMMENT'
  | 'UPDATED_COMMENT'
  // User actions
  | 'CREATED_USER'
  | 'UPDATED_USER'
  | 'DELETED_USER'
  | 'SUSPENDED_USER'
  | 'ACTIVATED_USER'
  | 'RESET_PASSWORD'
  | 'CHANGED_USER_ROLE'
  // Donor actions
  | 'CREATED_DONOR'
  | 'UPDATED_DONOR'
  | 'DELETED_DONOR'
  | 'SUSPENDED_DONOR'
  | 'ACTIVATED_DONOR'
  // System actions
  | 'VIEWED_DASHBOARD'
  | 'EXPORTED_DATA'
  | 'SYSTEM_CONFIG_CHANGED';

/**
 * Log an admin activity
 * 
 * @param userId - The ID of the platform admin performing the action
 * @param action - The type of action performed
 * @param entityType - The type of entity affected
 * @param entityId - The ID of the affected entity (optional)
 * @param details - Additional details about the action (optional)
 * @returns Promise<ActivityLog> - The created activity log entry
 */
export async function logActivity(
  userId: string,
  action: ActionType,
  entityType: EntityType,
  entityId?: string | null,
  details?: Record<string, any> | null
) {
  try {
    const activityLog = await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId || null,
        details: details || undefined,
      },
    });

    return activityLog;
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw error to prevent activity logging from breaking the main flow
    return null;
  }
}

/**
 * Get recent activity logs
 * 
 * @param limit - Number of logs to retrieve (default: 20)
 * @param filters - Optional filters for activity logs
 * @returns Promise<ActivityLog[]> - Array of activity logs
 */
export async function getRecentActivities(
  limit: number = 20,
  filters?: {
    userId?: string;
    entityType?: EntityType;
    action?: ActionType;
  }
) {
  try {
    const activities = await prisma.activityLog.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.entityType && { entityType: filters.entityType }),
        ...(filters?.action && { action: filters.action }),
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return activities;
  } catch (error) {
    console.error('Failed to retrieve activity logs:', error);
    return [];
  }
}

/**
 * Get activity count by action type
 * 
 * @param startDate - Start date for counting (optional)
 * @param endDate - End date for counting (optional)
 * @returns Promise<Record<string, number>> - Count of each action type
 */
export async function getActivityStats(
  startDate?: Date,
  endDate?: Date
) {
  try {
    const activities = await prisma.activityLog.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
      where: {
        ...(startDate && endDate && {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
    });

    const stats: Record<string, number> = {};
    activities.forEach((activity: { action: string; _count: { action: number } }) => {
      stats[activity.action] = activity._count.action;
    });

    return stats;
  } catch (error) {
    console.error('Failed to retrieve activity stats:', error);
    return {};
  }
}
