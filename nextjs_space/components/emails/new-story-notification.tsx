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
  const previewText = `New impact story from ${charityName}: ${storyTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>ImpactusAll</Heading>
            <Text style={headerSubtitle}>Your Impact in Action</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Notification Badge */}
            <Section style={badgeSection}>
              <Text style={badge}>📢 New Impact Story Published</Text>
            </Section>

            {/* Charity Info */}
            <Section style={charitySection}>
              {charityLogo && (
                <Img
                  src={charityLogo}
                  alt={charityName}
                  style={charityLogoStyle}
                  width="60"
                  height="60"
                />
              )}
              <Text style={charityNameStyle}>
                {charityName} has published a new story for {donorName}
              </Text>
            </Section>

            {/* Featured Image */}
            {featuredImageUrl && (
              <Section style={imageSection}>
                <Img
                  src={featuredImageUrl}
                  alt={storyTitle}
                  style={featuredImage}
                  width="560"
                />
              </Section>
            )}

            {/* Story Title */}
            <Heading style={storyTitleStyle}>{storyTitle}</Heading>

            {/* Story Excerpt */}
            <Text style={excerpt}>{storyExcerpt}</Text>

            {/* Impact Metrics */}
            {impactMetrics && impactMetrics.length > 0 && (
              <Section style={metricsSection}>
                <Text style={metricsTitle}>Impact Highlights</Text>
                <table style={metricsTable}>
                  <tbody>
                    <tr>
                      {impactMetrics.map((metric, index) => (
                        <td key={index} style={metricCell}>
                          <Text style={metricValue}>{metric.value}</Text>
                          <Text style={metricLabel}>{metric.label}</Text>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={button} href={storyUrl}>
                Read Full Story
              </Button>
            </Section>

            {/* Secondary Link */}
            <Section style={linkSection}>
              <Text style={linkText}>
                Or copy this link:{' '}
                <Link href={storyUrl} style={link}>
                  {storyUrl}
                </Link>
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you're part of the {donorName} team on ImpactusAll.
            </Text>
            <Text style={footerText}>
              Manage your notification preferences in your{' '}
              <Link href="https://impactusall.abacusai.app/corporate-dashboard/settings" style={link}>
                account settings
              </Link>
              .
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} ImpactusAll. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NewStoryNotificationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  background: 'linear-gradient(135deg, #ff7a00 0%, #14b8a6 100%)',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const headerSubtitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '400',
  margin: '0',
  opacity: 0.9,
};

const content = {
  padding: '0 24px',
};

const badgeSection = {
  marginTop: '32px',
  textAlign: 'center' as const,
};

const badge = {
  backgroundColor: '#fef3c7',
  color: '#92400e',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '600',
  display: 'inline-block',
  margin: '0',
};

const charitySection = {
  marginTop: '24px',
  textAlign: 'center' as const,
};

const charityLogoStyle = {
  borderRadius: '50%',
  margin: '0 auto 12px',
} as React.CSSProperties;

const charityNameStyle = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
} as React.CSSProperties;

const imageSection = {
  marginTop: '24px',
};

const featuredImage = {
  width: '100%',
  borderRadius: '12px',
  objectFit: 'cover' as const,
};

const storyTitleStyle = {
  color: '#1e293b',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '24px 0 16px',
};

const excerpt = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px',
};

const metricsSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '24px',
  marginTop: '24px',
};

const metricsTitle = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const metricsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const metricCell = {
  textAlign: 'center' as const,
  padding: '8px',
};

const metricValue = {
  color: '#ff7a00',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 4px',
};

const metricLabel = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
};

const buttonSection = {
  marginTop: '32px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#ff7a00',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  lineHeight: '1',
};

const linkSection = {
  marginTop: '16px',
  textAlign: 'center' as const,
};

const linkText = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
};

const link = {
  color: '#14b8a6',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
};

const footer = {
  padding: '0 24px',
};

const footerText = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

const footerCopyright = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
};