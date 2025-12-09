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
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Search, Eye, UserX, UserCheck, Trash2, Loader2, Building2 } from 'lucide-react';

interface Donor {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  donationAmount: any;
  createdAt: Date;
  users: { id: string; name: string; email: string }[];
  stories: { id: string; status: string }[];
  charity: { id: string; name: string } | null;
}

interface DonorManagementProps {
  initialDonors: Donor[];
  adminId: string;
}

export function DonorManagement({ initialDonors, adminId }: DonorManagementProps) {
  const [donors, setDonors] = useState<Donor[]>(initialDonors);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState<'delete' | null>(null);
  const { toast } = useToast();

  // Filter donors based on search
  const filteredDonors = useMemo(() => {
    let filtered = [...donors];

    if (searchTerm) {
      filtered = filtered.filter(
        (donor) =>
          donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donor.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [donors, searchTerm]);

  const handleDelete = async () => {
    if (!selectedDonor) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/platform-admin/donors?id=${selectedDonor.id}&adminId=${adminId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDonors(donors.filter((d) => d.id !== selectedDonor.id));
        toast({
          title: 'Success',
          description: 'Donor deleted successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete donor',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete donor',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setActionDialog(null);
      setSelectedDonor(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Donor Management</h1>
        <p className="text-gray-600 mt-1">Manage corporate donors and their activity</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Linked Charity</TableHead>
              <TableHead>Stories</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDonors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  No donors found
                </TableCell>
              </TableRow>
            ) : (
              filteredDonors.map((donor) => (
                <TableRow key={donor.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {donor.logoUrl ? (
                        <img
                          src={donor.logoUrl}
                          alt={donor.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div>{donor.name}</div>
                        <div className="text-xs text-gray-500">/{donor.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Corporate</Badge>
                  </TableCell>
                  <TableCell>
                    {donor.charity ? (
                      <span className="text-sm">{donor.charity.name}</span>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{donor.stories.length} total</div>
                      <div className="text-xs text-gray-500">
                        {donor.stories.filter((s) => s.status === 'PUBLISHED').length} published
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{donor.users.length}</TableCell>
                  <TableCell>
                    {new Date(donor.createdAt).toLocaleDateString('en-GB')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDonor(donor);
                          setViewDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedDonor(donor);
                          setActionDialog('delete');
                        }}
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

      {/* View Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Donor Details</DialogTitle>
            <DialogDescription>View information about {selectedDonor?.name}</DialogDescription>
          </DialogHeader>
          {selectedDonor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1">{selectedDonor.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Slug</h3>
                  <p className="mt-1">/{selectedDonor.slug}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Stories Published</h3>
                  <p className="mt-1">
                    {selectedDonor.stories.filter((s) => s.status === 'PUBLISHED').length} /{' '}
                    {selectedDonor.stories.length}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Linked Charity</h3>
                  <p className="mt-1">{selectedDonor.charity?.name || 'None'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Users ({selectedDonor.users.length})</h3>
                <div className="space-y-2">
                  {selectedDonor.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  ))}
                  {selectedDonor.users.length === 0 && (
                    <p className="text-sm text-gray-500">No users associated</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={actionDialog === 'delete'} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Donor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedDonor?.name}</strong>? 
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
