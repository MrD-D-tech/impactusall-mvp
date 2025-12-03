'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Download, FileText, TrendingUp, Users, Heart, Award, Edit3 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ImpactMetric {
  [key: string]: number;
}

interface Story {
  id: string;
  title: string;
  excerpt: string;
  impactMetrics: ImpactMetric;
  donationAmount: number;
  createdAt: string;
  charity: {
    name: string;
    logoUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
    reactions: number;
  };
}

interface Donor {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
}

interface ReportData {
  donor: Donor;
  stories: Story[];
}

type ReportTemplate = 'executive' | 'impact' | 'strategic';

export default function ReportsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Report builder state
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>('executive');
  const [storyFilter, setStoryFilter] = useState<string>('all');
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  
  // Editable fields
  const [reportTitle, setReportTitle] = useState('Community Impact Report');
  const [reportSubtitle, setReportSubtitle] = useState('Board of Directors Review');
  const [overviewText, setOverviewText] = useState('');
  const [strategicValue, setStrategicValue] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [closingStatement, setClosingStatement] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch('/api/corporate-dashboard/report-data');
        if (response.ok) {
          const data = await response.json();
          setReportData(data);
          
          // Initialize with all stories selected
          setSelectedStories(data.stories.map((s: Story) => s.id));
          
          // Set default text content
          setOverviewText(
            `${data.donor.name}'s community investment programme demonstrates our ongoing commitment to making a tangible difference across Greater Manchester. Through strategic partnerships with local charities, we have funded impactful initiatives, reaching families and individuals in need.`
          );
          
          setStrategicValue(
            `• Brand Enhancement: Strengthens Manchester United's reputation as a socially responsible organisation\n• Stakeholder Relations: Demonstrates tangible commitment to CSR objectives\n• Employee Engagement: Provides staff with meaningful volunteering opportunities\n• Commercial Value: Positive brand perception influences sponsorship deals and fan loyalty\n• Legacy Building: Establishes Manchester United as a catalyst for community transformation`
          );
          
          setRecommendation(
            `Based on the measurable impact achieved and positive community response, we recommend expanding the programme by 25% in the next fiscal year. This investment continues to deliver exceptional value in terms of brand equity, community goodwill, and stakeholder engagement.`
          );
          
          setClosingStatement(
            `Manchester United remains committed to being More Than a Club. Our community investment programme represents the very best of what we stand for—compassion, excellence, and lasting positive change. Together with our charity partners, we will continue to make a meaningful difference in Greater Manchester for years to come.`
          );
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchReportData();
    }
  }, [status]);

  // Filter stories based on time period
  const getFilteredStories = (): Story[] => {
    if (!reportData) return [];
    
    const now = new Date();
    const stories = reportData.stories;
    
    switch (storyFilter) {
      case 'quarter':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        return stories.filter(s => new Date(s.createdAt) >= threeMonthsAgo);
      case 'halfyear':
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        return stories.filter(s => new Date(s.createdAt) >= sixMonthsAgo);
      case 'year':
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return stories.filter(s => new Date(s.createdAt) >= oneYearAgo);
      default:
        return stories;
    }
  };

  const filteredStories = getFilteredStories();
  const selectedStoriesData = filteredStories.filter(s => selectedStories.includes(s.id));

  // Helper function to load images as base64
  const loadImageAsBase64 = async (imagePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      img.onerror = reject;
      img.src = imagePath;
    });
  };

  const generatePDF = async () => {
    if (!reportData || selectedStoriesData.length === 0) return;

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const { donor } = reportData;
      const stories = selectedStoriesData;
      
      // Calculate totals
      const totalInvestment = stories.reduce((sum, story) => sum + story.donationAmount, 0);
      const totalLikes = stories.reduce((sum, story) => sum + story._count.likes, 0);
      const totalComments = stories.reduce((sum, story) => sum + story._count.comments, 0);
      const totalReactions = stories.reduce((sum, story) => sum + story._count.reactions, 0);
      const totalEngagement = totalLikes + totalComments + totalReactions;

      // Aggregate impact metrics
      const aggregateMetrics: { [key: string]: number } = {};
      stories.forEach(story => {
        Object.entries(story.impactMetrics).forEach(([key, value]) => {
          aggregateMetrics[key] = (aggregateMetrics[key] || 0) + value;
        });
      });

      // Load Manchester United logo
      let manUtdLogoBase64 = '';
      try {
        manUtdLogoBase64 = await loadImageAsBase64('/images/man-united-logo.png');
      } catch (error) {
        console.error('Error loading Man Utd logo:', error);
      }

      // ========== PAGE 1: COVER PAGE ==========
      
      // Compact header with logo
      doc.setFillColor(218, 41, 28);
      doc.rect(0, 0, 210, 60, 'F');
      
      if (manUtdLogoBase64) {
        doc.addImage(manUtdLogoBase64, 'PNG', 20, 10, 35, 35);
      }
      
      // Report title - closer to logo
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text(reportTitle, 105, 80, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(reportSubtitle, 105, 92, { align: 'center' });
      
      // Date
      doc.setFontSize(11);
      const reportDate = new Date().toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      doc.text(reportDate, 105, 105, { align: 'center' });
      
      // Investment highlight - more compact
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(45, 120, 120, 35, 5, 5, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Total Community Investment', 105, 133, { align: 'center' });
      
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(218, 41, 28);
      doc.text(`£${totalInvestment.toLocaleString()}`, 105, 147, { align: 'center' });
      
      // Template indicator
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const templateNames = {
        executive: 'Executive Summary Template',
        impact: 'Impact Showcase Template',
        strategic: 'Strategic Review Template'
      };
      doc.text(templateNames[selectedTemplate], 105, 170, { align: 'center' });
      
      // Footer
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Confidential - For Board Review Only', 105, 280, { align: 'center' });
      
      // ========== PAGE 2: EXECUTIVE SUMMARY ==========
      doc.addPage();
      
      // Header
      doc.setFillColor(218, 41, 28);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 15, 13);
      
      let yPos = 35;
      
      // Programme Overview
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Programme Overview', 15, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitOverview = doc.splitTextToSize(overviewText, 180);
      doc.text(splitOverview, 15, yPos);
      yPos += splitOverview.length * 5 + 8;
      
      // Key Highlights
      const highlightBoxWidth = 58;
      const highlightBoxHeight = 28;
      const boxSpacing = 5;
      const startX = 15;
      
      const familiesHelped = aggregateMetrics.families_helped || 0;
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(startX, yPos, highlightBoxWidth, highlightBoxHeight, 3, 3, 'F');
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(218, 41, 28);
      doc.text(familiesHelped.toString(), startX + highlightBoxWidth / 2, yPos + 13, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Families Supported', startX + highlightBoxWidth / 2, yPos + 21, { align: 'center' });
      
      const supportHours = (aggregateMetrics.hours_of_care || 0) + (aggregateMetrics.counselling_hours || 0);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(startX + highlightBoxWidth + boxSpacing, yPos, highlightBoxWidth, highlightBoxHeight, 3, 3, 'F');
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(218, 41, 28);
      doc.text(supportHours.toString(), startX + highlightBoxWidth + boxSpacing + highlightBoxWidth / 2, yPos + 13, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Support Hours', startX + highlightBoxWidth + boxSpacing + highlightBoxWidth / 2, yPos + 21, { align: 'center' });
      
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(startX + (highlightBoxWidth + boxSpacing) * 2, yPos, highlightBoxWidth, highlightBoxHeight, 3, 3, 'F');
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(218, 41, 28);
      doc.text(stories.length.toString(), startX + (highlightBoxWidth + boxSpacing) * 2 + highlightBoxWidth / 2, yPos + 13, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Stories Published', startX + (highlightBoxWidth + boxSpacing) * 2 + highlightBoxWidth / 2, yPos + 21, { align: 'center' });
      
      yPos += highlightBoxHeight + 12;
      
      // Strategic Value
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(218, 41, 28);
      doc.text('Strategic Value for Manchester United', 15, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const strategicLines = strategicValue.split('\n').filter(line => line.trim());
      strategicLines.forEach((line) => {
        const splitLine = doc.splitTextToSize(line, 180);
        doc.text(splitLine, 15, yPos);
        yPos += splitLine.length * 5 + 2;
      });
      
      yPos += 8;
      
      // Digital Engagement
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Digital Engagement Metrics', 15, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Engagement: ${totalEngagement.toLocaleString()} interactions`, 15, yPos);
      yPos += 5;
      doc.text(`Likes: ${totalLikes.toLocaleString()} | Comments: ${totalComments.toLocaleString()} | Reactions: ${totalReactions.toLocaleString()}`, 15, yPos);
      yPos += 5;
      doc.text(`Estimated Reach: ${(totalEngagement * 12).toLocaleString()} people`, 15, yPos);
      yPos += 10;
      
      // Board Recommendation
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(218, 41, 28);
      doc.text('Board Recommendation', 15, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const splitRecommendation = doc.splitTextToSize(recommendation, 180);
      doc.text(splitRecommendation, 15, yPos);
      
      // ========== PAGE 3: IMPACT STORIES ==========
      doc.addPage();
      
      doc.setFillColor(218, 41, 28);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Impact Stories', 15, 13);
      
      yPos = 35;
      
      const displayStories = stories.slice(0, 3);
      
      for (let i = 0; i < displayStories.length; i++) {
        const story = displayStories[i];
        
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(15, yPos, 180, 65);
        
        let contentX = 20;
        
        // Charity logo - smaller and positioned carefully
        if (story.charity.logoUrl) {
          try {
            const logoBase64 = await loadImageAsBase64(story.charity.logoUrl);
            doc.addImage(logoBase64, 'PNG', contentX, yPos + 5, 18, 18);
            contentX += 23;
          } catch (error) {
            console.error(`Error loading charity logo:`, error);
            contentX += 23;
          }
        } else {
          contentX += 23;
        }
        
        // Story title
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const titleLines = doc.splitTextToSize(story.title, 150);
        doc.text(titleLines, contentX, yPos + 10);
        
        // Charity name
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(story.charity.name, contentX, yPos + 18);
        
        // Excerpt
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const excerptLines = doc.splitTextToSize(story.excerpt, 170);
        doc.text(excerptLines.slice(0, 3), 20, yPos + 27);
        
        // Impact metrics
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(218, 41, 28);
        const metricsText = Object.entries(story.impactMetrics)
          .slice(0, 3)
          .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
          .join(' | ');
        doc.text(metricsText, 20, yPos + 50);
        
        // Engagement stats
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const engagementText = `Engagement: ${story._count.likes} likes, ${story._count.comments} comments, ${story._count.reactions} reactions`;
        doc.text(engagementText, 20, yPos + 57);
        
        yPos += 72;
        
        if (i < displayStories.length - 1 && yPos > 200) {
          doc.addPage();
          yPos = 30;
        }
      }
      
      // ========== CLOSING STATEMENT ==========
      if (yPos > 220) {
        doc.addPage();
        yPos = 35;
      } else {
        yPos += 15;
      }
      
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(218, 41, 28);
      doc.text('Closing Statement', 15, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const splitClosing = doc.splitTextToSize(closingStatement, 180);
      doc.text(splitClosing, 15, yPos);
      
      // Save PDF
      doc.save(`${donor.name}_Impact_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Impact Report Builder</h1>
        <p className="text-muted-foreground">
          Customize and generate professional board reports
        </p>
      </div>

      <div className="grid gap-6">
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>1. Select Report Template</CardTitle>
            <CardDescription>Choose the report format that best suits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setSelectedTemplate('executive')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedTemplate === 'executive' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <h3 className="font-semibold mb-2">Executive Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Concise overview with key metrics and strategic value
                </p>
              </button>
              
              <button
                onClick={() => setSelectedTemplate('impact')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedTemplate === 'impact' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <h3 className="font-semibold mb-2">Impact Showcase</h3>
                <p className="text-sm text-muted-foreground">
                  Story-focused report highlighting beneficiary experiences
                </p>
              </button>
              
              <button
                onClick={() => setSelectedTemplate('strategic')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedTemplate === 'strategic' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <h3 className="font-semibold mb-2">Strategic Review</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed analysis with ROI and engagement metrics
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Story Selection */}
        <Card>
          <CardHeader>
            <CardTitle>2. Select Stories to Include</CardTitle>
            <CardDescription>Filter by time period and choose specific stories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="story-filter">Time Period</Label>
              <Select value={storyFilter} onValueChange={setStoryFilter}>
                <SelectTrigger id="story-filter">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stories</SelectItem>
                  <SelectItem value="quarter">Last Quarter (3 months)</SelectItem>
                  <SelectItem value="halfyear">Last 6 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Stories ({filteredStories.length} available)</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedStories(filteredStories.map(s => s.id))}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedStories([])}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto border rounded-lg p-4">
                {filteredStories.map((story) => (
                  <div key={story.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={story.id}
                      checked={selectedStories.includes(story.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStories([...selectedStories, story.id]);
                        } else {
                          setSelectedStories(selectedStories.filter(id => id !== story.id));
                        }
                      }}
                    />
                    <Label htmlFor={story.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{story.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {story.charity.name} • £{story.donationAmount.toLocaleString()}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editable Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              3. Edit Report Content
            </CardTitle>
            <CardDescription>Customize the text content for your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-title">Report Title</Label>
                <Input
                  id="report-title"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Community Impact Report"
                />
              </div>
              <div>
                <Label htmlFor="report-subtitle">Report Subtitle</Label>
                <Input
                  id="report-subtitle"
                  value={reportSubtitle}
                  onChange={(e) => setReportSubtitle(e.target.value)}
                  placeholder="Board of Directors Review"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="overview-text">Programme Overview</Label>
              <Textarea
                id="overview-text"
                value={overviewText}
                onChange={(e) => setOverviewText(e.target.value)}
                rows={4}
                placeholder="Describe your community investment programme..."
              />
            </div>

            <div>
              <Label htmlFor="strategic-value">Strategic Value Points</Label>
              <Textarea
                id="strategic-value"
                value={strategicValue}
                onChange={(e) => setStrategicValue(e.target.value)}
                rows={6}
                placeholder="Enter strategic value points (one per line)..."
              />
            </div>

            <div>
              <Label htmlFor="recommendation">Board Recommendation</Label>
              <Textarea
                id="recommendation"
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                rows={4}
                placeholder="Enter your recommendation..."
              />
            </div>

            <div>
              <Label htmlFor="closing-statement">Closing Statement</Label>
              <Textarea
                id="closing-statement"
                value={closingStatement}
                onChange={(e) => setClosingStatement(e.target.value)}
                rows={4}
                placeholder="Enter a closing statement for the report..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary and Generate */}
        <Card>
          <CardHeader>
            <CardTitle>4. Generate Report</CardTitle>
            <CardDescription>Review your selections and generate the PDF</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Stories</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedStoriesData.length}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Investment</span>
                  </div>
                  <p className="text-2xl font-bold">
                    £{selectedStoriesData.reduce((sum, s) => sum + s.donationAmount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Charities</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {new Set(selectedStoriesData.map(s => s.charity.name)).size}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Engagement</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {selectedStoriesData.reduce(
                      (sum, s) => sum + s._count.likes + s._count.comments + s._count.reactions,
                      0
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <strong>Template:</strong> {selectedTemplate === 'executive' ? 'Executive Summary' : selectedTemplate === 'impact' ? 'Impact Showcase' : 'Strategic Review'}
                  <br />
                  Report includes cover page, executive summary, impact stories, and closing statement
                </div>
                <Button
                  onClick={generatePDF}
                  disabled={isGenerating || selectedStoriesData.length === 0}
                  className="gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Generate PDF Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
