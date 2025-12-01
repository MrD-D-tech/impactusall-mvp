'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings as SettingsIcon, 
  Bell,
  Palette,
  Save,
  Loader2,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [donorData, setDonorData] = useState<any>(null);
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newStoryNotif, setNewStoryNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/corporate-dashboard/settings');
      if (response.ok) {
        const data = await response.json();
        setDonorData(data.donor);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/corporate-dashboard/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications: {
            email: emailNotifications,
            newStory: newStoryNotif,
            weeklyDigest,
            monthlyReport,
          },
        }),
      });

      if (response.ok) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isAdmin = (session?.user as any)?.corporateRole === 'ADMIN';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your preferences and branding
        </p>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Organization Information
          </CardTitle>
          <CardDescription>
            Your organization details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input value={donorData?.name || ''} readOnly disabled />
            </div>

            <div className="space-y-2">
              <Label>Donation Amount</Label>
              <Input 
                value={donorData?.donationAmount ? `£${Number(donorData.donationAmount).toLocaleString('en-GB')}` : ''} 
                readOnly 
                disabled 
              />
            </div>

            <div className="space-y-2">
              <Label>Public Hub URL</Label>
              <div className="flex gap-2">
                <Input 
                  value={donorData?.slug ? `${window.location.origin}/${donorData.slug}` : ''} 
                  readOnly 
                />
                <Button 
                  variant="outline"
                  onClick={() => window.open(`/${donorData?.slug}`, '_blank')}
                >
                  Visit
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Type</Label>
              <Input 
                value={(session?.user as any)?.corporateRole || 'VIEWER'} 
                readOnly 
                disabled 
              />
            </div>
          </div>

          {!isAdmin && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <Shield className="h-4 w-4 inline mr-2" />
                Contact an Admin to update organization information
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Branding
          </CardTitle>
          <CardDescription>
            Your organization's brand colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Colour</Label>
              <div className="flex gap-2">
                <div 
                  className="w-12 h-10 rounded border border-gray-300"
                  style={{ backgroundColor: donorData?.primaryColor || '#DA291C' }}
                />
                <Input 
                  value={donorData?.primaryColor || '#DA291C'} 
                  readOnly 
                  disabled={!isAdmin}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Secondary Colour</Label>
              <div className="flex gap-2">
                <div 
                  className="w-12 h-10 rounded border border-gray-300"
                  style={{ backgroundColor: donorData?.secondaryColor || '#FBE122' }}
                />
                <Input 
                  value={donorData?.secondaryColor || '#FBE122'} 
                  readOnly 
                  disabled={!isAdmin}
                />
              </div>
            </div>
          </div>

          {!isAdmin && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <Shield className="h-4 w-4 inline mr-2" />
                Contact an Admin to update branding
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage how you receive updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive email updates about your impact
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="pl-6 space-y-4 border-l-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Story Published</Label>
                <p className="text-sm text-gray-500">
                  Get notified when a new impact story is published
                </p>
              </div>
              <Switch
                checked={newStoryNotif}
                onCheckedChange={setNewStoryNotif}
                disabled={!emailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Digest</Label>
                <p className="text-sm text-gray-500">
                  Summary of engagement and new stories (every Monday)
                </p>
              </div>
              <Switch
                checked={weeklyDigest}
                onCheckedChange={setWeeklyDigest}
                disabled={!emailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Monthly Report</Label>
                <p className="text-sm text-gray-500">
                  Comprehensive impact report (first of every month)
                </p>
              </div>
              <Switch
                checked={monthlyReport}
                onCheckedChange={setMonthlyReport}
                disabled={!emailNotifications}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={saveSettings}
              disabled={saving}
              style={{ 
                backgroundColor: donorData?.primaryColor || '#DA291C',
                color: 'white'
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Features available in higher tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Custom Domain</p>
                  <p className="text-sm text-gray-500">e.g., impact.manutd.com</p>
                </div>
                <Badge variant="secondary">Tier 3+</Badge>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">API Access</p>
                  <p className="text-sm text-gray-500">Integrate with your systems</p>
                </div>
                <Badge variant="secondary">Tier 4+</Badge>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">White-Label Platform</p>
                  <p className="text-sm text-gray-500">Fully branded experience</p>
                </div>
                <Badge variant="secondary">Tier 3+</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
