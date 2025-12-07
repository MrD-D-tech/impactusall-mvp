'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Save, Sparkles, Plus, Trash2, Calendar, Loader2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

interface Milestone {
  id?: string;
  title: string;
  description: string;
  date: string;
  displayOrder: number;
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
    milestones?: Milestone[];
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIForm, setShowAIForm] = useState(!initialData);
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.featuredImageUrl || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // AI generation inputs
  const [aiInputs, setAiInputs] = useState({
    beneficiaryName: '',
    beneficiaryAge: '',
    situation: '',
    supportReceived: '',
    outcome: '',
    quote: '',
    donationAmount: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    donorId: initialData?.donorId || '',
    status: initialData?.status || 'DRAFT',
    impactMetrics: initialData?.impactMetrics || {},
  });

  // Milestones state
  const [milestones, setMilestones] = useState<Milestone[]>(
    initialData?.milestones || [
      { title: '', description: '', date: '', displayOrder: 1 },
      { title: '', description: '', date: '', displayOrder: 2 },
      { title: '', description: '', date: '', displayOrder: 3 },
      { title: '', description: '', date: '', displayOrder: 4 },
    ]
  );

  // Get selected donor name
  const selectedDonor = donors.find(d => d.id === formData.donorId);

  const handleAIGenerate = async () => {
    // Validation
    if (!aiInputs.beneficiaryName.trim()) {
      toast.error('Please enter the beneficiary\'s name');
      return;
    }
    if (!aiInputs.situation.trim()) {
      toast.error('Please describe their situation before help');
      return;
    }
    if (!aiInputs.supportReceived.trim()) {
      toast.error('Please describe the support received');
      return;
    }
    if (!aiInputs.outcome.trim()) {
      toast.error('Please describe the outcome/transformation');
      return;
    }
    if (!formData.donorId) {
      toast.error('Please select a donor first');
      return;
    }

    setIsGenerating(true);
    toast.info('Generating your story... This may take a moment');

    try {
      const response = await fetch('/api/charity-admin/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...aiInputs,
          donorName: selectedDonor?.name || 'Our generous donor',
          charityName: charityName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate story');
      }

      const data = await response.json();
      
      if (data.success && data.story) {
        // Populate the form with generated content
        setFormData(prev => ({
          ...prev,
          title: data.story.title || prev.title,
          excerpt: data.story.excerpt || prev.excerpt,
          content: data.story.content || prev.content,
          impactMetrics: data.story.suggestedMetrics || prev.impactMetrics,
        }));

        // Populate milestones
        if (data.story.milestones && data.story.milestones.length > 0) {
          const today = new Date();
          const generatedMilestones = data.story.milestones.map((m: any, index: number) => ({
            title: m.title,
            description: m.description,
            // Set dates spreading back from today
            date: new Date(today.getTime() - (120 - index * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            displayOrder: m.displayOrder || index + 1,
          }));
          setMilestones(generatedMilestones);
        }

        // Automatically set placeholder image for AI-generated stories
        setImagePreview('/images/story-placeholder.jpg');
        setImageFile(null);

        setShowAIForm(false);
        toast.success('Story generated! Placeholder image added. Review and publish when ready.');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate story');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be smaller than 10MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const usePlaceholderImage = () => {
    setImagePreview('/images/story-placeholder.jpg');
    setImageFile(null);
    toast.success('Placeholder image added');
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      if (file.size > 200 * 1024 * 1024) {
        toast.error('Video must be smaller than 200MB');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      toast.success(`Video selected: ${file.name}`);
    }
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    setMilestones(prev => prev.map((m, i) => 
      i === index ? { ...m, [field]: value } : m
    ));
  };

  const addMilestone = () => {
    setMilestones(prev => [
      ...prev,
      { title: '', description: '', date: '', displayOrder: prev.length + 1 }
    ]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) {
      toast.error('You need at least one milestone');
      return;
    }
    setMilestones(prev => prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, displayOrder: i + 1 })));
  };

  const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault();
    
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
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('content', formData.content);
      submitData.append('donorId', formData.donorId);
      submitData.append('status', asDraft ? 'DRAFT' : formData.status);
      submitData.append('charityId', charityId);
      submitData.append('userId', userId);
      
      // Send impact metrics as JSON
      if (Object.keys(formData.impactMetrics).length > 0) {
        submitData.append('impactMetrics', JSON.stringify(formData.impactMetrics));
      }

      // Send milestones as JSON (only those with content)
      const validMilestones = milestones.filter(m => m.title.trim() && m.description.trim());
      if (validMilestones.length > 0) {
        submitData.append('milestones', JSON.stringify(validMilestones));
      }

      if (imageFile) {
        submitData.append('featuredImage', imageFile);
      } else if (imagePreview === '/images/story-placeholder.jpg') {
        // Signal to use the placeholder image
        submitData.append('usePlaceholder', 'true');
      } else if (initialData?.featuredImageUrl) {
        submitData.append('existingImageUrl', initialData.featuredImageUrl);
      }

      if (videoFile) {
        submitData.append('video', videoFile);
        toast.info('Uploading video...');
      }

      const url = initialData
        ? `/api/charity-admin/stories/${initialData.id}`
        : '/api/charity-admin/stories';
      
      if (imageFile && imageFile.size > 1024 * 1024) {
        toast.info('Uploading image...');
      }

      const response = await fetch(url, {
        method: initialData ? 'PUT' : 'POST',
        body: submitData,
      });

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Connection error - please try again');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save story');
      }
      
      toast.success(initialData ? 'Story updated!' : 'Story created!');
      router.push('/charity-admin/stories');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving story:', error);
      toast.error(error.message || 'Failed to save story');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* AI Story Generator */}
      {showAIForm && (
        <Card className="border-2 border-dashed border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Sparkles className="h-5 w-5" />
                  AI Story Generator
                </CardTitle>
                <CardDescription className="mt-1">
                  Fill in the key details and we\'ll create a professionally written story for you to review and edit
                </CardDescription>
              </div>
              {formData.content && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIForm(false)}
                >
                  Skip to manual editing
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Donor Selection (required for AI) */}
            <div>
              <Label className="text-orange-700 font-medium">Corporate Donor *</Label>
              <Select
                value={formData.donorId}
                onValueChange={(value) => setFormData({ ...formData, donorId: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select the funding donor" />
                </SelectTrigger>
                <SelectContent>
                  {donors.map((donor) => (
                    <SelectItem key={donor.id} value={donor.id}>
                      {donor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-orange-700 font-medium">Beneficiary Name *</Label>
                <Input
                  value={aiInputs.beneficiaryName}
                  onChange={(e) => setAiInputs({ ...aiInputs, beneficiaryName: e.target.value })}
                  placeholder="e.g., Emma, James, The Wilson Family"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-orange-700 font-medium">Age (if relevant)</Label>
                <Input
                  value={aiInputs.beneficiaryAge}
                  onChange={(e) => setAiInputs({ ...aiInputs, beneficiaryAge: e.target.value })}
                  placeholder="e.g., 7 years old, 32"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-orange-700 font-medium">Situation Before Help *</Label>
              <Textarea
                value={aiInputs.situation}
                onChange={(e) => setAiInputs({ ...aiInputs, situation: e.target.value })}
                placeholder="Describe their circumstances before receiving support. What challenges were they facing? What was their life like?"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-orange-700 font-medium">Support Received *</Label>
              <Textarea
                value={aiInputs.supportReceived}
                onChange={(e) => setAiInputs({ ...aiInputs, supportReceived: e.target.value })}
                placeholder="What specific support did they receive? How did the charity help them? What programmes or services were involved?"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-orange-700 font-medium">Outcome & Transformation *</Label>
              <Textarea
                value={aiInputs.outcome}
                onChange={(e) => setAiInputs({ ...aiInputs, outcome: e.target.value })}
                placeholder="What changed for them? How is their life different now? What did they achieve?"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-orange-700 font-medium">Quote from Beneficiary (Optional)</Label>
              <Textarea
                value={aiInputs.quote}
                onChange={(e) => setAiInputs({ ...aiInputs, quote: e.target.value })}
                placeholder="A direct quote in their own words about their experience or gratitude"
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-orange-700 font-medium">Donation Amount (Optional)</Label>
              <Input
                value={aiInputs.donationAmount}
                onChange={(e) => setAiInputs({ ...aiInputs, donationAmount: e.target.value })}
                placeholder="e.g., £25,000, £10,000"
                className="mt-1"
              />
            </div>

            <Button
              type="button"
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="w-full gradient-primary text-white py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Your Story...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Story
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Show toggle to return to AI form */}
      {!showAIForm && !initialData && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAIForm(true)}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Use AI Generator
          </Button>
        </div>
      )}

      {/* Story Details */}
      <Card>
        <CardHeader>
          <CardTitle>Story Details</CardTitle>
          <CardDescription>
            {formData.content ? 'Review and edit the generated story' : 'Enter your story details manually'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div>
            <Label htmlFor="excerpt">Excerpt (appears on cards & in emails)</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="A brief summary of the story (2-3 sentences)"
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="content">Story Content *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowContentPreview(!showContentPreview)}
                className="gap-2"
              >
                {showContentPreview ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Edit HTML
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>
            </div>

            {showContentPreview ? (
              <div className="mt-1 p-6 border rounded-lg bg-white prose prose-sm max-w-none min-h-[400px]">
                <div dangerouslySetInnerHTML={{ __html: formData.content }} />
              </div>
            ) : (
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="The full impact story with HTML formatting..."
                rows={16}
                required
                className="mt-1 font-mono text-sm"
              />
            )}
            <p className="text-sm text-gray-500 mt-1">
              HTML formatting supported. Use &lt;h3&gt; for headings, &lt;p&gt; for paragraphs, and quote blocks for emotional quotes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Journey Timeline / Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Journey Timeline
          </CardTitle>
          <CardDescription>
            Add key milestones that show the beneficiary's journey (visible on the story page)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-600">Milestone {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMilestone(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={milestone.title}
                    onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                    placeholder="e.g., First Hospice Visit"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={milestone.date}
                    onChange={(e) => updateMilestone(index, 'date', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={milestone.description}
                  onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                  placeholder="What happened at this stage of the journey?"
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addMilestone}
            className="w-full border-dashed"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Milestone
          </Button>
        </CardContent>
      </Card>

      {/* Featured Image */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Image</CardTitle>
          <CardDescription>
            Upload a warm, hopeful image that represents the story (16:9 aspect ratio works best)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {imagePreview ? (
            <div className="relative">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image src={imagePreview} alt="Featured image preview" fill className="object-cover" />
              </div>
              <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="absolute top-2 right-2">
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 space-y-3">
                <Label htmlFor="image" className="cursor-pointer">
                  <span className="text-[#ea580c] hover:text-[#c2410c] font-medium">Upload an image</span>
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </Label>
                <p className="text-sm text-gray-500">PNG, JPG, WebP up to 10MB</p>
                
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={usePlaceholderImage}
                    className="gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Use Placeholder Image
                  </Button>
                </div>
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
                <video src={videoPreview} controls className="w-full h-full" preload="metadata" />
              </div>
              <Button type="button" variant="destructive" size="sm" onClick={removeVideo} className="absolute top-2 right-2">
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="video" className="cursor-pointer">
                  <span className="text-[#ea580c] hover:text-[#c2410c] font-medium">Upload a video</span>
                  <Input id="video" type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                </Label>
                <p className="text-sm text-gray-500 mt-2">MP4, MOV, WebM up to 200MB</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Story Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Charity</Label>
            <Input value={charityName} disabled className="mt-1 bg-gray-50" />
          </div>

          <div>
            <Label htmlFor="donor">Tag a Donor</Label>
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
                  <SelectItem key={donor.id} value={donor.id}>{donor.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Impact Metrics - Simplified with predefined options */}
          <div>
            <Label>Impact Metrics (Optional)</Label>
            <p className="text-sm text-gray-500 mt-1 mb-3">Select and fill in relevant metrics for this story</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-normal">People Impacted</Label>
                <Input
                  type="number"
                  value={formData.impactMetrics.people_impacted?.toString() ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    impactMetrics: { ...formData.impactMetrics, people_impacted: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-normal">Families Helped</Label>
                <Input
                  type="number"
                  value={formData.impactMetrics.families_helped?.toString() ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    impactMetrics: { ...formData.impactMetrics, families_helped: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-normal">Jobs Created/Secured</Label>
                <Input
                  type="number"
                  value={formData.impactMetrics.jobs_secured?.toString() ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    impactMetrics: { ...formData.impactMetrics, jobs_secured: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-normal">Support Hours Provided</Label>
                <Input
                  type="number"
                  value={formData.impactMetrics.support_hours?.toString() ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    impactMetrics: { ...formData.impactMetrics, support_hours: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-normal">Safe Nights Provided</Label>
                <Input
                  type="number"
                  value={formData.impactMetrics.safe_nights?.toString() ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    impactMetrics: { ...formData.impactMetrics, safe_nights: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-normal">Counselling Sessions</Label>
                <Input
                  type="number"
                  value={formData.impactMetrics.counselling_sessions?.toString() ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    impactMetrics: { ...formData.impactMetrics, counselling_sessions: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

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
            <p className="text-sm text-gray-500 mt-1">
              Publishing will notify the tagged donor via email
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/charity-admin/stories">
          <Button type="button" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
        </Link>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={(e) => handleSubmit(e, true)} disabled={isSubmitting}>
            Save as Draft
          </Button>
          <Button type="submit" className="gradient-primary" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : initialData ? 'Update Story' : 'Publish Story'}
          </Button>
        </div>
      </div>
    </form>
  );
}
