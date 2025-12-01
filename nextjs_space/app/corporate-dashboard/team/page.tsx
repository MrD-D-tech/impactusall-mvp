'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Copy, 
  Shield,
  Eye,
  Trash2,
  Loader2,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  corporateRole: 'ADMIN' | 'VIEWER';
  createdAt: string;
  lastLogin: string | null;
}

export default function TeamManagementPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteLink, setInviteLink] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'VIEWER'>('VIEWER');
  const [copied, setCopied] = useState(false);
  const [donorData, setDonorData] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchTeamData();
    }
  }, [status, router]);

  const fetchTeamData = async () => {
    try {
      const response = await fetch('/api/corporate-dashboard/team');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
        setDonorData(data.donor);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = () => {
    // Generate a unique invite token (in production, this would be a server-generated secure token)
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/register?invite=${token}&role=CORPORATE_DONOR&corporateRole=${inviteRole}&donor=${donorData?.slug || ''}`;
    setInviteLink(link);
    toast.success('Invite link generated!');
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const removeTeamMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/corporate-dashboard/team/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== memberId));
        toast.success('Team member removed successfully');
      } else {
        toast.error('Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = (session?.user as any)?.corporateRole === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">View your team members</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Only Admins can manage team members.</p>
            <p className="text-sm text-gray-400 mt-1">Contact your Admin to add or remove team members.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-600 mt-1">
          Manage your team's access to the corporate dashboard
        </p>
      </div>

      {/* Invite New Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </CardTitle>
          <CardDescription>
            Generate an invite link to add new team members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin - Full access
                    </div>
                  </SelectItem>
                  <SelectItem value="VIEWER">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Viewer - Read-only access
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateInviteLink} 
                className="w-full"
                style={{ 
                  backgroundColor: donorData?.primaryColor || '#DA291C',
                  color: 'white'
                }}
              >
                Generate Invite Link
              </Button>
            </div>
          </div>

          {inviteLink && (
            <div className="space-y-2">
              <Label htmlFor="invite-link">Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-link"
                  value={inviteLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button 
                  onClick={copyInviteLink} 
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Share this link with the team member you want to invite. They'll be prompted to create an account with {inviteRole} access.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({teamMembers.length})
          </CardTitle>
          <CardDescription>
            Current team members with access to this dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No team members yet. Invite your first team member above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <Badge 
                        variant={member.corporateRole === 'ADMIN' ? 'default' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        {member.corporateRole === 'ADMIN' ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                        {member.corporateRole}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Last login: {member.lastLogin 
                        ? new Date(member.lastLogin).toLocaleDateString('en-GB', { 
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Never'
                      }
                    </p>
                  </div>

                  {member.id !== session?.user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeamMember(member.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Shield className="h-4 w-4" style={{ color: donorData?.primaryColor || '#DA291C' }} />
                Admin
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• Full dashboard access</li>
                <li>• Generate PDF reports</li>
                <li>• Manage team members</li>
                <li>• Update settings</li>
                <li>• View all content</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Eye className="h-4 w-4 text-gray-600" />
                Viewer
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• View dashboard metrics</li>
                <li>• View impact stories</li>
                <li>• Download assets</li>
                <li>• Cannot generate reports</li>
                <li>• Cannot manage team</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
