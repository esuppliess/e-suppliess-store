export type ProductCondition = 'new' | 'like-new' | 'good' | 'fair';

export type ProductCategory = string; // Now dynamic from database

export type DeliveryOption = 'gta-meetup' | 'canada-shipping' | 'worldwide-agent';

export type ProductBadge = 'new-in' | 'back-in-stock' | 'sold-out' | null;

export interface SizeInventory {
  size: string;
  quantity: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: ProductCategory;
  brand: string;
  condition: ProductCondition;
  sizes: SizeInventory[];
  images: string[];
  inventoryCount: number;
  isActive: boolean;
  badge: ProductBadge;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  deliveryOption: DeliveryOption;
}

export interface VendorProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  features: string[];
  isBestDeal?: boolean;
  beaconsUrl: string;
}

// Kept for backwards compatibility - conditions don't change
export const CONDITIONS: { value: ProductCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

export const DELIVERY_OPTIONS: { value: DeliveryOption; label: string; description: string; detail?: string }[] = [
  { value: 'gta-meetup', label: 'Toronto / GTA Meetup', description: 'Free local pickup within the Greater Toronto Area', detail: 'Appointment-based after checkout' },
  { value: 'canada-shipping', label: 'Canada Shipping', description: 'Standard tracked shipping across Canada', detail: '3–7 business days' },
  { value: 'worldwide-agent', label: 'International Shipping', description: 'Order any size — sourced and shipped worldwide through our verified partner', detail: 'All sizes available, tracking provided' },
];
