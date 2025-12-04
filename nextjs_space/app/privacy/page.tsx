import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-teal-600" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <Card>
          <CardContent className="prose prose-gray max-w-none pt-6">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                ImpactusAll Ltd ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we 
                collect, use, disclose, and safeguard your personal information when you use our platform and services.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                This policy complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. 
                We are registered with the Information Commissioner's Office (ICO).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">2.1 Information You Provide</h3>
              <p className="text-gray-700 leading-relaxed">
                We collect information you provide directly, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Account Information:</strong> Name, email address, password, organisation name, charity registration number</li>
                <li><strong>Profile Information:</strong> Organisation description, location, focus areas, website URL</li>
                <li><strong>Content:</strong> Impact stories, images, videos, comments, and other user-generated content</li>
                <li><strong>Communications:</strong> Messages, feedback, and support requests</li>
                <li><strong>Payment Information:</strong> Billing details for paid subscriptions (processed securely by third-party payment providers)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">2.2 Information Collected Automatically</h3>
              <p className="text-gray-700 leading-relaxed">
                When you use ImpactusAll, we automatically collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, click patterns</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Cookies and Tracking:</strong> Session cookies, analytics cookies, preference cookies</li>
                <li><strong>Engagement Metrics:</strong> Story views, likes, shares, comments</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed">
                We use your personal information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Service Provision:</strong> To operate, maintain, and improve ImpactusAll</li>
                <li><strong>Account Management:</strong> To create and manage your account</li>
                <li><strong>Communication:</strong> To send you updates, notifications, and marketing communications (with your consent)</li>
                <li><strong>Analytics:</strong> To understand how users interact with our platform and improve user experience</li>
                <li><strong>Security:</strong> To detect, prevent, and address fraud, abuse, and security issues</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
                <li><strong>Personalisation:</strong> To customise your experience and provide relevant content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
              <p className="text-gray-700 leading-relaxed">
                Under UK GDPR, we process your personal data based on:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Contract:</strong> Processing necessary to provide our services to you</li>
                <li><strong>Consent:</strong> Where you have given explicit consent (e.g., marketing emails)</li>
                <li><strong>Legitimate Interests:</strong> For analytics, security, and service improvement</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Information Sharing and Disclosure</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">5.1 Public Information</h3>
              <p className="text-gray-700 leading-relaxed">
                Impact stories and related content you publish on ImpactusAll are publicly accessible. This includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Story titles, content, and images</li>
                <li>Charity name and description</li>
                <li>Public comments and engagement metrics</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">5.2 Third-Party Service Providers</h3>
              <p className="text-gray-700 leading-relaxed">
                We share information with trusted third parties who help us operate our platform:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Cloud Hosting:</strong> AWS (Amazon Web Services) for data storage and hosting</li>
                <li><strong>Email Services:</strong> Resend for transactional and notification emails</li>
                <li><strong>Analytics:</strong> Google Analytics for usage analytics (anonymised where possible)</li>
                <li><strong>Payment Processing:</strong> Stripe for secure payment processing</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                All third-party providers are contractually obligated to protect your data and use it only for specified purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">5.3 Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed">
                We may disclose your information if required by law, court order, or government request, or to protect our rights, 
                property, or safety.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organisational measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Secure password hashing (bcrypt)</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure cloud infrastructure (AWS)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations (e.g., tax records for 7 years)</li>
                <li>Resolve disputes and enforce agreements</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                When you delete your account, we will delete or anonymise your personal information within 30 days, except where 
                retention is required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                Under UK GDPR, you have the following rights:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for marketing communications</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@impactusall.com" className="text-teal-600 hover:underline">privacy@impactusall.com</a>. 
                We will respond within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
                <li><strong>Analytics Cookies:</strong> Understand how users interact with our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can control cookies through your browser settings. Disabling cookies may affect functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                ImpactusAll is not intended for children under 18. We do not knowingly collect personal information from children. 
                If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your data may be transferred to and processed in countries outside the UK. We ensure appropriate safeguards are in 
                place, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Standard Contractual Clauses (SCCs) approved by the ICO</li>
                <li>Adequacy decisions for countries with equivalent data protection laws</li>
                <li>Certification schemes (e.g., Privacy Shield successors)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes by email or through 
                the platform. Your continued use after changes take effect constitutes acceptance of the revised policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <p className="text-gray-700"><strong>Data Protection Officer</strong></p>
                <p className="text-gray-700"><strong>ImpactusAll Ltd</strong></p>
                <p className="text-gray-700">Email: privacy@impactusall.com</p>
                <p className="text-gray-700">Address: [Company Address]</p>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at 
                <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline"> ico.org.uk</a>.
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600">
                By using ImpactusAll, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <Link href="/terms" className="text-teal-600 hover:underline">
            Terms of Service
          </Link>
          {' • '}
          <Link href="/charity-signup" className="text-teal-600 hover:underline">
            Join as a Charity
          </Link>
          {' • '}
          <Link href="/" className="text-teal-600 hover:underline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
