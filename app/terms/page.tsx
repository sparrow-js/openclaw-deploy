import './markdown.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read Pincer\'s Terms of Service. Understand your rights and responsibilities when using our OpenClaw deployment platform.',
  robots: {
    index: true,
    follow: false,
  },
};

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl markdown">
      <section className="container mx-auto dark:text-white">
        <h1>Terms of Service</h1>
        <p>Last Updated: March 8, 2026</p>

        <h2>Introduction</h2>
        <p>
          These terms constitute a legal agreement between you and Pincer (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). Your use of the Pincer platform and the OpenClaw deployment services made available through it (collectively, the &quot;Services&quot;) is subject to these Terms of Service (these &quot;Terms&quot;). By using any of our Services, you:
        </p>
        <ul>
          <li>Acknowledge that you have read and understood these Terms</li>
          <li>Agree to be bound by these Terms</li>
          <li>Agree to our <a href="/privacy-policy">Privacy Policy</a></li>
          <li>Commit to comply with all applicable laws and regulations</li>
        </ul>

        <h2>License to Use Our Services</h2>
        <p>
          Subject to these Terms, we grant you a limited, personal, non-exclusive, non-transferable license to use our Services. This license includes the right to use our Services for both personal and commercial purposes, subject to your subscription plan and these Terms.
        </p>

        <h2>Intellectual Property Rights</h2>
        <h3>Our Rights</h3>
        <p>Pincer owns and retains all rights, title, and interest in and to:</p>

        <h4>Brand Elements</h4>
        <ul>
          <li>The &quot;Pincer&quot; name and brand</li>
          <li>All Pincer logos, designs, and visual elements</li>
          <li>All marketing materials and website content</li>
        </ul>

        <h4>Platform Elements</h4>
        <ul>
          <li>The platform architecture and design</li>
          <li>All platform features and functionalities</li>
          <li>Our proprietary algorithms and systems</li>
          <li>The user interface and experience design</li>
          <li>All documentation and supporting materials</li>
        </ul>

        <h3>Open Source</h3>
        <p>
          Pincer is an open-source project. The source code is available on{' '}
          <a href="https://github.com/sparrow-js/openclaw-deploy" target="_blank" rel="noopener noreferrer">GitHub</a>
          {' '}and is subject to its respective open-source license. Your use of the open-source code is governed by that license in addition to these Terms.
        </p>

        <h3>User Rights</h3>
        <p>Pincer makes no claim to ownership of:</p>
        <ul>
          <li>Your deployment configurations and settings</li>
          <li>Applications and services you deploy using our platform</li>
          <li>Custom implementations and modifications you create</li>
          <li>Your business logic and integration workflows</li>
          <li>Content generated or processed through your deployed OpenClaw instances</li>
        </ul>

        <h4>Usage Rights</h4>
        <p>You may freely:</p>
        <ul>
          <li>Use the platform for commercial purposes</li>
          <li>Deploy and operate OpenClaw instances for any lawful use</li>
          <li>Integrate deployed instances with third-party services and channels</li>
          <li>Modify and adapt the open-source code per its license</li>
        </ul>

        <h2>Data Usage and Learning</h2>
        <p>
          We collect and process data from your use of the Services to improve our platform, provide support, and enhance user experience. Our{' '}
          <a href="/privacy-policy">Privacy Policy</a> contains detailed information about data collection and processing.
        </p>

        <h3>Service Improvement</h3>
        <p>We use anonymized and aggregated data to:</p>
        <ul>
          <li>Optimize platform performance and reliability</li>
          <li>Identify and resolve technical issues</li>
          <li>Develop new features and capabilities</li>
          <li>Improve documentation and user guides</li>
        </ul>

        <h3>Data Retention and Management</h3>
        <ul>
          <li>Data is retained only as long as necessary for the purposes described above</li>
          <li>You may request data deletion subject to our retention policies and technical feasibility</li>
          <li>Some data may be retained for compliance purposes</li>
        </ul>

        <h2>User Accounts and Content</h2>
        <h3>Account Creation and Management</h3>
        <ul>
          <li>You may create an account to use our Services</li>
          <li>You are responsible for maintaining account security</li>
          <li>You are responsible for all activities that occur under your account</li>
          <li>We reserve the right to terminate accounts that violate these Terms</li>
        </ul>

        <h3>User Content and Credentials</h3>
        <p>You may provide content including but not limited to:</p>
        <ul>
          <li>Deployment configurations</li>
          <li>API keys and channel credentials</li>
          <li>Model selection preferences</li>
          <li>Other digital assets and settings</li>
        </ul>

        <p>You represent that:</p>
        <ul>
          <li>You have all necessary rights to use the credentials and configurations you provide</li>
          <li>Your use of the Services does not violate any laws or third-party rights</li>
          <li>You are solely responsible for the security of your API keys and credentials</li>
          <li>You are solely responsible for any costs incurred through third-party services connected via our platform</li>
        </ul>

        <h2>Services and Pricing</h2>
        <h3>Plans and Limits</h3>
        <ul>
          <li>Free plan: Limited usage as described on the platform</li>
          <li>Paid plans: As described on the pricing page</li>
          <li>We reserve the right to modify plans and pricing at any time</li>
        </ul>

        <h3>Support Services</h3>
        <ul>
          <li>
            Support is available via our{' '}
            <a href="https://github.com/sparrow-js/openclaw-deploy/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a>
          </li>
          <li>Limited to platform-related issues</li>
          <li>Does not include debugging of your deployed applications or third-party integrations</li>
          <li>Subject to our capacity and availability</li>
        </ul>

        <h2>Subscription / Payment Terms</h2>
        <ul>
          <li>Paid services are subscription-based with recurring billing</li>
          <li>Subscriptions automatically renew at the end of each billing period</li>
        </ul>

        <h2>Fulfillment and Service Policies</h2>
        <h3>Service Delivery</h3>
        <ul>
          <li>Access to our platform is granted immediately upon successful payment processing</li>
          <li>
            If you experience any issues with access, contact us via{' '}
            <a href="https://github.com/sparrow-js/openclaw-deploy/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a>
          </li>
        </ul>

        <h3>Refund Policy</h3>
        <ul>
          <li>All payments are non-refundable unless otherwise determined by us</li>
          <li>In cases where refunds are approved, they will be processed to the original payment method</li>
          <li>Refunds may be considered in cases of:</li>
          <ul>
            <li>Billing errors</li>
            <li>Duplicate charges</li>
            <li>Other circumstances at our sole discretion</li>
          </ul>
        </ul>

        <h3>Cancellation Policy</h3>
        <h4>How to Cancel</h4>
        <p>You can cancel your subscription at any time through the account management interface on the platform.</p>

        <h4>Cancellation Terms</h4>
        <ul>
          <li>Your subscription remains active until the end of the current billing period</li>
          <li>You will continue to have full access until the end of your paid period</li>
          <li>Your subscription will not automatically renew after cancellation</li>
          <li>No partial refunds are provided for unused portions of the billing period</li>
        </ul>

        <h3>Digital Service Notice</h3>
        <ul>
          <li>As a digital service providing access to our AI deployment platform, traditional return policies do not apply</li>
          <li>All sales are final unless otherwise specified in these Terms</li>
        </ul>

        <h2>Prohibited Uses</h2>
        <p>You explicitly agree not to:</p>
        <ul>
          <li>Use the Services for illegal activities</li>
          <li>Attempt to access unauthorized areas of the Services</li>
          <li>Create multiple free accounts to circumvent usage limits</li>
          <li>Use the Services in a way that could harm other users or the platform</li>
          <li>Upload malicious code or content</li>
          <li>Attempt to overwhelm or crash our systems</li>
          <li>Use automated tools or bots without permission</li>
          <li>Deploy content that violates any applicable laws or regulations</li>
          <li>Use the Services to distribute spam, malware, or harmful content through connected channels</li>
        </ul>
        <p>
          The Services may not be used in regions, or by anyone, subject to sanctions or export restrictions. Users are responsible for ensuring their use complies with the laws of their jurisdiction.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          Our platform integrates with various third-party services including AI model providers, messaging platforms, and other channels. Your use of these third-party services through our platform is subject to their respective terms of service and privacy policies. We are not responsible for the availability, accuracy, or reliability of any third-party services.
        </p>

        <h2>Feedback</h2>
        <ul>
          <li>We welcome feedback and suggestions</li>
          <li>We may implement any feedback without compensation</li>
          <li>Providing feedback grants us a perpetual, worldwide license to use it</li>
          <li>No credit or compensation is due for implemented suggestions</li>
        </ul>

        <h2>Disclaimer of Warranties</h2>
        <p className="uppercase">
          YOUR USE OF THE PLATFORM AND SERVICES IS ENTIRELY AT YOUR OWN RISK. THE PLATFORM, SERVICES, AND ALL CONTENT ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT ANY GUARANTEES. TO THE FULLEST EXTENT PERMITTED BY LAW, PINCER AND OUR SUPPLIERS AND LICENSORS EXPLICITLY DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE MAKE NO GUARANTEES REGARDING THE ACCURACY, RELIABILITY, OR USEFULNESS OF THE PLATFORM OR SERVICES. ANY MATERIALS OR CONFIGURATIONS YOU DOWNLOAD OR ACCESS THROUGH OUR PLATFORM ARE OBTAINED AT YOUR OWN DISCRETION AND RISK.
        </p>

        <h2>Limitation of Liability</h2>
        <p className="uppercase">
          PINCER, ALONG WITH ITS AFFILIATES, AGENTS, OFFICERS, EMPLOYEES, SUPPLIERS AND LICENSORS, SHALL NOT BE LIABLE FOR ANY DAMAGES, WHETHER DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOST PROFITS, GOODWILL, DATA, USE, OR OTHER INTANGIBLE LOSSES, ARISING FROM YOUR USE OF OR INABILITY TO USE OUR PLATFORM OR SERVICES.
        </p>

        <p className="uppercase">
          TO THE MAXIMUM EXTENT ALLOWED BY LAW, PINCER ACCEPTS NO LIABILITY OR RESPONSIBILITY FOR:
        </p>

        <ul className="uppercase">
          <li>Content errors, inaccuracies, or omissions in any form</li>
          <li>Personal injury or property damage resulting from your use of our platform or services</li>
          <li>Unauthorized access to our servers or your personal information</li>
          <li>Service interruptions, transmission failures, or platform unavailability</li>
          <li>Malicious software or code that may be transmitted through our platform</li>
          <li>Any errors, losses, or damages arising from the use of our services</li>
        </ul>

        <p className="uppercase">AI and deployment related issues, including:</p>
        <ul className="uppercase">
          <li>Failures or errors in deployed OpenClaw instances</li>
          <li>Incorrect or unexpected AI model responses</li>
          <li>Costs incurred through third-party AI model providers</li>
          <li>Downtime or unavailability of connected channels</li>
          <li>Data loss or corruption in deployment configurations</li>
          <li>Issues arising from third-party service integrations</li>
        </ul>

        <p className="uppercase">Platform-related issues such as:</p>
        <ul className="uppercase">
          <li>Temporary or permanent service unavailability</li>
          <li>Slow response times or performance degradation</li>
          <li>Loss of saved configurations or deployment history</li>
          <li>Interface bugs or usability issues</li>
          <li>Authentication or authorization problems</li>
        </ul>

        <p className="uppercase">
          THIS LIST IS NOT EXHAUSTIVE, AND PINCER&apos;S LIMITATION OF LIABILITY EXTENDS TO ALL POSSIBLE ISSUES, WHETHER LISTED HERE OR NOT, ARISING FROM THE USE OF OUR PLATFORM AND SERVICES.
        </p>

        <p className="uppercase">
          IN NO EVENT SHALL OUR TOTAL LIABILITY, ARISING FROM OR RELATING TO YOUR USE OF THE PLATFORM AND SERVICES, REGARDLESS OF THE TYPE OF CLAIM OR LEGAL THEORY, EXCEED THE AMOUNT YOU HAVE PAID TO US FOR THE SERVICES IN THE TWELVE MONTHS PRECEDING THE CLAIM. SOME JURISDICTIONS DO NOT PERMIT LIABILITY LIMITATIONS FOR CERTAIN DAMAGES, SO THESE LIMITATIONS MAY NOT FULLY APPLY TO YOU.
        </p>

        <h2>Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless Pincer, including our officers, directors, employees, agents, licensors, affiliates, and representatives, from and against any claims, liabilities, damages, judgments, awards, losses, costs, or expenses (including reasonable legal fees) arising from:
        </p>
        <ul>
          <li>Your use of our platform and Services</li>
          <li>Breach of these Terms</li>
          <li>Infringement of third-party rights</li>
          <li>Applications, bots, or services you deploy using our platform</li>
          <li>Any content you submit or distribute through connected channels</li>
        </ul>

        <h2>Governing Law</h2>
        <p>
          These Terms shall be governed by applicable law. Any disputes related to these Terms or your use of our platform shall be resolved in accordance with the applicable dispute resolution mechanisms. If any provision of these Terms is found invalid or unenforceable, the remaining provisions will continue in full effect.
        </p>

        <h2>Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. When we make changes, we will update the &quot;Last Updated&quot; date at the top of this page. Your continued use of the Services after any changes constitutes acceptance of the new Terms.
        </p>

        <h2>Contact Information</h2>
        <p>For any questions regarding these Terms, contact us through:</p>
        <ul>
          <li>
            GitHub Issues:{' '}
            <a href="https://github.com/sparrow-js/openclaw-deploy/issues" target="_blank" rel="noopener noreferrer">
              github.com/sparrow-js/openclaw-deploy/issues
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
