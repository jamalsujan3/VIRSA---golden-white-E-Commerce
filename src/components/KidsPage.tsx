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

const FABRICS = ['Cotton', 'Linen', 'Silk blend'];
const COLORS: ColorSwatch[] = [
  { name: 'Onyx Black', hex: '#0D0D0D' },
  { name: 'Ivory Cream', hex: '#F9F6F0' },
  { name: 'Royal Navy', hex: '#1E293B' },
  { name: 'Deep Emerald', hex: '#064E3B' },
  { name: 'Champagne Gold', hex: '#D4AF37' },
  { name: 'Imperial Ivory', hex: '#FFFFF0' },
  { name: 'Royal Maroon', hex: '#58111A' },
  { name: 'Desert Sand', hex: '#D2B48C' },
  { name: 'Obsidian Black', hex: '#111827' },
  { name: 'Royal Blue', hex: '#1E40AF' }
];

const SIZES = ['18', '20', '22', '24', '26', '28', '30', '32', '34', '36'];

export default function KidsPage({ products, onNavigate, onAddToCart }: PageProps) {
  const { toggle: toggleWishlist, has: isWishlisted } = useWishlist();
  
  // Filters State (only showing kids category)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(5000);
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
    setPriceRange(5000);
    setSelectedFabrics([]);
    setInStockOnly(false);
    setSortBy('newest');
    setVisibleCount(6);
  };

  // Only filter kids products
  const kidsProducts = useMemo(() => {
    return products.filter((p) => p.category === 'kids');
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...kidsProducts];

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

    // 5. Stock Filter
    if (inStockOnly) {
      result = result.filter((p) => p.variants.some((v) => v.stock > 0));
    }

    // 6. Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popularity') {
      result.sort((a, b) => b.ratings.average - a.ratings.average);
    } else {
      // Default: newest
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [kidsProducts, selectedSizes, selectedColors, priceRange, selectedFabrics, inStockOnly, sortBy]);

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
    <div id="kids-page-root" className="w-full">
      <SEO
        title="Royal Junior & Kids Festive Wear | VIRSA"
        description="Heritage luxury for young princes. Soft hypoallergenic organic cotton Panjabis, festive mini-Kotis, and sets for boys tailored for celebratory joy."
        canonical="/category/kids"
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=1200&q=85&fit=crop"
        ogImageAlt="VIRSA Royal Junior & Kids Festive Collection"
        structuredData={getBreadcrumbListSchema([
          { name: 'Home', path: '/' },
          { name: 'Kids', path: '/category/kids' }
        ])}
      />
      {/* 1. LUXURIOUS HERO BANNER */}
      <section className="relative h-[45vh] w-full overflow-hidden bg-black flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(18,18,18,0.2), rgba(18,18,18,0.95)), url('https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=1600&q=80&fit=crop')`
          }}
        />
        <div className="relative z-10 text-center max-w-3xl px-4 mt-8">
          <span className="text-xs sm:text-sm font-garamond tracking-[0.4em] text-[#C9A84C] uppercase mb-2 block font-medium">
            VIRSA JUNIOR
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-[0.1em] uppercase font-bold leading-tight mb-4">
            KIDS COLLECTION
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-sans tracking-wide leading-relaxed max-w-xl mx-auto">
            Handcrafted miniature masterpieces of traditional elegance for kids. Tailored in soft cotton and premium linens designed for ultimate comfort and royal style.
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
            Showing {filteredProducts.length} of {kidsProducts.length} masterworks
          </p>
        </div>

        {/* Filter Bar with Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-white/5 mb-10 gap-4">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-transparent border border-white/10 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] text-xs font-sans tracking-widest uppercase transition-colors rounded"
          >
            <SlidersHorizontal className="h-4 w-4 stroke-[1.5]" />
            <span>Filter Masterworks</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-300 font-sans">Sort By:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-10 py-2 bg-[#121212] text-xs font-sans font-medium text-white border border-white/10 rounded focus:outline-none focus:border-[#C9A84C] cursor-pointer"
              >
                <option value="newest" className="bg-[#121212] text-white">Newest First</option>
                <option value="price-asc" className="bg-[#121212] text-white">Price: Low → High</option>
                <option value="price-desc" className="bg-[#121212] text-white">Price: High → Low</option>
                <option value="popularity" className="bg-[#121212] text-white">Most Popular</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-300 pointer-events-none stroke-[1.5]" />
            </div>
          </div>
        </div>

        {/* Main layout layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block space-y-8 text-left pr-4 border-r border-white/10">
            {/* Section Price Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Max Price</h4>
                <span className="text-xs font-mono font-medium text-[#C9A84C]">৳{priceRange.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="5000"
                step="200"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
              />
              <div className="flex justify-between text-[10px] text-gray-300 font-mono">
                <span>৳1,000</span>
                <span>৳5,000</span>
              </div>
            </div>

            {/* Section Size Pills */}
            <div className="space-y-3">
              <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((sz) => {
                  const active = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`h-9 w-9 text-xs font-mono font-semibold flex items-center justify-center rounded border transition-all ${
                        active
                          ? 'bg-[#C9A84C] text-[#121212] border-[#C9A84C]'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:border-[#C9A84C] hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section Color Palette */}
            <div className="space-y-3">
              <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Color Palette</h4>
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

            {/* Section Fabric Filters */}
            <div className="space-y-3">
              <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Fabric Selection</h4>
              <div className="flex flex-col space-y-2">
                {FABRICS.map((fab) => {
                  const active = selectedFabrics.includes(fab);
                  return (
                    <label key={fab} className="flex items-center space-x-2.5 text-xs text-gray-400 hover:text-white cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleFabric(fab)}
                        className="rounded border-white/10 text-[#C9A84C] focus:ring-[#C9A84C] h-4 w-4 bg-transparent"
                      />
                      <span className={active ? 'text-white font-medium' : ''}>{fab}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Availability */}
            <div className="pt-2">
              <label className="flex items-center space-x-2.5 text-xs text-gray-400 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                  className="rounded border-white/10 text-[#C9A84C] focus:ring-[#C9A84C] h-4 w-4 bg-transparent"
                />
                <span className={inStockOnly ? 'text-white font-medium' : ''}>In Stock Only</span>
              </label>
            </div>

            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white text-xs font-sans tracking-widest uppercase transition-all rounded flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          </aside>

          {/* Product Store Grid */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center border border-white/5 bg-white/[0.02] rounded">
                <p className="text-gray-400 font-sans text-sm">No kids garments match your current selection.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-6 py-2 border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black text-xs font-sans tracking-widest uppercase transition-all rounded cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-6">
                  {displayedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => onNavigate('product-detail', { productId: prod.id })}
                      className="group cursor-pointer text-left"
                    >
                      {/* Thumbnail frame */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 border border-white/5 rounded-sm">
                        {prod.images && prod.images.length > 0 ? (
                          <img
                            src={prod.images.find((img) => img.isPrimary)?.url || prod.images[0].url}
                            alt={prod.images[0].alt}
                            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-full w-full bg-zinc-800" />
                        )}

                        {/* Heart Toggle Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(prod.id);
                          }}
                          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-[#121212]/75 border border-white/10 hover:border-rose-500/30 text-white hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                          title={isWishlisted(prod.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                          <Heart className={`h-4 w-4 transition-all duration-300 ${isWishlisted(prod.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white/80 hover:text-white'}`} />
                        </button>

                        {/* Hover Effect overlay */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>

                      {/* Info Panel */}
                      <div className="mt-4 flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-sans tracking-widest text-gray-400 uppercase font-medium">
                            {prod.tags[0] || 'Exclusive'}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-[#C9A84C] text-[#C9A84C]" />
                            <span className="text-[10px] font-sans text-gray-300">{prod.ratings.average}</span>
                          </div>
                        </div>

                        <h3 className="font-serif text-sm text-white group-hover:text-[#C9A84C] transition-colors line-clamp-1">
                          {prod.name}
                        </h3>

                        <div className="flex items-center space-x-2">
                          {prod.compareAtPrice && (
                            <span className="text-xs font-mono text-gray-400 line-through">
                              ৳{prod.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="text-xs font-mono font-bold text-[#C9A84C]">
                            ৳{prod.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {filteredProducts.length > visibleCount && (
                  <div className="pt-10 text-center border-t border-white/5">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                      className="px-8 py-3 bg-transparent border border-white/20 text-white hover:bg-white hover:text-black text-xs font-sans tracking-widest uppercase transition-colors"
                    >
                      Load More Kids Garments
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>

        </div>
      </div>

      {/* 4. MOBILE FILTER DRAWER OVERLAY */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer content */}
          <div className="relative flex flex-col w-full max-w-xs bg-[#121212] border-r border-white/10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h3 className="font-serif text-lg text-white font-bold tracking-wider">Filter Options</h3>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="text-white hover:text-[#C9A84C] text-xs font-sans uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            <div className="space-y-6">
              {/* Max Price */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Max Price</h4>
                  <span className="text-xs font-mono text-[#C9A84C]">৳{priceRange}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="5000"
                  step="200"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#C9A84C]"
                />
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Sizes</h4>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((sz) => {
                    const active = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        className={`h-9 w-9 text-xs font-mono font-semibold flex items-center justify-center rounded border ${
                          active
                            ? 'bg-[#C9A84C] text-[#121212] border-[#C9A84C]'
                            : 'bg-white/5 text-gray-300 border-white/10'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Color Palette</h4>
                <div className="grid grid-cols-5 gap-2">
                  {COLORS.map((col) => {
                    const active = selectedColors.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        onClick={() => toggleColor(col.name)}
                        className={`h-7 w-7 rounded-full border border-white/10 flex items-center justify-center ${
                          active ? 'ring-2 ring-offset-2 ring-[#C9A84C]' : ''
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {active && (
                          <Check className={`h-3 w-3 ${col.hex === '#F9F6F0' || col.hex === '#FFFFF0' ? 'text-black' : 'text-white'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fabrics */}
              <div className="space-y-2">
                <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Fabric</h4>
                <div className="flex flex-col space-y-2">
                  {FABRICS.map((fab) => {
                    const active = selectedFabrics.includes(fab);
                    return (
                      <label key={fab} className="flex items-center space-x-2 text-xs text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleFabric(fab)}
                          className="rounded border-white/10 text-[#C9A84C] h-4 w-4 bg-transparent"
                        />
                        <span>{fab}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* In Stock */}
              <div>
                <label className="flex items-center space-x-2 text-xs text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={() => setInStockOnly(!inStockOnly)}
                    className="rounded border-white/10 text-[#C9A84C] h-4 w-4 bg-transparent"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  resetFilters();
                  setIsFilterDrawerOpen(false);
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-sans tracking-widest uppercase transition-all rounded border border-white/5"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
