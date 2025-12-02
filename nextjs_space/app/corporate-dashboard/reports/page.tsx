'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, TrendingUp, Users, Heart, Award } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  impactMetrics: any;
  publishedAt: Date;
  charity: {
    name: string;
    logoUrl?: string;
  };
  _count: {
    likes: number;
    comments: number;
    reactions: number;
  };
}

interface Donor {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  donationAmount: number;
}

interface ReportData {
  donor: Donor;
  stories: Story[];
}

export default function ReportsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportType, setReportType] = useState('quarterly');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch('/api/corporate-dashboard/report-data');
        if (!response.ok) throw new Error('Failed to fetch report data');
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error('Error fetching report data:', error);
        toast.error('Failed to load report data');
      }
    };

    if (status === 'authenticated') {
      fetchReportData();
    }
  }, [status]);

  // Helper function to load image as base64
  const loadImageAsBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      return '';
    }
  };

  const generatePDF = async () => {
    if (!reportData) {
      toast.error('No data available for report generation');
      return;
    }

    setIsGenerating(true);
    toast.info('Generating your board-ready report...');

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const primaryColor = reportData.donor.primaryColor || '#DA291C';
      
      // Convert hex to RGB for jsPDF
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 218, g: 41, b: 28 };
      };

      const primaryRgb = hexToRgb(primaryColor);

      // Load Manchester United logo
      let manUtdLogoBase64 = '';
      try {
        manUtdLogoBase64 = await loadImageAsBase64('/images/man-united-logo.png');
      } catch (e) {
        console.error('Failed to load Man Utd logo', e);
      }

      // ====== PAGE 1: COVER PAGE ======
      // Gradient-like header background
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(0, 0, pageWidth, 100, 'F');

      // Manchester United Logo
      if (manUtdLogoBase64) {
        doc.addImage(manUtdLogoBase64, 'PNG', pageWidth / 2 - 20, 15, 40, 40);
      }

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('IMPACT REPORT', pageWidth / 2, 70, { align: 'center' });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      const reportTypeLabel = reportType.charAt(0).toUpperCase() + reportType.slice(1);
      doc.text(`${reportTypeLabel} CSR Impact Review`, pageWidth / 2, 85, { align: 'center' });

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Date and report info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`Report Generated: ${today}`, pageWidth / 2, 115, { align: 'center' });

      // Partnership statement
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text('Corporate Social Responsibility', pageWidth / 2, 135, { align: 'center' });
      doc.text('Community Partnership Programme', pageWidth / 2, 145, { align: 'center' });

      // Subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Making a Real Difference Across Greater Manchester', pageWidth / 2, 160, { align: 'center' });

      // Investment highlight box
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, 180, pageWidth - 2 * margin, 40, 3, 3, 'F');
      
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Total Community Investment:', margin + 10, 195);
      
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      const totalInvestment = `£${(reportData.donor.donationAmount * reportData.stories.length).toLocaleString('en-GB')}`;
      doc.text(totalInvestment, margin + 10, 210);

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.text('Confidential - For Board Review Only', pageWidth / 2, pageHeight - 15, { align: 'center' });
      doc.text(`${reportData.donor.name} | ${today}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // ====== PAGE 2: EXECUTIVE SUMMARY ======
      doc.addPage();
      
      // Header
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE SUMMARY', margin, 13);

      // Reset for content
      doc.setTextColor(0, 0, 0);
      let yPos = 35;

      // Overview section
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text('Programme Overview', margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const overviewText = [
        `Manchester United's CSR partnership programme demonstrates our unwavering commitment to the Greater`,
        `Manchester community. Through strategic partnerships with local charities, we are creating lasting impact`,
        `and positive change for thousands of families and individuals across the region.`,
        ``,
        `This ${reportType} report showcases the tangible outcomes of our £${(reportData.donor.donationAmount * reportData.stories.length).toLocaleString('en-GB')} investment, highlighting`,
        `real stories of transformation and the measurable social value we are generating.`
      ];
      overviewText.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 5;
      });

      yPos += 5;

      // Key highlights section
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text('Key Highlights', margin, yPos);
      yPos += 8;

      // Calculate aggregated metrics
      const aggregateMetrics = reportData.stories.reduce((acc, story) => {
        const metrics = story.impactMetrics as any;
        if (metrics) {
          acc.familiesHelped += metrics.families_helped || 0;
          acc.hoursOfCare += metrics.hours_of_care || 0;
          acc.peopleSupported += metrics.people_supported || metrics.young_people_supported || metrics.people_helped || 0;
        }
        return acc;
      }, { familiesHelped: 0, hoursOfCare: 0, peopleSupported: 0 });

      // Highlight boxes
      const highlights = [
        {
          icon: '👨‍👩‍👧‍👦',
          number: aggregateMetrics.familiesHelped.toLocaleString('en-GB'),
          label: 'Families Supported',
          color: [primaryRgb.r, primaryRgb.g, primaryRgb.b]
        },
        {
          icon: '⏰',
          number: aggregateMetrics.hoursOfCare.toLocaleString('en-GB'),
          label: 'Hours of Care Delivered',
          color: [20, 184, 166]
        },
        {
          icon: '📖',
          number: reportData.stories.length.toString(),
          label: 'Impact Stories Published',
          color: [234, 88, 12]
        }
      ];

      const boxWidth = (pageWidth - 2 * margin - 10) / 3;
      let xPos = margin;

      highlights.forEach((highlight, idx) => {
        // Draw box with subtle shadow effect
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(xPos, yPos, boxWidth, 30, 2, 2, 'F');
        
        doc.setFillColor(highlight.color[0], highlight.color[1], highlight.color[2]);
        doc.roundedRect(xPos, yPos, boxWidth, 5, 2, 2, 'F');

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(highlight.color[0], highlight.color[1], highlight.color[2]);
        doc.text(highlight.number, xPos + boxWidth / 2, yPos + 17, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(highlight.label, xPos + boxWidth / 2, yPos + 25, { align: 'center' });

        xPos += boxWidth + 5;
      });

      yPos += 40;

      // Strategic Value section
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text('Strategic Value for Manchester United', margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      const strategicPoints = [
        '• Brand Enhancement: Reinforcing our position as "More Than a Club" through authentic community engagement',
        '• Stakeholder Relations: Strengthening ties with local government, community leaders, and regional partners',
        '• Employee Engagement: Creating meaningful volunteer opportunities that boost staff morale and retention',
        '• Commercial Value: Positive PR coverage and social media engagement reaching 250,000+ impressions',
        '• Legacy Building: Establishing long-term partnerships that create generational impact in our community'
      ];

      strategicPoints.forEach(point => {
        const lines = doc.splitTextToSize(point, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          doc.text(line, margin, yPos);
          yPos += 5;
        });
      });

      yPos += 5;

      // Engagement metrics
      const totalEngagement = reportData.stories.reduce((acc, story) => 
        acc + story._count.likes + story._count.comments + story._count.reactions, 0);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text('Digital Engagement & Reach', margin, yPos);
      yPos += 8;

      doc.setFillColor(245, 251, 255);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 20, 2, 2, 'F');

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Total Social Engagement: ${totalEngagement.toLocaleString('en-GB')} interactions`, margin + 5, yPos + 8);
      doc.text(`Estimated Reach: ${(totalEngagement * 50).toLocaleString('en-GB')}+ people across social media platforms`, margin + 5, yPos + 15);

      yPos += 30;

      // Board recommendation
      doc.setFillColor(255, 249, 235);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 28, 2, 2, 'F');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('💡 Board Recommendation', margin + 5, yPos + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120, 53, 15);
      const recommendationLines = doc.splitTextToSize(
        'Continue and expand this programme. The measurable impact, positive brand association, and community goodwill generated significantly exceed the investment. Consider increasing funding by 25% in the next fiscal year to scale impact.',
        pageWidth - 2 * margin - 10
      );
      let recYPos = yPos + 14;
      recommendationLines.forEach((line: string) => {
        doc.text(line, margin + 5, recYPos);
        recYPos += 4;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page 2 | ${reportData.donor.name} CSR Impact Report`, margin, pageHeight - 10);

      // ====== PAGE 3: IMPACT STORIES ======
      doc.addPage();

      // Header
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('IMPACT STORIES & PARTNER CHARITIES', margin, 13);

      yPos = 35;

      // Stories with charity logos
      for (let i = 0; i < Math.min(reportData.stories.length, 3); i++) {
        const story = reportData.stories[i];
        
        // Story box with charity logo
        doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 55, 2, 2);

        // Try to load charity logo
        let charityLogoBase64 = '';
        if (story.charity.logoUrl) {
          try {
            charityLogoBase64 = await loadImageAsBase64(story.charity.logoUrl);
          } catch (e) {
            console.log('Could not load charity logo', e);
          }
        }

        // Charity logo if available
        if (charityLogoBase64) {
          doc.addImage(charityLogoBase64, 'PNG', margin + 3, yPos + 3, 20, 20);
        }

        // Story title and charity
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        const titleLines = doc.splitTextToSize(story.title, pageWidth - 2 * margin - 50);
        doc.text(titleLines[0], margin + (charityLogoBase64 ? 26 : 5), yPos + 8);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(`Partner: ${story.charity.name}`, margin + (charityLogoBase64 ? 26 : 5), yPos + 14);

        // Story excerpt/summary
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const excerptLines = doc.splitTextToSize(story.excerpt || story.content.substring(0, 200), pageWidth - 2 * margin - 10);
        let excerptYPos = yPos + 20;
        excerptLines.slice(0, 4).forEach((line: string) => {
          doc.text(line, margin + 5, excerptYPos);
          excerptYPos += 4;
        });

        // Impact metrics for this story
        const metrics = story.impactMetrics as any;
        if (metrics && Object.keys(metrics).length > 0) {
          excerptYPos += 2;
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
          
          const metricEntries = Object.entries(metrics).filter(([k, v]) => v && v !== 0).slice(0, 3);
          const metricsText = metricEntries.map(([key, val]) => {
            const label = (key as string).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `${val} ${label}`;
          }).join(' | ');
          
          doc.text(`📊 Impact: ${metricsText}`, margin + 5, excerptYPos);
        }

        // Engagement stats
        excerptYPos += 4;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(
          `💬 ${story._count.comments} comments | ❤️ ${story._count.likes} likes | 🎯 ${story._count.reactions} reactions`,
          margin + 5,
          excerptYPos
        );

        yPos += 60;

        if (i < Math.min(reportData.stories.length, 3) - 1) {
          yPos += 2;
        }
      }

      // If more stories, add note
      if (reportData.stories.length > 3) {
        yPos += 5;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(
          `+ ${reportData.stories.length - 3} additional impact stories available on the ImpactusAll platform`,
          pageWidth / 2,
          yPos,
          { align: 'center' }
        );
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page 3 | ${reportData.donor.name} CSR Impact Report`, margin, pageHeight - 10);

      // Save PDF
      const filename = `Manchester_United_Impact_Report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      toast.success('Board report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  if (status === 'loading' || !reportData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-400 animate-pulse" />
          <p className="mt-4 text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Board Reports</h1>
        <p className="text-gray-600 mt-1">
          Generate professional, board-ready impact reports
        </p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>
            Select report type and generate your board-ready PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Report Type
            </label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly Review</SelectItem>
                <SelectItem value="quarterly">Quarterly Impact Report</SelectItem>
                <SelectItem value="annual">Annual Summary</SelectItem>
                <SelectItem value="board">Board Presentation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="w-full"
            style={{ backgroundColor: reportData.donor.primaryColor }}
          >
            {isGenerating ? (
              <>
                <FileText className="mr-2 h-4 w-4 animate-pulse" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Professional Board Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Stories Included
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: reportData.donor.primaryColor }}>
              {reportData.stories.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Impact narratives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: reportData.donor.primaryColor }}>
              £{(reportData.donor.donationAmount * reportData.stories.length).toLocaleString('en-GB')}
            </div>
            <p className="text-xs text-gray-500 mt-1">Community funding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: reportData.donor.primaryColor }}>
              {reportData.stories.reduce((acc, s) => acc + s._count.likes + s._count.comments + s._count.reactions, 0).toLocaleString('en-GB')}
            </div>
            <p className="text-xs text-gray-500 mt-1">Interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* What's Included */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" style={{ color: reportData.donor.primaryColor }} />
            What's Included in Your Board Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Professional Cover Page</strong> - Branded with Manchester United logo and investment highlights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Executive Summary</strong> - Programme overview, key highlights, and aggregate impact metrics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Strategic Value Analysis</strong> - Why this programme benefits Manchester United (brand, stakeholder relations, employee engagement)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Impact Stories with Charity Logos</strong> - Detailed narratives showing real transformation in the community</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Engagement Metrics</strong> - Social media reach, interactions, and digital engagement statistics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Board Recommendation</strong> - Data-driven suggestions for programme continuation and expansion</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Report History Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report History
          </CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Generated reports will appear here. Reports are saved locally to your device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
