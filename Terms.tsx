import { Layout } from '@/components/layout/Layout';

export default function Terms() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: January 2024
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using the E Supplies website and services, you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Products & Services</h2>
            <p>
              E Supplies offers physical products (clothing, accessories, electronics, etc.) and 
              digital products (vendor lists). All products are sourced from trusted suppliers and 
              are described accurately to the best of our knowledge.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Pricing & Payment</h2>
            <p>
              All prices are displayed in USD unless otherwise noted. We reserve the right to change 
              prices at any time. Payment is processed securely through Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Shipping & Delivery</h2>
            <p>
              We offer multiple delivery options including local meetup (Toronto/GTA), Canada-wide 
              shipping, and international shipping via agent. Delivery times are estimates and may 
              vary based on location and external factors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Returns & Refunds</h2>
            <p>
              Please refer to our Refund Policy for detailed information about returns and refunds. 
              Digital products are non-refundable once access has been delivered.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. User Conduct</h2>
            <p>
              Users agree not to use our platform for any illegal activities. Sharing or redistributing 
              digital products (vendor lists) is strictly prohibited and may result in legal action.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
            <p>
              E Supplies is not liable for any indirect, incidental, or consequential damages arising 
              from your use of our products or services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of our services 
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Contact</h2>
            <p>
              If you have questions about these Terms of Service, please contact us through our 
              Contact page.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
