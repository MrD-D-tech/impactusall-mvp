'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileBarChart, Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<string>('monthly');
  const [donorData, setDonorData] = useState<any>(null);
  const [storiesData, setStoriesData] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/corporate-dashboard/report-data');
      if (response.ok) {
        const data = await response.json();
        setDonorData(data.donor);
        setStoriesData(data.stories);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  const generatePDF = async () => {
    if (!donorData || storiesData.length === 0) {
      toast.error('No data available to generate report');
      return;
    }

    setLoading(true);
    toast.info('Generating PDF report...');

    try {
      const doc = new jsPDF();
      const primaryColor = donorData.primaryColor || '#DA291C';
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Helper to convert hex to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 218, g: 41, b: 28 };
      };

      const rgb = hexToRgb(primaryColor);

      // Cover Page
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('Impact Report', pageWidth / 2, 35, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(donorData.name, pageWidth / 2, 50, { align: 'center' });
      
      doc.setFontSize(12);
      const reportDate = new Date().toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      doc.text(reportDate, pageWidth / 2, 65, { align: 'center' });

      // Executive Summary
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 20, 100);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'This report provides a comprehensive overview of the impact created through',
        20,
        115
      );
      doc.text(
        `${donorData.name}'s donation of £${Number(donorData.donationAmount).toLocaleString('en-GB')}.`,
        20,
        122
      );

      // Calculate metrics
      const totalFamilies = storiesData.reduce((acc: number, story: any) => {
        const metrics = story.impactMetrics || {};
        return acc + (metrics.families_helped || 0);
      }, 0);

      const totalHours = storiesData.reduce((acc: number, story: any) => {
        const metrics = story.impactMetrics || {};
        return acc + (metrics.hours_of_care || 0);
      }, 0);

      const totalLikes = storiesData.reduce((acc: number, story: any) => 
        acc + (story._count?.likes || 0), 0
      );

      const totalComments = storiesData.reduce((acc: number, story: any) => 
        acc + (story._count?.comments || 0), 0
      );

      // Impact Metrics Box
      doc.setFillColor(245, 245, 245);
      doc.rect(20, 135, pageWidth - 40, 45, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text('KEY IMPACT METRICS', 25, 145);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      
      const metricsY = 157;
      doc.text(totalFamilies.toString(), 25, metricsY);
      doc.text(totalHours.toLocaleString('en-GB'), 70, metricsY);
      doc.text(storiesData.length.toString(), 130, metricsY);
      doc.text(totalLikes.toLocaleString('en-GB'), 170, metricsY);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text('Families Helped', 25, 165);
      doc.text('Hours of Care', 70, 165);
      doc.text('Stories Published', 130, 165);
      doc.text('Total Likes', 170, 165);

      // Impact Stories Table
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Impact Stories', 20, 195);

      const tableData = storiesData.slice(0, 10).map((story: any) => [
        story.title.length > 40 ? story.title.substring(0, 37) + '...' : story.title,
        story.charity?.name || 'N/A',
        story.publishedAt 
          ? new Date(story.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'N/A',
        `${story._count?.likes || 0}`,
        `${story._count?.comments || 0}`,
      ]);

      autoTable(doc, {
        startY: 200,
        head: [['Story Title', 'Charity', 'Published', 'Likes', 'Comments']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [rgb.r, rgb.g, rgb.b],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 50 },
          2: { cellWidth: 30 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
        },
        margin: { left: 20, right: 20 },
      });

      // Footer
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      if (finalY < pageHeight - 40) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text(
          'This report is generated by ImpactusAll - Making Every Donation Count',
          pageWidth / 2,
          finalY,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `${donorData.slug}-impact-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generate Reports</h1>
        <p className="text-gray-600 mt-1">
          Create professional PDF reports for board meetings and stakeholder updates
        </p>
      </div>

      {/* Report Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Report Settings</CardTitle>
              <CardDescription>Customise your report parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Summary</SelectItem>
                    <SelectItem value="quarterly">Quarterly Overview</SelectItem>
                    <SelectItem value="annual">Annual Report</SelectItem>
                    <SelectItem value="board">Board Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generatePDF} 
                className="w-full" 
                disabled={loading || !donorData}
                style={{ 
                  backgroundColor: donorData?.primaryColor || '#DA291C',
                  color: 'white'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate PDF Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>Your report will include the following sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 pl-4 py-2" style={{ borderColor: donorData?.primaryColor || '#DA291C' }}>
                  <h3 className="font-semibold text-gray-900">Cover Page</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Professional cover with {donorData?.name || 'your organization'} branding and report date
                  </p>
                </div>

                <div className="border-l-4 pl-4 py-2" style={{ borderColor: donorData?.primaryColor || '#DA291C' }}>
                  <h3 className="font-semibold text-gray-900">Executive Summary</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Key impact metrics and donation overview
                  </p>
                </div>

                <div className="border-l-4 pl-4 py-2" style={{ borderColor: donorData?.primaryColor || '#DA291C' }}>
                  <h3 className="font-semibold text-gray-900">Impact Metrics</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Families helped, hours of care, stories published, and engagement statistics
                  </p>
                </div>

                <div className="border-l-4 pl-4 py-2" style={{ borderColor: donorData?.primaryColor || '#DA291C' }}>
                  <h3 className="font-semibold text-gray-900">Impact Stories Table</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Detailed list of all published impact stories with engagement data
                  </p>
                </div>
              </div>

              {storiesData.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Report will include:</strong>
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• {storiesData.length} impact stories</li>
                    <li>• Engagement metrics from all stories</li>
                    <li>• Board-ready format</li>
                    <li>• Professional design with your branding</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileBarChart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No previous reports. Generate your first report above.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
