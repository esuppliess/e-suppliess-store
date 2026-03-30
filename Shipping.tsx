import { Layout } from '@/components/layout/Layout';
import { Truck, MapPin, Globe, Clock } from 'lucide-react';

export default function Shipping() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-heading">Delivery Options</span>
          <h1 className="text-3xl md:text-5xl font-bold mt-2 mb-4">
            Shipping & Delivery
          </h1>
          <p className="text-muted-foreground">
            We offer multiple delivery options to serve you best.
          </p>
        </div>

        {/* Delivery Options */}
        <div className="space-y-8">
          {/* GTA Meetup */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Toronto / GTA Meetup</h2>
                <p className="text-muted-foreground mb-4">
                  Free local pickup within the Greater Toronto Area (Appointment-based after checkout)
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Meetup locations arranged after order confirmation</li>
                  <li>• Public locations preferred (malls, transit stations, etc.)</li>
                  <li>• Flexible scheduling to fit your availability</li>
                  <li>• Cash payment available for meetups</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Canada Shipping */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Canada Shipping</h2>
                <p className="text-muted-foreground mb-4">
                  Standard tracked shipping across Canada (3–7 business days)
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Full tracking provided via email</li>
                  <li>• Signature may be required for high-value items</li>
                  <li>• Shipping rates calculated at checkout</li>
                  <li>• Reliable delivery through trusted carriers</li>
                </ul>
              </div>
            </div>
          </div>

          {/* International Shipping */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">International Shipping</h2>
                <p className="text-muted-foreground mb-4">
                  Worldwide delivery fulfilled through our verified shipping partner (Tracking provided)
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Available to most countries worldwide</li>
                  <li>• Full tracking included with every shipment</li>
                  <li>• Shipping times vary by destination</li>
                  <li>• Customs duties may apply (buyer's responsibility)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 pt-12 border-t border-border">
          <div className="flex items-start gap-4">
            <Clock className="h-6 w-6 text-muted-foreground flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Processing Time</h3>
              <p className="text-sm text-muted-foreground">
                Orders are typically processed within 1-2 business days. You'll receive a 
                confirmation email once your order has shipped or when meetup details are confirmed.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold mb-2">Delays & Issues</h3>
            <p className="text-sm text-muted-foreground">
              While we strive to meet all delivery estimates, external factors like carrier delays 
              or customs processing may cause delays. If your order is significantly delayed, please 
              contact us and we'll help track it down.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
