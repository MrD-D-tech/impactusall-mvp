'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  Settings, 
  CreditCard, 
  FileText, 
  Mail, 
  Database, 
  Save, 
  Loader2,
  Shield,
  Bell
} from 'lucide-react';

interface PlatformSettingsProps {
  systemInfo: {
    totalUsers: number;
    totalCharities: number;
    totalDonors: number;
    totalStories: number;
    databaseUrl: string;
    nodeVersion: string;
    platform: string;
  };
  adminId: string;
}

export function PlatformSettings({ systemInfo, adminId }: PlatformSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Platform Settings
  const [platformName, setPlatformName] = useState('ImpactusAll');
  const [platformUrl, setPlatformUrl] = useState('https://impactusall.com');
  const [supportEmail, setSupportEmail] = useState('support@impactusall.com');

  // Subscription Settings
  const [defaultMonthlyFee, setDefaultMonthlyFee] = useState('49.99');
  const [trialPeriodDays, setTrialPeriodDays] = useState('14');
  const [autoApprovePayments, setAutoApprovePayments] = useState(false);

  // Content Settings
  const [autoModeration, setAutoModeration] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [maxUploadSize, setMaxUploadSize] = useState('10');

  // Email Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(true);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/platform-admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          settings: {
            platform: {
              name: platformName,
              url: platformUrl,
              supportEmail,
            },
            subscription: {
              defaultMonthlyFee: parseFloat(defaultMonthlyFee),
              trialPeriodDays: parseInt(trialPeriodDays),
              autoApprovePayments,
            },
            content: {
              autoModeration,
              requireApproval,
              maxUploadSize: parseInt(maxUploadSize),
            },
            email: {
              emailNotifications,
              weeklyDigest,
              monthlyReports,
            },
          },
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Settings saved successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to save settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
      </div>

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <CardTitle>Platform Settings</CardTitle>
          </div>
          <CardDescription>General platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platformName">Platform Name</Label>
            <Input
              id="platformName"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platformUrl">Platform URL</Label>
            <Input
              id="platformUrl"
              value={platformUrl}
              onChange={(e) => setPlatformUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Subscription Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-600" />
            <CardTitle>Subscription Settings</CardTitle>
          </div>
          <CardDescription>Manage subscription and payment configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultMonthlyFee">Default Monthly Fee (£)</Label>
            <Input
              id="defaultMonthlyFee"
              type="number"
              step="0.01"
              value={defaultMonthlyFee}
              onChange={(e) => setDefaultMonthlyFee(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trialPeriodDays">Trial Period (Days)</Label>
            <Input
              id="trialPeriodDays"
              type="number"
              value={trialPeriodDays}
              onChange={(e) => setTrialPeriodDays(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-approve Payments</Label>
              <p className="text-sm text-gray-500">Automatically approve manual payment entries</p>
            </div>
            <Switch
              checked={autoApprovePayments}
              onCheckedChange={setAutoApprovePayments}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <CardTitle>Content Settings</CardTitle>
          </div>
          <CardDescription>Configure content moderation and upload limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-moderation</Label>
              <p className="text-sm text-gray-500">Automatically flag potentially inappropriate content</p>
            </div>
            <Switch
              checked={autoModeration}
              onCheckedChange={setAutoModeration}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Approval for New Stories</Label>
              <p className="text-sm text-gray-500">Stories must be approved before publishing</p>
            </div>
            <Switch
              checked={requireApproval}
              onCheckedChange={setRequireApproval}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
            <Input
              id="maxUploadSize"
              type="number"
              value={maxUploadSize}
              onChange={(e) => setMaxUploadSize(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-gray-600" />
            <CardTitle>Email Settings</CardTitle>
          </div>
          <CardDescription>Configure email notifications and reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Send email notifications for important events</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-gray-500">Send weekly activity digest to admins</p>
            </div>
            <Switch
              checked={weeklyDigest}
              onCheckedChange={setWeeklyDigest}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Monthly Reports</Label>
              <p className="text-sm text-gray-500">Generate and send monthly platform reports</p>
            </div>
            <Switch
              checked={monthlyReports}
              onCheckedChange={setMonthlyReports}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-600" />
            <CardTitle>System Information</CardTitle>
          </div>
          <CardDescription>Platform statistics and system details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{systemInfo.totalUsers.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Charities</p>
                <p className="text-2xl font-bold">{systemInfo.totalCharities.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Total Donors</p>
                <p className="text-2xl font-bold">{systemInfo.totalDonors.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Stories</p>
                <p className="text-2xl font-bold">{systemInfo.totalStories.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Node Version:</span>
              <span className="font-mono">{systemInfo.nodeVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Platform:</span>
              <span className="font-mono">{systemInfo.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Database:</span>
              <span className="font-mono text-xs">{systemInfo.databaseUrl}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
