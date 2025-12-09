'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Search, Filter, ChevronDown, Check, X, Edit, Trash2, DollarSign, Loader2 } from 'lucide-react';

interface Charity {
  id: string;
  name: string;
  location: string | null;
  status: string;
  subscriptionStatus: string | null;
  monthlyFee: any;
  lastPaymentDate: Date | null;
  nextPaymentDue: Date | null;
  createdAt: Date;
  users: { id: string; name: string; email: string }[];
  stories: { id: string; status: string }[];
}

interface CharityManagementProps {
  initialCharities: Charity[];
  initialTab?: string;
  adminId: string;
}

export function CharityManagement({ initialCharities, initialTab, adminId }: CharityManagementProps) {
  const [charities, setCharities] = useState<Charity[]>(initialCharities);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState(initialTab || 'all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | 'suspend' | 'resume' | 'delete' | 'payment' | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const { toast } = useToast();

  // Filter charities based on search and filters
  const filteredCharities = useMemo(() => {
    let filtered = [...charities];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (charity) =>
          charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          charity.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab === 'pending') {
      filtered = filtered.filter((c) => c.status === 'PENDING');
    } else if (activeTab === 'payments') {
      filtered = filtered.filter((c) => c.status === 'APPROVED' && c.monthlyFee);
    } else if (activeTab === 'subscriptions') {
      filtered = filtered.filter((c) => c.subscriptionStatus === 'ACTIVE');
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Apply subscription filter
    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter((c) => c.subscriptionStatus === subscriptionFilter);
    }

    return filtered;
  }, [charities, searchTerm, statusFilter, subscriptionFilter, activeTab]);

  const handleAction = async (action: string, charity: Charity) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/platform-admin/charities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityId: charity.id,
          action,
          adminId,
          ...(action === 'payment' && { amount: parseFloat(paymentAmount) }),
        }),
      });

      if (response.ok) {
        const updatedCharity = await response.json();
        setCharities(
          charities.map((c) => (c.id === charity.id ? { ...c, ...updatedCharity } : c))
        );
        
        toast({
          title: 'Success',
          description: `Charity ${action} successful`,
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Action failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform action',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setActionDialog(null);
      setSelectedCharity(null);
      setPaymentAmount('');
    }
  };

  const handleDelete = async () => {
    if (!selectedCharity) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/platform-admin/charities?id=${selectedCharity.id}&adminId=${adminId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCharities(charities.filter((c) => c.id !== selectedCharity.id));
        toast({
          title: 'Success',
          description: 'Charity deleted successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete charity',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete charity',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setActionDialog(null);
      setSelectedCharity(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  const getSubscriptionBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">No Subscription</Badge>;
    
    const variants: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-orange-100 text-orange-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Charity Management</h1>
        <p className="text-gray-600 mt-1">Manage charities, approvals, subscriptions, and payments</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {activeTab === 'all' && (
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Charities ({charities.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approvals ({charities.filter((c) => c.status === 'PENDING').length})
          </TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="subscriptions">
            Subscriptions ({charities.filter((c) => c.subscriptionStatus === 'ACTIVE').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  {(activeTab === 'payments' || activeTab === 'subscriptions') && (
                    <>
                      <TableHead>Last Payment</TableHead>
                      <TableHead>Next Due</TableHead>
                    </>
                  )}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCharities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      No charities found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCharities.map((charity) => (
                    <TableRow key={charity.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{charity.name}</div>
                          <div className="text-xs text-gray-500">
                            {charity.stories.filter((s) => s.status === 'PUBLISHED').length} stories
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{charity.location || '—'}</TableCell>
                      <TableCell>{getStatusBadge(charity.status)}</TableCell>
                      <TableCell>{getSubscriptionBadge(charity.subscriptionStatus)}</TableCell>
                      <TableCell>
                        {charity.monthlyFee
                          ? `£${Number(charity.monthlyFee).toFixed(2)}`
                          : '—'}
                      </TableCell>
                      {(activeTab === 'payments' || activeTab === 'subscriptions') && (
                        <>
                          <TableCell>
                            {charity.lastPaymentDate
                              ? new Date(charity.lastPaymentDate).toLocaleDateString('en-GB')
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {charity.nextPaymentDue
                              ? new Date(charity.nextPaymentDue).toLocaleDateString('en-GB')
                              : '—'}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {charity.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setSelectedCharity(charity);
                                  setActionDialog('approve');
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedCharity(charity);
                                  setActionDialog('reject');
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {charity.status === 'APPROVED' && (
                            <>
                              {charity.subscriptionStatus === 'ACTIVE' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCharity(charity);
                                    setActionDialog('suspend');
                                  }}
                                >
                                  Suspend
                                </Button>
                              ) : charity.subscriptionStatus === 'SUSPENDED' ? (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    setSelectedCharity(charity);
                                    setActionDialog('resume');
                                  }}
                                >
                                  Resume
                                </Button>
                              ) : null}
                              {charity.monthlyFee && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCharity(charity);
                                    setPaymentAmount(charity.monthlyFee?.toString() || '');
                                    setActionDialog('payment');
                                  }}
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedCharity(charity);
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
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <AlertDialog open={actionDialog === 'approve'} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Charity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve <strong>{selectedCharity?.name}</strong>? 
              This will allow them to access the platform and publish stories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCharity && handleAction('approve', selectedCharity)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={actionDialog === 'reject'} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Charity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject <strong>{selectedCharity?.name}</strong>? 
              This action can be reversed later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCharity && handleAction('reject', selectedCharity)}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Dialog */}
      <AlertDialog open={actionDialog === 'suspend'} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend the subscription for <strong>{selectedCharity?.name}</strong>? 
              They will lose access to premium features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCharity && handleAction('suspend', selectedCharity)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resume Dialog */}
      <AlertDialog open={actionDialog === 'resume'} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Resume the subscription for <strong>{selectedCharity?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCharity && handleAction('resume', selectedCharity)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resume'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog */}
      <Dialog open={actionDialog === 'payment'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a manual payment for <strong>{selectedCharity?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Payment Amount (£)</label>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedCharity && handleAction('payment', selectedCharity)}
              disabled={isLoading || !paymentAmount}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={actionDialog === 'delete'} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Charity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedCharity?.name}</strong>? 
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
