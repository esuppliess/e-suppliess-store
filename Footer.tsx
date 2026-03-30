import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useSiteContent } from '@/hooks/useSiteContent';

const FOOTER_LINKS = {
  shop: [
    { href: '/shop', label: 'All Products' },
    { href: '/shop?category=hoodies', label: 'Hoodies' },
    { href: '/shop?category=shoes', label: 'Shoes' },
    { href: '/shop?category=accessories', label: 'Accessories' },
  ],
  support: [
    { href: '/shipping', label: 'Shipping & Delivery' },
    { href: '/faqs', label: 'FAQs' },
    { href: '/contact', label: 'Contact Us' },
  ],
  legal: [
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/refunds', label: 'Refund Policy' },
  ],
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: content } = useSiteContent();
  
  // Build social links from content
  const socialLinks = [
    content?.instagram_url && { href: content.instagram_url, label: 'Instagram', icon: Instagram },
    content?.tiktok_url && { href: content.tiktok_url, label: 'TikTok', icon: TikTokIcon },
    content?.tiktok_url_2 && { href: content.tiktok_url_2, label: 'TikTok 2', icon: TikTokIcon },
    content?.discord_url && content.discord_url !== '#' && { href: content.discord_url, label: 'Discord', icon: DiscordIcon },
  ].filter(Boolean) as Array<{ href: string; label: string; icon: any }>;

  // Fallback if no content loaded yet
  const defaultSocialLinks = [
    { href: 'https://instagram.com/e_suppliess', label: 'Instagram', icon: Instagram },
    { href: 'https://tiktok.com/@e_suppliess', label: 'TikTok', icon: TikTokIcon },
    { href: 'https://tiktok.com/@e_suppliess2', label: 'TikTok 2', icon: TikTokIcon },
  ];

  const displaySocialLinks = socialLinks.length > 0 ? socialLinks : defaultSocialLinks;
  
  return (
    <footer className="bg-background border-t border-foreground">
      {/* Delivery Strip */}
      <div className="border-b border-foreground/20">
        <div className="container mx-auto px-4 md:px-6 lg:px-10 py-4">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
            <span>Toronto/GTA Meetup</span>
            <span className="text-foreground">•</span>
            <span>Canada Shipping</span>
            <span className="text-foreground">•</span>
            <span>International Shipping</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-10 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="E Supplies"
                  className="h-6 max-w-[120px] object-contain"
                />
              ) : (
                <span className="text-lg font-bold tracking-tight">E SUPPLIES</span>
              )}
            </Link>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Curated stock. Premium sourcing. Built for serious buyers.
            </p>
            <div className="flex items-center gap-4">
              {displaySocialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-muted-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="section-heading mb-4">Shop</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="section-heading mb-4">Support</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="section-heading mb-4">Legal</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Authenticity Disclaimer */}
        <div className="mt-8 pt-6 border-t border-foreground/20">
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
            All items are sourced through trusted suppliers and carefully inspected before fulfillment. Condition and packaging may vary by item.
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-6 border-t border-foreground">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} E Supplies. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Prices in USD. We do not support illegal activity.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
