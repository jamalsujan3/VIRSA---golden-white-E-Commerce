/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown, Check, RefreshCw, Star, ArrowLeft, Heart } from 'lucide-react';
import { Product, ColorSwatch } from '../types';
import { useWishlist } from '../lib/wishlist';
import SEO from './SEO';
import { getBreadcrumbListSchema } from '../lib/seoSchemas';

interface PageProps {
  products: Product[];
  onNavigate: (view: string, extra?: any) => void;
  onAddToCart: (product: Product, size: string, color: ColorSwatch) => void;
}

const FABRICS = ['Cotton', 'Silk', 'Linen', 'Viscose'];
const COLORS: ColorSwatch[] = [
  { name: 'Onyx Black', hex: '#0D0D0D' },
  { name: 'Ivory Cream', hex: '#F9F6F0' },
  { name: 'Royal Navy', hex: '#1E293B' },
  { name: 'Deep Emerald', hex: '#064E3B' },
  { name: 'Champagne Gold', hex: '#D4AF37' },
  { name: 'Imperial Ivory', hex: '#FFFFF0' },
  { name: 'Royal Maroon', hex: '#58111A' },
  { name: 'Desert Sand', hex: '#D2B48C' },
  { name: 'Obsidian Black', hex: '#111827' }
];
const SIZES = ['38', '40', '42', '44', '46', '48', '50'];

export default function PajamaPage({ products, onNavigate, onAddToCart }: PageProps) {
  const { toggle: toggleWishlist, has: isWishlisted } = useWishlist();
  // Filters State (only showing pajama category)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(15000);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Toggle helpers
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const toggleFabric = (fabric: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(15000);
    setSelectedFabrics([]);
    setInStockOnly(false);
    setSortBy('newest');
    setVisibleCount(6);
  };

  // Only filter pajama products
  const pajamaProducts = useMemo(() => {
    return products.filter((p) => p.category === 'pajama');
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...pajamaProducts];

    // 1. Size Filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => selectedSizes.includes(v.size) && v.stock > 0)
      );
    }

    // 2. Color Filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => selectedColors.includes(v.color.name) && v.stock > 0)
      );
    }

    // 3. Price Filter
    result = result.filter((p) => p.price <= priceRange);

    // 4. Fabric Filter
    if (selectedFabrics.length > 0) {
      result = result.filter((p) =>
        selectedFabrics.some((f) =>
          p.fabricDetails.material.toLowerCase().includes(f.toLowerCase())
        )
      );
    }

    // 5. In Stock Filter
    if (inStockOnly) {
      result = result.filter((p) => p.variants.some((v) => v.stock > 0));
    }

    // Sort Logic
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.ratings.average - a.ratings.average);
    } else {
      // Default: newest
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [pajamaProducts, selectedSizes, selectedColors, priceRange, selectedFabrics, inStockOnly, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // Quick addition from grid
  const handleQuickAdd = (e: React.MouseEvent, product: Product, size: string) => {
    e.stopPropagation();
    const availableVariant = product.variants.find((v) => v.size === size && v.stock > 0);
    if (availableVariant) {
      onAddToCart(product, size, availableVariant.color);
      alert(`Added ${product.name} (Size: ${size}) to your cart.`);
    } else {
      alert(`Size ${size} of this item is currently out of stock.`);
    }
  };

  return (
    <div id="pajama-page-root" className="w-full">
      <SEO
        title="Heritage Pajamas, Shalwars & Trousers | VIRSA"
        description="Pair your luxury tunics with premium tailored Aligarhi pajamas, slim-fit churidars, and heritage trousers crafted from fine cotton and linen."
        canonical="/category/pajama"
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=1200&q=85&fit=crop"
        ogImageAlt="VIRSA Heritage Pajama & Trousers Collection"
        structuredData={getBreadcrumbListSchema([
          { name: 'Home', path: '/' },
          { name: 'Pajama', path: '/category/pajama' }
        ])}
      />
      {/* 1. LUXURIOUS HERO BANNER */}
      <section className="relative h-[45vh] w-full overflow-hidden bg-black flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(18,18,18,0.2), rgba(18,18,18,0.95)), url('https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=1600&q=80&fit=crop')`
          }}
        />
        <div className="relative z-10 text-center max-w-3xl px-4 mt-8">
          <span className="text-xs sm:text-sm font-garamond tracking-[0.4em] text-[#C9A84C] uppercase mb-2 block font-medium">
            VIRSA ATELIER
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-[0.1em] uppercase font-bold leading-tight mb-4">
            PAJAMA COLLECTION
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-sans tracking-wide leading-relaxed max-w-xl mx-auto">
            The perfect accompaniment to our premium Panjabis and Kablis. Classic, tailored, and premium pajama styles designed for comfort and absolute class.
          </p>
        </div>
      </section>

      {/* 2. MAIN STOREFRONT GRID & SIDEBAR FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Navigation Breadcrumb & Back action */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
          <button
            onClick={() => onNavigate('homepage')}
            className="flex items-center space-x-2 text-xs font-sans tracking-widest text-gray-400 hover:text-white uppercase transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Atelier</span>
          </button>
          
          <p className="text-xs font-sans tracking-widest text-gray-300 uppercase">
            Showing {filteredProducts.length} of {pajamaProducts.length} masterpieces
          </p>
        </div>

        {/* Filter Bar with Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-white/5 mb-10 gap-4">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:border-[#C9A84C] text-xs font-sans tracking-wider uppercase text-white transition-colors w-full sm:w-auto justify-center"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filter Collections</span>
          </button>

          <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-400 font-sans tracking-wider uppercase">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#C9A84C]" />
            <span>Filter and Sort Tailored</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <span className="text-[11px] font-sans text-gray-400 uppercase tracking-widest hidden sm:inline">Sort By:</span>
            <div className="relative w-full sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-[#121212] border border-white/10 text-white text-xs tracking-wider font-sans rounded-none px-4 py-2.5 focus:outline-none focus:border-[#C9A84C] focus:ring-0 cursor-pointer"
              >
                <option value="newest">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* A. Desktop Sidebar Filters */}
          <aside className="hidden lg:block space-y-8 pr-4 border-r border-white/5">
            {/* Price Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-garamond tracking-[0.2em] uppercase font-bold text-white border-b border-white/5 pb-2">Price Limit</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="200"
                  value={priceRange > 5000 ? 5000 : priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#C9A84C] bg-white/5 h-1 rounded-full cursor-pointer"
                />
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>৳500</span>
                  <span className="text-[#C9A84C] font-semibold">৳{(priceRange > 5000 ? 5000 : priceRange).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <h3 className="text-xs font-garamond tracking-[0.2em] uppercase font-bold text-white border-b border-white/5 pb-2">Tailored Size</h3>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => {
                  const active = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`h-9 w-9 text-xs font-mono border transition-all ${
                        active 
                          ? 'bg-[#C9A84C] border-[#C9A84C] text-[#121212] font-semibold shadow-lg' 
                          : 'border-white/10 text-white hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <h3 className="text-xs font-garamond tracking-[0.2em] uppercase font-bold text-white border-b border-white/5 pb-2">Color Palette</h3>
              <div className="grid grid-cols-5 gap-2.5">
                {COLORS.map((col) => {
                  const active = selectedColors.includes(col.name);
                  return (
                    <button
                      key={col.name}
                      onClick={() => toggleColor(col.name)}
                      className={`group relative h-7 w-7 rounded-full border border-white/10 flex items-center justify-center transition-all ${
                        active ? 'ring-2 ring-offset-2 ring-[#C9A84C]' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {active && (
                        <Check className={`h-3.5 w-3.5 ${col.hex === '#F9F6F0' || col.hex === '#FFFFF0' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fabrics */}
            <div className="space-y-4">
              <h3 className="text-xs font-garamond tracking-[0.2em] uppercase font-bold text-white border-b border-white/5 pb-2">Fabric Choice</h3>
              <div className="flex flex-col space-y-2.5">
                {FABRICS.map((fab) => {
                  const active = selectedFabrics.includes(fab);
                  return (
                    <label key={fab} className="flex items-center space-x-2.5 text-xs text-gray-400 hover:text-white cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleFabric(fab)}
                        className="rounded border-white/10 text-[#C9A84C] focus:ring-[#C9A84C] h-4 w-4 bg-transparent group-hover:border-white/30"
                      />
                      <span className={active ? 'text-white font-medium' : 'transition-colors'}>{fab}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Stock Options */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="flex items-center space-x-2.5 text-xs text-gray-400 hover:text-white cursor-pointer group">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                  className="rounded border-white/10 text-[#C9A84C] focus:ring-[#C9A84C] h-4 w-4 bg-transparent group-hover:border-white/30"
                />
                <span className={inStockOnly ? 'text-white font-medium' : 'transition-colors'}>In-Stock / Ready To Wear</span>
              </label>
            </div>

            {/* Reset Button */}
            {(selectedSizes.length > 0 || selectedColors.length > 0 || priceRange < 15000 || selectedFabrics.length > 0 || inStockOnly) && (
              <button
                onClick={resetFilters}
                className="w-full py-2.5 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#121212] hover:border-[#C9A84C] text-[10px] font-sans tracking-widest uppercase transition-all font-bold rounded"
              >
                Clear Active Filters
              </button>
            )}
          </aside>

          {/* B. Product Showcase Grid */}
          <div className="lg:col-span-3">
            {displayedProducts.length === 0 ? (
              <div className="text-center py-24 bg-white/5 border border-white/5 rounded-lg">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4 stroke-[1.2]" />
                <h3 className="text-lg font-serif text-white font-medium mb-1">No collections found</h3>
                <p className="text-xs text-gray-400 font-sans max-w-sm mx-auto">Try loosening your criteria or adjusting active filters to explore more of the Virsa Atelier.</p>
                <button
                  onClick={resetFilters}
                  className="mt-6 px-6 py-2.5 bg-[#C9A84C] hover:bg-white text-[#121212] text-xs font-sans tracking-wider uppercase font-bold transition-all rounded"
                >
                  Reset Active Filters
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                  {displayedProducts.map((product) => {
                    const primaryImg = product.images.find((img) => img.isPrimary) || product.images[0];
                    const hoverImg = product.images.find((img) => !img.isPrimary) || product.images[0];
                    const isNew = product.tags.includes('new-arrival');
                    const hasPromo = product.compareAtPrice && product.compareAtPrice > product.price;

                    return (
                      <div
                        key={product.id}
                        onClick={() => onNavigate('product-detail', { productId: product.id })}
                        className="group flex flex-col h-full bg-[#161616] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden cursor-pointer"
                      >
                        {/* Image Canvas */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
                          {isNew && (
                            <span className="absolute top-3 left-3 z-10 bg-[#C9A84C] text-[#121212] text-[9px] font-sans tracking-widest uppercase font-bold px-2 py-1 shadow-md">
                              NEW ARRIVAL
                            </span>
                          )}
                          {hasPromo && (
                            <span className="absolute top-3 right-3 z-10 bg-red-950/90 border border-red-800 text-red-200 text-[9px] font-sans tracking-widest uppercase font-bold px-2 py-1 shadow-md">
                              PROMO
                            </span>
                          )}

                          <img
                            src={primaryImg?.url}
                            alt={primaryImg?.alt || product.name}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          <img
                            src={hoverImg?.url}
                            alt={hoverImg?.alt || product.name}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out opacity-0 scale-95 group-hover:scale-105 group-hover:opacity-100"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />

                          {/* Heart Toggle Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            className="absolute top-14 right-3 z-20 p-2 rounded-full bg-[#121212]/75 border border-white/10 hover:border-rose-500/30 text-white hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                            title={isWishlisted(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                          >
                            <Heart className={`h-4 w-4 transition-all duration-300 ${isWishlisted(product.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white/80 hover:text-white'}`} />
                          </button>

                          {/* Hover Effect overlay */}
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>

                        {/* Description Blocks */}
                        <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-sans tracking-widest text-gray-400 uppercase font-bold">{product.fabricDetails?.material.split(' ')[0] || 'Premium'} Fabric</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-[#C9A84C] fill-[#C9A84C]" />
                                <span className="text-[10px] font-mono text-gray-300 font-bold">{product.ratings.average}</span>
                              </div>
                            </div>
                            <h3 className="font-serif text-sm text-white group-hover:text-[#C9A84C] transition-colors line-clamp-1">{product.name}</h3>
                          </div>

                          <div className="flex items-baseline space-x-2">
                            <span className="text-sm font-mono font-bold text-[#E8D5B7]">৳{product.price.toLocaleString()}</span>
                            {hasPromo && (
                              <span className="text-xs font-mono text-gray-400 line-through">৳{product.compareAtPrice?.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {filteredProducts.length > visibleCount && (
                  <div className="text-center pt-8">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                      className="px-8 py-3 bg-transparent border border-white/10 hover:border-[#C9A84C] hover:text-[#C9A84C] text-white text-xs font-sans tracking-widest uppercase transition-all font-bold"
                    >
                      Explore More Masterpieces
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* C. Mobile Filter Drawer / Modal Overlay */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#121212] h-full p-6 flex flex-col justify-between overflow-y-auto border-l border-white/10 z-10">
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-sm font-serif text-white tracking-widest uppercase font-bold">Atelier Filters</h3>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="text-gray-400 hover:text-white text-xs uppercase tracking-widest font-sans">
                  Close
                </button>
              </div>

              {/* Mobile Price */}
              <div className="space-y-3">
                <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Price Range</h4>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="200"
                  value={priceRange > 5000 ? 5000 : priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#C9A84C] bg-white/5 h-1 rounded-full cursor-pointer"
                />
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>৳500</span>
                  <span className="text-[#C9A84C] font-semibold">৳{(priceRange > 5000 ? 5000 : priceRange).toLocaleString()}</span>
                </div>
              </div>

              {/* Mobile Sizes */}
              <div className="space-y-3">
                <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Tailored Sizes</h4>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((sz) => {
                    const active = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        className={`h-9 w-9 text-xs font-mono border transition-all ${
                          active
                            ? 'bg-[#C9A84C] border-[#C9A84C] text-[#121212] font-semibold'
                            : 'border-white/10 text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Colors */}
              <div className="space-y-3">
                <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Colors</h4>
                <div className="flex flex-wrap gap-2.5">
                  {COLORS.map((col) => {
                    const active = selectedColors.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        onClick={() => toggleColor(col.name)}
                        className={`group relative h-7 w-7 rounded-full border border-white/10 flex items-center justify-center transition-all ${
                          active ? 'ring-2 ring-offset-2 ring-[#C9A84C]' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      >
                        {active && (
                          <Check className={`h-3.5 w-3.5 ${col.hex === '#F9F6F0' || col.hex === '#FFFFF0' ? 'text-black' : 'text-white'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fabric Selection */}
              <div className="space-y-3">
                <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Fabric Selection</h4>
                <div className="flex flex-col space-y-2">
                  {FABRICS.map((fab) => {
                    const active = selectedFabrics.includes(fab);
                    return (
                      <label key={fab} className="flex items-center space-x-2.5 text-xs text-gray-400 hover:text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleFabric(fab)}
                          className="rounded border-white/10 text-[#C9A84C] focus:ring-[#C9A84C] h-4 w-4"
                        />
                        <span className={active ? 'text-white font-medium' : ''}>{fab}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Stock switch */}
              <div className="pt-4 border-t border-white/10">
                <label className="flex items-center space-x-2.5 text-xs text-gray-400 hover:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={() => setInStockOnly(!inStockOnly)}
                    className="rounded border-white/10 text-[#C9A84C] focus:ring-[#C9A84C] h-4 w-4"
                  />
                  <span className={inStockOnly ? 'text-white font-medium' : ''}>Available / In-Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex gap-4 mt-8">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 border border-white/10 text-white text-xs font-sans tracking-widest uppercase hover:bg-white/5 transition-colors rounded"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-3 bg-[#C9A84C] text-[#121212] text-xs font-sans tracking-widest uppercase font-bold hover:bg-white transition-colors rounded"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
