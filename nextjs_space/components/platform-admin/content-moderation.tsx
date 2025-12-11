'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { Search, Flag, Trash2, Eye, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  status: string;
  isFlagged: boolean;
  flagReason: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  charity: { id: string; name: string };
  createdBy: { id: string; name: string; email: string };
  _count: { likes: number; comments: number; reactions: number };
}

interface Comment {
  id: string;
  content: string;
  status: string;
  isFlagged: boolean;
  flagReason: string | null;
  userName: string;
  userEmail: string | null;
  createdAt: Date;
  story: { id: string; title: string };
  user: { id: string; name: string; email: string } | null;
}

interface ContentModerationProps {
  initialStories: Story[];
  initialComments: Comment[];
  adminId: string;
}

export function ContentModeration({ initialStories, initialComments, adminId }: ContentModerationProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('stories');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<'flag' | 'unflag' | 'delete' | 'view' | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const { toast } = useToast();

  // Filter stories
  const filteredStories = useMemo(() => {
    let filtered = [...stories];

    if (searchTerm) {
      filtered = filtered.filter(
        (story) =>
          story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.charity.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeTab === 'flagged') {
      filtered = filtered.filter((s) => s.isFlagged);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    return filtered;
  }, [stories, searchTerm, statusFilter, activeTab]);

  // Filter comments
  const filteredComments = useMemo(() => {
    let filtered = [...comments];

    if (searchTerm) {
      filtered = filtered.filter(
        (comment) =>
          comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comment.story.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeTab === 'flagged') {
      filtered = filtered.filter((c) => c.isFlagged);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    return filtered;
  }, [comments, searchTerm, statusFilter, activeTab]);

  const handleStoryAction = async (action: string, story: Story) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/platform-admin/content/stories', {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: story.id,
          action,
          adminId,
          ...(action === 'flag' && { flagReason }),
        }),
      });

      if (response.ok) {
        if (action === 'delete') {
          setStories(stories.filter((s) => s.id !== story.id));
        } else {
          const updatedStory = await response.json();
          setStories(stories.map((s) => (s.id === story.id ? { ...s, ...updatedStory } : s)));
        }
        
        toast({
          title: 'Success',
          description: `Story ${action} successful`,
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
      setSelectedItem(null);
      setFlagReason('');
    }
  };

  const handleCommentAction = async (action: string, comment: Comment) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/platform-admin/content/comments', {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: comment.id,
          action,
          adminId,
          ...(action === 'flag' && { flagReason }),
        }),
      });

      if (response.ok) {
        if (action === 'delete') {
          setComments(comments.filter((c) => c.id !== comment.id));
        } else {
          const updatedComment = await response.json();
          setComments(comments.map((c) => (c.id === comment.id ? { ...c, ...updatedComment } : c)));
        }
        
        toast({
          title: 'Success',
          description: `Comment ${action} successful`,
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
      setSelectedItem(null);
      setFlagReason('');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-orange-100 text-orange-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      SPAM: 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  const flaggedStoriesCount = stories.filter((s) => s.isFlagged).length;
  const flaggedCommentsCount = comments.filter((c) => c.isFlagged).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
        <p className="text-gray-600 mt-1">Manage stories, comments, and flagged content</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {activeTab !== 'flagged' && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {activeTab === 'stories' ? (
                <>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="SPAM">Spam</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="stories">Stories ({stories.length})</TabsTrigger>
          <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
          <TabsTrigger value="flagged">
            <Flag className="h-4 w-4 mr-2" />
            Flagged ({flaggedStoriesCount + flaggedCommentsCount})
          </TabsTrigger>
        </TabsList>

        {/* Stories Tab */}
        <TabsContent value="stories" className="mt-6">
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Charity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      No stories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStories.map((story) => (
                    <TableRow key={story.id} className={story.isFlagged ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {story.isFlagged && <Flag className="h-4 w-4 text-red-500" />}
                          <span className="max-w-xs truncate">{story.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{story.charity.name}</TableCell>
                      <TableCell>{getStatusBadge(story.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {story._count.likes}L · {story._count.reactions}R · {story._count.comments}C
                        </div>
                      </TableCell>
                      <TableCell>
                        {story.publishedAt
                          ? new Date(story.publishedAt).toLocaleDateString('en-GB')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(story);
                              setActionDialog('view');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {story.isFlagged ? (
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedItem(story);
                                setActionDialog('unflag');
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(story);
                                setActionDialog('flag');
                              }}
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedItem(story);
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

        {/* Comments Tab */}
        <TabsContent value="comments" className="mt-6">
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Story</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      No comments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComments.map((comment) => (
                    <TableRow key={comment.id} className={comment.isFlagged ? 'bg-red-50' : ''}>
                      <TableCell className="max-w-md">
                        <div className="flex items-start gap-2">
                          {comment.isFlagged && <Flag className="h-4 w-4 text-red-500 mt-1" />}
                          <span className="line-clamp-2">{comment.content}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{comment.userName}</div>
                          {comment.userEmail && (
                            <div className="text-xs text-gray-500">{comment.userEmail}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{comment.story.title}</TableCell>
                      <TableCell>{getStatusBadge(comment.status)}</TableCell>
                      <TableCell>
                        {new Date(comment.createdAt).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {comment.isFlagged ? (
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedItem(comment);
                                setActionDialog('unflag');
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(comment);
                                setActionDialog('flag');
                              }}
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedItem(comment);
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

        {/* Flagged Tab */}
        <TabsContent value="flagged" className="mt-6">
          <div className="space-y-6">
            {/* Flagged Stories */}
            {flaggedStoriesCount > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Flagged Stories ({flaggedStoriesCount})</h3>
                <div className="bg-white rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Charity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stories
                        .filter((s) => s.isFlagged)
                        .map((story) => (
                          <TableRow key={story.id} className="bg-red-50">
                            <TableCell className="font-medium">{story.title}</TableCell>
                            <TableCell>
                              <span className="text-sm text-red-600">
                                {story.flagReason || 'No reason provided'}
                              </span>
                            </TableCell>
                            <TableCell>{story.charity.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    setSelectedItem(story);
                                    setActionDialog('unflag');
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Unflag
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedItem(story);
                                    setActionDialog('delete');
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Flagged Comments */}
            {flaggedCommentsCount > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Flagged Comments ({flaggedCommentsCount})</h3>
                <div className="bg-white rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Content</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Story</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comments
                        .filter((c) => c.isFlagged)
                        .map((comment) => (
                          <TableRow key={comment.id} className="bg-red-50">
                            <TableCell className="max-w-md line-clamp-2">{comment.content}</TableCell>
                            <TableCell>
                              <span className="text-sm text-red-600">
                                {comment.flagReason || 'No reason provided'}
                              </span>
                            </TableCell>
                            <TableCell>{comment.story.title}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    setSelectedItem(comment);
                                    setActionDialog('unflag');
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Unflag
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedItem(comment);
                                    setActionDialog('delete');
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {flaggedStoriesCount === 0 && flaggedCommentsCount === 0 && (
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No flagged content to display</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Flag Dialog */}
      <Dialog open={actionDialog === 'flag'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Content</DialogTitle>
            <DialogDescription>
              Provide a reason for flagging this {selectedItem?.title ? 'story' : 'comment'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter flag reason..."
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedItem?.title) {
                  handleStoryAction('flag', selectedItem);
                } else {
                  handleCommentAction('flag', selectedItem);
                }
              }}
              disabled={isLoading || !flagReason}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Flag Content'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unflag Dialog */}
      <AlertDialog open={actionDialog === 'unflag'} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unflag Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the flag from this content?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedItem?.title) {
                  handleStoryAction('unflag', selectedItem);
                } else {
                  handleCommentAction('unflag', selectedItem);
                }
              }}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unflag'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={actionDialog === 'delete'} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {selectedItem?.title ? 'story' : 'comment'}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedItem?.title) {
                  handleStoryAction('delete', selectedItem);
                } else {
                  handleCommentAction('delete', selectedItem);
                }
              }}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Dialog */}
      <Dialog open={actionDialog === 'view'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Story Details</DialogTitle>
          </DialogHeader>
          {selectedItem?.title && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="mt-1">{selectedItem.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Charity</h3>
                <p className="mt-1">{selectedItem.charity.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1">{getStatusBadge(selectedItem.status)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Engagement</h3>
                  <p className="mt-1">
                    {selectedItem._count.likes} likes, {selectedItem._count.comments} comments
                  </p>
                </div>
              </div>
              {selectedItem.isFlagged && (
                <div className="bg-red-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-red-800">Flagged</h3>
                  <p className="mt-1 text-sm text-red-600">
                    {selectedItem.flagReason || 'No reason provided'}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
