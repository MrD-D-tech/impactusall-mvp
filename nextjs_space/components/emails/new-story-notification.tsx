import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface NewStoryNotificationEmailProps {
  storyTitle: string;
  storyExcerpt: string;
  charityName: string;
  charityLogo?: string;
  donorName: string;
  impactMetrics?: {
    label: string;
    value: string | number;
  }[];
  storyUrl: string;
  featuredImageUrl?: string;
}

export const NewStoryNotificationEmail = ({
  storyTitle = 'Emma\'s Journey to Recovery',
  storyExcerpt = 'A heartwarming story of resilience and hope...',
  charityName = 'Northern Hospice',
  charityLogo,
  donorName = 'Manchester United',
  impactMetrics = [
    { label: 'Families Helped', value: 25 },
    { label: 'Hours of Care', value: 150 },
  ],
  storyUrl = 'https://impactusall.abacusai.app/manchester-united/emmas-story',
  featuredImageUrl,
}: NewStoryNotificationEmailProps) => {
  const previewText = `${donorName}: New impact story from ${charityName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Minimal Header */}
          <Section style={header}>
            <Text style={headerBrand}>IMPACTUS<span style={headerBrandAccent}>ALL</span></Text>
          </Section>

          {/* Featured Image - Full Width at Top (Apple style) */}
          {featuredImageUrl && (
            <Img
              src={featuredImageUrl}
              alt={storyTitle}
              style={heroImage}
              width="600"
            />
          )}

          {/* Story Content */}
          <Section style={contentSection}>
            {/* New Story Badge */}
            <Text style={newStoryLabel}>NEW IMPACT STORY</Text>
            
            {/* Title */}
            <Heading style={heroTitle}>{storyTitle}</Heading>
            
            {/* Attribution - Clean, No Box */}
            <Text style={attribution}>
              by <span style={charityNameStyle}>{charityName}</span>
            </Text>
            <Text style={fundedBy}>Funded by {donorName}</Text>
            
            {/* Excerpt */}
            <Text style={excerptText}>{storyExcerpt}</Text>
          </Section>

          {/* Impact Metrics - Beautiful Cards */}
          {impactMetrics && impactMetrics.length > 0 && (
            <Section style={metricsSection}>
              <Text style={metricsHeading}>YOUR IMPACT</Text>
              <table style={metricsTable} cellPadding="0" cellSpacing="0">
                <tbody>
                  <tr>
                    {impactMetrics.slice(0, 2).map((metric, index) => (
                      <td key={index} style={metricCell}>
                        <div style={metricCard}>
                          <Text style={metricNumber}>{metric.value}</Text>
                          <Text style={metricLabel}>{metric.label}</Text>
                        </div>
                      </td>
                    ))}
                  </tr>
                  {impactMetrics.length > 2 && (
                    <tr>
                      {impactMetrics.slice(2, 4).map((metric, index) => (
                        <td key={index} style={metricCell}>
                          <div style={metricCard}>
                            <Text style={metricNumber}>{metric.value}</Text>
                            <Text style={metricLabel}>{metric.label}</Text>
                          </div>
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>
          )}

          {/* CTA Button */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={storyUrl}>
              Read Full Story
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              You're receiving this because {donorName} supports {charityName}.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://impactusall.abacusai.app/corporate-dashboard/settings" style={footerLink}>
                Manage email preferences
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © 2025 ImpactusAll
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NewStoryNotificationEmail;

// ============================================
// PREMIUM STYLES - Apple/Airbnb Inspired
// ============================================

const main: React.CSSProperties = {
  backgroundColor: '#f5f5f7',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  padding: '40px 20px',
};

const container: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
};

const header: React.CSSProperties = {
  padding: '32px 40px 24px',
  textAlign: 'center',
};

const headerBrand: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  color: '#1d1d1f',
  margin: 0,
};

const headerBrandAccent: React.CSSProperties = {
  color: '#ff6600',
};

const heroImage: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const contentSection: React.CSSProperties = {
  padding: '40px 40px 32px',
};

const newStoryLabel: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '1px',
  color: '#ff6600',
  textTransform: 'uppercase',
  margin: '0 0 16px',
};

const heroTitle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  lineHeight: 1.25,
  color: '#1d1d1f',
  margin: '0 0 12px',
};

const attribution: React.CSSProperties = {
  fontSize: '15px',
  color: '#86868b',
  margin: '0 0 4px',
  lineHeight: 1.5,
};

const charityNameStyle: React.CSSProperties = {
  color: '#1d1d1f',
  fontWeight: 600,
};

const fundedBy: React.CSSProperties = {
  fontSize: '13px',
  color: '#86868b',
  margin: '0 0 24px',
  lineHeight: 1.5,
};

const excerptText: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: 1.7,
  color: '#424245',
  margin: 0,
};

const metricsSection: React.CSSProperties = {
  padding: '0 40px 32px',
};

const metricsHeading: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '1px',
  color: '#86868b',
  textTransform: 'uppercase',
  margin: '0 0 16px',
};

const metricsTable: React.CSSProperties = {
  width: '100%',
};

const metricCell: React.CSSProperties = {
  padding: '6px',
  width: '50%',
  verticalAlign: 'top',
};

const metricCard: React.CSSProperties = {
  backgroundColor: '#f5f5f7',
  borderRadius: '12px',
  padding: '20px 16px',
  textAlign: 'center',
};

const metricNumber: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 700,
  color: '#1d1d1f',
  lineHeight: 1,
  margin: '0 0 6px',
  letterSpacing: '-1px',
};

const metricLabel: React.CSSProperties = {
  fontSize: '12px',
  color: '#86868b',
  fontWeight: 500,
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const ctaSection: React.CSSProperties = {
  padding: '8px 40px 40px',
  textAlign: 'center',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#1d1d1f',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 32px',
  borderRadius: '980px',
  lineHeight: 1,
};

const footerSection: React.CSSProperties = {
  padding: '24px 40px 32px',
  backgroundColor: '#f5f5f7',
  textAlign: 'center',
};

const footerText: React.CSSProperties = {
  fontSize: '13px',
  color: '#86868b',
  lineHeight: 1.5,
  margin: '0 0 12px',
};

const footerLinks: React.CSSProperties = {
  fontSize: '13px',
  margin: '0 0 16px',
};

const footerLink: React.CSSProperties = {
  color: '#0066cc',
  textDecoration: 'none',
};

const footerCopyright: React.CSSProperties = {
  fontSize: '12px',
  color: '#aeaeb2',
  margin: 0,
};
