/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  Smartphone,
  Lock,
  ArrowLeft,
  ArrowRight,
  Tag,
  X,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Coupon, Order, AsyncStatus } from '../types';
import { BANGLADESH_AREAS } from '../data';
import { formatPrice } from '../lib/formatters';
import SEO from './SEO';
import { sanitizeUGC } from '../lib/sanitize';

interface CheckoutProps {
  cart: CartItem[];
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
  onPlaceOrder: (order: Order) => void;
  onNavigate: (view: string, extra?: any) => void;
  isLoggedIn?: boolean;
  currentUser?: any;
}

export default function Checkout({
  cart,
  coupons,
  appliedCoupon,
  onApplyCoupon,
  onPlaceOrder,
  onNavigate,
  isLoggedIn = false,
  currentUser = null
}: CheckoutProps) {
  // Navigation Guard: Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      onNavigate('homepage');
    }
  }, [cart, onNavigate]);

  // Multi-step state (1: Customer/Address, 2: Shipping Method, 3: Payment & Review)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Form Fields State (Preserved throughout lifecycle)
  const [fullName, setFullName] = useState(() => (isLoggedIn && currentUser ? currentUser.name || '' : ''));
  const [phone, setPhone] = useState(() => (isLoggedIn && currentUser ? currentUser.phone || '' : ''));
  const [email, setEmail] = useState(() => (isLoggedIn && currentUser ? currentUser.email || '' : ''));
  const [address, setAddress] = useState(() => (isLoggedIn && currentUser ? currentUser.address || '' : ''));
  const [city, setCity] = useState<'Dhaka' | 'Outside Dhaka'>('Dhaka');
  const [area, setArea] = useState<string>('Dhanmondi');
  const [postalCode, setPostalCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Shipping Method State
  const [shippingMethod, setShippingMethod] = useState<'regular_dhaka' | 'regular_outside' | 'express_dhaka'>('regular_dhaka');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket' | 'sslcommerz'>('cod');

  // Touched state for onBlur inline validation
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Coupon State inside checkout
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponAsyncStatus, setCouponAsyncStatus] = useState<AsyncStatus>('idle');

  // Submission & Anti-Double Order State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatusText, setSubmissionStatusText] = useState('Securing & Placing Order...');

  // Simulated Mobile Banking / Gateway Modal
  const [isPaymentSimOpen, setIsPaymentSimOpen] = useState(false);
  const [simStep, setSimStep] = useState<'details' | 'otp' | 'pin' | 'verifying'>('details');
  const [simAccountNum, setSimAccountNum] = useState('');
  const [simOtp, setSimOtp] = useState('');
  const [simPin, setSimPin] = useState('');
  const [simError, setSimError] = useState('');

  // Synchronize when loggedIn user data changes
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      if (!fullName) setFullName(currentUser.name || '');
      if (!phone) setPhone(currentUser.phone || '');
      if (!email) setEmail(currentUser.email || '');
      if (!address) setAddress(currentUser.address || '');
    }
  }, [isLoggedIn, currentUser]);

  // Adjust shipping options when City changes
  useEffect(() => {
    if (city === 'Dhaka') {
      if (shippingMethod === 'regular_outside') {
        setShippingMethod('regular_dhaka');
      }
      if (!BANGLADESH_AREAS['Dhaka'].includes(area)) {
        setArea(BANGLADESH_AREAS['Dhaka'][0] || '');
      }
    } else {
      setShippingMethod('regular_outside');
      if (!BANGLADESH_AREAS['Outside Dhaka'].includes(area)) {
        setArea(BANGLADESH_AREAS['Outside Dhaka'][0] || '');
      }
    }
  }, [city]);

  // Pricing Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Discount Calculation
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

  // Shipping Cost calculation
  const isFreeDelivery = subtotal >= 5000;
  let baseShippingCost = 0;
  if (!isFreeDelivery) {
    if (shippingMethod === 'express_dhaka') baseShippingCost = 150;
    else if (shippingMethod === 'regular_outside') baseShippingCost = 130;
    else baseShippingCost = 80;
  } else {
    if (shippingMethod === 'express_dhaka') baseShippingCost = 70;
    else baseShippingCost = 0;
  }

  // 5% standard VAT (VAT Inclusive transparency)
  const vatRate = 0.05;
  const vatAmount = Math.round((subtotal - discount) * vatRate);

  const grandTotal = Math.max(0, subtotal - discount + baseShippingCost);

  // Real-time Field Validation Function
  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case 'fullName':
        if (!value.trim()) return 'Full Name is required.';
        if (value.trim().length < 3) return 'Full Name must be at least 3 characters.';
        return '';

      case 'phone': {
        const clean = value.replace(/\s+/g, '');
        if (!clean) return 'Mobile Phone Number is required.';
        const bdRegex = /^(01)[3-9]\d{8}$/;
        if (!bdRegex.test(clean)) {
          return 'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).';
        }
        return '';
      }

      case 'email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address.';
        }
        return '';

      case 'address':
        if (!value.trim()) return 'Delivery street address is required.';
        if (value.trim().length < 8) return 'Please provide full house/holding, road, and sector details.';
        return '';

      case 'area':
        if (!value.trim()) return 'Please select your area or thana.';
        return '';

      default:
        return '';
    }
  };

  // Perform full validation for Step 1
  const validateStep1 = (): boolean => {
    const newErrors: { [key: string]: string } = {
      fullName: validateField('fullName', fullName),
      phone: validateField('phone', phone),
      email: validateField('email', email),
      address: validateField('address', address),
      area: validateField('area', area)
    };

    const activeErrors: { [key: string]: string } = {};
    Object.keys(newErrors).forEach((key) => {
      if (newErrors[key]) activeErrors[key] = newErrors[key];
    });

    setErrors(activeErrors);
    setTouched({
      fullName: true,
      phone: true,
      email: true,
      address: true,
      area: true
    });

    return Object.keys(activeErrors).length === 0;
  };

  // Handle Blur Event for Inline Error Feedback
  const handleBlur = (fieldName: string, value: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const errorMsg = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
  };

  // Promo Code Validation inside checkout
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) {
      setCouponAsyncStatus('error');
      setCouponError('Please enter a promo code.');
      return;
    }

    setCouponAsyncStatus('loading');

    setTimeout(() => {
      const matched = coupons.find((c) => c.code.toUpperCase() === cleanCode);

      if (!matched) {
        setCouponAsyncStatus('error');
        setCouponError(`The promo code "${cleanCode}" is invalid. Please check the spelling.`);
        return;
      }

      if (!matched.isActive) {
        setCouponAsyncStatus('error');
        setCouponError(`The promo code "${cleanCode}" is currently disabled.`);
        return;
      }

      if (matched.expiresAt && new Date(matched.expiresAt).getTime() < Date.now()) {
        const expDate = new Date(matched.expiresAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        setCouponAsyncStatus('error');
        setCouponError(`The promo code "${cleanCode}" expired on ${expDate}.`);
        return;
      }

      if (matched.usageLimit && matched.usedCount >= matched.usageLimit) {
        setCouponAsyncStatus('error');
        setCouponError(`The promo code "${cleanCode}" has reached its maximum redemption limit.`);
        return;
      }

      if (subtotal < matched.minOrderValue) {
        setCouponAsyncStatus('error');
        setCouponError(
          `Minimum order value of ${formatPrice(matched.minOrderValue)} required to apply "${matched.code}". Add ${formatPrice(matched.minOrderValue - subtotal)} more to qualify.`
        );
        return;
      }

      onApplyCoupon(matched);
      setCouponAsyncStatus('success');
      setCouponSuccess(`Promo code "${matched.code}" applied successfully!`);
      setCouponInput('');
    }, 350);
  };

  // Navigation handlers
  const handleContinueToShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setActiveStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Order Placement Trigger
  const executeOrderPlacement = async (finalPaymentStatus: 'pending' | 'completed' = 'pending') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionStatusText('Authenticating & Generating Order Confirmation...');

    const cleanName = sanitizeUGC(fullName.trim());
    const cleanPhone = sanitizeUGC(phone.trim());
    const cleanEmail = email.trim() ? sanitizeUGC(email.trim()) : undefined;
    const cleanAddress = sanitizeUGC(address.trim());
    const cleanArea = sanitizeUGC(area.trim());
    const cleanPostal = postalCode.trim() ? sanitizeUGC(postalCode.trim()) : undefined;
    const cleanNotes = orderNotes.trim() ? sanitizeUGC(orderNotes.trim()) : undefined;

    const payload = {
      customer: {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail
      },
      shippingAddress: {
        address: cleanAddress,
        area: cleanArea,
        city,
        postalCode: cleanPostal
      },
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        size: item.selectedSize,
        color: item.selectedColor.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.images[0]?.url || 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop'
      })),
      shippingMethod,
      paymentMethod,
      paymentStatus: finalPaymentStatus,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      notes: cleanNotes
    };

    try {
      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.order) {
        onPlaceOrder(data.order);
        return;
      }

      if (data?.error) {
        setSubmissionStatusText(data.error);
      }
    } catch {
      // Fallback
    }

    const now = new Date();
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedOrderNumber = `VRS-${dateCode}-${randomSuffix}`;
    const generatedId = `ord-${Date.now().toString().slice(-6)}`;

    const fallbackOrder: Order = {
      id: generatedId,
      orderNumber: generatedOrderNumber,
      customer: {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail
      },
      shippingAddress: {
        address: cleanAddress,
        area: cleanArea,
        city,
        postalCode: cleanPostal
      },
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        size: item.selectedSize,
        color: item.selectedColor.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.images[0]?.url || 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop'
      })),
      pricing: {
        subtotal,
        shippingCost: baseShippingCost,
        discount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        total: grandTotal
      },
      shippingMethod,
      paymentMethod,
      paymentStatus: finalPaymentStatus,
      orderStatus: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note:
            paymentMethod === 'cod'
              ? 'Order placed with Cash on Delivery. Awaiting dispatch inspection.'
              : `Payment verified via ${paymentMethod.toUpperCase()}. Order confirmed for priority atelier tailoring.`
        }
      ],
      notes: cleanNotes,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      onPlaceOrder(fallbackOrder);
    }, 400);
  };

  // Step 3: Final Submit Click
  const handleFinalOrderSubmit = () => {
    if (isSubmitting) return;

    if (paymentMethod === 'cod') {
      executeOrderPlacement('pending');
    } else {
      setSimAccountNum(phone || '01700000000');
      setSimStep('details');
      setSimError('');
      setIsPaymentSimOpen(true);
    }
  };

  // Complete simulated digital payment
  const handleSimulatePaymentProcess = () => {
    if (simStep === 'details') {
      if (!simAccountNum || simAccountNum.length < 11) {
        setSimError('Please enter a valid 11-digit mobile wallet number.');
        return;
      }
      setSimError('');
      setSimStep('otp');
    } else if (simStep === 'otp') {
      if (!simOtp || simOtp.length < 4) {
        setSimError('Please enter the 4-digit verification code sent to your phone.');
        return;
      }
      setSimError('');
      setSimStep('pin');
    } else if (simStep === 'pin') {
      if (!simPin || simPin.length < 4) {
        setSimError('Please enter your security PIN.');
        return;
      }
      setSimError('');
      setSimStep('verifying');
      setTimeout(() => {
        setIsPaymentSimOpen(false);
        executeOrderPlacement('completed');
      }, 1800);
    }
  };

  return (
    <div id="checkout-root" className="w-full bg-[#FAF8F5] text-[#1F1B17] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 text-left">
        <SEO
          title="Secure Checkout | VIRSA Luxury Menswear"
          description="Complete your order for bespoke handcrafted traditional menswear."
          canonical="/checkout"
        />

        {/* Header & Brand Guarantee */}
        <div className="mb-8 border-b border-[#E8DFC8] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#8C6819] font-bold block">
              Virsa Haute Couture Atelier
            </span>
            <h1 className="font-serif text-3xl font-bold tracking-wider text-[#1F1B17] mt-1">
              Express Checkout
            </h1>
          </div>
          <div className="flex items-center space-x-2 text-xs font-sans text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg shadow-2xs">
            <Lock className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>256-Bit SSL Encrypted & Bank-Grade Security</span>
          </div>
        </div>

        {/* ================= MULTI-STEP PROGRESS INDICATOR ================= */}
        <div className="mb-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Background connector bar */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#E8DFC8] -z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] transition-all duration-500 -z-0"
              style={{ width: activeStep === 1 ? '0%' : activeStep === 2 ? '50%' : '100%' }}
            />

            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 ${
                  activeStep > 1
                    ? 'bg-[#C5A059] text-white ring-4 ring-[#C5A059]/20'
                    : activeStep === 1
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] ring-4 ring-[#C5A059]/30 shadow-xs'
                    : 'bg-white text-[#6E645A] border border-[#E8DFC8]'
                }`}
              >
                {activeStep > 1 ? <Check className="h-5 w-5 stroke-[3]" /> : '1'}
              </div>
              <span
                className={`text-xs font-sans mt-2 tracking-wider font-semibold ${
                  activeStep === 1 ? 'text-[#8C6819]' : 'text-[#6E645A]'
                }`}
              >
                Customer & Address
              </span>
            </button>

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setActiveStep(2);
              }}
              className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 ${
                  activeStep > 2
                    ? 'bg-[#C5A059] text-white ring-4 ring-[#C5A059]/20'
                    : activeStep === 2
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] ring-4 ring-[#C5A059]/30 shadow-xs'
                    : 'bg-white text-[#6E645A] border border-[#E8DFC8]'
                }`}
              >
                {activeStep > 2 ? <Check className="h-5 w-5 stroke-[3]" /> : '2'}
              </div>
              <span
                className={`text-xs font-sans mt-2 tracking-wider font-semibold ${
                  activeStep === 2 ? 'text-[#8C6819]' : 'text-[#6E645A]'
                }`}
              >
                Delivery Method
              </span>
            </button>

            {/* Step 3 Pill */}
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setActiveStep(3);
              }}
              className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 ${
                  activeStep === 3
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] ring-4 ring-[#C5A059]/30 shadow-xs'
                    : 'bg-white text-[#6E645A] border border-[#E8DFC8]'
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-sans mt-2 tracking-wider font-semibold ${
                  activeStep === 3 ? 'text-[#8C6819]' : 'text-[#6E645A]'
                }`}
              >
                Payment & Review
              </span>
            </button>
          </div>
        </div>

        {/* Main Grid: Left Steps (7 cols) | Right Live Summary (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ================= LEFT COLUMN: STEP FORMS ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Guest Checkout Indicator Banner */}
            {!isLoggedIn && (
              <div className="p-4 bg-white border border-[#E8DFC8] rounded-xl flex items-center justify-between text-xs text-[#5C5248] shadow-2xs">
                <div className="flex items-center space-x-2.5">
                  <User className="h-4 w-4 text-[#8C6819]" />
                  <span>
                    Checking out as <strong>Guest</strong>. No account required.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('homepage')}
                  className="text-[#8C6819] hover:underline font-semibold cursor-pointer"
                >
                  Sign in to auto-fill
                </button>
              </div>
            )}

            {/* ----------------- STEP 1: CUSTOMER & ADDRESS ----------------- */}
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-[#E8DFC8] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm"
              >
                <div className="border-b border-[#E8DFC8] pb-4">
                  <h2 className="font-serif text-xl font-bold text-[#1F1B17] flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#8C6819]" />
                    <span>1. Contact Details & Delivery Address</span>
                  </h2>
                  <p className="text-xs text-[#6E645A] mt-1 font-sans">
                    Please provide your exact address and mobile number for dispatch coordination.
                  </p>
                </div>

                <form onSubmit={handleContinueToShipping} noValidate className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-fullname" className="block text-xs font-sans font-bold text-[#1F1B17] uppercase tracking-wider">
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6E645A]" />
                      <input
                        id="checkout-fullname"
                        type="text"
                        placeholder="e.g. Asifur Rahman"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (touched.fullName) handleBlur('fullName', e.target.value);
                        }}
                        onBlur={(e) => handleBlur('fullName', e.target.value)}
                        aria-invalid={!!errors.fullName}
                        className={`w-full pl-10 pr-4 py-3 min-h-[44px] bg-[#FAF8F5] text-base sm:text-sm text-[#1F1B17] font-sans rounded-lg border focus:outline-none transition-colors ${
                          touched.fullName && errors.fullName
                            ? 'border-rose-500 focus:border-rose-500 bg-rose-50'
                            : 'border-[#E8DFC8] focus:border-[#C5A059]'
                        }`}
                      />
                    </div>
                    {touched.fullName && errors.fullName && (
                      <p className="text-[11px] text-rose-600 font-sans flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone Number & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label htmlFor="checkout-phone" className="block text-xs font-sans font-bold text-[#1F1B17] uppercase tracking-wider">
                        Mobile Phone (BD) <span className="text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6E645A]" />
                        <input
                          id="checkout-phone"
                          type="tel"
                          placeholder="01712345678"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (touched.phone) handleBlur('phone', e.target.value);
                          }}
                          onBlur={(e) => handleBlur('phone', e.target.value)}
                          aria-invalid={!!errors.phone}
                          className={`w-full pl-10 pr-4 py-3 min-h-[44px] bg-[#FAF8F5] text-base sm:text-sm text-[#1F1B17] font-mono rounded-lg border focus:outline-none transition-colors ${
                            touched.phone && errors.phone
                              ? 'border-rose-500 focus:border-rose-500 bg-rose-50'
                              : 'border-[#E8DFC8] focus:border-[#C5A059]'
                          }`}
                        />
                      </div>
                      {touched.phone && errors.phone && (
                        <p className="text-[11px] text-rose-600 font-sans flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="checkout-email" className="block text-xs font-sans font-bold text-[#1F1B17] uppercase tracking-wider">
                        Email Address <span className="text-[#9E948A] font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6E645A]" />
                        <input
                          id="checkout-email"
                          type="email"
                          placeholder="e.g. asif@virsa.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (touched.email) handleBlur('email', e.target.value);
                          }}
                          onBlur={(e) => handleBlur('email', e.target.value)}
                          aria-invalid={!!errors.email}
                          className={`w-full pl-10 pr-4 py-3 min-h-[44px] bg-[#FAF8F5] text-base sm:text-sm text-[#1F1B17] font-sans rounded-lg border focus:outline-none transition-colors ${
                            touched.email && errors.email
                              ? 'border-rose-500 focus:border-rose-500 bg-rose-50'
                              : 'border-[#E8DFC8] focus:border-[#C5A059]'
                          }`}
                        />
                      </div>
                      {touched.email && errors.email && (
                        <p className="text-[11px] text-rose-600 font-sans flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Zone (City) & Thana (Area) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* City Selection */}
                    <div className="space-y-1.5">
                      <label htmlFor="checkout-city" className="block text-xs font-sans font-bold text-[#1F1B17] uppercase tracking-wider">
                        Delivery Zone <span className="text-rose-600">*</span>
                      </label>
                      <select
                        id="checkout-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value as 'Dhaka' | 'Outside Dhaka')}
                        className="w-full px-4 py-3 min-h-[44px] bg-[#FAF8F5] text-base sm:text-sm text-[#1F1B17] font-sans rounded-lg border border-[#E8DFC8] focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="Dhaka">Inside Dhaka Metropolitan</option>
                        <option value="Outside Dhaka">Outside Dhaka (All 64 Districts)</option>
                      </select>
                    </div>

                    {/* Area / Thana Selection */}
                    <div className="space-y-1.5">
                      <label htmlFor="checkout-area" className="block text-xs font-sans font-bold text-[#1F1B17] uppercase tracking-wider">
                        Thana / Area <span className="text-rose-600">*</span>
                      </label>
                      <select
                        id="checkout-area"
                        value={area}
                        onChange={(e) => {
                          setArea(e.target.value);
                          if (touched.area) handleBlur('area', e.target.value);
                        }}
                        onBlur={(e) => handleBlur('area', e.target.value)}
                        className={`w-full px-4 py-3 min-h-[44px] bg-[#FAF8F5] text-base sm:text-sm text-[#1F1B17] font-sans rounded-lg border focus:outline-none transition-colors ${
                          touched.area && errors.area
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-[#E8DFC8] focus:border-[#C5A059]'
                        }`}
                      >
                        {BANGLADESH_AREAS[city].map((ar) => (
                          <option key={ar} value={ar}>
                            {ar}
                          </option>
                        ))}
                      </select>
                      {touched.area && errors.area && (
                        <p className="text-[11px] text-rose-600 font-sans flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{errors.area}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Street Address */}
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-address" className="block text-xs font-sans font-bold text-[#1F1B17] uppercase tracking-wider">
                      Full Physical Street Address <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      id="checkout-address"
                      rows={2}
                      placeholder="House / Holding Number, Road Number, Sector, Landmark"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (touched.address) handleBlur('address', e.target.value);
                      }}
                      onBlur={(e) => handleBlur('address', e.target.value)}
                      aria-invalid={!!errors.address}
                      className={`w-full px-4 py-2.5 min-h-[44px] bg-[#FAF8F5] text-base sm:text-sm text-[#1F1B17] font-sans rounded-lg border focus:outline-none transition-colors ${
                        touched.address && errors.address
                          ? 'border-rose-500 focus:border-rose-500 bg-rose-50'
                          : 'border-[#E8DFC8] focus:border-[#C5A059]'
                      }`}
                    />
                    {touched.address && errors.address && (
                      <p className="text-[11px] text-rose-600 font-sans flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Postal Code & Delivery Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="checkout-postal" className="block text-xs font-sans font-bold text-[#1F1B17] uppercase tracking-wider">
                        Postal Code <span className="text-[#9E948A] font-normal">(Optional)</span>
                      </label>
                      <input
                        id="checkout-postal"
                        type="text"
                        placeholder="e.g. 1205"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-4 py-3 min-h-[44px] bg-[#FAF8F5] text-base sm:text-sm text-[#1F1B17] font-mono rounded-lg border border-[#E8DFC8] focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label htmlFor="checkout-notes" className="block text-xs font-sans font-bold text-[#1F1B17] uppercase tracking-wider">
                        Special Delivery Instructions <span className="text-[#9E948A] font-normal">(Optional)</span>
                      </label>
                      <input
                        id="checkout-notes"
                        type="text"
                        placeholder="e.g. Call before arrival / Deliver after 4 PM"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full px-4 py-3 min-h-[44px] bg-[#FAF8F5] text-base sm:text-sm text-[#1F1B17] font-sans rounded-lg border border-[#E8DFC8] focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  {/* Continue Action */}
                  <div className="pt-4 border-t border-[#E8DFC8] flex justify-end">
                    <button
                      type="submit"
                      id="checkout-continue-step2-btn"
                      className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] font-bold text-xs font-sans tracking-widest uppercase rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                    >
                      <span>Proceed to Delivery Method</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ----------------- STEP 2: SHIPPING METHODS ----------------- */}
            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-[#E8DFC8] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm"
              >
                <div className="border-b border-[#E8DFC8] pb-4">
                  <h2 className="font-serif text-xl font-bold text-[#1F1B17] flex items-center gap-2">
                    <Truck className="h-5 w-5 text-[#8C6819]" />
                    <span>2. Select Shipping Method & Priority</span>
                  </h2>
                  <p className="text-xs text-[#6E645A] mt-1 font-sans">
                    All shipments are safely sealed in VIRSA's signature weather-proof royal garment carriers.
                  </p>
                </div>

                <form onSubmit={handleContinueToPayment} className="space-y-4">
                  {city === 'Dhaka' ? (
                    <>
                      {/* Regular Dhaka */}
                      <label
                        htmlFor="shipping-regular-dhaka"
                        className={`block p-4 rounded-xl border transition-all cursor-pointer ${
                          shippingMethod === 'regular_dhaka'
                            ? 'bg-[#FAF6ED] border-[#C5A059] ring-1 ring-[#C5A059]'
                            : 'bg-[#FAF8F5] border-[#E8DFC8] hover:border-[#C5A059]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              id="shipping-regular-dhaka"
                              type="radio"
                              name="shippingMethod"
                              checked={shippingMethod === 'regular_dhaka'}
                              onChange={() => setShippingMethod('regular_dhaka')}
                              className="accent-[#C5A059] h-4 w-4"
                            />
                            <div>
                              <span className="font-bold text-[#1F1B17] text-sm block">Standard Dhaka Delivery</span>
                              <span className="text-xs text-[#6E645A]">1 to 2 Business Days • RedX / Steadfast Express</span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-sm text-[#8C6819]">
                            {isFreeDelivery ? 'FREE' : formatPrice(80)}
                          </span>
                        </div>
                      </label>

                      {/* Express Next-Day Dhaka */}
                      <label
                        htmlFor="shipping-express-dhaka"
                        className={`block p-4 rounded-xl border transition-all cursor-pointer ${
                          shippingMethod === 'express_dhaka'
                            ? 'bg-[#FAF6ED] border-[#C5A059] ring-1 ring-[#C5A059]'
                            : 'bg-[#FAF8F5] border-[#E8DFC8] hover:border-[#C5A059]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              id="shipping-express-dhaka"
                              type="radio"
                              name="shippingMethod"
                              checked={shippingMethod === 'express_dhaka'}
                              onChange={() => setShippingMethod('express_dhaka')}
                              className="accent-[#C5A059] h-4 w-4"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#1F1B17] text-sm">Express Atelier Priority (Next-Day)</span>
                                <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded uppercase">
                                  Fast-Track
                                </span>
                              </div>
                              <span className="text-xs text-[#6E645A]">Guaranteed within 24 Hours • VIP Courier Dispatch</span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-sm text-[#8C6819]">
                            {isFreeDelivery ? formatPrice(70) : formatPrice(150)}
                          </span>
                        </div>
                      </label>
                    </>
                  ) : (
                    /* Outside Dhaka */
                    <label
                      htmlFor="shipping-regular-outside"
                      className="block p-4 rounded-xl border bg-[#FAF6ED] border-[#C5A059] ring-1 ring-[#C5A059]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            id="shipping-regular-outside"
                            type="radio"
                            name="shippingMethod"
                            checked={shippingMethod === 'regular_outside'}
                            onChange={() => setShippingMethod('regular_outside')}
                            className="accent-[#C5A059] h-4 w-4"
                          />
                          <div>
                            <span className="font-bold text-[#1F1B17] text-sm block">National Inter-District Transit</span>
                            <span className="text-xs text-[#6E645A]">3 to 5 Business Days • SA Paribahan / Sundarban Courier</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-sm text-[#8C6819]">
                          {isFreeDelivery ? 'FREE' : formatPrice(130)}
                        </span>
                      </div>
                    </label>
                  )}

                  {/* Recipient summary recap */}
                  <div className="p-4 bg-[#FAF8F5] border border-[#E8DFC8] rounded-lg text-xs text-[#5C5248] space-y-1">
                    <div className="text-[#6E645A] uppercase font-sans text-[10px] tracking-wider font-semibold">Dispatch Address:</div>
                    <div className="text-[#1F1B17] font-medium">{fullName} ({phone})</div>
                    <div className="text-[#6E645A]">{address}, {area}, {city}</div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-4 border-t border-[#E8DFC8] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="px-5 py-3 border border-[#E8DFC8] text-[#5C5248] hover:text-[#1F1B17] hover:border-[#C5A059] text-xs font-sans tracking-widest uppercase rounded-lg transition-colors flex items-center space-x-2 cursor-pointer bg-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Address</span>
                    </button>

                    <button
                      type="submit"
                      id="checkout-continue-step3-btn"
                      className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-bold text-xs font-sans tracking-widest uppercase rounded-lg hover:brightness-110 transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ----------------- STEP 3: PAYMENT & REVIEW ----------------- */}
            {activeStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-[#E8DFC8] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm"
              >
                <div className="border-b border-[#E8DFC8] pb-4">
                  <h2 className="font-serif text-xl font-bold text-[#1F1B17] flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#8C6819]" />
                    <span>3. Select Payment Method & Place Order</span>
                  </h2>
                  <p className="text-xs text-[#6E645A] mt-1 font-sans">
                    Choose Cash on Delivery upon inspection, or pay securely using Mobile Banking / Debit/Credit Cards.
                  </p>
                </div>

                {/* Payment Methods Selection */}
                <div className="space-y-3">
                  {/* 1. Cash on Delivery */}
                  <label
                    htmlFor="payment-cod"
                    className={`block p-4 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'bg-[#FAF6ED] border-[#C5A059] ring-1 ring-[#C5A059]'
                        : 'bg-[#FAF8F5] border-[#E8DFC8] hover:border-[#C5A059]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          id="payment-cod"
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="accent-[#C5A059] h-4 w-4"
                        />
                        <div>
                          <span className="font-bold text-[#1F1B17] text-sm block">Cash on Delivery (COD)</span>
                          <span className="text-xs text-[#6E645A]">
                            Inspect your luxury garments first, then pay the rider in cash.
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-[#8C6819] font-sans font-semibold">Recommended</span>
                    </div>
                  </label>

                  {/* 2. bKash */}
                  <label
                    htmlFor="payment-bkash"
                    className={`block p-4 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === 'bkash'
                        ? 'bg-[#FAF6ED] border-[#C5A059] ring-1 ring-[#C5A059]'
                        : 'bg-[#FAF8F5] border-[#E8DFC8] hover:border-[#C5A059]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          id="payment-bkash"
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'bkash'}
                          onChange={() => setPaymentMethod('bkash')}
                          className="accent-[#C5A059] h-4 w-4"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1F1B17] text-sm">bKash Direct Gateway</span>
                            <span className="text-[9px] bg-pink-100 text-pink-800 border border-pink-300 font-bold px-1.5 py-0.5 rounded uppercase">
                              Instant
                            </span>
                          </div>
                          <span className="text-xs text-[#6E645A]">Pay directly from your verified bKash wallet.</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-pink-700 font-bold">bKash</span>
                    </div>
                  </label>

                  {/* 3. Nagad */}
                  <label
                    htmlFor="payment-nagad"
                    className={`block p-4 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === 'nagad'
                        ? 'bg-[#FAF6ED] border-[#C5A059] ring-1 ring-[#C5A059]'
                        : 'bg-[#FAF8F5] border-[#E8DFC8] hover:border-[#C5A059]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          id="payment-nagad"
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'nagad'}
                          onChange={() => setPaymentMethod('nagad')}
                          className="accent-[#C5A059] h-4 w-4"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1F1B17] text-sm">Nagad Payment Gateway</span>
                            <span className="text-[9px] bg-orange-100 text-orange-800 border border-orange-300 font-bold px-1.5 py-0.5 rounded uppercase">
                              Instant
                            </span>
                          </div>
                          <span className="text-xs text-[#6E645A]">Pay using your Nagad account balance.</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-orange-700 font-bold">Nagad</span>
                    </div>
                  </label>

                  {/* 4. SSLCOMMERZ / Cards */}
                  <label
                    htmlFor="payment-sslcommerz"
                    className={`block p-4 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === 'sslcommerz'
                        ? 'bg-[#FAF6ED] border-[#C5A059] ring-1 ring-[#C5A059]'
                        : 'bg-[#FAF8F5] border-[#E8DFC8] hover:border-[#C5A059]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          id="payment-sslcommerz"
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'sslcommerz'}
                          onChange={() => setPaymentMethod('sslcommerz')}
                          className="accent-[#C5A059] h-4 w-4"
                        />
                        <div>
                          <span className="font-bold text-[#1F1B17] text-sm block">Credit / Debit Card / NetBanking</span>
                          <span className="text-xs text-[#6E645A]">Visa, MasterCard, Amex, City Bank, DBBL Nexus</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#8C6819] font-mono font-bold">SSLCOMMERZ</span>
                    </div>
                  </label>
                </div>

                {/* Order Placement Action */}
                <div className="pt-6 border-t border-[#E8DFC8] flex items-center justify-between gap-4">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setActiveStep(2)}
                    className="px-5 py-3 border border-[#E8DFC8] text-[#5C5248] hover:text-[#1F1B17] hover:border-[#C5A059] text-xs font-sans tracking-widest uppercase rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-40 cursor-pointer bg-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    id="checkout-final-place-order-btn"
                    disabled={isSubmitting}
                    onClick={handleFinalOrderSubmit}
                    className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-bold text-xs font-sans tracking-widest uppercase rounded-lg hover:brightness-110 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#1F1B17]" />
                        <span>{submissionStatusText}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>
                          {paymentMethod === 'cod'
                            ? `Place Atelier Order • ${formatPrice(grandTotal)}`
                            : `Authorize & Pay • ${formatPrice(grandTotal)}`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: LIVE ORDER SUMMARY ================= */}
          <div className="lg:col-span-5 bg-white border border-[#E8DFC8] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm sticky top-24">
            <div className="border-b border-[#E8DFC8] pb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#1F1B17] uppercase tracking-wider">
                Order Statement
              </h3>
              <span className="text-xs font-mono text-[#6E645A]">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
              </span>
            </div>

            {/* Garments List */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 no-scrollbar divide-y divide-[#E8DFC8]">
              {cart.map((item) => (
                <div key={item.sku} className="flex items-start space-x-3.5 pt-4 first:pt-0">
                  <img
                    src={item.product.images[0]?.url || 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop'}
                    alt={item.product.name}
                    className="w-14 h-16 object-cover rounded-lg border border-[#E8DFC8] shrink-0 bg-[#F5EFEB]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-xs font-bold text-[#1F1B17] truncate">{item.product.name}</h4>
                    <p className="text-[10px] text-[#6E645A] font-sans tracking-wide mt-0.5">
                      Size: {item.selectedSize} • {item.selectedColor.name} • Qty: {item.quantity}
                    </p>
                    <span className="text-xs font-mono font-bold text-[#8C6819] block mt-1">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input Inside Checkout */}
            <div className="pt-4 border-t border-[#E8DFC8] space-y-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6E645A]" />
                  <input
                    type="text"
                    placeholder="Promo Code (e.g. EID2026)"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      if (couponError) setCouponError('');
                    }}
                    className="w-full pl-8 pr-3 py-2 bg-[#FAF8F5] text-xs text-[#1F1B17] placeholder-[#9E948A] font-sans border border-[#E8DFC8] rounded-lg focus:outline-none focus:border-[#C5A059] uppercase tracking-wider"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponAsyncStatus === 'loading'}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-bold text-[11px] font-sans tracking-widest uppercase hover:brightness-110 transition-colors rounded-lg cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[70px] shadow-2xs"
                >
                  {couponAsyncStatus === 'loading' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </button>
              </form>

              {couponError && (
                <p className="text-[11px] text-rose-700 font-sans bg-rose-50 border border-rose-200 px-2.5 py-1 rounded">
                  {couponError}
                </p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-emerald-800 font-sans bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                  {couponSuccess}
                </p>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between bg-[#FAF6ED] border border-[#C5A059] px-3 py-1.5 rounded-lg">
                  <span className="flex items-center space-x-1.5 text-xs font-sans font-semibold text-[#8C6819]">
                    <span>Applied: <strong>{appliedCoupon.code}</strong></span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onApplyCoupon(null);
                      setCouponSuccess('');
                    }}
                    className="text-[#6E645A] hover:text-rose-600 p-0.5 cursor-pointer"
                    title="Remove promo code"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-[#E8DFC8] text-xs font-sans">
              <div className="flex justify-between text-[#5C5248]">
                <span>Garments Subtotal</span>
                <span className="font-mono text-[#1F1B17] font-medium">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promo Discount ({appliedCoupon?.code})</span>
                  <span className="font-mono">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#5C5248]">
                <span>Delivery Transport</span>
                <span className="font-mono">
                  {baseShippingCost === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    formatPrice(baseShippingCost)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-[#6E645A] text-[11px]">
                <span>VAT / Tax (5% Standard)</span>
                <span className="font-mono text-[#5C5248]">{formatPrice(vatAmount)} (Included)</span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#1F1B17] pt-3 border-t border-[#E8DFC8]">
                <span>Grand Total</span>
                <span className="font-mono text-xl text-[#8C6819]">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Delivery & Care Trust Badges */}
            <div className="pt-4 border-t border-[#E8DFC8] space-y-2 text-[11px] text-[#6E645A] font-sans">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-[#8C6819] shrink-0" />
                <span>Includes 7-Day Size Exchange Guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-[#8C6819] shrink-0" />
                <span>Complimentary signature wooden hanger & dust cover</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SIMULATED PAYMENT MODAL ================= */}
        <AnimatePresence>
          {isPaymentSimOpen && (
            <div className="fixed inset-0 bg-[#1F1B17]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md bg-white border border-[#E8DFC8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-left"
              >
                <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-4">
                  <div className="flex items-center space-x-2.5">
                    <Smartphone className="h-5 w-5 text-[#8C6819]" />
                    <span className="font-serif text-lg font-bold text-[#1F1B17] uppercase">
                      {paymentMethod.toUpperCase()} Secure Portal
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPaymentSimOpen(false)}
                    className="text-[#6E645A] hover:text-[#1F1B17] p-1 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {simStep === 'details' && (
                  <div className="space-y-4">
                    <p className="text-xs text-[#5C5248] leading-relaxed font-sans">
                      Enter your <strong>{paymentMethod.toUpperCase()}</strong> account number to initiate the secure payment of <strong className="text-[#8C6819] font-mono">{formatPrice(grandTotal)}</strong>.
                    </p>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1F1B17] uppercase">Account Mobile Number</label>
                      <input
                        type="tel"
                        value={simAccountNum}
                        onChange={(e) => setSimAccountNum(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8DFC8] rounded-lg text-[#1F1B17] font-mono text-sm focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    {simError && <p className="text-xs text-rose-600">{simError}</p>}
                    <button
                      type="button"
                      onClick={handleSimulatePaymentProcess}
                      className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-bold text-xs uppercase tracking-widest rounded-lg hover:brightness-110 transition-all cursor-pointer shadow-sm"
                    >
                      Send Verification OTP
                    </button>
                  </div>
                )}

                {simStep === 'otp' && (
                  <div className="space-y-4">
                    <p className="text-xs text-[#5C5248] leading-relaxed font-sans">
                      A 4-digit verification code was sent to <strong className="text-[#1F1B17] font-mono">{simAccountNum}</strong>. (For demo testing, enter <span className="font-mono text-[#8C6819] font-bold">1234</span>).
                    </p>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1F1B17] uppercase">Verification Code (OTP)</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={simOtp}
                        onChange={(e) => setSimOtp(e.target.value)}
                        placeholder="1234"
                        className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8DFC8] rounded-lg text-[#1F1B17] font-mono text-center tracking-[0.5em] text-lg focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    {simError && <p className="text-xs text-rose-600">{simError}</p>}
                    <button
                      type="button"
                      onClick={handleSimulatePaymentProcess}
                      className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-bold text-xs uppercase tracking-widest rounded-lg hover:brightness-110 transition-all cursor-pointer shadow-sm"
                    >
                      Verify Code
                    </button>
                  </div>
                )}

                {simStep === 'pin' && (
                  <div className="space-y-4">
                    <p className="text-xs text-[#5C5248] leading-relaxed font-sans">
                      Enter your secret wallet PIN to authorize the transaction of <strong className="text-[#8C6819] font-mono">{formatPrice(grandTotal)}</strong>.
                    </p>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1F1B17] uppercase">Wallet PIN</label>
                      <input
                        type="password"
                        maxLength={5}
                        value={simPin}
                        onChange={(e) => setSimPin(e.target.value)}
                        placeholder="•••••"
                        className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8DFC8] rounded-lg text-[#1F1B17] font-mono text-center tracking-[0.5em] text-lg focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    {simError && <p className="text-xs text-rose-600">{simError}</p>}
                    <button
                      type="button"
                      onClick={handleSimulatePaymentProcess}
                      className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-bold text-xs uppercase tracking-widest rounded-lg hover:brightness-110 transition-all cursor-pointer shadow-sm"
                    >
                      Confirm & Complete Payment
                    </button>
                  </div>
                )}

                {simStep === 'verifying' && (
                  <div className="py-8 text-center space-y-4">
                    <Loader2 className="h-10 w-10 text-[#8C6819] animate-spin mx-auto" />
                    <p className="text-sm font-serif text-[#1F1B17] font-semibold">
                      Authorizing with Bank Gateway...
                    </p>
                    <p className="text-xs text-[#6E645A]">Please do not close or refresh this window.</p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
