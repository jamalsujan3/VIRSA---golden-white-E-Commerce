/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, Tag, Percent, RotateCcw, ArrowRight, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Coupon, AsyncStatus } from '../types';
import { formatPrice } from '../lib/formatters';
import { EmptyState } from './EmptyState';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (sku: string, qty: number) => void;
  onRemoveItem: (sku: string) => void;
  onRestoreItem?: (item: CartItem) => void;
  onProceedToCheckout: () => void;
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onRestoreItem,
  onProceedToCheckout,
  coupons,
  appliedCoupon,
  onApplyCoupon
}: CartDrawerProps) {
  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<AsyncStatus>('idle');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Undo Buffer State
  const [lastRemovedItem, setLastRemovedItem] = useState<CartItem | null>(null);
  const [showUndoBanner, setShowUndoBanner] = useState(false);

  // Subtotal Calculation
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handle Item Removal with Undo capability
  const handleRemoveWithUndo = (item: CartItem) => {
    setLastRemovedItem(item);
    setShowUndoBanner(true);
    onRemoveItem(item.sku);

    // Auto-dismiss undo banner after 8 seconds
    setTimeout(() => {
      setShowUndoBanner(false);
    }, 8000);
  };

  // Restore removed item
  const handleUndo = () => {
    if (lastRemovedItem && onRestoreItem) {
      onRestoreItem(lastRemovedItem);
      setShowUndoBanner(false);
      setLastRemovedItem(null);
    }
  };

  // Promo Code Validation Engine with Explicit 4 Async States
  const handleApplyCoupon = (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    setCouponStatus('loading');

    const cleanCode = (directCode || couponInput).trim().toUpperCase();
    if (!cleanCode) {
      setCouponStatus('error');
      setCouponError('Please enter a promo code.');
      return;
    }

    // Simulate async server-side voucher validation
    setTimeout(() => {
      const matched = coupons.find((c) => c.code.toUpperCase() === cleanCode);

      if (!matched) {
        setCouponStatus('error');
        setCouponError(`The promo code "${cleanCode}" is invalid. Please verify spelling.`);
        return;
      }

      if (!matched.isActive) {
        setCouponStatus('error');
        setCouponError(`The promo code "${cleanCode}" is currently disabled.`);
        return;
      }

      // Expiry check
      if (matched.expiresAt && new Date(matched.expiresAt).getTime() < Date.now()) {
        const expDate = new Date(matched.expiresAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        setCouponStatus('error');
        setCouponError(`The promo code "${cleanCode}" expired on ${expDate}.`);
        return;
      }

      // Usage limit check
      if (matched.usageLimit && matched.usedCount >= matched.usageLimit) {
        setCouponStatus('error');
        setCouponError(`The promo code "${cleanCode}" has reached its maximum redemption limit.`);
        return;
      }

      // Min order value check
      if (subtotal < matched.minOrderValue) {
        setCouponStatus('error');
        setCouponError(
          `Minimum order value of ${formatPrice(matched.minOrderValue)} required to apply "${matched.code}". Add ${formatPrice(matched.minOrderValue - subtotal)} more to qualify.`
        );
        return;
      }

      onApplyCoupon(matched);
      setCouponStatus('success');
      setCouponSuccess(`Promo code "${matched.code}" applied successfully!`);
      setCouponInput('');
    }, 400);
  };

  // Calculate discount
  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.type === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.value;
    }
  }

  // Free shipping over ৳5,000
  const freeShippingThreshold = 5000;
  const isFreeShipping = subtotal >= freeShippingThreshold || subtotal === 0;
  const shippingCost = isFreeShipping ? 0 : 80;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // 5% standard VAT (VAT Inclusive)
  const vatRate = 0.05;
  const vatAmount = Math.round((subtotal - discount) * vatRate);

  // Grand Total
  const grandTotal = Math.max(0, subtotal - discount + shippingCost);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Semi-transparent Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1F1B17]/60 z-50 cursor-pointer backdrop-blur-xs"
          />

          {/* Cart Sliding Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-[#E8DFC8] z-50 flex flex-col justify-between shadow-2xl overflow-hidden text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E8DFC8] bg-[#FAF6ED]">
              <div className="flex items-center space-x-3">
                <span className="font-serif text-xl font-bold tracking-wider text-[#1F1B17]">Your Atelier Cart</span>
                <span className="bg-white border border-[#C5A059] text-[#8C6819] text-xs font-mono font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'Garment' : 'Garments'}
                </span>
              </div>
              <button
                id="close-cart-btn"
                onClick={onClose}
                className="text-[#6E645A] hover:text-[#1F1B17] p-2 hover:bg-white rounded-full transition-all cursor-pointer"
                aria-label="Close Cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            {cart.length > 0 && (
              <div className="bg-[#FAF8F5] px-5 py-3 border-b border-[#E8DFC8]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#8C6819]" />
                      Complimentary Nationwide Delivery Unlocked!
                    </span>
                  ) : (
                    <span className="text-[#5C5248] font-sans text-[11px]">
                      Add <strong className="text-[#8C6819] font-mono">{formatPrice(amountToFreeShipping)}</strong> more for Free Shipping
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-[#6E645A]">
                    {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-[#E8DFC8] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#AA8232] transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Undo Notification Banner */}
            <AnimatePresence>
              {showUndoBanner && lastRemovedItem && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-[#FAF6ED] border-b border-[#C5A059] px-5 py-3 flex items-center justify-between overflow-hidden"
                >
                  <div className="flex items-center space-x-2 text-xs text-[#1F1B17] truncate pr-2">
                    <Trash2 className="h-3.5 w-3.5 text-[#8C6819] shrink-0" />
                    <span className="truncate">
                      Removed <strong>{lastRemovedItem.product.name}</strong> ({lastRemovedItem.selectedSize})
                    </span>
                  </div>
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-1 text-xs font-bold font-sans text-[#1F1B17] bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 px-2.5 py-1 rounded transition-colors uppercase tracking-wider shrink-0 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Undo</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 divide-y divide-[#E8DFC8]">
              {cart.length === 0 ? (
                <EmptyState
                  type="cart"
                  primaryAction={{
                    label: 'Explore Collections',
                    onClick: () => {
                      onClose();
                      onProceedToCheckout();
                    }
                  }}
                  suggestedTags={[
                    {
                      label: 'Silk Panjabi',
                      onClick: () => {
                        onClose();
                        onProceedToCheckout();
                      }
                    },
                    {
                      label: 'Royal Sherwani',
                      onClick: () => {
                        onClose();
                        onProceedToCheckout();
                      }
                    },
                    {
                      label: 'Imperial Kabli',
                      onClick: () => {
                        onClose();
                        onProceedToCheckout();
                      }
                    },
                    {
                      label: 'Velvet Koti',
                      onClick: () => {
                        onClose();
                        onProceedToCheckout();
                      }
                    }
                  ]}
                />
              ) : (
                cart.map((item) => (
                  <div key={item.sku} className="flex items-start space-x-4 pt-5 first:pt-0">
                    {/* Item Image */}
                    <div className="w-20 h-24 bg-[#F5EFEB] flex-shrink-0 overflow-hidden rounded-xl border border-[#E8DFC8] relative shadow-2xs">
                      <img
                        src={item.product.images[0]?.url || 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop'}
                        alt={item.product.name}
                        className="w-full h-full object-cover object-center"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-semibold text-[#1F1B17] hover:text-[#8C6819] transition-colors truncate">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[11px] font-sans text-[#5C5248] bg-[#FAF8F5] border border-[#E8DFC8] px-2 py-0.5 rounded">
                          Size: {item.selectedSize}
                        </span>
                        <span className="text-[11px] font-sans text-[#5C5248] bg-[#FAF8F5] border border-[#E8DFC8] px-2 py-0.5 rounded flex items-center gap-1">
                          <span
                            className="h-2 w-2 rounded-full inline-block border border-black/20"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          {item.selectedColor.name}
                        </span>
                      </div>

                      {/* Quantity Controls & Line Price */}
                      <div className="flex items-center justify-between mt-3.5">
                        <div className="flex items-center border border-[#E8DFC8] rounded-lg bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.sku, item.quantity - 1)}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-[#FAF6ED] text-[#6E645A] hover:text-[#1F1B17] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 text-xs font-mono font-bold text-[#1F1B17] min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.sku, item.quantity + 1)}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-[#FAF6ED] text-[#6E645A] hover:text-[#1F1B17] transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <span className="text-sm font-bold text-[#8C6819] font-mono">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => handleRemoveWithUndo(item)}
                      className="text-[#6E645A] hover:text-rose-600 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-[#FAF6ED] rounded-lg transition-colors cursor-pointer"
                      title="Remove from bag"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4 stroke-[1.5]" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer & Live Order Summary */}
            {cart.length > 0 && (
              <div className="bg-[#FAF6ED] p-5 sm:p-6 border-t border-[#E8DFC8] space-y-4 shadow-2xl">
                
                {/* Promo Code Input Form */}
                <div className="space-y-2">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-2.5 h-4 w-4 text-[#6E645A]" />
                      <input
                        type="text"
                        placeholder="Enter Promo Code (e.g. EID2026)"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          if (couponError) setCouponError('');
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-white text-xs text-[#1F1B17] placeholder-[#9E948A] font-sans border border-[#E8DFC8] rounded-lg focus:outline-none focus:border-[#C5A059] uppercase tracking-wider shadow-2xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={couponStatus === 'loading'}
                      className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-bold text-xs font-sans tracking-widest uppercase hover:brightness-110 transition-all rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                    >
                      {couponStatus === 'loading' ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Apply</span>
                      )}
                    </button>
                  </form>

                  {/* Promo Error & Success Messages */}
                  {couponError && (
                    <div className="flex items-center justify-between text-[11px] text-rose-700 font-sans bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded">
                      <div className="flex items-center space-x-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{couponError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="text-[10px] uppercase font-bold text-[#8C6819] hover:underline ml-2 shrink-0 cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-800 font-sans bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                      {couponSuccess}
                    </p>
                  )}

                  {/* Applied Coupon Banner */}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-white border border-[#C5A059] px-3 py-1.5 rounded-lg shadow-2xs">
                      <span className="flex items-center space-x-1.5 text-xs font-sans font-semibold text-[#8C6819]">
                        <Percent className="h-3.5 w-3.5" />
                        <span>Code Applied: <strong>{appliedCoupon.code}</strong> ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% OFF` : `${formatPrice(appliedCoupon.value)} OFF`})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onApplyCoupon(null);
                          setCouponSuccess('');
                        }}
                        className="text-[#6E645A] hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove promo code"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Available Public Coupon Suggestion Chips */}
                  {!appliedCoupon && coupons.length > 0 && (
                    <div className="pt-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[10px]">
                      <span className="text-[#6E645A] font-sans shrink-0 font-semibold">Available:</span>
                      {coupons.filter(c => c.isActive).map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCouponInput(c.code);
                            onApplyCoupon(c);
                            setCouponSuccess(`Promo code "${c.code}" applied!`);
                          }}
                          className="bg-white hover:bg-[#FAF6ED] border border-[#E8DFC8] hover:border-[#C5A059] text-[#8C6819] px-2 py-0.5 rounded font-mono transition-colors shrink-0 cursor-pointer shadow-2xs"
                        >
                          {c.code} ({c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Summary Breakdown */}
                <div className="space-y-2 pt-3 border-t border-[#E8DFC8] font-sans text-xs">
                  <div className="flex justify-between text-[#5C5248]">
                    <span>Subtotal</span>
                    <span className="font-mono text-[#1F1B17] font-medium">{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Promo Discount ({appliedCoupon?.code})</span>
                      <span className="font-mono">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#5C5248]">
                    <span>Estimated Delivery</span>
                    <span className="font-mono">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-700 font-semibold">FREE</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#6E645A] text-[11px]">
                    <span>VAT / Tax (5% Standard)</span>
                    <span className="font-mono text-[#5C5248]">{formatPrice(vatAmount)} (Included)</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-[#1F1B17] pt-2.5 border-t border-[#E8DFC8]">
                    <span>Grand Total</span>
                    <span className="font-mono text-lg text-[#8C6819]">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    id="cart-proceed-checkout-btn"
                    onClick={onProceedToCheckout}
                    className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] text-xs font-sans tracking-widest uppercase font-bold hover:brightness-110 transition-all duration-300 rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2 bg-transparent text-[#6E645A] hover:text-[#1F1B17] text-xs font-sans tracking-widest uppercase hover:underline transition-all cursor-pointer"
                  >
                    Continue Atelier Browsing
                  </button>
                </div>

              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
