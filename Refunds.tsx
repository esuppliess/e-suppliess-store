import { Layout } from '@/components/layout/Layout';

export default function Refunds() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Refund Policy</h1>
        
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: January 2024
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Physical Products</h2>
            <p>
              We want you to be completely satisfied with your purchase. If you're not happy with 
              your order, please contact us within 48 hours of receiving your item.
            </p>
            <div className="mt-4 p-4 bg-card border border-border rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">Refund Eligibility</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Item must be in original, unworn condition</li>
                <li>All tags and packaging must be intact</li>
                <li>Request must be made within 48 hours of delivery</li>
                <li>Proof of purchase required</li>
              </ul>
            </div>
            <div className="mt-4 p-4 bg-card border border-border rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">Non-Refundable Items</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Items marked as "Final Sale"</li>
                <li>Worn, washed, or altered items</li>
                <li>Items without original packaging/tags</li>
                <li>Fragrance products (for hygiene reasons)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Digital Products (Vendor Lists)</h2>
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-foreground font-medium">
                ⚠️ All digital products are NON-REFUNDABLE once access has been delivered.
              </p>
            </div>
            <p className="mt-4">
              Due to the nature of digital products, we cannot offer refunds after you've received 
              access to the vendor lists. Please review product details carefully before purchasing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">How to Request a Refund</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact us through our Contact page within 48 hours</li>
              <li>Include your order number and reason for refund</li>
              <li>Attach photos if the item is damaged or not as described</li>
              <li>Wait for our response (usually within 24 hours)</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Refund Process</h2>
            <p>
              Once approved, refunds will be processed to your original payment method within 
              5-10 business days. Shipping costs are non-refundable unless the return is due to 
              our error.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Exchanges</h2>
            <p>
              We may offer exchanges for different sizes or styles, subject to availability. 
              Please contact us to discuss exchange options.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Damaged or Incorrect Items</h2>
            <p>
              If you receive a damaged or incorrect item, please contact us immediately with photos. 
              We'll arrange a replacement or full refund at no additional cost to you.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
