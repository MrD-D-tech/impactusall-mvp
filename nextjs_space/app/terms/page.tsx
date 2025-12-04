import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <FileText className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <Card>
          <CardContent className="prose prose-gray max-w-none pt-6">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to ImpactusAll. These Terms of Service ("Terms") govern your access to and use of the ImpactusAll platform, 
                including our website, services, and applications (collectively, the "Service"). By accessing or using the Service, 
                you agree to be bound by these Terms.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                ImpactusAll is operated by ImpactusAll Ltd, a company registered in England and Wales. Our mission is to connect 
                UK charities with corporate donors through compelling impact storytelling.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
              <p className="text-gray-700 leading-relaxed">
                To use ImpactusAll, you must:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>For charity accounts: represent a registered UK charity or equivalent organisation</li>
                <li>For corporate accounts: represent a legitimate business entity</li>
                <li>Provide accurate and complete registration information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Registration and Security</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">3.1 Account Creation</h3>
              <p className="text-gray-700 leading-relaxed">
                When you create an account, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorised use of your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">3.2 Charity Verification</h3>
              <p className="text-gray-700 leading-relaxed">
                Charity accounts are subject to verification. We reserve the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Request proof of charity registration</li>
                <li>Verify your organisation's legitimacy with the Charity Commission</li>
                <li>Approve or reject applications at our discretion</li>
                <li>Suspend or terminate accounts that fail verification</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">4.1 Permitted Use</h3>
              <p className="text-gray-700 leading-relaxed">
                You may use ImpactusAll to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Share authentic impact stories about your charitable work</li>
                <li>Connect with corporate donors and supporters</li>
                <li>Track engagement and measure impact</li>
                <li>Generate reports for stakeholders</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">4.2 Prohibited Activities</h3>
              <p className="text-gray-700 leading-relaxed">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Post false, misleading, or fraudulent content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Upload malicious code or viruses</li>
                <li>Attempt to gain unauthorised access to the Service</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use the Service for commercial purposes without authorisation</li>
                <li>Scrape or collect data from the Service without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">5.1 Your Content</h3>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of all content you post on ImpactusAll ("User Content"). By posting User Content, you grant 
                ImpactusAll a worldwide, non-exclusive, royalty-free licence to use, reproduce, modify, and display your content 
                for the purpose of operating and promoting the Service.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">5.2 Content Standards</h3>
              <p className="text-gray-700 leading-relaxed">
                All User Content must:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Be accurate and truthful</li>
                <li>Respect the privacy and dignity of beneficiaries</li>
                <li>Comply with data protection laws (GDPR, UK DPA 2018)</li>
                <li>Not contain offensive, discriminatory, or harmful material</li>
                <li>Include appropriate consent for images and personal stories</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">5.3 Our Intellectual Property</h3>
              <p className="text-gray-700 leading-relaxed">
                The ImpactusAll platform, including its design, features, and functionality, is owned by ImpactusAll Ltd and 
                protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Protection and Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of ImpactusAll is also governed by our <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>, 
                which explains how we collect, use, and protect your personal data. By using the Service, you consent to our data practices 
                as described in the Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Subscription and Fees</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">7.1 Free Tier</h3>
              <p className="text-gray-700 leading-relaxed">
                ImpactusAll offers a free tier for UK-registered charities with basic features.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">7.2 Paid Subscriptions</h3>
              <p className="text-gray-700 leading-relaxed">
                Premium features are available through paid subscription tiers. Subscription fees are:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Billed annually in advance</li>
                <li>Non-refundable except as required by law</li>
                <li>Subject to change with 30 days' notice</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">7.3 Cancellation</h3>
              <p className="text-gray-700 leading-relaxed">
                You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may suspend or terminate your account if:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>You breach these Terms</li>
                <li>Your account is inactive for an extended period</li>
                <li>We are required to do so by law</li>
                <li>We discontinue the Service</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Upon termination, your right to use the Service will immediately cease. We may delete your account and content, 
                though we may retain certain information as required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitations of Liability</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">9.1 Service "As Is"</h3>
              <p className="text-gray-700 leading-relaxed">
                ImpactusAll is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that 
                the Service will be uninterrupted, secure, or error-free.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">9.2 Limitation of Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                To the fullest extent permitted by law, ImpactusAll Ltd shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law and Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of England and Wales. Any disputes arising from these Terms or your use of 
                ImpactusAll shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms from time to time. We will notify you of material changes by email or through the Service. 
                Your continued use of ImpactusAll after changes take effect constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <p className="text-gray-700"><strong>ImpactusAll Ltd</strong></p>
                <p className="text-gray-700">Email: legal@impactusall.com</p>
                <p className="text-gray-700">Address: [Company Address]</p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600">
                By using ImpactusAll, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <Link href="/privacy" className="text-teal-600 hover:underline">
            Privacy Policy
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
