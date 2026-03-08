import './markdown.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Pincer protects your privacy and handles your data when you use our OpenClaw deployment platform.',
  robots: {
    index: true,
    follow: false,
  },
};

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl markdown">
      <section className="container mx-auto dark:text-white">
        <h1>Privacy Policy</h1>
        <p className="text-sm">Last Updated: March 8, 2026</p>

        <h2>Introduction</h2>
        <p>
          This privacy policy explains how Pincer (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and protects your information when you use our website and the OpenClaw deployment platform (collectively, the &quot;Services&quot;). By using our Services, you agree to the collection and use of information as described in this policy.
        </p>

        <h2>Data Collection and Use</h2>
        <h3>Information We Collect</h3>
        <h4>Account Information</h4>
        <ul>
          <li>Name and email address (via third-party authentication providers)</li>
          <li>Account preferences and settings</li>
          <li>Payment information for paid plans (processed by third-party payment providers)</li>
        </ul>

        <h4>Deployment and Service Data</h4>
        <ul>
          <li>OpenClaw deployment configurations</li>
          <li>Connected channel credentials (encrypted at rest)</li>
          <li>Model selection and usage data</li>
          <li>Deployment logs and status information</li>
        </ul>

        <h4>Automatically Collected Information</h4>
        <ul>
          <li>IP addresses</li>
          <li>Browser type and version</li>
          <li>Device information and operating system</li>
          <li>Access times and dates</li>
          <li>Pages visited and feature usage patterns</li>
        </ul>

        <h3>Analytics and Tracking</h3>
        <p>We may use analytics tools to understand how our Services are used. These tools help us improve the user experience and platform performance.</p>

        <h2>Cookies and Tracking Technologies</h2>
        <p>We use cookies and similar tracking technologies to:</p>
        <ul>
          <li>Maintain your authentication session</li>
          <li>Remember your preferences and settings</li>
          <li>Analyze platform usage and performance</li>
          <li>Improve our Services</li>
        </ul>
        <p>You can control cookie preferences through your browser settings.</p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>
            <strong>Provide and operate our Services:</strong>
            <ul>
              <li>Process and manage your OpenClaw deployments</li>
              <li>Connect and maintain your configured channels</li>
              <li>Handle billing and subscription management</li>
            </ul>
          </li>
          <li>
            <strong>Improve and develop our platform:</strong>
            <ul>
              <li>Analyze usage patterns to enhance features</li>
              <li>Debug technical issues and fix bugs</li>
              <li>Develop new features and improvements</li>
            </ul>
          </li>
          <li>
            <strong>Security and maintenance:</strong>
            <ul>
              <li>Maintain platform security and integrity</li>
              <li>Prevent abuse, fraud, and unauthorized access</li>
              <li>Monitor system health and performance</li>
            </ul>
          </li>
          <li>
            <strong>Communication:</strong>
            <ul>
              <li>Send service-related notifications</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Notify you of important changes to our Services</li>
            </ul>
          </li>
        </ul>

        <h2>Data Sharing and Third Parties</h2>
        <h3>Third-party Service Providers</h3>
        <p>We may share your data with trusted third-party service providers who help us operate our platform, including:</p>
        <ul>
          <li>Authentication providers (for account sign-in)</li>
          <li>Payment processors (for subscription billing)</li>
          <li>Cloud infrastructure providers (for hosting and deployment)</li>
          <li>AI model providers (as part of your configured deployments)</li>
        </ul>
        <p>These providers are contractually obligated to handle your data securely and only as necessary to provide their services.</p>

        <h3>Your Deployment Data</h3>
        <p>
          When you deploy an OpenClaw instance and connect it to third-party channels (such as messaging platforms or social media), your deployment configuration and credentials are shared with those platforms as necessary to operate the connection. Please review the privacy policies of any third-party channels you connect.
        </p>

        <h3>Legal Requirements</h3>
        <p>We may disclose your information if required to do so by law or in response to valid legal requests by public authorities.</p>

        <h2>Data Security</h2>
        <p>We implement industry-standard security measures to protect your data:</p>
        <ul>
          <li>Encrypted data transmission (TLS/SSL)</li>
          <li>Encrypted storage of sensitive credentials</li>
          <li>Access controls and authentication mechanisms</li>
          <li>Regular security reviews</li>
        </ul>
        <p>
          While we strive to protect your data, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
        </p>

        <h2>Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data in a portable format</li>
          <li>Opt out of certain data processing activities</li>
          <li>Withdraw consent where applicable</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us through our{' '}
          <a href="https://github.com/sparrow-js/openclaw-deploy/issues" target="_blank" rel="noopener noreferrer">
            GitHub repository
          </a>
          .
        </p>

        <h2>Data Retention</h2>
        <p>
          We retain your personal data for as long as your account is active or as needed to provide you with our Services. If you delete your account, we will delete or anonymize your personal data within a reasonable timeframe, unless we are required to retain it for legal obligations.
        </p>

        <h2>Children&apos;s Privacy</h2>
        <p>
          Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal data from children. If we become aware that a child has provided us with personal data, we will take steps to delete such information.
        </p>

        <h2>International Data Transfers</h2>
        <p>
          Your data may be transferred to and processed in countries other than your own. We ensure that appropriate safeguards are in place to protect your data in accordance with this privacy policy.
        </p>

        <h2>Open Source</h2>
        <p>
          Pincer is an open-source project. The source code is available on{' '}
          <a href="https://github.com/sparrow-js/openclaw-deploy" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          . You can review how our platform handles data by examining the codebase.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. When we make changes, we will update the &quot;Last Updated&quot; date at the top of this page. We encourage you to review this policy periodically to stay informed about how we protect your data.
        </p>

        <h2>Contact Us</h2>
        <p>If you have questions about this privacy policy or our data practices, you can reach us through:</p>
        <ul>
          <li>
            GitHub Issues:{' '}
            <a href="https://github.com/sparrow-js/openclaw-deploy/issues" target="_blank" rel="noopener noreferrer">
              github.com/sparrow-js/openclaw-deploy/issues
            </a>
          </li>
          <li>
            Twitter/X:{' '}
            <a href="https://x.com/nicepkg" target="_blank" rel="noopener noreferrer">
              @nicepkg
            </a>
          </li>
        </ul>

        <p className="mt-8 text-sm">Last updated: March 8, 2026</p>
      </section>
    </main>
  );
}
