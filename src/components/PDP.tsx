/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Star,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  RefreshCcw,
  HelpCircle,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Heart,
  Bell,
  Sparkles,
  ShoppingBag,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ColorSwatch, AsyncStatus } from '../types';
import SizeGuideModal from './SizeGuideModal';
import { useWishlist } from '../lib/wishlist';
import SEO from './SEO';
import { getProductSchema, getBreadcrumbListSchema } from '../lib/seoSchemas';
import { formatPrice } from '../lib/formatters';
import { PDPSkeleton } from './Skeletons';
import { ErrorRetryCard } from './ErrorRetryCard';
import { sanitizeUGC } from '../lib/sanitize';

interface PDPProps {
  product: Product;
  allProducts?: Product[];
  onAddToCart: (product: Product, size: string, color: ColorSwatch, quantity: number) => void;
  onBuyNow: (product: Product, size: string, color: ColorSwatch, quantity: number) => void;
  onNavigate: (view: string, extra?: any) => void;
}

export default function PDP({
  product,
  allProducts = [],
  onAddToCart,
  onBuyNow,
  onNavigate
}: PDPProps) {
  if (!product) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4">
        <ErrorRetryCard
          title="Garment Not Found in Archive"
          message="The requested luxury piece is no longer accessible or may have been relocated."
          onSecondaryAction={() => onNavigate('category', { category: 'all' })}
          secondaryActionLabel="Explore All Collections"
        />
      </div>
    );
  }

  const { toggle: toggleWishlist, has: isWishlisted } = useWishlist();

  // 1. GALLERY STATE & ZOOM & SWIPE
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Touch coordinates for mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // 2. VARIANT SELECTION (SIZE & COLOR)
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<ColorSwatch>({ name: '', hex: '' });

  // 3. QUANTITY STATE
  const [quantity, setQuantity] = useState<number>(1);

  // 4. ACCORDIONS & MODALS
  const [openAccordion, setOpenAccordion] = useState<string>('description');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // 5. ASYNC ACTION STATES
  const [addToCartStatus, setAddToCartStatus] = useState<AsyncStatus>('idle');
  const [addToCartError, setAddToCartError] = useState<string | null>(null);
  const [buyNowStatus, setBuyNowStatus] = useState<AsyncStatus>('idle');
  const [notifyStatus, setNotifyStatus] = useState<AsyncStatus>('idle');
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [sizeValidationError, setSizeValidationError] = useState<string | null>(null);

  // 6. RESTOCK NOTIFICATION MODAL / INLINE STATE
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  // 7. DYNAMIC REVIEWS & UGC SANITIZATION
  const [reviewsList, setReviewsList] = useState<any[]>(() => product.reviews || []);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // 8. SERVER-SIDE GEMINI LUXURY STYLIST CONCIERGE
  const [isStylistModalOpen, setIsStylistModalOpen] = useState(false);
  const [stylistOccasion, setStylistOccasion] = useState('Eid Celebration');
  const [stylistPrompt, setStylistPrompt] = useState('');
  const [stylistLoading, setStylistLoading] = useState(false);
  const [stylistAdvice, setStylistAdvice] = useState<string | null>(null);
  const [stylistError, setStylistError] = useState<string | null>(null);

  useEffect(() => {
    setReviewsList(product.reviews || []);
    setStylistAdvice(null);
    setStylistError(null);
  }, [product]);

  // Handle Review Submission via Server API
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    const cleanAuthor = sanitizeUGC(reviewAuthor);
    const cleanComment = sanitizeUGC(reviewComment);

    if (cleanAuthor.length < 2 || cleanAuthor.length > 80) {
      setReviewError('Please provide your name (2-80 characters).');
      return;
    }

    if (cleanComment.length < 5 || cleanComment.length > 1000) {
      setReviewError('Review comment must be between 5 and 1,000 characters.');
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          author: cleanAuthor,
          rating: reviewRating,
          comment: cleanComment,
          verified: true
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setReviewError(data?.error || 'Unable to publish review at this time. Please try again.');
        setReviewSubmitting(false);
        return;
      }

      setReviewsList((prev) => [data.review, ...prev]);
      setReviewSuccess('Your verified collector review has been published.');
      setReviewAuthor('');
      setReviewComment('');
      setIsWritingReview(false);
    } catch {
      setReviewError('Unable to connect to the atelier service. Please try again shortly.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Handle Server-Side Gemini AI Stylist Inquiry
  const handleRequestStyling = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStylistLoading(true);
    setStylistError(null);

    try {
      const res = await fetch('/api/ai/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          occasion: stylistOccasion,
          prompt: sanitizeUGC(stylistPrompt)
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setStylistError(data?.error || 'Styling recommendations unavailable. Please try again.');
        setStylistLoading(false);
        return;
      }

      setStylistAdvice(
        data.advice ||
          'For a regal look, pair with our crisp Aligarhi Pajama and handcrafted leather Nagra footwear.'
      );
    } catch {
      setStylistError('Our Master Stylist concierge is currently curating looks. Please try again shortly.');
    } finally {
      setStylistLoading(false);
    }
  };

  // Sticky mobile CTA bar visibility
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  // Derive unique colors and unique sizes from product variants
  const uniqueColors = useMemo(() => {
    const list: ColorSwatch[] = [];
    product.variants.forEach((v) => {
      if (!list.some((c) => c.name === v.color.name)) {
        list.push(v.color);
      }
    });
    return list;
  }, [product]);

  const uniqueSizes = useMemo(() => {
    const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
    return sizes.sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [product]);

  // Initial selection when product changes
  useEffect(() => {
    if (product && product.variants.length > 0) {
      const firstInStock = product.variants.find((v) => v.stock > 0) || product.variants[0];
      setSelectedSize(firstInStock.size);
      setSelectedColor(firstInStock.color);
    }
    setActiveImgIndex(0);
    setQuantity(1);
    setIsNotifyModalOpen(false);
    setNotifySuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  // Determine current active variant & its stock
  const currentVariant = useMemo(() => {
    return product.variants.find(
      (v) => v.size === selectedSize && v.color.name === selectedColor.name
    );
  }, [product, selectedSize, selectedColor]);

  const currentVariantStock = currentVariant ? currentVariant.stock : 0;
  const isOutOfStock = currentVariantStock === 0;
  const isLowStock = currentVariantStock > 0 && currentVariantStock <= 5;

  // Bound quantity whenever variant or stock changes
  useEffect(() => {
    if (isOutOfStock) {
      setQuantity(0);
    } else {
      setQuantity((prev) => {
        if (prev < 1) return 1;
        if (prev > currentVariantStock) return currentVariantStock;
        return prev;
      });
    }
  }, [currentVariantStock, isOutOfStock]);

  // Monitor scroll for mobile sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (!buyBoxRef.current) return;
      const rect = buyBoxRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Desktop Zoom Mouse Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  // Mobile Swipe Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      setActiveImgIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
    } else if (distance < -minSwipeDistance) {
      setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Add to Cart
  const handleAddToCart = () => {
    setSizeValidationError(null);
    setAddToCartError(null);

    if (!selectedSize) {
      setSizeValidationError('Please select a garment size before adding to your bag.');
      return;
    }
    if (isOutOfStock) {
      setIsNotifyModalOpen(true);
      return;
    }

    setAddToCartStatus('loading');
    setTimeout(() => {
      try {
        onAddToCart(product, selectedSize, selectedColor, quantity);
        setAddToCartStatus('success');
        setTimeout(() => setAddToCartStatus('idle'), 2500);
      } catch (err) {
        setAddToCartStatus('error');
        setAddToCartError('Could not add garment to bag. Please retry.');
      }
    }, 300);
  };

  // Buy Now
  const handleBuyNow = () => {
    setSizeValidationError(null);
    if (!selectedSize) {
      setSizeValidationError('Please select a garment size to proceed with express checkout.');
      return;
    }
    if (isOutOfStock) {
      setIsNotifyModalOpen(true);
      return;
    }

    setBuyNowStatus('loading');
    setTimeout(() => {
      try {
        onBuyNow(product, selectedSize, selectedColor, quantity);
        setBuyNowStatus('success');
      } catch (err) {
        setBuyNowStatus('idle');
      }
    }, 300);
  };

  // Handle Notify Me
  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim()) return;

    setNotifyStatus('loading');
    setNotifyError(null);

    setTimeout(() => {
      try {
        const savedRequests = JSON.parse(localStorage.getItem('virsa_restock_alerts') || '[]');
        savedRequests.push({
          productId: product.id,
          productName: product.name,
          size: selectedSize,
          color: selectedColor.name,
          email: notifyEmail.trim(),
          date: new Date().toISOString()
        });
        localStorage.setItem('virsa_restock_alerts', JSON.stringify(savedRequests));

        setNotifyStatus('success');
        setNotifySuccess(true);
        setTimeout(() => {
          setIsNotifyModalOpen(false);
          setNotifySuccess(false);
          setNotifyStatus('idle');
          setNotifyEmail('');
        }, 2200);
      } catch (err) {
        setNotifyStatus('error');
        setNotifyError('Failed to register restock subscription. Please try again.');
      }
    }, 400);
  };

  // Related Products Calculation
  const relatedProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    const sameCategory = allProducts.filter(
      (p) => p.id !== product.id && p.category === product.category
    );

    const complementary = allProducts.filter(
      (p) => p.id !== product.id && p.category !== product.category
    );

    const combined = [...sameCategory, ...complementary];
    return combined.slice(0, 4);
  }, [allProducts, product]);

  // Delivery Estimate Date Helper
  const getEstimatedDates = () => {
    const today = new Date();
    const dhakaMin = new Date(today);
    dhakaMin.setDate(today.getDate() + 1);
    const dhakaMax = new Date(today);
    dhakaMax.setDate(today.getDate() + 2);

    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return {
      dhaka: `${dhakaMin.toLocaleDateString('en-US', options)} - ${dhakaMax.toLocaleDateString('en-US', options)}`,
      outside: `Within 3-5 business days`
    };
  };

  const deliveryDates = getEstimatedDates();

  // SEO & Breadcrumbs
  const primaryImage = product.images[0]?.url || 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop';
  const categoryCapitalized = product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : 'Collection';
  const shortDescription = `${product.name} - ${product.description.slice(0, 130).trim()}... Handcrafted luxury menswear by VIRSA. Price: ৳${product.price.toLocaleString()} BDT.`;
  const canonicalPath = `/product/${product.slug || product.id}`;

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: categoryCapitalized, path: `/category/${product.category}` },
    { name: product.name, path: canonicalPath }
  ];

  return (
    <div id="pdp-root" className="w-full bg-[#FAF8F5] text-[#1F1B17] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 md:pb-16 text-left">
        <SEO
          title={`${product.name} | VIRSA Luxury Menswear`}
          description={shortDescription}
          canonical={canonicalPath}
          ogType="product"
          ogImage={primaryImage}
          ogImageAlt={product.images[0]?.alt || product.name}
          structuredData={[
            getProductSchema(product, canonicalPath),
            getBreadcrumbListSchema(breadcrumbs)
          ]}
        />

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-sans tracking-widest uppercase text-[#6E645A] mb-8">
          <button
            onClick={() => onNavigate('homepage')}
            className="hover:text-[#8C6819] transition-colors cursor-pointer"
          >
            Home
          </button>
          <span className="text-[#D1C7B7]">/</span>
          <button
            onClick={() => onNavigate('category', { category: product.category })}
            className="hover:text-[#8C6819] transition-colors cursor-pointer"
          >
            {categoryCapitalized}
          </button>
          <span className="text-[#D1C7B7]">/</span>
          <span className="text-[#1F1B17] font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Grid: Gallery Left (7 Cols) | Product Info Right (5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* ================= LEFT COLUMN: IMAGE GALLERY ================= */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            
            {/* Thumbnails strip */}
            <div className="flex md:flex-col flex-row gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 justify-start md:w-24 shrink-0 no-scrollbar">
              {product.images.map((img, idx) => {
                const isActive = activeImgIndex === idx;
                return (
                  <button
                    key={idx}
                    id={`pdp-thumb-${idx}`}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 bg-[#F5EFEB] rounded-md overflow-hidden border transition-all duration-200 shrink-0 cursor-pointer ${
                      isActive
                        ? 'border-[#C5A059] ring-2 ring-[#C5A059]/40 shadow-xs scale-[1.02]'
                        : 'border-[#E8DFC8] hover:border-[#C5A059] opacity-80 hover:opacity-100'
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `${product.name} angle ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-[#C5A059]/10 pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Primary Viewable Image (With Desktop Lens Zoom & Mobile Touch Swipe) */}
            <div className="flex-1 relative">
              <div
                id="pdp-primary-img"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative aspect-[3/4] bg-[#F5EFEB] overflow-hidden border border-[#E8DFC8] rounded-xl cursor-crosshair select-none shadow-md group"
              >
                {/* Primary Image */}
                <img
                  src={product.images[activeImgIndex]?.url || primaryImage}
                  alt={product.images[activeImgIndex]?.alt || product.name}
                  className={`w-full h-full object-cover object-center transition-transform duration-100 ease-out ${
                    isZoomed ? 'scale-[2.2]' : 'scale-100'
                  }`}
                  style={
                    isZoomed
                      ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                      : undefined
                  }
                  referrerPolicy="no-referrer"
                />

                {/* Zoom Instruction Badge for Desktop */}
                <div
                  className={`hidden md:flex items-center gap-1.5 absolute bottom-3 right-3 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-[#1F1B17] font-sans border border-[#E8DFC8] pointer-events-none transition-opacity duration-300 shadow-2xs ${
                    isZoomed ? 'opacity-0' : 'opacity-90 group-hover:opacity-100'
                  }`}
                >
                  <ZoomIn className="h-3 w-3 text-[#8C6819]" />
                  <span>Hover to zoom (2.2x)</span>
                </div>

                {/* Mobile Carousel Navigation Arrows */}
                <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none md:hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
                    }}
                    className="h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8DFC8] flex items-center justify-center shadow pointer-events-auto hover:bg-white text-[#1F1B17] transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 text-[#1F1B17]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
                    }}
                    className="h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8DFC8] flex items-center justify-center shadow pointer-events-auto hover:bg-white text-[#1F1B17] transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 text-[#1F1B17]" />
                  </button>
                </div>

                {/* Mobile Dot Indicators */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5 md:hidden pointer-events-none">
                  {product.images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeImgIndex === idx ? 'w-6 bg-[#C5A059]' : 'w-1.5 bg-black/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Wishlist Button on Primary Image */}
                <button
                  id="pdp-top-wishlist-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 z-10 shadow-xs cursor-pointer ${
                    isWishlisted(product.id)
                      ? 'bg-rose-50 border-rose-300 text-rose-500'
                      : 'bg-white/90 border-[#E8DFC8] text-[#1F1B17] hover:border-[#C5A059] hover:text-[#8C6819]'
                  }`}
                  title={isWishlisted(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isWishlisted(product.id) ? 'fill-rose-500 text-rose-500 scale-110' : ''
                    }`}
                  />
                </button>

              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: PRODUCT CONFIG & BUY BOX ================= */}
          <div ref={buyBoxRef} className="lg:col-span-5 space-y-6">
            
            {/* Tag & Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#FBF8F1] border border-[#854D0E]/30 text-[#854D0E] text-[10px] font-sans font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="h-2.5 w-2.5 text-[#854D0E]" />
                  {product.category} Collection
                </span>
                <span className="text-[11px] font-mono text-[#52525B]">
                  SKU: {currentVariant ? currentVariant.sku : product.sku}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-[#18181B] leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Reviews Rating & Social Proof */}
            <div className="flex items-center space-x-4 border-b border-[#E2D9C5] pb-4">
              <div className="flex items-center space-x-1.5">
                <div className="flex text-[#D97706]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.ratings.average)
                          ? 'fill-[#D97706]'
                          : i < product.ratings.average
                          ? 'fill-[#D97706]/50'
                          : 'text-[#D1D5DB]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-[#18181B] pl-1">
                  {product.ratings.average.toFixed(1)}
                </span>
              </div>
              <span className="text-[#D1D5DB]">•</span>
              <button
                onClick={() => {
                  setOpenAccordion('reviews');
                  document.getElementById('accordion-reviews')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-sans text-[#3F3F46] hover:text-[#854D0E] font-semibold underline cursor-pointer"
              >
                {product.ratings.count} Verified Atelier Reviews
              </button>
            </div>

            {/* Pricing & Savings */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-[#854D0E] font-mono tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg text-[#6B7280] line-through font-mono">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span className="bg-[#DC2626] text-white text-[11px] font-bold font-mono px-2.5 py-0.5 rounded tracking-wider shadow-2xs">
                    SAVE {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status Indicator Badge */}
            <div className="py-2">
              {isOutOfStock ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-sans font-semibold">
                  <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
                  <span>Out of Stock in Size {selectedSize} ({selectedColor.name})</span>
                </div>
              ) : isLowStock ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs font-sans font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-700 animate-bounce" />
                  <span>Only {currentVariantStock} left in stock — Order soon!</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-sans font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span>In Stock — Dispatches within 24 hours</span>
                </div>
              )}
            </div>

            {/* 1. COLOR SELECTION SWATCHES */}
            <div className="space-y-2.5 pt-2 border-t border-[#E2D9C5]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold tracking-wider text-[#18181B] uppercase">
                  Color Palette: <span className="font-semibold text-[#854D0E]">{selectedColor.name}</span>
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-3">
                {uniqueColors.map((col) => {
                  const active = selectedColor.name === col.name;
                  const variantForSize = product.variants.find(
                    (v) => v.color.name === col.name && v.size === selectedSize
                  );
                  const hasStockInCurrentSize = variantForSize ? variantForSize.stock > 0 : false;
                  const totalColorStock = product.variants
                    .filter((v) => v.color.name === col.name)
                    .reduce((sum, v) => sum + v.stock, 0);

                  return (
                    <button
                      key={col.name}
                      id={`color-swatch-${col.name.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setSelectedColor(col)}
                      className={`group relative h-11 w-11 min-h-[44px] min-w-[44px] rounded-full border-2 transition-all duration-200 flex items-center justify-center cursor-pointer ${
                        active
                          ? 'border-[#854D0E] ring-2 ring-[#854D0E] ring-offset-2 ring-offset-white scale-110 shadow-xs'
                          : 'border-[#D1D5DB] hover:scale-105'
                      } ${totalColorStock === 0 ? 'opacity-40 cursor-pointer' : ''}`}
                      style={{ backgroundColor: col.hex }}
                      title={`${col.name} ${!hasStockInCurrentSize ? '(Out of stock in current size)' : ''}`}
                      aria-label={`Select color ${col.name}`}
                    >
                      {active ? (
                        <Check
                          className={`h-4 w-4 ${
                            col.hex === '#F9F6F0' || col.hex === '#FFFFF0' ? 'text-[#18181B]' : 'text-white'
                          }`}
                        />
                      ) : (
                        !hasStockInCurrentSize && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-rose-600 rounded-full border border-white" title="Out of stock in selected size" />
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. SIZES SELECTION PILLS */}
            <div className="space-y-2.5 pt-2 border-t border-[#E2D9C5]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold tracking-wider text-[#18181B] uppercase">
                  Size Selection:{' '}
                  <span className="font-mono font-bold text-[#854D0E]">
                    {selectedSize || 'None Selected'}
                  </span>
                </span>
                
                {/* SIZE GUIDE TRIGGER */}
                <button
                  id="size-guide-trigger-btn"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="flex items-center space-x-1.5 min-h-[44px] py-1 text-xs text-[#854D0E] hover:text-[#18181B] transition-colors cursor-pointer group"
                >
                  <Ruler className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                  <span className="underline decoration-[#854D0E] group-hover:decoration-[#18181B] font-bold">
                    Atelier Size Guide & Fit
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {uniqueSizes.map((sz) => {
                  const variant = product.variants.find(
                    (v) => v.size === sz && v.color.name === selectedColor.name
                  );
                  const hasStock = variant ? variant.stock > 0 : false;
                  const active = selectedSize === sz;

                  return (
                    <button
                      key={sz}
                      id={`size-pill-${sz}`}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-h-[44px] px-2 text-xs font-mono font-bold rounded-lg border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden cursor-pointer ${
                        active
                          ? hasStock
                            ? 'bg-gradient-to-r from-[#DFB847] via-[#E6C65E] to-[#C99E32] text-[#18181B] border-[#854D0E] shadow-xs'
                            : 'bg-rose-50 text-rose-800 border-rose-400'
                          : hasStock
                          ? 'bg-white text-[#18181B] border-[#E2D9C5] hover:border-[#854D0E] hover:bg-[#FBF8F1]'
                          : 'bg-[#F4EFE6] text-[#6B7280] border-[#E2D9C5] hover:border-rose-400'
                      }`}
                      title={
                        !hasStock
                          ? `Size ${sz} is currently out of stock. Click to request restock notification.`
                          : `Size ${sz} (${variant?.stock} available)`
                      }
                      aria-label={`Select size ${sz}`}
                    >
                      <span>{sz}</span>
                      {!hasStock && (
                        <span className="text-[8px] font-sans text-rose-700 leading-none font-bold">
                          Sold Out
                        </span>
                      )}
                      {!hasStock && (
                        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(45deg,transparent_45%,#ef4444_49%,#ef4444_51%,transparent_55%)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. QUANTITY SELECTOR */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E2D9C5]">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-sans font-bold tracking-wider text-[#18181B] uppercase">
                  Quantity:
                </span>
                <div className="flex items-center border-2 border-[#E2D9C5] rounded-lg bg-white shadow-2xs">
                  <button
                    id="qty-decrement-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-[#FBF8F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#18181B] cursor-pointer font-bold"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-3 text-sm font-mono font-bold text-[#18181B] min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    id="qty-increment-btn"
                    onClick={() => setQuantity((q) => Math.min(currentVariantStock, q + 1))}
                    disabled={quantity >= currentVariantStock || isOutOfStock}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-[#FBF8F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#18181B] cursor-pointer font-bold"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!isOutOfStock && (
                <span className="text-[11px] font-mono text-[#52525B]">
                  Max Available: <strong className="text-[#18181B] font-bold">{currentVariantStock}</strong>
                </span>
              )}
            </div>

            {/* 4. PRIMARY ACTIONS (Add to Cart / Buy Now / Out of Stock Notify Me) */}
            <div className="space-y-3 pt-2">
              {/* Size Validation Inline Notice */}
              {sizeValidationError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border-2 border-amber-400 text-amber-900 text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-between shadow-2xs font-medium"
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>{sizeValidationError}</span>
                  </div>
                  <button
                    onClick={() => setSizeValidationError(null)}
                    className="text-amber-900 hover:text-black text-xs ml-2 font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </motion.div>
              )}

              {addToCartError && (
                <div className="bg-rose-50 border-2 border-rose-400 text-rose-900 text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-between font-medium">
                  <span>{addToCartError}</span>
                  <button
                    onClick={handleAddToCart}
                    className="text-[#854D0E] hover:underline font-bold uppercase text-[11px] cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {isOutOfStock ? (
                /* OUT OF STOCK: DISABLE ADD TO CART & OFFER NOTIFY ME */
                <div className="space-y-3">
                  <button
                    id="pdp-notify-me-btn"
                    onClick={() => setIsNotifyModalOpen(true)}
                    disabled={notifyStatus === 'loading'}
                    className="w-full py-4 bg-gradient-to-r from-[#DFB847] via-[#E6C65E] to-[#C99E32] text-[#18181B] text-xs font-sans font-bold tracking-widest uppercase hover:brightness-105 transition-all duration-300 rounded-lg shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 border-2 border-[#854D0E]"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notify Me When Size {selectedSize || 'Selected'} Is Restocked</span>
                  </button>

                  <div className="flex gap-3">
                    <button
                      disabled
                      className="flex-grow py-4 bg-[#F4EFE6] border border-[#E2D9C5] text-[#6B7280] text-xs font-sans font-bold tracking-widest uppercase rounded-lg cursor-not-allowed"
                    >
                      Add to Cart (Unavailable)
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`px-5 py-4 border rounded-lg transition-all duration-300 flex items-center justify-center cursor-pointer ${
                        isWishlisted(product.id)
                          ? 'bg-rose-50 border-rose-300 text-rose-500'
                          : 'bg-white border-[#E2D9C5] text-[#18181B] hover:border-[#854D0E]'
                      }`}
                      title={isWishlisted(product.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}
                    >
                      <Heart
                        className={`h-4.5 w-4.5 ${
                          isWishlisted(product.id) ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ) : (
                /* IN STOCK: BUY MASTERPIECE NOW (PROMINENT HERO) & ADD TO CART (COMPACT) */
                <div className="space-y-2.5">
                  {/* HERO CTA: BUY NOW (Large & Highlighted with Razor-Sharp Contrast) */}
                  <button
                    id="pdp-buy-now-btn"
                    onClick={handleBuyNow}
                    disabled={buyNowStatus === 'loading'}
                    className="w-full py-4 sm:py-4.5 bg-gradient-to-r from-[#DFB847] via-[#E6C65E] to-[#C99E32] hover:brightness-105 active:scale-[0.99] text-[#18181B] text-sm sm:text-base font-serif font-extrabold tracking-[0.16em] uppercase transition-all duration-300 rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2.5 shadow-md shadow-[#D4AF37]/30 border-2 border-[#854D0E]"
                  >
                    {buyNowStatus === 'loading' ? (
                      <>
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                        <span>Initiating Express Checkout...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4.5 w-4.5 text-[#18181B]" />
                        <span>Buy Masterpiece Now</span>
                      </>
                    )}
                  </button>

                  {/* SECONDARY ROW: ADD TO CART (Smaller) & WISHLIST */}
                  <div className="flex gap-2.5">
                    <button
                      id="pdp-add-to-cart-btn"
                      onClick={handleAddToCart}
                      disabled={addToCartStatus === 'loading'}
                      className={`flex-grow py-2.5 px-3.5 text-xs font-sans font-bold tracking-wider uppercase transition-all duration-200 rounded-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75 border-2 ${
                        addToCartStatus === 'success'
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : addToCartStatus === 'error'
                          ? 'bg-rose-700 border-rose-700 text-white'
                          : 'bg-white hover:bg-[#FBF8F1] border-[#854D0E] text-[#854D0E] hover:text-[#78350F] hover:border-[#78350F] shadow-2xs'
                      }`}
                    >
                      {addToCartStatus === 'loading' ? (
                        <>
                          <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                          <span>Adding to Bag...</span>
                        </>
                      ) : addToCartStatus === 'success' ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                          <span>Added to Atelier Bag!</span>
                        </>
                      ) : addToCartStatus === 'error' ? (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-300" />
                          <span>Retry Adding</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5 text-[#854D0E]" />
                          <span>Add to Atelier Bag</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`px-4 py-2.5 border-2 rounded-lg transition-all duration-300 flex items-center justify-center cursor-pointer ${
                        isWishlisted(product.id)
                          ? 'bg-rose-50 border-rose-300 text-rose-500'
                          : 'bg-white border-[#E2D9C5] text-[#3F3F46] hover:border-[#854D0E] hover:text-[#854D0E]'
                      }`}
                      title={isWishlisted(product.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}
                    >
                      <Heart
                        className={`h-4 w-4 transition-all duration-300 ${
                          isWishlisted(product.id)
                            ? 'fill-rose-500 text-rose-500 scale-110'
                            : 'text-[#3F3F46] hover:scale-110'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 5. COMPACT ATELIER ASSURANCE & DELIVERY ESTIMATE */}
            <div className="p-4 bg-white border border-[#E2D9C5] rounded-xl space-y-3 text-xs text-[#27272A] font-sans shadow-2xs">
              
              {/* Delivery Estimate */}
              <div className="flex items-start space-x-3">
                <Truck className="h-4 w-4 text-[#854D0E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#18181B] block">
                    Estimated Delivery: {deliveryDates.dhaka} (Dhaka)
                  </span>
                  <span className="text-[11px] text-[#3F3F46] font-medium">
                    Dhaka City ৳60 (1-2 days) • Outside Dhaka ৳120 (3-5 days) • Free above ৳5,000
                  </span>
                </div>
              </div>

              {/* Return Policy */}
              <div className="flex items-start space-x-3 pt-2 border-t border-[#E2D9C5]">
                <RefreshCcw className="h-4 w-4 text-[#854D0E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#18181B] block">
                    7-Day Atelier Return & Size Exchange
                  </span>
                  <span className="text-[11px] text-[#3F3F46] font-medium">
                    Hassle-free exchanges at any Dhaka flagship or via easy home courier pickup.
                  </span>
                </div>
              </div>

              {/* Fabric Authenticity */}
              <div className="flex items-start space-x-3 pt-2 border-t border-[#E2D9C5]">
                <ShieldCheck className="h-4 w-4 text-[#854D0E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#18181B] block">
                    100% Certified Raw Luxury Fabrics
                  </span>
                  <span className="text-[11px] text-[#3F3F46] font-medium">
                    Includes signature VIRSA wooden hanger box and protective garment carrier.
                  </span>
                </div>
              </div>

            </div>

            {/* AI STYLIST CONCIERGE TRIGGER */}
            <div className="p-4 bg-[#FBF8F1] border border-[#854D0E]/30 rounded-xl flex items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-white border border-[#854D0E] flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="h-4 w-4 text-[#854D0E]" />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#18181B] tracking-wide">
                    Bespoke AI Styling Advisor
                  </h4>
                  <p className="text-[11px] text-[#3F3F46] font-sans font-medium">
                    Get personalized occasion pairing & footwear guidance for this piece.
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="pdp-ai-stylist-trigger-btn"
                onClick={() => {
                  setIsStylistModalOpen(true);
                  if (!stylistAdvice) handleRequestStyling();
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-[#DFB847] to-[#C99E32] hover:brightness-105 text-[#18181B] font-bold text-[10px] font-sans tracking-widest uppercase rounded-lg transition-all shrink-0 cursor-pointer shadow-xs border border-[#854D0E]"
              >
                Consult Stylist
              </button>
            </div>

            {/* 6. EXPANDABLE ACCORDION TABS */}
            <div className="pt-4 border-t border-[#E2D9C5] space-y-3">
              
              {/* Description Tab */}
              <div className="border border-[#E2D9C5] rounded-lg bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'description' ? '' : 'description')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-[#FBF8F1] transition-colors cursor-pointer"
                >
                  <span className="text-xs font-serif tracking-wider uppercase font-bold text-[#18181B]">
                    Atelier Narrative & Cut Details
                  </span>
                  <span className="text-[#854D0E] font-mono font-bold">{openAccordion === 'description' ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {openAccordion === 'description' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-[#27272A] leading-relaxed font-sans space-y-3 border-t border-[#E2D9C5]">
                        <p>{product.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-[#3F3F46] pt-2 border-t border-[#E2D9C5]">
                          <div>
                            <span className="text-[#18181B] font-bold">Category:</span> {categoryCapitalized}
                          </div>
                          <div>
                            <span className="text-[#18181B] font-bold">Selected SKU:</span> {currentVariant ? currentVariant.sku : product.sku}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Fabric Details Tab */}
              <div className="border border-[#E2D9C5] rounded-lg bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'fabric' ? '' : 'fabric')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-[#FBF8F1] transition-colors cursor-pointer"
                >
                  <span className="text-xs font-serif tracking-wider uppercase font-bold text-[#18181B]">
                    Composition & Care Guide
                  </span>
                  <span className="text-[#854D0E] font-mono font-bold">{openAccordion === 'fabric' ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {openAccordion === 'fabric' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-[#27272A] leading-relaxed font-sans space-y-3 border-t border-[#E2D9C5]">
                        <p className="font-bold text-[#854D0E]">
                          Material: {product.fabricDetails?.material || '100% Premium Egyptian Giza Double-Cotton'}
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-[#3F3F46] font-medium">
                          {product.fabricDetails?.care?.map((item, i) => (
                            <li key={i}>{item}</li>
                          )) || (
                            <>
                              <li>Dry clean recommended for first 2 washes to preserve bullion luster.</li>
                              <li>Machine wash cold on gentle cycle with mild detergent.</li>
                              <li>Warm steam iron on reverse side. Do not iron directly on metallic zari.</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reviews Tab */}
              <div id="accordion-reviews" className="border border-[#E2D9C5] rounded-lg bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'reviews' ? '' : 'reviews')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-[#FBF8F1] transition-colors cursor-pointer"
                >
                  <span className="text-xs font-serif tracking-wider uppercase font-bold text-[#18181B]">
                    Verified Collector Reviews ({reviewsList.length})
                  </span>
                  <span className="text-[#854D0E] font-mono font-bold">{openAccordion === 'reviews' ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {openAccordion === 'reviews' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 text-xs text-[#27272A] leading-relaxed font-sans space-y-4 border-t border-[#E2D9C5]">
                        {/* Review Action Toolbar */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-[#3F3F46] font-medium">
                            {reviewsList.length} authenticated feedback entries
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsWritingReview(!isWritingReview)}
                            className="text-[11px] font-sans text-[#854D0E] hover:underline font-bold cursor-pointer"
                          >
                            {isWritingReview ? 'Close Form' : '+ Write a Review'}
                          </button>
                        </div>

                        {/* Interactive Review Form */}
                        {isWritingReview && (
                          <form
                            onSubmit={handleReviewSubmit}
                            className="p-4 bg-[#FAF6ED] border border-[#E8DFC8] rounded-lg space-y-3"
                          >
                            <h4 className="text-xs font-serif font-bold text-[#1F1B17] tracking-wide">
                              Submit Collector Review
                            </h4>

                            {reviewError && (
                              <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded">
                                {reviewError}
                              </p>
                            )}

                            <div>
                              <label className="text-[10px] text-[#6E645A] uppercase tracking-wider block mb-1 font-semibold">
                                Your Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={reviewAuthor}
                                onChange={(e) => setReviewAuthor(e.target.value)}
                                placeholder="e.g. Asif Chowdhury"
                                className="w-full bg-white border border-[#E8DFC8] rounded px-3 py-1.5 text-xs text-[#1F1B17] placeholder-[#9E948A] focus:outline-none focus:border-[#C5A059]"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-[#6E645A] uppercase tracking-wider block mb-1 font-semibold">
                                Rating
                              </label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    type="button"
                                    key={star}
                                    onClick={() => setReviewRating(star)}
                                    className="p-1 text-[#C5A059] hover:scale-110 transition-transform cursor-pointer"
                                  >
                                    <Star
                                      className={`h-4 w-4 ${
                                        star <= reviewRating ? 'fill-[#C5A059]' : 'text-[#D1C7B7]'
                                      }`}
                                    />
                                  </button>
                                ))}
                                <span className="text-[11px] text-[#6E645A] ml-2 font-mono">{reviewRating} Stars</span>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-[#6E645A] uppercase tracking-wider block mb-1 font-semibold">
                                Your Experience *
                              </label>
                              <textarea
                                required
                                rows={3}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Share insights on the fabric feel, embroidery finishing, and sizing fit..."
                                className="w-full bg-white border border-[#E8DFC8] rounded px-3 py-1.5 text-xs text-[#1F1B17] placeholder-[#9E948A] focus:outline-none focus:border-[#C5A059] resize-none"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={reviewSubmitting}
                              className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-bold text-[11px] font-sans tracking-wider uppercase rounded hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                            >
                              {reviewSubmitting ? 'Verifying & Posting...' : 'Publish Verified Review'}
                            </button>
                          </form>
                        )}

                        {reviewSuccess && (
                          <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded">
                            {reviewSuccess}
                          </p>
                        )}

                        {reviewsList && reviewsList.length > 0 ? (
                          reviewsList.map((rev) => (
                            <div key={rev.id} className="pt-3 first:pt-0 border-t first:border-0 border-[#E8DFC8]">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-[#1F1B17]">{rev.author}</span>
                                <span className="text-[10px] text-[#9E948A] font-mono">{rev.date}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex text-[#C5A059]">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${i < rev.rating ? 'fill-[#C5A059]' : 'text-[#D1C7B7]'}`}
                                    />
                                  ))}
                                </div>
                                {rev.verified && (
                                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center space-x-1">
                                    <Check className="h-2.5 w-2.5" />
                                    <span>Verified Collector</span>
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-[#5C5248] italic">"{rev.comment}"</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[#9E948A] italic">Be the first to review this atelier masterwork.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>

        </div>

        {/* ================= 7. RELATED PRODUCTS SECTION ================= */}
        {relatedProducts.length > 0 && (
          <section id="pdp-related-products" className="mt-20 pt-12 border-t border-[#E8DFC8] space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#8C6819] font-bold block">
                  Atelier Recommendations
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1F1B17] tracking-wider uppercase font-bold mt-1">
                  Complete The Royal Look
                </h2>
              </div>
              <button
                onClick={() => onNavigate('category', { category: product.category })}
                className="text-xs text-[#8C6819] hover:text-[#1F1B17] uppercase font-sans tracking-widest flex items-center gap-1.5 group transition-colors font-bold cursor-pointer"
              >
                <span>View Full {categoryCapitalized}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => {
                const hasDiscount = rel.compareAtPrice && rel.compareAtPrice > rel.price;
                const discountPercent = hasDiscount
                  ? Math.round(((rel.compareAtPrice! - rel.price) / rel.compareAtPrice!) * 100)
                  : 0;

                return (
                  <div
                    key={rel.id}
                    id={`related-product-${rel.id}`}
                    onClick={() => onNavigate('product-detail', { productId: rel.id })}
                    className="group bg-white border border-[#E8DFC8] rounded-xl overflow-hidden shadow-xs hover:border-[#C5A059] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#F5EFEB]">
                      <img
                        src={rel.images[0]?.url}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {hasDiscount && (
                        <span className="absolute top-2.5 left-2.5 bg-[#B91C1C] text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded shadow">
                          SAVE {discountPercent}%
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-grow justify-between space-y-2">
                      <div>
                        <span className="text-[9px] font-sans tracking-widest uppercase text-[#8C6819] font-bold">
                          {rel.category}
                        </span>
                        <h3 className="font-serif text-sm text-[#1F1B17] group-hover:text-[#8C6819] font-semibold line-clamp-1 transition-colors">
                          {rel.name}
                        </h3>
                      </div>

                      <div className="pt-2 border-t border-[#E8DFC8] flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-[#8C6819]">
                          {formatPrice(rel.price)}
                        </span>
                        <div className="flex items-center text-[10px] text-[#6E645A]">
                          <Star className="h-3 w-3 text-[#C5A059] fill-[#C5A059] mr-1" />
                          <span>{rel.ratings.average}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= 8. STICKY BOTTOM MOBILE CTA BAR ================= */}
        <AnimatePresence>
          {showStickyBar && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-[#E8DFC8] z-50 px-4 py-3 flex items-center justify-between md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.1)]"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
            >
              {/* Left info */}
              <div className="flex items-center space-x-3 overflow-hidden pr-2 min-w-0">
                <img
                  src={product.images[0]?.url || primaryImage}
                  alt={product.name}
                  className="w-11 h-13 object-cover rounded border border-[#E2D9C5] shrink-0 bg-[#F4EFE6]"
                  referrerPolicy="no-referrer"
                />
                <div className="truncate">
                  <span className="text-[11px] font-mono text-[#3F3F46] font-medium block truncate">
                    Size {selectedSize} • {selectedColor.name}
                  </span>
                  <span className="text-base font-bold text-[#854D0E] font-mono leading-tight block">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              {/* Right Action */}
              {isOutOfStock ? (
                <button
                  id="mobile-sticky-notify-btn"
                  type="button"
                  onClick={() => setIsNotifyModalOpen(true)}
                  className="min-h-[44px] px-5 bg-gradient-to-r from-[#DFB847] via-[#E6C65E] to-[#C99E32] text-[#18181B] text-xs font-sans tracking-widest uppercase font-bold rounded-lg shrink-0 flex items-center space-x-2 shadow cursor-pointer active:scale-95 transition-transform border border-[#854D0E]"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notify Me</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    id="mobile-sticky-add-to-cart-btn"
                    type="button"
                    onClick={handleAddToCart}
                    className="min-h-[42px] px-3 bg-white hover:bg-[#FBF8F1] border-2 border-[#854D0E] text-[#854D0E] text-[11px] font-sans tracking-wider uppercase font-bold rounded-lg shrink-0 flex items-center space-x-1.5 shadow-2xs cursor-pointer active:scale-95 transition-transform"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 text-[#854D0E]" />
                    <span>Add</span>
                  </button>
                  <button
                    id="mobile-sticky-buy-now-btn"
                    type="button"
                    onClick={handleBuyNow}
                    className="min-h-[42px] px-4 bg-gradient-to-r from-[#DFB847] via-[#E6C65E] to-[#C99E32] hover:brightness-105 text-[#18181B] text-xs font-serif tracking-widest uppercase font-extrabold rounded-lg shrink-0 flex items-center space-x-1.5 shadow-md shadow-[#D4AF37]/25 cursor-pointer active:scale-95 transition-transform border border-[#854D0E]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Buy Now</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= 9. SIZE GUIDE MODAL OVERLAY ================= */}
        <SizeGuideModal
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
          defaultCategory={product.category}
          onSelectSize={(sz) => setSelectedSize(sz)}
        />

        {/* ================= 10. NOTIFY ME RESTOCK ALERT MODAL ================= */}
        <AnimatePresence>
          {isNotifyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsNotifyModalOpen(false)}
                className="absolute inset-0 bg-[#1F1B17]/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-white border border-[#E8DFC8] rounded-2xl p-6 sm:p-8 shadow-2xl z-10 text-left space-y-5"
              >
                <button
                  onClick={() => setIsNotifyModalOpen(false)}
                  className="absolute top-4 right-4 text-[#6E645A] hover:text-[#1F1B17] p-1 rounded-full hover:bg-[#FAF6ED] transition-colors"
                  title="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF6ED] border border-[#C5A059] rounded-full text-[#8C6819] text-[10px] font-sans font-bold uppercase tracking-widest">
                    <Bell className="h-3 w-3" />
                    <span>Restock Notification</span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#1F1B17] font-bold tracking-wide">
                    Get Notified When Available
                  </h3>
                  <p className="text-xs text-[#5C5248] font-sans leading-relaxed">
                    Size <strong className="text-[#1F1B17] font-mono">{selectedSize}</strong> ({selectedColor.name}) of{' '}
                    <strong className="text-[#8C6819]">{product.name}</strong> is currently being tailored. Enter your email or phone to receive instant priority restock notification.
                  </p>
                </div>

                {notifySuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                    <p className="text-xs font-semibold text-emerald-900">Priority Alert Registered!</p>
                    <p className="text-[11px] text-emerald-800">
                      We will notify you immediately once this size is crafted and returned to our atelier catalog.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-sans uppercase tracking-wider text-[#1F1B17] block mb-1.5 font-bold">
                        Your Email or Mobile Number
                      </label>
                      <input
                        type="text"
                        required
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        placeholder="e.g. collector@domain.com or 017XXXXXXXX"
                        className="w-full bg-[#FAF8F5] border border-[#E8DFC8] rounded-lg px-4 py-3 text-xs text-[#1F1B17] placeholder-[#9E948A] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] font-sans"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-sans font-bold text-xs tracking-widest uppercase rounded-lg hover:brightness-110 transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                      >
                        <Bell className="h-4 w-4" />
                        <span>Notify Me Upon Restock</span>
                      </button>
                    </div>
                  </form>
                )}

                <p className="text-[10px] text-[#9E948A] text-center">
                  We respect your privacy. No spam, only single restock notification.
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ================= 11. BESPOKE AI STYLIST CONCIERGE MODAL ================= */}
        <AnimatePresence>
          {isStylistModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsStylistModalOpen(false)}
                className="absolute inset-0 bg-[#1F1B17]/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg bg-white border border-[#E8DFC8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl z-10"
              >
                <button
                  type="button"
                  onClick={() => setIsStylistModalOpen(false)}
                  className="absolute top-4 right-4 text-[#6E645A] hover:text-[#1F1B17] p-1 rounded-full hover:bg-[#FAF6ED] transition-colors"
                  title="Close styling modal"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF6ED] border border-[#C5A059] rounded-full text-[#8C6819] text-[10px] font-sans font-bold uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" />
                    <span>Atelier AI Stylist</span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#1F1B17] font-bold tracking-wide">
                    Bespoke Styling Concierge
                  </h3>
                  <p className="text-xs text-[#5C5248] font-sans leading-relaxed">
                    Tailored wardrobe pairings for <strong className="text-[#8C6819]">{product.name}</strong>, curated by our heritage style advisory engine.
                  </p>
                </div>

                <form onSubmit={handleRequestStyling} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-sans uppercase tracking-wider text-[#1F1B17] block mb-1.5 font-bold">
                      Select Planned Occasion
                    </label>
                    <select
                      value={stylistOccasion}
                      onChange={(e) => setStylistOccasion(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E8DFC8] rounded-lg px-4 py-2.5 text-xs text-[#1F1B17] focus:outline-none focus:border-[#C5A059] font-sans"
                    >
                      <option value="Eid Morning Prayer">Eid Morning Prayer</option>
                      <option value="Royal Wedding Reception">Royal Wedding Reception / Holud</option>
                      <option value="Diplomatic Gala Dinner">Diplomatic Gala Dinner</option>
                      <option value="Jummah Congregation">Jummah Congregation & High Tea</option>
                      <option value="Evening Soirée">Evening Soirée & Festive Family Gathering</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-sans uppercase tracking-wider text-[#1F1B17] block mb-1.5 font-bold">
                      Specific Inquiries or Preferences (Optional)
                    </label>
                    <input
                      type="text"
                      value={stylistPrompt}
                      onChange={(e) => setStylistPrompt(e.target.value)}
                      placeholder="e.g. Best footwear color, pajama cut, or stole pairing..."
                      className="w-full bg-[#FAF8F5] border border-[#E8DFC8] rounded-lg px-4 py-2.5 text-xs text-[#1F1B17] placeholder-[#9E948A] focus:outline-none focus:border-[#C5A059] font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={stylistLoading}
                    className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] font-sans font-bold text-xs tracking-widest uppercase rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {stylistLoading ? (
                      <>
                        <RefreshCcw className="h-4 w-4 animate-spin text-[#1F1B17]" />
                        <span>Curating Atelier Ensemble...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Get Master Look Advice</span>
                      </>
                    )}
                  </button>
                </form>

                {stylistError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                    {stylistError}
                  </div>
                )}

                {stylistAdvice && (
                  <div className="p-4 bg-[#FAF6ED] border border-[#C5A059] rounded-xl space-y-2 shadow-2xs">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-[#8C6819] uppercase tracking-wider">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Concierge Recommendation</span>
                    </div>
                    <p className="text-xs text-[#1F1B17] font-sans leading-relaxed">
                      {stylistAdvice}
                    </p>
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
