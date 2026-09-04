/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface Variant {
  size: string;
  color: ColorSwatch;
  stock: number;
  sku: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface FabricDetails {
  material: string;
  care: string[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: 'panjabi' | 'koti' | 'sherwani' | 'jubbah' | 'kabli' | 'pajama' | 'kids';
  subCategory?: string;
  description: string;
  fabricDetails: FabricDetails;
  price: number;
  compareAtPrice?: number;
  variants: Variant[];
  images: ProductImage[];
  videoUrl?: string;
  tags: string[];
  ratings: {
    average: number;
    count: number;
  };
  reviews: Review[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface ShippingAddress {
  address: string;
  area: string;
  city: 'Dhaka' | 'Outside Dhaka';
  postalCode?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderPricing {
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode: string | null;
  total: number;
}

export interface StatusHistoryEntry {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  pricing: OrderPricing;
  shippingMethod: 'regular_dhaka' | 'regular_outside' | 'express_dhaka';
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'sslcommerz';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory: StatusHistoryEntry[];
  notes?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: ColorSwatch;
  quantity: number;
  sku: string;
  price: number;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = unknown> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
}

export interface Showroom {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapUrl?: string;
}

export type AdminTheme = 'shopify' | 'woocommerce' | 'atelier';

export interface AdminThemeStyles {
  bg: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  sidebar: string;
  sidebarActive: string;
  sidebarText: string;
  sidebarTextActive: string;
  accent: string;
  accentText: string;
  button: string;
  input: string;
  tableHeader: string;
  badgeGreen: string;
  badgeYellow: string;
  badgeRed: string;
  badgeBlue: string;
}

