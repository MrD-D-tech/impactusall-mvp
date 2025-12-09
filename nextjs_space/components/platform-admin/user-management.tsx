'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Search, Edit, Trash2, Loader2, ShieldCheck } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  lastLogin: Date | null;
  charity: { id: string; name: string } | null;
  donor: { id: string; name: string } | null;
}

interface UserManagementProps {
  initialUsers: User[];
  adminId: string;
}

export function UserManagement({ initialUsers, adminId }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<'changeRole' | 'delete' | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const { toast } = useToast();

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    return filtered;
  }, [users, searchTerm, roleFilter]);

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/platform-admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: 'changeRole',
          adminId,
          newRole,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedUser } : u)));
        toast({
          title: 'Success',
          description: 'User role updated successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to update user role',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setActionDialog(null);
      setSelectedUser(null);
      setNewRole('');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/platform-admin/users?id=${selectedUser.id}&adminId=${adminId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== selectedUser.id));
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete user',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setActionDialog(null);
      setSelectedUser(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      PUBLIC_USER: 'bg-gray-100 text-gray-800',
      CHARITY_ADMIN: 'bg-blue-100 text-blue-800',
      CORPORATE_DONOR: 'bg-purple-100 text-purple-800',
      PLATFORM_ADMIN: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      PUBLIC_USER: 'Public User',
      CHARITY_ADMIN: 'Charity Admin',
      CORPORATE_DONOR: 'Corporate Donor',
      PLATFORM_ADMIN: 'Platform Admin',
    };
    return <Badge className={variants[role] || ''}>{labels[role] || role}</Badge>;
  };

  const roleStats = useMemo(() => {
    return {
      PUBLIC_USER: users.filter((u) => u.role === 'PUBLIC_USER').length,
      CHARITY_ADMIN: users.filter((u) => u.role === 'CHARITY_ADMIN').length,
      CORPORATE_DONOR: users.filter((u) => u.role === 'CORPORATE_DONOR').length,
      PLATFORM_ADMIN: users.filter((u) => u.role === 'PLATFORM_ADMIN').length,
    };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Public Users</div>
          <div className="text-2xl font-bold mt-1">{roleStats.PUBLIC_USER}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Charity Admins</div>
          <div className="text-2xl font-bold mt-1">{roleStats.CHARITY_ADMIN}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Corporate Donors</div>
          <div className="text-2xl font-bold mt-1">{roleStats.CORPORATE_DONOR}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Platform Admins</div>
          <div className="text-2xl font-bold mt-1">{roleStats.PLATFORM_ADMIN}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="PUBLIC_USER">Public User</SelectItem>
            <SelectItem value="CHARITY_ADMIN">Charity Admin</SelectItem>
            <SelectItem value="CORPORATE_DONOR">Corporate Donor</SelectItem>
            <SelectItem value="PLATFORM_ADMIN">Platform Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    {user.charity ? (
                      <span className="text-sm">{user.charity.name}</span>
                    ) : user.donor ? (
                      <span className="text-sm">{user.donor.name}</span>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('en-GB')}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString('en-GB')
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.role);
                          setActionDialog('changeRole');
                        }}
                        disabled={user.id === adminId}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedUser(user);
                          setActionDialog('delete');
                        }}
                        disabled={user.id === adminId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Change Role Dialog */}
      <Dialog open={actionDialog === 'changeRole'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for <strong>{selectedUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select New Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC_USER">Public User</SelectItem>
                  <SelectItem value="CHARITY_ADMIN">Charity Admin</SelectItem>
                  <SelectItem value="CORPORATE_DONOR">Corporate Donor</SelectItem>
                  <SelectItem value="PLATFORM_ADMIN">Platform Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newRole === 'PLATFORM_ADMIN' && (
              <div className="bg-yellow-50 p-3 rounded flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Platform Admin role grants full access to all platform features.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleChangeRole} disabled={isLoading || !newRole || newRole === selectedUser?.role}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={actionDialog === 'delete'} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
