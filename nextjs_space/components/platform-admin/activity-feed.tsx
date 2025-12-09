'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Loader2 } from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: any;
  timestamp: Date;
}

interface ActivityFeedProps {
  initialActivities: ActivityLogEntry[];
}

export function ActivityFeed({ initialActivities }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>(initialActivities);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialActivities.length === 20);
  const [enrichedData, setEnrichedData] = useState<Map<string, any>>(new Map());

  // Enrich activities with actual names
  useEffect(() => {
    const enrichActivities = async () => {
      const userIds = new Set<string>();
      const charityIds = new Set<string>();
      const donorIds = new Set<string>();
      const storyIds = new Set<string>();

      activities.forEach((activity) => {
        userIds.add(activity.userId);
        if (activity.entityId) {
          if (activity.entityType === 'CHARITY') {
            charityIds.add(activity.entityId);
          } else if (activity.entityType === 'DONOR') {
            donorIds.add(activity.entityId);
          } else if (activity.entityType === 'STORY') {
            storyIds.add(activity.entityId);
          }
        }
      });

      try {
        const response = await fetch('/api/platform-admin/activity-enrichment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIds: Array.from(userIds),
            charityIds: Array.from(charityIds),
            donorIds: Array.from(donorIds),
            storyIds: Array.from(storyIds),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const newEnrichedData = new Map(enrichedData);
          
          // Add users
          data.users?.forEach((user: any) => {
            newEnrichedData.set(`USER_${user.id}`, user);
          });
          
          // Add charities
          data.charities?.forEach((charity: any) => {
            newEnrichedData.set(`CHARITY_${charity.id}`, charity);
          });
          
          // Add donors
          data.donors?.forEach((donor: any) => {
            newEnrichedData.set(`DONOR_${donor.id}`, donor);
          });
          
          // Add stories
          data.stories?.forEach((story: any) => {
            newEnrichedData.set(`STORY_${story.id}`, story);
          });

          setEnrichedData(newEnrichedData);
        }
      } catch (error) {
        console.error('Failed to enrich activities:', error);
      }
    };

    enrichActivities();
  }, [activities]);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const lastActivity = activities[activities.length - 1];
      const response = await fetch(`/api/platform-admin/activities?cursor=${lastActivity.id}&limit=20`);
      
      if (response.ok) {
        const newActivities = await response.json();
        if (newActivities.length < 20) {
          setHasMore(false);
        }
        setActivities([...activities, ...newActivities]);
      }
    } catch (error) {
      console.error('Failed to load more activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEntityName = (entityType: string, entityId: string | null) => {
    if (!entityId) return null;
    
    const key = `${entityType}_${entityId}`;
    const entity = enrichedData.get(key);
    
    if (entity) {
      return entity.name || entity.title || entity.email;
    }
    
    return `${entityType} · ID: ${entityId.slice(0, 8)}`;
  };

  const getUserName = (userId: string) => {
    const user = enrichedData.get(`USER_${userId}`);
    return user?.name || user?.email || 'Unknown Admin';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-600" />
          <CardTitle>Recent Activity</CardTitle>
        </div>
        <CardDescription>
          Admin actions on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity to display</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {activities.map((activity) => {
                const entityName = getEntityName(activity.entityType, activity.entityId);
                
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 border-l-2 border-teal-500 pl-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">
                          {getUserName(activity.userId)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {activity.action.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {entityName && (
                        <p className="text-sm text-gray-600 mt-1">
                          {entityName}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString('en-GB', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {hasMore && (
              <div className="flex justify-center pt-4 border-t">
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
