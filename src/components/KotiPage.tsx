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

const FABRICS = ['Velvet', 'Brocade', 'Silk', 'Jacquard'];
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

export default function KotiPage({ products, onNavigate, onAddToCart }: PageProps) {
  const { toggle: toggleWishlist, has: isWishlisted } = useWishlist();
  // Filters State (only showing koti category)
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

  // Only filter koti products
  const kotiProducts = useMemo(() => {
    return products.filter((p) => p.category === 'koti');
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...kotiProducts];

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

    // 5. Availability Filter
    if (inStockOnly) {
      result = result.filter((p) => p.variants.some((v) => v.stock > 0));
    }

    // 6. Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popularity') {
      result.sort((a, b) => b.ratings.count - a.ratings.count);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [kotiProducts, selectedSizes, selectedColors, priceRange, selectedFabrics, inStockOnly, sortBy]);

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
    <div id="koti-page-root" className="w-full">
      <SEO
        title="Handcrafted Waistcoats & Italian Velvet Kotis | VIRSA"
        description="Elevate your festive attire with VIRSA handcrafted Kotis, Italian velvet waistcoats, and metallic embroidered occasion wear tailored for regal distinction."
        canonical="/category/koti"
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=85&fit=crop"
        ogImageAlt="VIRSA Handcrafted Velvet Koti Collection"
        structuredData={getBreadcrumbListSchema([
          { name: 'Home', path: '/' },
          { name: 'Koti', path: '/category/koti' }
        ])}
      />
      {/* 1. LUXURIOUS HERO BANNER */}
      <section className="relative h-[45vh] w-full overflow-hidden bg-black flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(18,18,18,0.2), rgba(18,18,18,0.95)), url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=80&fit=crop')`
          }}
        />
        <div className="relative z-10 text-center max-w-3xl px-4 mt-8">
          <span className="text-xs sm:text-sm font-garamond tracking-[0.4em] text-[#C9A84C] uppercase mb-2 block font-medium">
            VIRSA ROYALTY
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-[0.1em] uppercase font-bold leading-tight mb-4">
            KOTI COLLECTION
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-sans tracking-wide leading-relaxed max-w-xl mx-auto">
            Elevate your traditional ensemble with bespoke luxury waistcoats. Tailored to perfection from premium Italian cotton velvet, Banarasi gold zari, and high-density jacquard blends.
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
            Showing {filteredProducts.length} of {kotiProducts.length} masterpieces
          </p>
        </div>

        {/* Filter Bar with Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-white/5 mb-10 gap-4">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-transparent border border-white/10 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] text-xs font-sans tracking-widest uppercase transition-colors rounded"
          >
            <SlidersHorizontal className="h-4 w-4 stroke-[1.5]" />
            <span>Filter Waistcoats</span>
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
                min="2000"
                max="15000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
              />
              <div className="flex justify-between text-[10px] text-gray-300 font-mono">
                <span>৳2,000</span>
                <span>৳15,000</span>
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

            {/* Section Fabric checks */}
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

            {/* Availability check */}
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

            {/* Reset button */}
            <button
              onClick={resetFilters}
              className="w-full py-2.5 border border-dashed border-white/10 text-gray-400 hover:border-[#C9A84C] hover:text-white text-xs font-sans tracking-widest uppercase transition-colors flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset All Filters</span>
            </button>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-12">
            {displayedProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="text-sm text-gray-300">No luxury Kotis match your current selection criteria.</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#C9A84C] text-[#121212] text-xs font-sans tracking-widest uppercase hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                  {displayedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => onNavigate('product-detail', { productId: prod.id })}
                      className="group bg-white/5 border border-white/5 rounded overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-[#C9A84C]/30 transition-all duration-500 cursor-pointer flex flex-col h-full"
                    >
                      <div className="relative aspect-[3/4] bg-white/5 overflow-hidden">
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
                          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-[#121212]/75 border border-white/10 hover:border-rose-500/30 text-white hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                          title={isWishlisted(prod.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                          <Heart className={`h-4 w-4 transition-all duration-300 ${isWishlisted(prod.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white/80 hover:text-white'}`} />
                        </button>

                        {/* Hover Effect overlay */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col justify-between text-left">
                        <div>
                          <span className="text-xs font-garamond tracking-widest text-[#E8D5B7] uppercase mb-1 block font-medium">
                            {prod.category}
                          </span>
                          <h3 className="font-serif text-sm text-white group-hover:text-[#C9A84C] transition-colors font-semibold line-clamp-1 mb-2">
                            {prod.name}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <div className="flex text-[#C9A84C]">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-2.5 w-2.5 ${i < Math.floor(prod.ratings.average) ? 'fill-[#C9A84C]' : ''}`} />
                              ))}
                            </div>
                            <span className="text-[9px] font-mono text-gray-400">({prod.ratings.count})</span>
                          </div>
                        </div>

                        <div className="flex items-baseline justify-between pt-3 border-t border-white/5 mt-3">
                          <span className="text-[10px] font-mono font-medium text-gray-400">Atelier Price</span>
                          <div className="flex items-center space-x-1.5">
                            {prod.compareAtPrice && (
                              <span className="text-[10px] text-gray-400 line-through font-mono">
                                ৳{prod.compareAtPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="text-xs font-semibold text-[#E8D5B7] font-mono">
                              ৳{prod.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More */}
                {filteredProducts.length > visibleCount && (
                  <div className="pt-10 text-center border-t border-white/5">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                      className="px-8 py-3.5 bg-transparent border border-white/20 text-white hover:bg-white hover:text-black text-xs font-sans tracking-widest uppercase transition-colors"
                    >
                      Load More Masterworks
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. MOBILE FILTER DRAWER */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="relative ml-auto max-w-sm w-full h-full bg-[#121212] shadow-xl p-6 flex flex-col justify-between overflow-y-auto border-l border-white/10">
            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-serif text-lg text-white font-medium uppercase tracking-wider">Filters & Specs</h3>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="text-gray-400 hover:text-white text-xs tracking-widest uppercase">
                  Close
                </button>
              </div>

              {/* Price Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-garamond tracking-widest uppercase font-bold text-white">Max Price</h4>
                  <span className="text-xs font-mono font-medium text-[#C9A84C]">৳{priceRange.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
                />
              </div>

              {/* Sizes */}
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

              {/* Color Swatches */}
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
