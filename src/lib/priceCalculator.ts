/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { INITIAL_PRODUCTS, INITIAL_COUPONS } from '../data';
import { Product, Coupon } from '../types';

export interface OrderItemRequest {
  productId: string;
  size?: string;
  color?: string;
  quantity: number;
  clientReportedPrice?: number;
}

export interface VerifiedPricingResult {
  isValid: boolean;
  error?: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  appliedCoupon: {
    code: string;
    discountAmount: number;
    type: 'percentage' | 'flat';
  } | null;
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    size: string;
    color: string;
    quantity: number;
    authoritativePrice: number;
    itemTotal: number;
    image?: string;
  }>;
  priceTamperingDetected: boolean;
}

/**
 * Calculates authoritative order totals directly from the master catalog.
 * NEVER trusts client-submitted prices or totals.
 */
export function calculateAuthoritativePricing(
  items: OrderItemRequest[],
  couponCode?: string | null,
  shippingMethod = 'regular_dhaka',
  city = 'Dhaka'
): VerifiedPricingResult {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      isValid: false,
      error: 'Order must contain at least one valid garment piece.',
      subtotal: 0,
      discount: 0,
      shippingCost: 0,
      total: 0,
      appliedCoupon: null,
      items: [],
      priceTamperingDetected: false
    };
  }

  let subtotal = 0;
  let priceTamperingDetected = false;
  const verifiedItems: VerifiedPricingResult['items'] = [];

  for (const rawItem of items) {
    const product = INITIAL_PRODUCTS.find((p) => p.id === rawItem.productId);
    if (!product || !product.isActive) {
      return {
        isValid: false,
        error: `Selected garment (${rawItem.productId}) is not available in our active collection.`,
        subtotal: 0,
        discount: 0,
        shippingCost: 0,
        total: 0,
        appliedCoupon: null,
        items: [],
        priceTamperingDetected: false
      };
    }

    const qty = Math.max(1, Math.min(99, Math.floor(Number(rawItem.quantity) || 1)));
    const authenticPrice = product.price;

    // Check if client claimed a different price
    if (
      typeof rawItem.clientReportedPrice === 'number' &&
      rawItem.clientReportedPrice !== authenticPrice
    ) {
      priceTamperingDetected = true;
    }

    const itemTotal = authenticPrice * qty;
    subtotal += itemTotal;

    const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || '';

    verifiedItems.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      size: String(rawItem.size || '38'),
      color: String(rawItem.color || 'Standard'),
      quantity: qty,
      authoritativePrice: authenticPrice,
      itemTotal,
      image: primaryImage
    });
  }

  // 2. Authoritative Coupon Verification
  let discount = 0;
  let appliedCouponData: VerifiedPricingResult['appliedCoupon'] = null;

  if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    const coupon = INITIAL_COUPONS.find(
      (c) => c.code.toUpperCase() === cleanCode && c.isActive
    );

    if (coupon) {
      const now = new Date();
      const isExpired = coupon.expiresAt ? new Date(coupon.expiresAt) < now : false;
      const meetsMinOrder = coupon.minOrderValue ? subtotal >= coupon.minOrderValue : true;

      if (!isExpired && meetsMinOrder) {
        if (coupon.type === 'percentage') {
          const rawDiscount = Math.round((subtotal * coupon.value) / 100);
          discount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
        } else if (coupon.type === 'flat') {
          discount = Math.min(coupon.value, subtotal);
        }

        appliedCouponData = {
          code: coupon.code,
          discountAmount: discount,
          type: coupon.type
        };
      }
    }
  }

  // 3. Authoritative Shipping Calculation
  let shippingCost = 0;
  const isFreeDeliveryEligible = subtotal >= 5000;

  if (isFreeDeliveryEligible) {
    shippingCost = 0;
  } else if (shippingMethod === 'express_dhaka') {
    shippingCost = 120;
  } else if (shippingMethod === 'regular_outside' || city.toLowerCase().includes('outside')) {
    shippingCost = 120;
  } else {
    shippingCost = 60; // Standard Dhaka delivery
  }

  // 4. Authoritative Grand Total
  const total = Math.max(0, subtotal - discount + shippingCost);

  return {
    isValid: true,
    subtotal,
    discount,
    shippingCost,
    total,
    appliedCoupon: appliedCouponData,
    items: verifiedItems,
    priceTamperingDetected
  };
}
