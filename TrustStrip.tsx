import { ShieldCheck, Truck, MapPin, Headphones } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Secure Checkout' },
  { icon: Truck, label: 'Tracked Shipping' },
  { icon: MapPin, label: 'Toronto/GTA Local Pickup Available' },
  { icon: Headphones, label: 'Customer Support Available' },
];

export function TrustStrip() {
  return (
    <div className="bg-background border-t border-foreground">
      <div className="container mx-auto px-4 md:px-6 lg:px-10 py-4">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {TRUST_ITEMS.map((item, index) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              <span className="text-xs md:text-sm text-foreground">{item.label}</span>
              {index < TRUST_ITEMS.length - 1 && (
                <span className="hidden md:inline text-muted-foreground ml-4">•</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
