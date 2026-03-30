import { Layout } from '@/components/layout/Layout';

export default function Privacy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: January 2024
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Name and email address</li>
              <li>Shipping address (for shipped orders)</li>
              <li>Order and transaction information</li>
              <li>Communications you send to us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about orders and updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our products and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share 
              information with:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Payment processors (Stripe) to process transactions</li>
              <li>Shipping carriers to deliver your orders</li>
              <li>Service providers who assist in our operations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. 
              Payment information is handled securely by Stripe and is never stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Cookies</h2>
            <p>
              We use cookies to improve your browsing experience and analyze site traffic. You can 
              control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us through our 
              Contact page.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
