import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
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
          {/* Minimal Header with Logo */}
          <Section style={header}>
            <Text style={headerBrand}>IMPACTUS<span style={headerBrandAccent}>ALL</span></Text>
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Text style={newStoryLabel}>NEW IMPACT STORY</Text>
            <Heading style={heroTitle}>{storyTitle}</Heading>
            <Text style={heroSubtitle}>
              From <strong>{charityName}</strong> · Funded by {donorName}
            </Text>
          </Section>

          {/* Featured Image - Full Width */}
          {featuredImageUrl && (
            <Section style={imageWrapper}>
              <Img
                src={featuredImageUrl}
                alt={storyTitle}
                style={heroImage}
                width="600"
              />
            </Section>
          )}

          {/* Story Excerpt */}
          <Section style={contentSection}>
            <Text style={excerptText}>{storyExcerpt}</Text>
          </Section>

          {/* Impact Metrics - Clean Grid */}
          {impactMetrics && impactMetrics.length > 0 && (
            <Section style={metricsWrapper}>
              <Text style={metricsHeading}>IMPACT AT A GLANCE</Text>
              <table style={metricsGrid}>
                <tbody>
                  <tr>
                    {impactMetrics.slice(0, 2).map((metric, index) => (
                      <td key={index} style={metricBox}>
                        <Text style={metricNumber}>{metric.value}</Text>
                        <Text style={metricText}>{metric.label}</Text>
                      </td>
                    ))}
                  </tr>
                  {impactMetrics.length > 2 && (
                    <tr>
                      {impactMetrics.slice(2, 4).map((metric, index) => (
                        <td key={index} style={metricBox}>
                          <Text style={metricNumber}>{metric.value}</Text>
                          <Text style={metricText}>{metric.label}</Text>
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>
          )}

          {/* CTA Button - Prominent */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={storyUrl}>
              Read the Full Story →
            </Button>
          </Section>

          {/* Charity Branding */}
          {charityLogo && (
            <Section style={charityBrand}>
              <Img
                src={charityLogo}
                alt={charityName}
                style={charityLogoStyle}
                width="48"
                height="48"
              />
              <Text style={charityText}>{charityName}</Text>
            </Section>
          )}

          {/* Minimal Footer */}
          <Section style={footerSection}>
            <Hr style={divider} />
            <Text style={footerSmall}>
              You're receiving this because your organization supports {charityName}.{' '}
              <Link href="https://impactusall.abacusai.app/corporate-dashboard/settings" style={footerLink}>
                Manage preferences
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} ImpactusAll · Making Impact Visible
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NewStoryNotificationEmail;

// Premium Styles - Inspired by Apple, Airbnb, Stripe
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  WebkitFontSmoothing: 'antialiased' as const,
  MozOsxFontSmoothing: 'grayscale' as const,
};

const container = {
  margin: '0 auto',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
};

const header = {
  padding: '48px 40px 32px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #f0f0f0',
};

const headerBrand = {
  fontSize: '20px',
  fontWeight: '700',
  letterSpacing: '-0.5px',
  color: '#000000',
  margin: '0',
};

const headerBrandAccent = {
  color: '#ff7a00',
};

const heroSection = {
  padding: '48px 40px 32px',
  textAlign: 'center' as const,
};

const newStoryLabel = {
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '1.5px',
  color: '#ff7a00',
  textTransform: 'uppercase' as const,
  margin: '0 0 16px',
};

const heroTitle = {
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '-1px',
  lineHeight: '1.2',
  color: '#000000',
  margin: '0 0 16px',
};

const heroSubtitle = {
  fontSize: '15px',
  color: '#666666',
  lineHeight: '1.5',
  margin: '0',
};

const imageWrapper = {
  padding: '0',
  margin: '0',
};

const heroImage = {
  width: '100%',
  height: 'auto',
  display: 'block',
  margin: '0',
  padding: '0',
};

const contentSection = {
  padding: '40px 40px 32px',
};

const excerptText = {
  fontSize: '17px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '0',
};

const metricsWrapper = {
  padding: '32px 40px',
  backgroundColor: '#fafafa',
};

const metricsHeading = {
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '1.5px',
  color: '#999999',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const metricsGrid = {
  width: '100%',
  borderCollapse: 'separate' as const,
  borderSpacing: '12px',
};

const metricBox = {
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  padding: '24px 16px',
  textAlign: 'center' as const,
  width: '50%',
};

const metricNumber = {
  fontSize: '36px',
  fontWeight: '700',
  color: '#000000',
  lineHeight: '1',
  margin: '0 0 8px',
  letterSpacing: '-1px',
};

const metricText = {
  fontSize: '13px',
  color: '#666666',
  fontWeight: '500',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const ctaSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const ctaButton = {
  backgroundColor: '#000000',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 40px',
  borderRadius: '8px',
  lineHeight: '1',
  letterSpacing: '-0.2px',
};

const charityBrand = {
  padding: '32px 40px',
  textAlign: 'center' as const,
  borderTop: '1px solid #f0f0f0',
};

const charityLogoStyle = {
  borderRadius: '50%',
  margin: '0 auto 12px',
  border: '1px solid #e0e0e0',
} as React.CSSProperties;

const charityText = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
};

const footerSection = {
  padding: '24px 40px 48px',
};

const divider = {
  border: 'none',
  borderTop: '1px solid #f0f0f0',
  margin: '0 0 24px',
};

const footerSmall = {
  fontSize: '13px',
  color: '#999999',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '0 0 8px',
};

const footerLink = {
  color: '#000000',
  textDecoration: 'underline',
};

const footerCopyright = {
  fontSize: '12px',
  color: '#cccccc',
  textAlign: 'center' as const,
  margin: '12px 0 0',
};