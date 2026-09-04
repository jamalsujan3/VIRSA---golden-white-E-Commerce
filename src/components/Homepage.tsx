/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, ChevronLeft, ChevronRight, Mail, Phone, Clock, MapPin, Sparkles, ShoppingBag, Check, ShieldCheck, Heart, ArrowUp, Flame, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ColorSwatch, Showroom } from '../types';
import { SHOWROOMS as STATIC_SHOWROOMS } from '../data';
import QuickViewModal from './QuickViewModal';
import { useWishlist } from '../lib/wishlist';
import TrackOrderModal from './TrackOrderModal';
import CustomerFAQs from './CustomerFAQs';
import SEO from './SEO';
import { getOrganizationSchema } from '../lib/seoSchemas';
import { formatPrice } from '../lib/formatters';

interface HomepageProps {
  products: Product[];
  onNavigate: (view: string, extra?: any) => void;
  onAddToCart?: (product: Product, size: string, color: ColorSwatch, quantity: number) => void;
  showrooms?: Showroom[];
}

export default function Homepage({ products, onNavigate, onAddToCart, showrooms = STATIC_SHOWROOMS }: HomepageProps) {
  const { toggle: toggleWishlist, has: isWishlisted } = useWishlist();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    setIsAdminLoggedIn(!!localStorage.getItem('virsa_logged_admin'));
  }, []);

  // Scroll event handler to show/hide back-to-top button past the hero section
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.75;
      if (window.scrollY > heroHeight) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const newArrivalsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollArrivalsLeft, setCanScrollArrivalsLeft] = useState(false);
  const [canScrollArrivalsRight, setCanScrollArrivalsRight] = useState(true);

  const checkArrivalsScroll = () => {
    if (newArrivalsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = newArrivalsScrollRef.current;
      setCanScrollArrivalsLeft(scrollLeft > 15);
      setCanScrollArrivalsRight(scrollLeft < scrollWidth - clientWidth - 15);
    }
  };

  const scrollArrivals = (direction: 'left' | 'right') => {
    if (newArrivalsScrollRef.current) {
      const scrollDistance = newArrivalsScrollRef.current.clientWidth * 0.75;
      newArrivalsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollDistance : scrollDistance,
        behavior: 'smooth'
      });
    }
  };

  // Filter and sort newest arrivals
  const newArrivalProducts = React.useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }, [products]);

  // Filter and sort featured items
  const featuredProducts = React.useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  const heroCampaigns = [
    {
      tag: 'ROYAL EID ATELIER 2026',
      title: 'ELEGANCE DEFINED',
      subtitle: 'Handcrafted Egyptian Cotton, Mulberry Silks & Pure Zari Embroidery',
      cta: 'Explore Royal Panjabi',
      category: 'panjabi',
      bgImage: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600&q=80&fit=crop'
    },
    {
      tag: 'BESPOKE WAISTCOAT & SUITS',
      title: 'REGAL ATTIRE',
      subtitle: 'Tailored Italian Velvet Kotis & Imperial Wedding Sherwanis',
      cta: 'Explore Velvet Kotis',
      category: 'koti',
      bgImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=80&fit=crop'
    }
  ];

  // Rotate campaign hero banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroCampaigns.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroCampaigns.length]);

  const [categoriesCurrentIndex, setCategoriesCurrentIndex] = useState(0);
  const [categoriesVisibleCount, setCategoriesVisibleCount] = useState(4);
  const [isCategoryAutoplay, setIsCategoryAutoplay] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setCategoriesVisibleCount(4);
      } else if (window.innerWidth >= 640) {
        setCategoriesVisibleCount(2);
      } else {
        setCategoriesVisibleCount(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories = [
    { name: 'Royal Panjabi', code: 'panjabi', count: 'Exclusive Tunics', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop' },
    { name: 'Imperial Kabli', code: 'kabli', count: 'Classic Sets', image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80&fit=crop' },
    { name: 'Velvet Koti', code: 'koti', count: 'Luxury Waistcoats', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop' },
    { name: 'Royal Sherwani', code: 'sherwani', count: 'Imperial Groomwear', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80&fit=crop' },
    { name: 'Islamic Jubbah', code: 'jubbah', count: 'Serene Robes', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80&fit=crop' },
    { name: 'Fine Pajamas', code: 'pajama', count: 'Heritage Bottoms', image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&q=80&fit=crop' },
    { name: 'Junior Royal', code: 'kids', count: 'Royal Kids Attire', image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80&fit=crop' }
  ];

  const maxCategoriesIndex = Math.max(0, categories.length - categoriesVisibleCount);
  const safeCategoriesIndex = Math.min(categoriesCurrentIndex, maxCategoriesIndex);

  useEffect(() => {
    if (!isCategoryAutoplay) return;
    const timer = setInterval(() => {
      setCategoriesCurrentIndex((prev) => (prev >= maxCategoriesIndex ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, [isCategoryAutoplay, maxCategoriesIndex]);

  const nextCategorySlide = () => {
    setIsCategoryAutoplay(false);
    setCategoriesCurrentIndex((prev) => (prev >= maxCategoriesIndex ? 0 : prev + 1));
  };

  const prevCategorySlide = () => {
    setIsCategoryAutoplay(false);
    setCategoriesCurrentIndex((prev) => (prev <= 0 ? maxCategoriesIndex : prev - 1));
  };

  return (
    <div id="homepage-root" className="w-full bg-[#FAF8F5] text-[#1F1B17]">
      <SEO
        title="VIRSA | Luxury Menswear & Heritage Panjabi Atelier"
        description="Explore VIRSA’s signature collection of handcrafted Panjabis, Royal Kablis, Italian velvet Kotis, imperial Sherwanis, and Jubbahs. Luxury traditional attire tailored in Dhaka."
        canonical="/"
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=85&fit=crop"
        ogImageAlt="VIRSA Luxury Menswear Atelier Collection"
        structuredData={getOrganizationSchema()}
      />
      
      {/* 1. HERO BANNER SLIDER */}
      <section id="hero-slider" className="relative h-[85vh] w-full overflow-hidden bg-[#1F1B17]">
        {heroCampaigns.map((camp, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background image overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.01]"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(20, 16, 12, 0.45) 0%, rgba(20, 16, 12, 0.75) 100%), url(${camp.bgImage})`
              }}
            />
            
            {/* Hero Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={idx === currentHeroIndex ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#E8DFC8]/40 mb-5"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#E5C158]" />
                <span className="text-xs font-serif tracking-[0.25em] text-[#F3E5AB] uppercase font-semibold">
                  {camp.tag}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={idx === currentHeroIndex ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="font-serif text-4xl sm:text-6xl md:text-7xl font-light tracking-[0.14em] text-white max-w-4xl leading-tight mb-4 drop-shadow-sm"
              >
                {camp.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={idx === currentHeroIndex ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-sm sm:text-base font-sans text-[#EAE4DC] max-w-2xl mx-auto mb-8 font-light tracking-wide"
              >
                {camp.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={idx === currentHeroIndex ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <button
                  onClick={() => onNavigate('category', { category: camp.category })}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#AA8232] text-[#1F1B17] text-xs font-sans font-bold tracking-[0.2em] uppercase rounded-sm shadow-[0_4px_25px_rgba(212,175,55,0.4)] hover:brightness-110 hover:shadow-[0_6px_30px_rgba(212,175,55,0.6)] transition-all duration-300 cursor-pointer flex items-center space-x-2"
                >
                  <span>{camp.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => onNavigate('category', { category: 'all' })}
                  className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md text-xs font-sans font-semibold tracking-[0.2em] uppercase rounded-sm transition-all duration-300 cursor-pointer"
                >
                  View Lookbook
                </button>
              </motion.div>
            </div>
          </div>
        ))}

        {/* Campaign Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-3">
          {heroCampaigns.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIndex(idx)}
              className="group p-2 focus:outline-none cursor-pointer"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div className={`h-1.5 transition-all duration-500 rounded-full ${idx === currentHeroIndex ? 'w-12 bg-[#D4AF37]' : 'w-6 bg-white/40 group-hover:bg-white'}`} />
            </button>
          ))}
        </div>
      </section>

      {/* 2. CATEGORY SECTOR CAROUSEL */}
      <section id="category-grid-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="text-xs font-serif font-bold tracking-[0.3em] text-[#8C6819] uppercase block mb-2">Curated Collections</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1F1B17] font-normal tracking-[0.12em] uppercase">SHOP BY CATEGORY</h2>
          <div className="flex items-center justify-center space-x-3 mt-4">
            <div className="w-12 h-[1px] bg-[#E8DFC8]" />
            <div className="w-2 h-2 rotate-45 bg-[#C5A059]" />
            <div className="w-12 h-[1px] bg-[#E8DFC8]" />
          </div>
        </div>

        {/* Carousel Wrapper with Arrows on both sides */}
        <div className="relative group/carousel px-0 sm:px-10">
          {/* Left Arrow */}
          <button
            onClick={prevCategorySlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-[#E8DFC8] text-[#1F1B17] hover:border-[#C5A059] hover:text-[#8C6819] bg-white/95 backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(197,160,89,0.15)] disabled:opacity-20 disabled:pointer-events-none cursor-pointer -ml-2 sm:-ml-4"
            aria-label="Previous Category"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Carousel Window */}
          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsCategoryAutoplay(false)}
            onMouseLeave={() => setIsCategoryAutoplay(true)}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${safeCategoriesIndex * (100 / categoriesVisibleCount)}%)` }}
            >
              {categories.map((cat) => (
                <div
                  key={cat.code}
                  className="w-full sm:w-1/2 lg:w-1/4 shrink-0 px-3"
                >
                  <div
                    onClick={() => onNavigate('category', { category: cat.code })}
                    className="group relative h-80 overflow-hidden bg-white rounded-lg shadow-[0_4px_20px_rgba(197,160,89,0.08)] cursor-pointer border border-[#E8DFC8] hover:border-[#C5A059] transition-all duration-500"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ backgroundImage: `linear-gradient(to top, rgba(31, 27, 23, 0.88) 15%, rgba(31, 27, 23, 0.15) 60%), url(${cat.image})` }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end">
                      <span className="text-[10px] font-sans tracking-[0.2em] text-[#F3E5AB] uppercase mb-1 font-semibold">
                        {cat.count}
                      </span>
                      <h3 className="font-serif text-lg sm:text-xl text-white tracking-wider uppercase group-hover:text-[#F3E5AB] transition-colors">
                        {cat.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 mt-2.5 opacity-0 transform translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <span className="text-[11px] font-sans tracking-widest text-white uppercase font-semibold">Discover Line</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#F3E5AB]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextCategorySlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-[#E8DFC8] text-[#1F1B17] hover:border-[#C5A059] hover:text-[#8C6819] bg-white/95 backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(197,160,89,0.15)] disabled:opacity-20 disabled:pointer-events-none cursor-pointer -mr-2 sm:-mr-4"
            aria-label="Next Category"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {Array.from({ length: maxCategoriesIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsCategoryAutoplay(false);
                setCategoriesCurrentIndex(idx);
              }}
              className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${idx === safeCategoriesIndex ? 'w-8 bg-[#C5A059]' : 'w-2 bg-[#D1C7B7] hover:bg-[#C5A059]/60'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 3. BEST SELLERS / FEATURED SLIDER CAROUSEL */}
      <section id="best-sellers-section" className="bg-[#FAF6ED] py-24 border-y border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full flex flex-col items-center justify-center text-center mb-16">
            <div className="flex flex-col items-center">
              <span className="text-xs font-serif font-bold tracking-[0.3em] text-[#8C6819] uppercase block mb-2">Highly Coveted</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1F1B17] font-normal tracking-[0.12em] uppercase">BEST SELLERS</h2>
              <div className="flex items-center justify-center space-x-3 mt-4">
                <div className="w-12 h-[1px] bg-[#E8DFC8]" />
                <div className="w-2 h-2 rotate-45 bg-[#C5A059]" />
                <div className="w-12 h-[1px] bg-[#E8DFC8]" />
              </div>
            </div>

            <div className="mt-8 md:mt-0 md:absolute md:right-0 md:bottom-1">
              <button
                onClick={() => onNavigate('category')}
                className="flex items-center space-x-2 text-xs font-sans font-bold tracking-widest uppercase text-[#8C6819] hover:text-[#1F1B17] transition-colors group pb-1 border-b border-[#C5A059]/40 hover:border-[#1F1B17] cursor-pointer"
              >
                <span>Explore All Masterpieces</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#8C6819] transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => onNavigate('product-detail', { productId: prod.id })}
                className="group bg-white border border-[#E8DFC8] rounded-md overflow-hidden shadow-[0_4px_20px_rgba(197,160,89,0.06)] hover:border-[#C5A059] hover:shadow-[0_10px_30px_rgba(197,160,89,0.15)] transition-all duration-500 cursor-pointer flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="relative aspect-[3/4] bg-[#F5EFEB] overflow-hidden">
                  
                  {/* Champagne tag badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] text-[10px] font-sans tracking-widest uppercase font-bold px-2.5 py-1 rounded shadow-sm">
                      Best Seller
                    </span>
                  </div>

                  {/* Primary & Hover Secondary Image crossfade */}
                  <img
                    src={prod.images[0].url}
                    alt={prod.images[0].alt}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-in-out group-hover:opacity-0"
                    referrerPolicy="no-referrer"
                  />
                  {prod.images[1] && (
                    <img
                      src={prod.images[1].url}
                      alt={prod.images[1].alt}
                      className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Heart Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(prod.id);
                    }}
                    className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E8DFC8] hover:border-rose-400 text-[#1F1B17] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-sm"
                    title={isWishlisted(prod.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart className={`h-4 w-4 transition-all duration-300 ${isWishlisted(prod.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-[#6E645A] hover:text-rose-500'}`} />
                  </button>
                  
                  {/* Quick View Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQuickViewProduct(prod);
                      setIsQuickViewOpen(true);
                    }}
                    className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md hover:bg-[#C5A059] hover:text-white text-[#1F1B17] py-2.5 text-xs font-sans tracking-widest uppercase transition-all duration-300 rounded opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 shadow-md border border-[#E8DFC8] z-20 cursor-pointer font-bold"
                  >
                    Quick View
                  </button>
                </div>

                {/* Info Text */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-sans tracking-widest text-[#8C6819] uppercase mb-1 block font-bold">
                      {prod.category}
                    </span>
                    <h3 className="font-serif text-base text-[#1F1B17] group-hover:text-[#8C6819] transition-colors font-medium line-clamp-1 mb-2">
                      {prod.name}
                    </h3>
                    
                    {/* Stars */}
                    <div className="flex items-center space-x-1.5 mb-3">
                      <div className="flex text-[#C5A059]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(prod.ratings.average) ? 'fill-[#C5A059]' : ''}`} />
                        ))}
                      </div>
                      <span className="text-[11px] font-mono text-[#6E645A]">({prod.ratings.count})</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-3 border-t border-[#E8DFC8] mt-2">
                    <span className="font-sans text-[11px] text-[#6E645A] uppercase tracking-wider font-medium">Starting from</span>
                    <div className="flex items-center space-x-2">
                      {prod.compareAtPrice && (
                        <span className="text-xs text-[#9E948A] line-through font-mono">
                          {formatPrice(prod.compareAtPrice)}
                        </span>
                      )}
                      <span className="text-sm font-bold text-[#8C6819] font-mono">
                        {formatPrice(prod.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          NEW ARRIVALS: HORIZONTAL SCROLLING LATEST MASTERPIECES
          ========================================================================= */}
      <section id="new-arrivals-section" className="bg-[#FAF8F5] py-20 border-b border-[#E8DFC8] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="text-left">
              <div className="flex items-center space-x-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-[#18181B] text-[#FDE047] border border-[#854D0E] shadow-2xs">
                  <Sparkles className="h-3 w-3 text-[#FDE047]" />
                  Fresh From The Atelier
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#18181B] font-bold tracking-[0.12em] uppercase">
                NEW ARRIVALS
              </h2>
              <div className="flex items-center space-x-3 mt-3">
                <div className="w-12 h-[1px] bg-[#E2D9C5]" />
                <div className="w-2 h-2 rotate-45 bg-[#854D0E]" />
                <div className="w-12 h-[1px] bg-[#E2D9C5]" />
              </div>
              <p className="text-xs sm:text-sm text-[#3F3F46] max-w-xl mt-3 font-sans leading-relaxed">
                Discover the latest handcrafted silhouettes, pure mulberry silks, and bespoke festive weaves freshly tailored for the season.
              </p>
            </div>

            {/* Actions: Navigation Chevrons + Shop New Button */}
            <div className="flex items-center space-x-3 self-start md:self-end">
              {/* Scroll Controls */}
              <div className="flex items-center space-x-1.5 bg-white border border-[#E2D9C5] rounded-lg p-1 shadow-2xs">
                <button
                  id="new-arrivals-scroll-left"
                  type="button"
                  onClick={() => scrollArrivals('left')}
                  disabled={!canScrollArrivalsLeft}
                  className={`p-2 rounded-md transition-all ${
                    canScrollArrivalsLeft
                      ? 'text-[#18181B] hover:text-[#854D0E] hover:bg-[#FAF6ED] cursor-pointer'
                      : 'text-[#A1A1AA] opacity-40 cursor-not-allowed'
                  }`}
                  aria-label="Scroll left through new arrivals"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="w-[1px] h-4 bg-[#E2D9C5]" />
                <button
                  id="new-arrivals-scroll-right"
                  type="button"
                  onClick={() => scrollArrivals('right')}
                  disabled={!canScrollArrivalsRight}
                  className={`p-2 rounded-md transition-all ${
                    canScrollArrivalsRight
                      ? 'text-[#18181B] hover:text-[#854D0E] hover:bg-[#FAF6ED] cursor-pointer'
                      : 'text-[#A1A1AA] opacity-40 cursor-not-allowed'
                  }`}
                  aria-label="Scroll right through new arrivals"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* 'Shop New' Button */}
              <button
                id="shop-new-arrivals-btn"
                type="button"
                onClick={() => onNavigate('category', { sort: 'newest' })}
                className="min-h-[42px] px-5 bg-gradient-to-r from-[#DFB847] via-[#E6C65E] to-[#C99E32] hover:brightness-105 text-[#18181B] border border-[#854D0E] text-xs font-serif font-extrabold tracking-widest uppercase rounded-lg shadow-sm hover:shadow-md flex items-center space-x-2 transition-all cursor-pointer active:scale-95"
              >
                <span>Shop New</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrolling Product Cards Track */}
          <div
            ref={newArrivalsScrollRef}
            onScroll={checkArrivalsScroll}
            className="flex space-x-6 overflow-x-auto pb-6 pt-2 scrollbar-thin scrollbar-track-[#FAF8F5] scrollbar-thumb-[#C5A059]/40 hover:scrollbar-thumb-[#C5A059] snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
            style={{ scrollBehavior: 'smooth' }}
          >
            {newArrivalProducts.map((prod) => (
              <div
                key={`new-${prod.id}`}
                onClick={() => onNavigate('product-detail', { productId: prod.id })}
                className="w-[270px] sm:w-[300px] shrink-0 snap-start group bg-white border border-[#E2D9C5] rounded-lg overflow-hidden shadow-[0_4px_20px_rgba(197,160,89,0.06)] hover:border-[#854D0E] hover:shadow-[0_10px_30px_rgba(197,160,89,0.15)] transition-all duration-500 cursor-pointer flex flex-col"
              >
                {/* Image Section */}
                <div className="relative aspect-[3/4] bg-[#F4EFE6] overflow-hidden">
                  
                  {/* High Contrast 'NEW' Tag Badge */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                    <span className="bg-[#18181B] text-[#FDE047] border border-[#854D0E] text-[9px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 text-[#FDE047]" />
                      NEW
                    </span>
                    {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                      <span className="bg-rose-700 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                        {Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  {/* Primary & Hover Secondary Image Crossfade */}
                  <img
                    src={prod.images[0]?.url}
                    alt={prod.images[0]?.alt || prod.name}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-in-out group-hover:opacity-0"
                    referrerPolicy="no-referrer"
                  />
                  {prod.images[1] ? (
                    <img
                      src={prod.images[1].url}
                      alt={prod.images[1].alt || prod.name}
                      className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <img
                      src={prod.images[0]?.url}
                      alt={prod.images[0]?.alt || prod.name}
                      className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Heart Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(prod.id);
                    }}
                    className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E2D9C5] hover:border-rose-400 text-[#18181B] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-sm"
                    title={isWishlisted(prod.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart className={`h-4 w-4 transition-all duration-300 ${isWishlisted(prod.id) ? 'fill-rose-600 text-rose-600 scale-110' : 'text-[#52525B] hover:text-rose-600'}`} />
                  </button>
                  
                  {/* Quick View Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQuickViewProduct(prod);
                      setIsQuickViewOpen(true);
                    }}
                    className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md hover:bg-[#854D0E] hover:text-white text-[#18181B] py-2 text-xs font-sans tracking-wider uppercase transition-all duration-300 rounded opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 shadow-md border border-[#E2D9C5] z-20 cursor-pointer font-bold"
                  >
                    Quick View
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-serif tracking-widest text-[#854D0E] uppercase mb-1 font-bold">
                      <span>{prod.category}</span>
                      <span className="text-[10px] font-mono text-[#52525B] font-semibold">{prod.sku}</span>
                    </div>

                    <h3 className="font-serif text-sm text-[#18181B] group-hover:text-[#854D0E] transition-colors font-bold line-clamp-1 mb-1.5 leading-snug">
                      {prod.name}
                    </h3>
                    
                    {/* Ratings */}
                    <div className="flex items-center space-x-1.5 mb-2.5">
                      <div className="flex text-[#D97706]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < Math.floor(prod.ratings.average) ? 'fill-[#D97706]' : 'text-[#D1D5DB]'}`} />
                        ))}
                      </div>
                      <span className="text-[11px] font-mono text-[#3F3F46] font-semibold">({prod.ratings.count})</span>
                    </div>
                  </div>

                  {/* Pricing and Details */}
                  <div className="pt-3 border-t border-[#E2D9C5] flex items-baseline justify-between">
                    <span className="font-sans text-[10px] text-[#3F3F46] uppercase tracking-wider font-bold">
                      Price
                    </span>
                    <div className="flex items-baseline space-x-2">
                      {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                        <span className="text-xs text-[#6B7280] line-through font-mono">
                          {formatPrice(prod.compareAtPrice)}
                        </span>
                      )}
                      <span className="text-base font-bold text-[#854D0E] font-mono">
                        {formatPrice(prod.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Final 'Explore All New' Callout Card in Scroller */}
            <div
              onClick={() => onNavigate('category', { sort: 'newest' })}
              className="w-[240px] shrink-0 snap-start bg-gradient-to-br from-[#18181B] via-[#27272A] to-[#141210] border-2 border-[#854D0E] rounded-lg p-6 flex flex-col items-center justify-center text-center text-white cursor-pointer hover:border-[#DFB847] hover:scale-[1.02] transition-all shadow-md group"
            >
              <div className="p-3 rounded-full bg-[#854D0E]/30 text-[#FDE047] border border-[#854D0E] mb-4 group-hover:rotate-12 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-white mb-2">
                All New Masterpieces
              </h3>
              <p className="text-xs text-stone-300 font-sans leading-relaxed mb-6">
                Explore the complete collection of freshly released atelier garments.
              </p>
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#DFB847] via-[#E6C65E] to-[#C99E32] text-[#18181B] font-serif text-xs font-extrabold tracking-widest uppercase rounded-lg shadow cursor-pointer group-hover:brightness-110 flex items-center justify-center space-x-1.5"
              >
                <span>Shop New</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CATEGORY HIGHLIGHTS: 4 SEPARATE PREMIUM SECTIONS
          ========================================================================= */}

      {/* SECTION 1: PREMIUM PANJABI HIGHLIGHT */}
      <section id="panjabi-highlight-section" className="py-20 bg-[#FAF8F5] border-b border-[#E8DFC8] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative w-full flex flex-col items-center justify-center text-center mb-16">
            <div className="flex flex-col items-center">
              <span className="text-xs font-serif font-bold tracking-[0.3em] text-[#8C6819] uppercase block mb-2">
                Atelier Heritage Classics
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1F1B17] font-normal tracking-[0.12em] uppercase">
                THE ROYAL PANJABI
              </h2>
              <div className="flex items-center justify-center space-x-3 mt-4">
                <div className="w-12 h-[1px] bg-[#E8DFC8]" />
                <div className="w-2 h-2 rotate-45 bg-[#C5A059]" />
                <div className="w-12 h-[1px] bg-[#E8DFC8]" />
              </div>
            </div>
            
            <div className="mt-8 md:mt-0 md:absolute md:right-0 md:bottom-1">
              <button
                onClick={() => onNavigate('category', { category: 'panjabi' })}
                className="flex items-center space-x-2 text-xs font-sans font-bold tracking-widest uppercase text-[#8C6819] hover:text-[#1F1B17] transition-colors group pb-1 border-b border-[#C5A059]/40 hover:border-[#1F1B17] cursor-pointer"
              >
                <span>View All Panjabis</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#8C6819] transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Staggered Grid for Panjabi Products */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {products
              .filter((p) => p.category.toLowerCase() === 'panjabi')
              .slice(0, 4)
              .map((prod) => (
                <motion.div
                  key={prod.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.98 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } }
                  }}
                  onClick={() => onNavigate('product-detail', { productId: prod.id })}
                  className="group bg-white border border-[#E8DFC8] rounded-md overflow-hidden shadow-[0_4px_20px_rgba(197,160,89,0.06)] hover:border-[#C5A059] hover:shadow-[0_10px_30px_rgba(197,160,89,0.15)] transition-all duration-500 cursor-pointer flex flex-col h-full relative"
                >
                  <div className="relative aspect-[3/4] bg-[#F5EFEB] overflow-hidden">
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-[#FAF6ED] border border-[#C5A059]/50 text-[#8C6819] text-[9px] font-sans tracking-[0.2em] uppercase font-bold px-2.5 py-1 rounded-sm shadow-xs">
                        Signature Line
                      </span>
                    </div>

                    <img
                      src={prod.images[0].url}
                      alt={prod.images[0].alt}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:opacity-0 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {prod.images[1] ? (
                      <img
                        src={prod.images[1].url}
                        alt={prod.images[1].alt}
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <img
                        src={prod.images[0].url}
                        alt={prod.images[0].alt}
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:opacity-35 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E8DFC8] hover:border-rose-400 text-[#1F1B17] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-xs"
                      title={isWishlisted(prod.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart
                        className={`h-4 w-4 transition-all duration-300 ${
                          isWishlisted(prod.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-[#6E645A] hover:text-rose-500'
                        }`}
                      />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuickViewProduct(prod);
                        setIsQuickViewOpen(true);
                      }}
                      className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md hover:bg-[#C5A059] hover:text-white text-[#1F1B17] py-2.5 text-xs font-sans tracking-widest uppercase transition-all duration-300 rounded opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 shadow-md border border-[#E8DFC8] z-20 cursor-pointer font-bold"
                    >
                      Quick View
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-sans tracking-widest text-[#8C6819] uppercase mb-1 block font-bold">
                        Panjabi
                      </span>
                      <h3 className="font-serif text-base text-[#1F1B17] group-hover:text-[#8C6819] transition-colors font-medium line-clamp-1 mb-2">
                        {prod.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 mb-3">
                        <div className="flex text-[#C5A059]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(prod.ratings.average) ? 'fill-[#C5A059]' : ''}`} />
                          ))}
                        </div>
                        <span className="text-[11px] font-mono text-[#6E645A]">({prod.ratings.count})</span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-3 border-t border-[#E8DFC8] mt-2">
                      <span className="font-sans text-[11px] text-[#6E645A] uppercase tracking-wider font-medium">Starting from</span>
                      <div className="flex items-center space-x-2">
                        {prod.compareAtPrice && (
                          <span className="text-xs text-[#9E948A] line-through font-mono">
                            {formatPrice(prod.compareAtPrice)}
                          </span>
                        )}
                        <span className="text-sm font-bold text-[#8C6819] font-mono">
                          {formatPrice(prod.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: DESIGNER KOTI HIGHLIGHT */}
      <section id="koti-highlight-section" className="py-20 bg-[#FAF6ED] border-b border-[#E8DFC8] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative w-full flex flex-col items-center justify-center text-center mb-16">
            <div className="flex flex-col items-center">
              <span className="text-xs font-serif font-bold tracking-[0.3em] text-[#8C6819] uppercase block mb-2">
                The Fine Art of Layering
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1F1B17] font-normal tracking-[0.12em] uppercase">
                DESIGNER KOTI WAISTCOATS
              </h2>
              <div className="flex items-center justify-center space-x-3 mt-4">
                <div className="w-12 h-[1px] bg-[#E8DFC8]" />
                <div className="w-2 h-2 rotate-45 bg-[#C5A059]" />
                <div className="w-12 h-[1px] bg-[#E8DFC8]" />
              </div>
            </div>
            
            <div className="mt-8 md:mt-0 md:absolute md:right-0 md:bottom-1">
              <button
                onClick={() => onNavigate('category', { category: 'koti' })}
                className="flex items-center space-x-2 text-xs font-sans font-bold tracking-widest uppercase text-[#8C6819] hover:text-[#1F1B17] transition-colors group pb-1 border-b border-[#C5A059]/40 hover:border-[#1F1B17] cursor-pointer"
              >
                <span>View All Kotis</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#8C6819] transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {products
              .filter((p) => p.category.toLowerCase() === 'koti')
              .slice(0, 4)
              .map((prod) => (
                <motion.div
                  key={prod.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.98 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } }
                  }}
                  onClick={() => onNavigate('product-detail', { productId: prod.id })}
                  className="group bg-white border border-[#E8DFC8] rounded-md overflow-hidden shadow-[0_4px_20px_rgba(197,160,89,0.06)] hover:border-[#C5A059] hover:shadow-[0_10px_30px_rgba(197,160,89,0.15)] transition-all duration-500 cursor-pointer flex flex-col h-full relative"
                >
                  <div className="relative aspect-[3/4] bg-[#F5EFEB] overflow-hidden">
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-[#FAF6ED] border border-[#C5A059]/50 text-[#8C6819] text-[9px] font-sans tracking-[0.2em] uppercase font-bold px-2.5 py-1 rounded-sm shadow-xs">
                        Atelier Exquisite
                      </span>
                    </div>

                    <img
                      src={prod.images[0].url}
                      alt={prod.images[0].alt}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:opacity-0 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {prod.images[1] ? (
                      <img
                        src={prod.images[1].url}
                        alt={prod.images[1].alt}
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <img
                        src={prod.images[0].url}
                        alt={prod.images[0].alt}
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:opacity-35 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E8DFC8] hover:border-rose-400 text-[#1F1B17] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-xs"
                      title={isWishlisted(prod.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart
                        className={`h-4 w-4 transition-all duration-300 ${
                          isWishlisted(prod.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-[#6E645A] hover:text-rose-500'
                        }`}
                      />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuickViewProduct(prod);
                        setIsQuickViewOpen(true);
                      }}
                      className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md hover:bg-[#C5A059] hover:text-white text-[#1F1B17] py-2.5 text-xs font-sans tracking-widest uppercase transition-all duration-300 rounded opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 shadow-md border border-[#E8DFC8] z-20 cursor-pointer font-bold"
                    >
                      Quick View
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-sans tracking-widest text-[#8C6819] uppercase mb-1 block font-bold">
                        Waistcoat / Koti
                      </span>
                      <h3 className="font-serif text-base text-[#1F1B17] group-hover:text-[#8C6819] transition-colors font-medium line-clamp-1 mb-2">
                        {prod.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 mb-3">
                        <div className="flex text-[#C5A059]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(prod.ratings.average) ? 'fill-[#C5A059]' : ''}`} />
                          ))}
                        </div>
                        <span className="text-[11px] font-mono text-[#6E645A]">({prod.ratings.count})</span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-3 border-t border-[#E8DFC8] mt-2">
                      <span className="font-sans text-[11px] text-[#6E645A] uppercase tracking-wider font-medium">Starting from</span>
                      <div className="flex items-center space-x-2">
                        {prod.compareAtPrice && (
                          <span className="text-xs text-[#9E948A] line-through font-mono">
                            {formatPrice(prod.compareAtPrice)}
                          </span>
                        )}
                        <span className="text-sm font-bold text-[#8C6819] font-mono">
                          {formatPrice(prod.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: ROYAL SHERWANI HIGHLIGHT */}
      <section id="sherwani-highlight-section" className="py-20 bg-[#FAF8F5] border-b border-[#E8DFC8] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative w-full flex flex-col items-center justify-center text-center mb-16">
            <div className="flex flex-col items-center">
              <span className="text-xs font-serif font-bold tracking-[0.3em] text-[#8C6819] uppercase block mb-2">
                Grand Regal Celebration
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1F1B17] font-normal tracking-[0.12em] uppercase">
                ROYAL SHERWANI ATELIER
              </h2>
              <div className="flex items-center justify-center space-x-3 mt-4">
                <div className="w-12 h-[1px] bg-[#E8DFC8]" />
                <div className="w-2 h-2 rotate-45 bg-[#C5A059]" />
                <div className="w-12 h-[1px] bg-[#E8DFC8]" />
              </div>
            </div>
            
            <div className="mt-8 md:mt-0 md:absolute md:right-0 md:bottom-1">
              <button
                onClick={() => onNavigate('category', { category: 'sherwani' })}
                className="flex items-center space-x-2 text-xs font-sans font-bold tracking-widest uppercase text-[#8C6819] hover:text-[#1F1B17] transition-colors group pb-1 border-b border-[#C5A059]/40 hover:border-[#1F1B17] cursor-pointer"
              >
                <span>View All Sherwanis</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#8C6819] transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {products
              .filter((p) => p.category.toLowerCase() === 'sherwani')
              .slice(0, 4)
              .map((prod) => (
                <motion.div
                  key={prod.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.98 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } }
                  }}
                  onClick={() => onNavigate('product-detail', { productId: prod.id })}
                  className="group bg-white border border-[#E8DFC8] rounded-md overflow-hidden shadow-[0_4px_20px_rgba(197,160,89,0.06)] hover:border-[#C5A059] hover:shadow-[0_10px_30px_rgba(197,160,89,0.15)] transition-all duration-500 cursor-pointer flex flex-col h-full relative"
                >
                  <div className="relative aspect-[3/4] bg-[#F5EFEB] overflow-hidden">
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-[#FAF6ED] border border-[#C5A059]/50 text-[#8C6819] text-[9px] font-sans tracking-[0.2em] uppercase font-bold px-2.5 py-1 rounded-sm shadow-xs">
                        Imperial Line
                      </span>
                    </div>

                    <img
                      src={prod.images[0].url}
                      alt={prod.images[0].alt}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:opacity-0 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {prod.images[1] ? (
                      <img
                        src={prod.images[1].url}
                        alt={prod.images[1].alt}
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <img
                        src={prod.images[0].url}
                        alt={prod.images[0].alt}
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:opacity-35 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E8DFC8] hover:border-rose-400 text-[#1F1B17] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-xs"
                      title={isWishlisted(prod.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart
                        className={`h-4 w-4 transition-all duration-300 ${
                          isWishlisted(prod.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-[#6E645A] hover:text-rose-500'
                        }`}
                      />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuickViewProduct(prod);
                        setIsQuickViewOpen(true);
                      }}
                      className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md hover:bg-[#C5A059] hover:text-white text-[#1F1B17] py-2.5 text-xs font-sans tracking-widest uppercase transition-all duration-300 rounded opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 shadow-md border border-[#E8DFC8] z-20 cursor-pointer font-bold"
                    >
                      Quick View
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-sans tracking-widest text-[#8C6819] uppercase mb-1 block font-bold">
                        Imperial Sherwani
                      </span>
                      <h3 className="font-serif text-base text-[#1F1B17] group-hover:text-[#8C6819] transition-colors font-medium line-clamp-1 mb-2">
                        {prod.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 mb-3">
                        <div className="flex text-[#C5A059]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(prod.ratings.average) ? 'fill-[#C5A059]' : ''}`} />
                          ))}
                        </div>
                        <span className="text-[11px] font-mono text-[#6E645A]">({prod.ratings.count})</span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-3 border-t border-[#E8DFC8] mt-2">
                      <span className="font-sans text-[11px] text-[#6E645A] uppercase tracking-wider font-medium">Starting from</span>
                      <div className="flex items-center space-x-2">
                        {prod.compareAtPrice && (
                          <span className="text-xs text-[#9E948A] line-through font-mono">
                            {formatPrice(prod.compareAtPrice)}
                          </span>
                        )}
                        <span className="text-sm font-bold text-[#8C6819] font-mono">
                          {formatPrice(prod.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: KIDS HERITAGE HIGHLIGHT */}
      <section id="kids-highlight-section" className="py-20 bg-[#FAF6ED] border-b border-[#E8DFC8] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative w-full flex flex-col items-center justify-center text-center mb-16">
            <div className="flex flex-col items-center">
              <span className="text-xs font-serif font-bold tracking-[0.3em] text-[#8C6819] uppercase block mb-2">
                Little Masters Noblesse
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1F1B17] font-normal tracking-[0.12em] uppercase">
                KIDS HERITAGE COUTURE
              </h2>
              <div className="flex items-center justify-center space-x-3 mt-4">
                <div className="w-12 h-[1px] bg-[#E8DFC8]" />
                <div className="w-2 h-2 rotate-45 bg-[#C5A059]" />
                <div className="w-12 h-[1px] bg-[#E8DFC8]" />
              </div>
            </div>
            
            <div className="mt-8 md:mt-0 md:absolute md:right-0 md:bottom-1">
              <button
                onClick={() => onNavigate('category', { category: 'kids' })}
                className="flex items-center space-x-2 text-xs font-sans font-bold tracking-widest uppercase text-[#8C6819] hover:text-[#1F1B17] transition-colors group pb-1 border-b border-[#C5A059]/40 hover:border-[#1F1B17] cursor-pointer"
              >
                <span>View Kids Collection</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#8C6819] transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {products
              .filter((p) => p.category.toLowerCase() === 'kids')
              .slice(0, 4)
              .map((prod) => (
                <motion.div
                  key={prod.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.98 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } }
                  }}
                  onClick={() => onNavigate('product-detail', { productId: prod.id })}
                  className="group bg-white border border-[#E8DFC8] rounded-md overflow-hidden shadow-[0_4px_20px_rgba(197,160,89,0.06)] hover:border-[#C5A059] hover:shadow-[0_10px_30px_rgba(197,160,89,0.15)] transition-all duration-500 cursor-pointer flex flex-col h-full relative"
                >
                  <div className="relative aspect-[3/4] bg-[#F5EFEB] overflow-hidden">
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-[#FAF6ED] border border-[#C5A059]/50 text-[#8C6819] text-[9px] font-sans tracking-[0.2em] uppercase font-bold px-2.5 py-1 rounded-sm shadow-xs">
                        Junior Noblesse
                      </span>
                    </div>

                    <img
                      src={prod.images[0].url}
                      alt={prod.images[0].alt}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:opacity-0 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {prod.images[1] ? (
                      <img
                        src={prod.images[1].url}
                        alt={prod.images[1].alt}
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <img
                        src={prod.images[0].url}
                        alt={prod.images[0].alt}
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:opacity-35 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E8DFC8] hover:border-rose-400 text-[#1F1B17] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-xs"
                      title={isWishlisted(prod.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart
                        className={`h-4 w-4 transition-all duration-300 ${
                          isWishlisted(prod.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-[#6E645A] hover:text-rose-500'
                        }`}
                      />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuickViewProduct(prod);
                        setIsQuickViewOpen(true);
                      }}
                      className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md hover:bg-[#C5A059] hover:text-white text-[#1F1B17] py-2.5 text-xs font-sans tracking-widest uppercase transition-all duration-300 rounded opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 shadow-md border border-[#E8DFC8] z-20 cursor-pointer font-bold"
                    >
                      Quick View
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-sans tracking-widest text-[#8C6819] uppercase mb-1 block font-bold">
                        Kids Collection
                      </span>
                      <h3 className="font-serif text-base text-[#1F1B17] group-hover:text-[#8C6819] transition-colors font-medium line-clamp-1 mb-2">
                        {prod.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 mb-3">
                        <div className="flex text-[#C5A059]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(prod.ratings.average) ? 'fill-[#C5A059]' : ''}`} />
                          ))}
                        </div>
                        <span className="text-[11px] font-mono text-[#6E645A]">({prod.ratings.count})</span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-3 border-t border-[#E8DFC8] mt-2">
                      <span className="font-sans text-[11px] text-[#6E645A] uppercase tracking-wider font-medium">Starting from</span>
                      <div className="flex items-center space-x-2">
                        {prod.compareAtPrice && (
                          <span className="text-xs text-[#9E948A] line-through font-mono">
                            {formatPrice(prod.compareAtPrice)}
                          </span>
                        )}
                        <span className="text-sm font-bold text-[#8C6819] font-mono">
                          {formatPrice(prod.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* 4. BRAND STORY SECTION */}
      <section id="brand-story-section" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Close-up Image */}
          <div className="relative h-[500px] overflow-hidden rounded-lg shadow-[0_8px_30px_rgba(197,160,89,0.12)] border border-[#E8DFC8]">
            <img
              src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80&fit=crop"
              alt="Artisan stitching details"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-4 border border-[#C5A059]/40 rounded pointer-events-none" />
          </div>

          {/* Right Narrative Copy */}
          <div className="space-y-6 lg:pl-6 text-left">
            <div className="w-12 h-[2px] bg-[#C5A059]" />
            <span className="text-xs font-serif font-bold tracking-[0.3em] text-[#8C6819] uppercase block">Our Heritage Legacy</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1F1B17] tracking-wider leading-tight">
              TRADITION. REDEFINED.
            </h2>
            <p className="text-sm text-[#5C5248] leading-relaxed font-sans">
              At VIRSA, garments are living narratives of identity, devotion, and centuries-old South Asian craftsmanship. Our brand is born from a deep devotion to preserve and elevate the fine art of royal menswear.
            </p>
            <p className="text-sm text-[#5C5248] leading-relaxed font-sans">
              Every thread in our Panjabi, Koti, Sherwani, and Jubbah collections is chosen with intense deliberation. From the loom artists weaving pure Mulberry silk and combed Egyptian cotton to master tailors handcrafting bespoke Zari embroideries, we fuse historical heritage with pristine, contemporary silhouettes.
            </p>
            <blockquote className="border-l-2 border-[#C5A059] pl-4 italic text-[#8C6819] font-serif text-base py-1">
              "We do not construct clothes. We curate a silent language of regal sophistication and timeless heritage."
            </blockquote>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('category')}
                className="px-8 py-3.5 bg-white border border-[#C5A059] text-[#8C6819] hover:bg-[#C5A059] hover:text-white text-xs font-sans font-bold tracking-widest uppercase transition-all duration-300 shadow-sm"
              >
                Discover the Craft
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STORE LOCATOR */}
      <section id="showroom-section" className="bg-[#FAF6ED] text-[#1F1B17] py-24 border-y border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative">
            <span className="text-xs font-serif font-bold tracking-[0.3em] text-[#8C6819] uppercase block mb-2">VIRSA Experience Showrooms</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1F1B17] tracking-wider">OUR FLAGSHIP LOCATIONS</h2>
            <div className="flex items-center justify-center space-x-3 mt-4">
              <div className="w-12 h-[1px] bg-[#E8DFC8]" />
              <div className="w-2 h-2 rotate-45 bg-[#C5A059]" />
              <div className="w-12 h-[1px] bg-[#E8DFC8]" />
            </div>
            
            {isAdminLoggedIn && (
              <div className="mt-6 inline-flex items-center gap-3 bg-white border border-[#C5A059]/40 rounded-full px-5 py-2 text-xs text-[#8C6819] shadow-sm">
                <span className="font-sans font-medium">Atelier Admin Mode Active</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]"></span>
                <button
                  onClick={() => {
                    localStorage.setItem('virsa_admin_active_tab', 'locations');
                    onNavigate('admin');
                  }}
                  className="font-sans font-bold hover:text-[#1F1B17] transition-colors underline cursor-pointer"
                >
                  Manage/Add Showrooms →
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {showrooms.map((store) => (
              <div
                key={store.id}
                className="bg-white border border-[#E8DFC8] rounded-lg p-6 hover:border-[#C5A059] hover:shadow-[0_8px_25px_rgba(197,160,89,0.12)] transition-all duration-300 flex flex-col justify-between relative group text-left"
              >
                {isAdminLoggedIn && (
                  <button
                    onClick={() => {
                      localStorage.setItem('virsa_admin_active_tab', 'locations');
                      onNavigate('admin');
                    }}
                    className="absolute top-4 right-4 p-2 bg-[#FAF6ED] hover:bg-[#C5A059] text-[#8C6819] hover:text-white border border-[#E8DFC8] rounded-full transition-all duration-200 shadow-xs cursor-pointer z-20 flex items-center justify-center gap-1 text-[10px] font-sans font-bold tracking-widest uppercase"
                    title="Edit Showroom Details"
                  >
                    <span>Edit</span>
                  </button>
                )}

                <div className="space-y-4">
                  <div className="p-3 bg-[#FAF6ED] rounded-full inline-block border border-[#E8DFC8]">
                    <MapPin className="h-5 w-5 text-[#8C6819] stroke-[1.5]" />
                  </div>
                  <h3 className="font-serif text-lg text-[#1F1B17] tracking-wider font-semibold">
                    {store.name}
                  </h3>
                  <div className="space-y-2 text-xs font-sans text-[#5C5248] leading-relaxed">
                    <p className="flex items-start">
                      <span className="font-semibold text-[#1F1B17] mr-1.5">Address:</span>
                      {store.address}
                    </p>
                    <p className="flex items-center">
                      <Phone className="h-3.5 w-3.5 text-[#8C6819] mr-1.5" />
                      <span>{store.phone}</span>
                    </p>
                    <p className="flex items-start">
                      <Clock className="h-3.5 w-3.5 text-[#8C6819] mr-1.5 mt-0.5" />
                      <span>{store.hours}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-[#E8DFC8]">
                  <a
                    href={store.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-block text-center py-2.5 bg-[#FAF6ED] border border-[#E8DFC8] text-[#1F1B17] hover:bg-[#C5A059] hover:text-white hover:border-[#C5A059] text-xs font-sans font-bold tracking-widest uppercase transition-all rounded-sm"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER FAQs ACCORDION */}
      <CustomerFAQs />

      {/* 6. NEWSLETTER & VIP CLUB */}
      <section id="newsletter-section" className="bg-[#FAF8F5] py-20 border-t border-[#E8DFC8]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-white border border-[#E8DFC8] flex items-center justify-center mx-auto shadow-xs">
            <Mail className="h-6 w-6 text-[#8C6819] stroke-[1.5]" />
          </div>
          <span className="text-xs font-serif font-bold tracking-[0.3em] text-[#8C6819] uppercase block">Exclusive Privileges</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1F1B17] tracking-wider font-normal">JOIN THE VIRSA VIP CLUB</h2>
          <p className="text-sm text-[#5C5248] max-w-md mx-auto leading-relaxed">
            Subscribe to receive private preview invitations, festive couture launch announcements, and bespoke sizing consultations.
          </p>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing to VIRSA VIP Atelier.');
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 bg-white text-sm text-[#1F1B17] border border-[#E8DFC8] rounded-sm focus:outline-none focus:border-[#C5A059] shadow-2xs placeholder:text-[#9E948A]"
            />
            <button
              type="submit"
              className="px-7 py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] text-xs font-sans font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-sm shadow-sm cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Quick View Modal */}
      {selectedQuickViewProduct && onAddToCart && (
        <QuickViewModal
          product={selectedQuickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={() => {
            setIsQuickViewOpen(false);
            setSelectedQuickViewProduct(null);
          }}
          onAddToCart={onAddToCart}
          onNavigate={onNavigate}
        />
      )}

      {/* Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />

      {/* Back to Top Floating Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            id="back-to-top-button"
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-8 z-40 p-3.5 bg-white border border-[#C5A059] text-[#8C6819] hover:bg-[#C5A059] hover:text-white rounded-full shadow-[0_4px_20px_rgba(197,160,89,0.25)] transition-all duration-300 group hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
            title="Back to Top"
            aria-label="Back to Top"
          >
            <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
