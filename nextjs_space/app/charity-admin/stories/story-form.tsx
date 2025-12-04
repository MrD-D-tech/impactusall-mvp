'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Donor {
  id: string;
  name: string;
  slug: string;
}

interface StoryFormProps {
  charityId: string;
  charityName: string;
  donors: Donor[];
  userId: string;
  initialData?: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    featuredImageUrl: string | null;
    donorId: string | null;
    status: string;
    impactMetrics: any;
  };
}

export default function StoryForm({
  charityId,
  charityName,
  donors,
  userId,
  initialData,
}: StoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.featuredImageUrl || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    donorId: initialData?.donorId || '',
    status: initialData?.status || 'DRAFT',
    impactMetricValue: initialData?.impactMetrics?.value || '',
    impactMetricLabel: initialData?.impactMetrics?.label || '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be smaller than 10MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }

      // Validate file size (max 200MB for ~10 minute video)
      if (file.size > 200 * 1024 * 1024) {
        toast.error('Video must be smaller than 200MB (~10 minutes)');
        return;
      }

      setVideoFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      
      toast.success(`Video selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a story title');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Please enter story content');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('content', formData.content);
      submitData.append('donorId', formData.donorId);
      submitData.append('status', asDraft ? 'DRAFT' : formData.status);
      submitData.append('charityId', charityId);
      submitData.append('userId', userId);
      
      // Add impact metrics if provided
      if (formData.impactMetricValue && formData.impactMetricLabel) {
        submitData.append('impactMetrics', JSON.stringify({
          value: formData.impactMetricValue,
          label: formData.impactMetricLabel,
        }));
      }

      // Add image if new one is selected
      if (imageFile) {
        submitData.append('featuredImage', imageFile);
      } else if (initialData?.featuredImageUrl) {
        submitData.append('existingImageUrl', initialData.featuredImageUrl);
      }

      // Add video if selected
      if (videoFile) {
        submitData.append('video', videoFile);
        toast.info('Uploading video... This may take a moment');
      }

      // Determine endpoint based on create or edit
      const url = initialData
        ? `/api/charity-admin/stories/${initialData.id}`
        : '/api/charity-admin/stories';
      
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: submitData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save story');
      }

      const result = await response.json();
      
      toast.success(
        initialData
          ? 'Story updated successfully!'
          : 'Story created successfully!'
      );
      
      router.push('/charity-admin/stories');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving story:', error);
      toast.error(error.message || 'Failed to save story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Story Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Emma's Journey to Recovery"
              required
              className="mt-1"
            />
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="A brief summary of the story (2-3 sentences)"
              rows={3}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              This appears on story cards and previews
            </p>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Story Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Tell the full impact story... Share the journey, the challenges, and the transformation."
              rows={12}
              required
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Write the full story with all the emotional details and impact.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Featured Image */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Image</CardTitle>
        </CardHeader>
        <CardContent>
          {imagePreview ? (
            <div className="relative">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={imagePreview}
                  alt="Featured image preview"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeImage}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="image" className="cursor-pointer">
                  <span className="text-[#ea580c] hover:text-[#c2410c] font-medium">
                    Upload an image
                  </span>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </Label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, WebP up to 5MB</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Impact Video (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          {videoPreview ? (
            <div className="relative">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeVideo}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
              {videoFile && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>File:</strong> {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="video" className="cursor-pointer">
                  <span className="text-[#ea580c] hover:text-[#c2410c] font-medium">
                    Upload a video
                  </span>
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </Label>
                <p className="text-sm text-gray-500 mt-2">
                  MP4, MOV, WebM up to 200MB (~10 minutes)
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Video uploads may take a few moments depending on file size
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Donor & Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Story Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Charity (read-only) */}
          <div>
            <Label>Charity</Label>
            <Input value={charityName} disabled className="mt-1 bg-gray-50" />
          </div>

          {/* Donor Selection */}
          <div>
            <Label htmlFor="donor">Tag a Donor (Optional)</Label>
            <Select
              value={formData.donorId}
              onValueChange={(value) => setFormData({ ...formData, donorId: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a donor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No donor</SelectItem>
                {donors.map((donor) => (
                  <SelectItem key={donor.id} value={donor.id}>
                    {donor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Tag the corporate donor who funded this story
            </p>
          </div>

          {/* Impact Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="impactValue">Impact Metric Value</Label>
              <Input
                id="impactValue"
                value={formData.impactMetricValue}
                onChange={(e) =>
                  setFormData({ ...formData, impactMetricValue: e.target.value })
                }
                placeholder="e.g., 150"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="impactLabel">Impact Metric Label</Label>
              <Input
                id="impactLabel"
                value={formData.impactMetricLabel}
                onChange={(e) =>
                  setFormData({ ...formData, impactMetricLabel: e.target.value })
                }
                placeholder="e.g., Hours of Care"
                className="mt-1"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/charity-admin/stories">
          <Button type="button" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </Link>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            className="gradient-primary"
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting
              ? 'Saving...'
              : initialData
              ? 'Update Story'
              : 'Publish Story'}
          </Button>
        </div>
      </div>
    </form>
  );
}
