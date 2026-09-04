/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  SlidersHorizontal,
  ChevronDown,
  Check,
  RefreshCw,
  Star,
  Heart,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ColorSwatch, AsyncStatus } from '../types';
import { useWishlist } from '../lib/wishlist';
import SEO from './SEO';
import { getBreadcrumbListSchema } from '../lib/seoSchemas';
import { formatPrice } from '../lib/formatters';
import { ProductGridSkeleton } from './Skeletons';
import { ErrorRetryCard } from './ErrorRetryCard';
import { EmptyState } from './EmptyState';

interface PLPProps {
  products: Product[];
  onNavigate: (view: string, extra?: any) => void;
  onAddToCart: (product: Product, size: string, color: ColorSwatch) => void;
  initialCategory?: string;
  initialSearchQuery?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Collections' },
  { id: 'panjabi', label: 'Panjabi' },
  { id: 'kabli', label: 'Kabli' },
  { id: 'koti', label: 'Koti' },
  { id: 'sherwani', label: 'Sherwani' },
  { id: 'jubbah', label: 'Jubbah' },
  { id: 'pajama', label: 'Pajama' },
  { id: 'kids', label: 'Kids' }
];

const FABRICS = ['Cotton', 'Silk', 'Linen', 'Viscose', 'Velvet', 'Brocade'];

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

const SIZES = ['18', '20', '22', '24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50'];

const PRICE_PRESETS = [
  { label: 'All Prices', min: 1000, max: 15000 },
  { label: 'Under ৳4,000', min: 1000, max: 4000 },
  { label: '৳4,000 - ৳7,000', min: 4000, max: 7000 },
  { label: '৳7,000 - ৳10,000', min: 7000, max: 10000 },
  { label: '৳10,000+', min: 10000, max: 15000 }
];

const CATEGORY_HEROES: Record<string, { title: string; subtitle: string; image: string; tag: string }> = {
  all: {
    title: 'THE COMPLETE ATELIER COLLECTION',
    subtitle: 'Signature luxury menswear handcrafted from 100% Giza Egyptian cotton, Mulberry silk, and Italian velvets.',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600&q=85&fit=crop',
    tag: 'Dhaka Master Craftsmen'
  },
  panjabi: {
    title: 'ROYAL HERITAGE PANJABIS',
    subtitle: 'Woven with high-count Egyptian double cotton, pure Mulberry silk, and imperial tonal needlework.',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600&q=85&fit=crop',
    tag: 'Eid & Festive Luxe'
  },
  kabli: {
    title: 'IMPERIAL KABLI SUITS & SETS',
    subtitle: 'Structured masculine drape featuring contrast piping, matching shalwars, and regal collar craftsmanship.',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1600&q=85&fit=crop',
    tag: 'Bespoke Presidential Silhouette'
  },
  koti: {
    title: 'HANDCRAFTED VELVET & BROCADE KOTIS',
    subtitle: 'Italian velvet waistcoats and metallic bullion embroidered statement pieces for prestigious events.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=85&fit=crop',
    tag: 'Occasion & Reception Layering'
  },
  sherwani: {
    title: 'IMPERIAL WEDDING SHERWANIS',
    subtitle: 'Antique Zari needlework, Banarasi brocades, and imperial cuts designed for groom excellence.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&q=85&fit=crop',
    tag: 'Royal Bridal & Groomwear'
  },
  jubbah: {
    title: 'SERENE ISLAMIC JUBBAHS & ROBES',
    subtitle: 'Minimal modern grace with breathable linen and cotton thobes tailored with tranquil refinement.',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1600&q=85&fit=crop',
    tag: 'Friday Prayer & Umrah Luxe'
  },
  pajama: {
    title: 'HERITAGE PAJAMAS & SHALWARS',
    subtitle: 'Aligarhi cuts, slim churidars, and tailored trousers crafted from breathable fine cotton.',
    image: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=1600&q=85&fit=crop',
    tag: 'Tailored Bottomwear Pairings'
  },
  kids: {
    title: 'ROYAL JUNIOR & KIDS FESTIVE WEAR',
    subtitle: 'Hypoallergenic organic cotton Panjabis and mini-Kotis tailored for young princes.',
    image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=1600&q=85&fit=crop',
    tag: 'Little Gentleman Collection'
  }
};

const ITEMS_PER_PAGE = 12;

export default function PLP({
  products,
  onNavigate,
  onAddToCart,
  initialCategory,
  initialSearchQuery
}: PLPProps) {
  const { toggle: toggleWishlist, has: isWishlisted } = useWishlist();
  const gridTopRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Helper to parse query parameters from URL
  const parseUrlParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    let categoryFromUrl = searchParams.get('category');
    if (!categoryFromUrl && pathParts[0] === 'category' && pathParts[1]) {
      categoryFromUrl = pathParts[1];
    }

    const q = searchParams.get('q') || searchParams.get('search') || initialSearchQuery || '';
    const cat = categoryFromUrl || initialCategory || 'all';
    const size = searchParams.get('size')?.split(',').filter(Boolean) || [];
    const color = searchParams.get('color')?.split(',').filter(Boolean) || [];
    const fabric = searchParams.get('fabric')?.split(',').filter(Boolean) || [];
    const minP = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 1000;
    const maxP = searchParams.get('maxPrice') || searchParams.get('price')
      ? Number(searchParams.get('maxPrice') || searchParams.get('price'))
      : 15000;
    const inStock = searchParams.get('inStock') === 'true';
    const sort = searchParams.get('sort') || 'newest';
    const page = searchParams.get('page') ? Math.max(1, Number(searchParams.get('page'))) : 1;

    return {
      category: cat,
      search: q,
      sizes: size,
      colors: color,
      fabrics: fabric,
      minPrice: isNaN(minP) ? 1000 : minP,
      maxPrice: isNaN(maxP) ? 15000 : maxP,
      inStockOnly: inStock,
      sortBy: sort,
      page: isNaN(page) ? 1 : page
    };
  };

  const initialParams = parseUrlParams();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialParams.category);
  const [searchInput, setSearchInput] = useState<string>(initialParams.search);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialParams.search);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialParams.sizes);
  const [selectedColors, setSelectedColors] = useState<string[]>(initialParams.colors);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>(initialParams.fabrics);
  const [minPrice, setMinPrice] = useState<number>(initialParams.minPrice);
  const [maxPrice, setMaxPrice] = useState<number>(initialParams.maxPrice);
  const [inStockOnly, setInStockOnly] = useState<boolean>(initialParams.inStockOnly);
  const [sortBy, setSortBy] = useState<string>(initialParams.sortBy);
  const [currentPage, setCurrentPage] = useState<number>(initialParams.page);

  // 4 Explicit Async States: idle | loading | success | error
  const [asyncStatus, setAsyncStatus] = useState<AsyncStatus>('idle');
  const [asyncError, setAsyncError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mobile Filter Drawer Toggle
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const triggerAsyncFetch = () => {
    setAsyncStatus('loading');
    setIsLoading(true);
    setAsyncError(null);

    const timer = setTimeout(() => {
      setAsyncStatus('success');
      setIsLoading(false);
    }, 280);

    return () => clearTimeout(timer);
  };

  // Trigger smooth async state transition on category or search changes
  useEffect(() => {
    triggerAsyncFetch();
  }, [selectedCategory, debouncedSearch, sortBy]);

  const handleRetry = () => {
    triggerAsyncFetch();
  };

  // 1. Debounce Search Input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchInput) {
        setDebouncedSearch(searchInput);
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, debouncedSearch]);

  // Sync if initial props change
  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
      setCurrentPage(1);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearchQuery !== undefined && initialSearchQuery !== searchInput) {
      setSearchInput(initialSearchQuery);
      setDebouncedSearch(initialSearchQuery);
      setCurrentPage(1);
    }
  }, [initialSearchQuery]);

  // 2. Synchronize Filter State with URL Query String
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    if (debouncedSearch.trim()) {
      params.set('q', debouncedSearch.trim());
    }
    if (selectedSizes.length > 0) {
      params.set('size', selectedSizes.join(','));
    }
    if (selectedColors.length > 0) {
      params.set('color', selectedColors.join(','));
    }
    if (selectedFabrics.length > 0) {
      params.set('fabric', selectedFabrics.join(','));
    }
    if (minPrice > 1000) {
      params.set('minPrice', String(minPrice));
    }
    if (maxPrice < 15000) {
      params.set('maxPrice', String(maxPrice));
    }
    if (inStockOnly) {
      params.set('inStock', 'true');
    }
    if (sortBy !== 'newest') {
      params.set('sort', sortBy);
    }
    if (currentPage > 1) {
      params.set('page', String(currentPage));
    }

    const queryString = params.toString();
    const basePath = selectedCategory !== 'all' ? `/category/${selectedCategory}` : '/category/all';
    const newUrl = queryString ? `${basePath}?${queryString}` : basePath;

    window.history.replaceState(null, '', newUrl);
  }, [
    selectedCategory,
    debouncedSearch,
    selectedSizes,
    selectedColors,
    selectedFabrics,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy,
    currentPage
  ]);

  // 3. Listen to browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlParams();
      setSelectedCategory(parsed.category);
      setSearchInput(parsed.search);
      setDebouncedSearch(parsed.search);
      setSelectedSizes(parsed.sizes);
      setSelectedColors(parsed.colors);
      setSelectedFabrics(parsed.fabrics);
      setMinPrice(parsed.minPrice);
      setMaxPrice(parsed.maxPrice);
      setInStockOnly(parsed.inStockOnly);
      setSortBy(parsed.sortBy);
      setCurrentPage(parsed.page);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 4. Trigger brief skeleton loader on filter changes to prevent jarring UI
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 240);
    return () => clearTimeout(timer);
  }, [
    selectedCategory,
    debouncedSearch,
    selectedSizes,
    selectedColors,
    selectedFabrics,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy,
    currentPage
  ]);

  // Toggle helpers
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setCurrentPage(1);
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
    setCurrentPage(1);
  };

  const toggleFabric = (fabric: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
    setCurrentPage(1);
  };

  const handlePricePreset = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedFabrics([]);
    setMinPrice(1000);
    setMaxPrice(15000);
    setInStockOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
  };

  const removeFilter = (type: string, value?: string) => {
    if (type === 'category') setSelectedCategory('all');
    if (type === 'search') {
      setSearchInput('');
      setDebouncedSearch('');
    }
    if (type === 'size' && value) setSelectedSizes((prev) => prev.filter((s) => s !== value));
    if (type === 'color' && value) setSelectedColors((prev) => prev.filter((c) => c !== value));
    if (type === 'fabric' && value) setSelectedFabrics((prev) => prev.filter((f) => f !== value));
    if (type === 'price') {
      setMinPrice(1000);
      setMaxPrice(15000);
    }
    if (type === 'inStock') setInStockOnly(false);
    setCurrentPage(1);
  };

  // Active filter count check
  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (debouncedSearch.trim() ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    selectedFabrics.length +
    (minPrice > 1000 || maxPrice < 15000 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  // Helper to calculate total stock of a product
  const getProductStock = (product: Product) => {
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 0. Search Query Filter
    if (debouncedSearch.trim() !== '') {
      const query = debouncedSearch.toLowerCase().trim();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)) ||
        (p.fabricDetails?.material && p.fabricDetails.material.toLowerCase().includes(query)) ||
        p.sku.toLowerCase().includes(query)
      );
    }

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 2. Size Filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => selectedSizes.includes(v.size) && v.stock > 0)
      );
    }

    // 3. Color Filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => selectedColors.includes(v.color.name) && v.stock > 0)
      );
    }

    // 4. Price Filter (Between min and max)
    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    // 5. Fabric Filter
    if (selectedFabrics.length > 0) {
      result = result.filter((p) =>
        selectedFabrics.some((f) =>
          p.fabricDetails?.material?.toLowerCase().includes(f.toLowerCase())
        )
      );
    }

    // 6. Availability Filter
    if (inStockOnly) {
      result = result.filter((p) => p.variants.some((v) => v.stock > 0));
    }

    // 7. Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popularity') {
      result.sort((a, b) => b.ratings.count * b.ratings.average - a.ratings.count * a.ratings.average);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [
    products,
    selectedCategory,
    debouncedSearch,
    selectedSizes,
    selectedColors,
    minPrice,
    maxPrice,
    selectedFabrics,
    inStockOnly,
    sortBy
  ]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Recommendations for No-Results State
  const recommendedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.compareAtPrice ? 1 : 0) - (a.compareAtPrice ? 1 : 0))
      .slice(0, 4);
  }, [products]);

  // Handle page navigation
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === validPage) return;
    setCurrentPage(page);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const heroInfo = CATEGORY_HEROES[selectedCategory] || CATEGORY_HEROES.all;

  const categoryLabel = selectedCategory === 'all'
    ? 'All Collections'
    : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);

  const pageTitle = debouncedSearch
    ? `Search: "${debouncedSearch}" | VIRSA Luxury Menswear`
    : `${categoryLabel} Collection | VIRSA Premium Menswear`;

  const pageDesc = debouncedSearch
    ? `Search results for "${debouncedSearch}" at VIRSA Atelier. Explore luxury traditional menswear, Panjabis, Kotis, and Kablis.`
    : `Explore VIRSA's signature ${categoryLabel} collection. Tailored with premium Egyptian cotton, Mulberry silk, and artisanal craftsmanship in Dhaka.`;

  const canonicalPath = selectedCategory === 'all' ? '/category/all' : `/category/${selectedCategory}`;

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: categoryLabel, path: canonicalPath }
  ];

  return (
    <div id="plp-root" className="w-full bg-[#FAF8F5] text-[#1F1B17] min-h-screen">
      <SEO
        title={pageTitle}
        description={pageDesc}
        canonical={canonicalPath}
        ogType="website"
        ogImage={heroInfo.image}
        structuredData={getBreadcrumbListSchema(breadcrumbs)}
      />

      {/* 1. LUXURY CATEGORY HERO BANNER */}
      <section className="relative h-[32vh] sm:h-[40vh] w-full overflow-hidden bg-[#1F1B17] flex items-center justify-center border-b border-[#E8DFC8]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('${heroInfo.image}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F1B17] via-[#1F1B17]/75 to-[#1F1B17]/40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 border border-[#E8DFC8]/40 backdrop-blur-md rounded-full shadow-sm">
            <Sparkles className="h-3 w-3 text-[#E5C158]" />
            <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#F3E5AB] font-semibold">
              {heroInfo.tag}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-white tracking-widest uppercase font-light">
            {debouncedSearch ? `Search: "${debouncedSearch}"` : heroInfo.title}
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#EAE4DC] font-sans tracking-wide leading-relaxed">
            {debouncedSearch
              ? `Found ${filteredProducts.length} handcrafted masterworks matching your inquiry.`
              : heroInfo.subtitle}
          </p>

          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto mt-2" />
        </div>
      </section>

      {/* 2. CATEGORY PILLS BAR */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#E8DFC8] sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => {
              const count = products.filter((p) => (cat.id === 'all' ? true : p.category === cat.id)).length;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-pill-${cat.id}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentPage(1);
                  }}
                  className={`whitespace-nowrap px-4 py-2 min-h-[40px] rounded-full text-xs font-sans tracking-wider uppercase transition-all duration-300 flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-bold shadow-[0_2px_10px_rgba(212,175,55,0.3)]'
                      : 'bg-[#FAF6ED] text-[#5C5248] hover:bg-[#FAF8F5] hover:text-[#1F1B17] border border-[#E8DFC8]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/15 text-[#1F1B17] font-bold' : 'bg-white text-[#8C6819]'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div ref={gridTopRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Top Controls Bar: Search, Filter Toggle, Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-[#E8DFC8] mb-8">
          
          {/* Debounced Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C6819] pointer-events-none" />
            <input
              id="plp-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by fabric, motif, color, size, SKU..."
              className="w-full min-h-[44px] bg-white border border-[#E8DFC8] rounded-lg pl-10 pr-10 py-2.5 text-xs text-[#1F1B17] placeholder-[#9E948A] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 transition-all font-sans shadow-2xs"
            />
            {searchInput && (
              <button
                id="clear-search-btn"
                onClick={() => {
                  setSearchInput('');
                  setDebouncedSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E948A] hover:text-[#1F1B17] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
                title="Clear search"
                aria-label="Clear search text"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right Action Group */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            
            {/* Mobile Filter Button */}
            <button
              id="toggle-mobile-filters-btn"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2.5 min-h-[44px] bg-white border border-[#E8DFC8] text-[#1F1B17] hover:border-[#C5A059] hover:text-[#8C6819] text-xs font-sans tracking-widest uppercase transition-all rounded-lg cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#8C6819]" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#C5A059] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Control */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#6E645A] font-sans hidden sm:inline flex items-center gap-1 font-semibold uppercase">
                <ArrowUpDown className="h-3 w-3 text-[#8C6819]" />
                Sort:
              </span>
              <div className="relative">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-3.5 pr-9 py-2.5 min-h-[44px] bg-white text-xs font-sans font-medium text-[#1F1B17] border border-[#E8DFC8] rounded-lg focus:outline-none focus:border-[#C5A059] cursor-pointer hover:border-[#C5A059] transition-colors shadow-2xs"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="popularity">Most Popular & Top Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C6819] pointer-events-none stroke-[1.5]" />
              </div>
            </div>

          </div>
        </div>

        {/* 4. ACTIVE FILTER CHIPS (If any applied) */}
        {activeFiltersCount > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2 bg-[#FAF6ED] border border-[#E8DFC8] p-3.5 rounded-lg">
            <span className="text-[11px] font-sans font-bold text-[#6E645A] uppercase tracking-wider mr-2">Active Filters:</span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#C5A059] text-[#8C6819] text-xs font-sans font-semibold rounded-full shadow-2xs">
                Category: <strong className="uppercase">{selectedCategory}</strong>
                <button onClick={() => removeFilter('category')} className="hover:text-[#1F1B17] cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            )}

            {debouncedSearch.trim() && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E8DFC8] text-[#1F1B17] text-xs rounded-full shadow-2xs">
                Search: "{debouncedSearch}"
                <button onClick={() => removeFilter('search')} className="hover:text-rose-600 cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            )}

            {(minPrice > 1000 || maxPrice < 15000) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E8DFC8] text-[#1F1B17] text-xs rounded-full font-mono shadow-2xs">
                ৳{minPrice.toLocaleString()} - ৳{maxPrice.toLocaleString()}
                <button onClick={() => removeFilter('price')} className="hover:text-rose-600 cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            )}

            {selectedSizes.map((sz) => (
              <span key={sz} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E8DFC8] text-[#1F1B17] text-xs rounded-full font-mono shadow-2xs">
                Size: {sz}
                <button onClick={() => removeFilter('size', sz)} className="hover:text-rose-600 cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            ))}

            {selectedColors.map((col) => (
              <span key={col} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E8DFC8] text-[#1F1B17] text-xs rounded-full shadow-2xs">
                Color: {col}
                <button onClick={() => removeFilter('color', col)} className="hover:text-rose-600 cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            ))}

            {selectedFabrics.map((fab) => (
              <span key={fab} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E8DFC8] text-[#1F1B17] text-xs rounded-full shadow-2xs">
                Fabric: {fab}
                <button onClick={() => removeFilter('fabric', fab)} className="hover:text-rose-600 cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            ))}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-full shadow-2xs">
                In Stock Only
                <button onClick={() => removeFilter('inStock')} className="hover:text-emerald-950 cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-[11px] font-sans tracking-wider uppercase text-rose-600 hover:text-rose-800 font-bold underline ml-auto cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* 5. MAIN CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* ================= DESKTOP SIDEBAR FILTERS ================= */}
          <aside className="hidden lg:block space-y-7 text-left pr-4 border-r border-[#E8DFC8]">
            
            {/* Header & Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="h-4 w-4 text-[#8C6819]" />
                <h3 className="text-xs font-serif tracking-[0.2em] uppercase font-bold text-[#1F1B17]">
                  Refine Masterworks
                </h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-sans uppercase tracking-wider text-[#8C6819] hover:text-[#1F1B17] flex items-center space-x-1 font-bold cursor-pointer"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* 1. Categories */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-serif tracking-widest uppercase font-bold text-[#1F1B17] flex items-center justify-between">
                <span>Collections</span>
                <span className="text-[10px] font-mono text-[#8C6819] font-normal">{products.length} Total</span>
              </h4>
              <div className="flex flex-col space-y-1">
                {CATEGORIES.map((cat) => {
                  const count = products.filter((p) => (cat.id === 'all' ? true : p.category === cat.id)).length;
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center justify-between py-2 px-3 rounded text-xs uppercase tracking-wider font-sans transition-all text-left cursor-pointer ${
                        active
                          ? 'bg-[#FAF6ED] text-[#8C6819] font-bold border-l-2 border-[#C5A059]'
                          : 'text-[#5C5248] hover:text-[#1F1B17] hover:bg-white'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="text-[10px] font-mono text-[#9E948A]">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Price Range */}
            <div className="space-y-3 pt-3 border-t border-[#E8DFC8]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-serif tracking-widest uppercase font-bold text-[#1F1B17]">Price Range</h4>
                <span className="text-xs font-mono font-bold text-[#8C6819]">
                  ৳{minPrice.toLocaleString()} - ৳{maxPrice.toLocaleString()}
                </span>
              </div>

              {/* Price Range Slider */}
              <input
                id="price-range-slider"
                type="range"
                min="1000"
                max="15000"
                step="500"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full h-1.5 bg-[#E8DFC8] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
              />

              {/* Presets */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {PRICE_PRESETS.map((p) => {
                  const isSelected = minPrice === p.min && maxPrice === p.max;
                  return (
                    <button
                      key={p.label}
                      onClick={() => handlePricePreset(p.min, p.max)}
                      className={`text-[10px] font-mono py-1.5 px-2 rounded border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#C5A059] text-white border-[#C5A059] font-bold shadow-xs'
                          : 'bg-white text-[#5C5248] border-[#E8DFC8] hover:text-[#1F1B17] hover:border-[#C5A059]'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Sizes */}
            <div className="space-y-2.5 pt-3 border-t border-[#E8DFC8]">
              <h4 className="text-xs font-serif tracking-widest uppercase font-bold text-[#1F1B17] flex items-center justify-between">
                <span>Sizes</span>
                {selectedSizes.length > 0 && (
                  <span className="text-[10px] text-[#8C6819] font-mono font-bold">{selectedSizes.length} Selected</span>
                )}
              </h4>
              <div className="grid grid-cols-4 gap-1.5">
                {SIZES.map((sz) => {
                  const active = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`h-8 text-xs font-mono font-semibold flex items-center justify-center rounded border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#C5A059] text-white border-[#C5A059] shadow-xs font-bold'
                          : 'bg-white text-[#5C5248] border-[#E8DFC8] hover:border-[#C5A059] hover:text-[#1F1B17]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Color Swatches */}
            <div className="space-y-2.5 pt-3 border-t border-[#E8DFC8]">
              <h4 className="text-xs font-serif tracking-widest uppercase font-bold text-[#1F1B17]">Color Palette</h4>
              <div className="grid grid-cols-5 gap-2.5">
                {COLORS.map((col) => {
                  const active = selectedColors.includes(col.name);
                  return (
                    <button
                      key={col.name}
                      onClick={() => toggleColor(col.name)}
                      className={`group relative h-7 w-7 rounded-full border border-[#D1C7B7] flex items-center justify-center transition-all cursor-pointer ${
                        active ? 'ring-2 ring-offset-2 ring-[#C5A059] scale-110' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {active && (
                        <Check className={`h-3 w-3 ${col.hex === '#F9F6F0' || col.hex === '#FFFFF0' ? 'text-[#1F1B17]' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Fabrics */}
            <div className="space-y-2.5 pt-3 border-t border-[#E2D9C5]">
              <h4 className="text-xs font-serif tracking-widest uppercase font-bold text-[#18181B]">Fabric Artistry</h4>
              <div className="flex flex-col space-y-1.5">
                {FABRICS.map((fab) => {
                  const active = selectedFabrics.includes(fab);
                  return (
                    <label key={fab} className="flex items-center space-x-2 text-xs text-[#27272A] hover:text-[#18181B] cursor-pointer select-none font-medium">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleFabric(fab)}
                        className="rounded border-[#E2D9C5] text-[#854D0E] focus:ring-[#854D0E] h-3.5 w-3.5"
                      />
                      <span className={active ? 'text-[#854D0E] font-bold' : ''}>{fab}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 6. In-Stock Filter */}
            <div className="pt-3 border-t border-[#E2D9C5]">
              <label className="flex items-center space-x-2 text-xs text-[#27272A] hover:text-[#18181B] cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => {
                    setInStockOnly(!inStockOnly);
                    setCurrentPage(1);
                  }}
                  className="rounded border-[#E2D9C5] text-[#854D0E] focus:ring-[#854D0E] h-4 w-4"
                />
                <span className={inStockOnly ? 'text-[#854D0E] font-bold' : ''}>In Stock / Available Only</span>
              </label>
            </div>

          </aside>

          {/* ================= PRODUCT GRID & STATES ================= */}
          <div className="lg:col-span-3 space-y-10 text-left">
            
            {/* Header Result Count info */}
            <div className="flex items-center justify-between text-xs text-[#3F3F46] font-sans pb-2 border-b border-[#E2D9C5]">
              <span>
                Showing <strong className="text-[#18181B] font-mono">{filteredProducts.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}</strong> of <strong className="text-[#854D0E] font-mono">{filteredProducts.length}</strong> masterworks
              </span>
              {totalPages > 1 && (
                <span className="font-mono text-[11px] font-bold text-[#854D0E]">
                  Page {validPage} of {totalPages}
                </span>
              )}
            </div>

            {/* 1. SKELETON LOADING STATE */}
            {isLoading || asyncStatus === 'loading' ? (
              <ProductGridSkeleton count={6} columns={3} />
            ) : asyncStatus === 'error' ? (
              <ErrorRetryCard
                title="Garment Retrieval Interrupted"
                message={asyncError || "Failed to load luxury collections. Please verify your connection."}
                onRetry={handleRetry}
                onSecondaryAction={resetFilters}
                secondaryActionLabel="Reset Filters"
              />
            ) : filteredProducts.length === 0 ? (
              /* 2. DEDICATED EMPTY STATES */
              <div id="no-results-state" className="space-y-8">
                {debouncedSearch ? (
                  <EmptyState
                    type="search"
                    searchQuery={debouncedSearch}
                    primaryAction={{
                      label: 'Clear Search',
                      onClick: () => {
                        setSearchInput('');
                        setDebouncedSearch('');
                        setCurrentPage(1);
                      }
                    }}
                    secondaryAction={{
                      label: 'Browse All Collections',
                      onClick: () => {
                        resetFilters();
                        setSelectedCategory('all');
                      }
                    }}
                    suggestedTags={[
                      { label: 'Silk Panjabi', onClick: () => { setSearchInput('Silk'); setDebouncedSearch('Silk'); } },
                      { label: 'Royal Sherwani', onClick: () => { setSearchInput('Sherwani'); setDebouncedSearch('Sherwani'); } },
                      { label: 'Imperial Kabli', onClick: () => { setSearchInput('Kabli'); setDebouncedSearch('Kabli'); } },
                      { label: 'Velvet Koti', onClick: () => { setSearchInput('Koti'); setDebouncedSearch('Koti'); } }
                    ]}
                  />
                ) : (
                  <EmptyState
                    type="filter"
                    activeFilters={[
                      ...selectedSizes.map((s) => ({ label: `Size ${s}`, onRemove: () => toggleSize(s) })),
                      ...selectedColors.map((c) => ({ label: `Color: ${c}`, onRemove: () => toggleColor(c) })),
                      ...selectedFabrics.map((f) => ({ label: `Fabric: ${f}`, onRemove: () => toggleFabric(f) })),
                      ...(inStockOnly ? [{ label: 'In Stock Only', onRemove: () => setInStockOnly(false) }] : []),
                      ...(minPrice > 0 || maxPrice < 50000
                        ? [{ label: `Price: ${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`, onRemove: () => { setMinPrice(0); setMaxPrice(50000); } }]
                        : [])
                    ]}
                    primaryAction={{
                      label: 'Reset All Filters',
                      onClick: resetFilters
                    }}
                    secondaryAction={{
                      label: 'View All Collections',
                      onClick: () => {
                        resetFilters();
                        setSelectedCategory('all');
                      }
                    }}
                  />
                )}

                {/* Suggested Masterworks Grid */}
                <div className="pt-8 border-t border-[#E8DFC8] text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-serif uppercase tracking-[0.2em] text-[#8C6819] font-bold">
                      Featured Masterworks You May Admire
                    </h4>
                    <span className="text-[10px] text-[#6E645A] font-sans">Curated recommendations</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {recommendedProducts.map((prod) => (
                      <div
                        key={`rec-${prod.id}`}
                        onClick={() => onNavigate('product-detail', { productId: prod.id })}
                        className="bg-white border border-[#E8DFC8] rounded-lg p-2.5 hover:border-[#C5A059] transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="aspect-[3/4] overflow-hidden rounded mb-2 bg-[#F5EFEB]">
                          <img
                            src={prod.images[0].url}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <h5 className="font-serif text-[11px] text-[#1F1B17] group-hover:text-[#8C6819] line-clamp-1 font-semibold">
                          {prod.name}
                        </h5>
                        <p className="text-[10px] font-mono text-[#8C6819] font-bold mt-1">{formatPrice(prod.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (

              /* 3. PRODUCT CARDS GRID */
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                {displayedProducts.map((prod) => {
                  const totalStock = getProductStock(prod);
                  const isOutOfStock = totalStock === 0;
                  const isLowStock = totalStock > 0 && totalStock <= 5;
                  const hasDiscount = prod.compareAtPrice && prod.compareAtPrice > prod.price;
                  const discountPercent = hasDiscount
                    ? Math.round(((prod.compareAtPrice! - prod.price) / prod.compareAtPrice!) * 100)
                    : 0;

                  return (
                    <div
                      key={prod.id}
                      id={`product-card-${prod.id}`}
                      onClick={() => onNavigate('product-detail', { productId: prod.id })}
                      className="group bg-white border border-[#E8DFC8] rounded-lg overflow-hidden shadow-[0_4px_15px_rgba(197,160,89,0.06)] hover:border-[#C5A059] hover:shadow-[0_8px_25px_rgba(197,160,89,0.15)] transition-all duration-500 cursor-pointer flex flex-col h-full relative"
                    >
                      {/* Image Frame */}
                      <div className="relative aspect-[3/4] bg-[#F5EFEB] overflow-hidden">
                        <img
                          src={prod.images[0].url}
                          alt={prod.images[0].alt || prod.name}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
                          referrerPolicy="no-referrer"
                        />
                        {prod.images[1] ? (
                          <img
                            src={prod.images[1].url}
                            alt={prod.images[1].alt || prod.name}
                            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <img
                            src={prod.images[0].url}
                            alt={prod.images[0].alt || prod.name}
                            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
                            referrerPolicy="no-referrer"
                          />
                        )}

                        {/* Top Badges: Discount or Special Tag */}
                        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                          {hasDiscount && (
                            <span className="bg-[#B91C1C] text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded shadow tracking-wider">
                              SAVE {discountPercent}%
                            </span>
                          )}
                          {prod.tags.includes('best-seller') && (
                            <span className="bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] text-[9px] font-bold font-sans uppercase px-2 py-0.5 rounded shadow tracking-wider">
                              Best Seller
                            </span>
                          )}
                          {prod.tags.includes('new-arrival') && (
                            <span className="bg-white text-[#1F1B17] border border-[#E8DFC8] text-[9px] font-bold font-sans uppercase px-2 py-0.5 rounded shadow tracking-wider">
                              New Arrival
                            </span>
                          )}
                        </div>

                        {/* Heart Wishlist Button */}
                        <button
                          id={`wishlist-btn-${prod.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(prod.id);
                          }}
                          className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#E8DFC8] hover:border-rose-400 text-[#1F1B17] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-xs"
                          title={isWishlisted(prod.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart
                            className={`h-4 w-4 transition-all duration-300 ${
                              isWishlisted(prod.id)
                                ? 'fill-rose-500 text-rose-500 scale-110'
                                : 'text-[#6E645A] hover:text-rose-500'
                            }`}
                          />
                        </button>

                        {/* Out of Stock Overlay */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
                            <span className="px-3 py-1.5 bg-rose-100 border border-rose-300 text-rose-800 text-xs font-mono font-bold tracking-widest uppercase rounded">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Content Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        
                        {/* Top: Category & Name */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-serif uppercase tracking-widest text-[#854D0E] mb-1 font-bold">
                            <span>{prod.category}</span>
                            <span className="text-[10px] font-mono text-[#52525B] font-semibold">{prod.sku}</span>
                          </div>

                          <h3 className="font-serif text-sm text-[#18181B] group-hover:text-[#854D0E] transition-colors font-bold line-clamp-1 leading-snug">
                            {prod.name}
                          </h3>

                          {/* Ratings */}
                          <div className="flex items-center space-x-1.5 mt-1.5">
                            <div className="flex text-[#D97706]">
                              {[...Array(5)].map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`h-3 w-3 ${
                                    idx < Math.floor(prod.ratings.average) ? 'fill-[#D97706]' : 'text-[#D1D5DB]'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-mono text-[#3F3F46] font-semibold">
                              {prod.ratings.average.toFixed(1)} ({prod.ratings.count})
                            </span>
                          </div>
                        </div>

                        {/* Bottom: Price & Stock Status Badge */}
                        <div className="pt-3 border-t border-[#E2D9C5] space-y-2">
                          
                          {/* Price with Discount */}
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] font-sans uppercase tracking-wider text-[#3F3F46] font-bold">Price</span>
                            <div className="flex items-baseline space-x-2">
                              {hasDiscount && (
                                <span className="text-xs text-[#6B7280] line-through font-mono">
                                  {formatPrice(prod.compareAtPrice)}
                                </span>
                              )}
                              <span className="text-base font-bold text-[#854D0E] font-mono">
                                {formatPrice(prod.price)}
                              </span>
                            </div>
                          </div>

                          {/* Stock Status Badge */}
                          <div className="flex items-center justify-between pt-1">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                                Only {totalStock} Left
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                In Stock
                              </span>
                            )}

                            {/* View Details Link */}
                            <span className="text-[11px] font-sans tracking-wider uppercase text-[#854D0E] group-hover:text-[#18181B] font-bold transition-colors">
                              Explore →
                            </span>
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= PAGINATION CONTROLS ================= */}
            {totalPages > 1 && (
              <nav aria-label="Catalog Pagination" className="pt-10 border-t border-[#E8DFC8] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[#6E645A] font-sans">
                  Showing Page <strong className="text-[#1F1B17] font-mono">{validPage}</strong> of <strong className="text-[#1F1B17] font-mono">{totalPages}</strong>
                </span>

                <div className="flex items-center space-x-1.5">
                  {/* Previous Button */}
                  <button
                    id="pagination-prev-btn"
                    onClick={() => handlePageChange(validPage - 1)}
                    disabled={validPage <= 1}
                    className="p-2 rounded-lg border border-[#E8DFC8] text-[#1F1B17] bg-white hover:bg-[#FAF6ED] hover:border-[#C5A059] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4 text-[#8C6819]" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === validPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-9 w-9 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] border-[#C5A059] shadow-xs'
                            : 'bg-white text-[#5C5248] border-[#E8DFC8] hover:border-[#C5A059] hover:text-[#1F1B17]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    id="pagination-next-btn"
                    onClick={() => handlePageChange(validPage + 1)}
                    disabled={validPage >= totalPages}
                    className="p-2 rounded-lg border border-[#E8DFC8] text-[#1F1B17] bg-white hover:bg-[#FAF6ED] hover:border-[#C5A059] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="h-4 w-4 text-[#8C6819]" />
                  </button>
                </div>
              </nav>
            )}

          </div>

        </div>

      </div>

      {/* ================= MOBILE FILTER DRAWER OVERLAY ================= */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 bg-[#1F1B17]/60 z-50 lg:hidden cursor-pointer backdrop-blur-sm"
            />

            {/* Mobile Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[88%] max-w-md bg-white border-r border-[#E8DFC8] z-50 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl lg:hidden text-left"
            >
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E8DFC8]">
                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="h-5 w-5 text-[#8C6819]" />
                    <h3 className="font-serif text-lg text-[#1F1B17] uppercase tracking-wider font-bold">
                      Filters & Specs
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="text-[#6E645A] hover:text-[#1F1B17] p-2 rounded-lg hover:bg-[#FAF6ED]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <h4 className="text-xs font-serif tracking-widest uppercase font-bold text-[#1F1B17]">Collections</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setCurrentPage(1);
                        }}
                        className={`min-h-[44px] py-2 px-2 text-center text-xs uppercase tracking-wider font-sans border rounded-lg transition-all cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-[#C5A059] text-white border-[#C5A059] font-bold shadow-xs'
                            : 'bg-[#FAF6ED] text-[#5C5248] border-[#E8DFC8] hover:border-[#C5A059]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2 pt-3 border-t border-[#E8DFC8]">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-serif tracking-widest uppercase font-bold text-[#1F1B17]">Max Price</h4>
                    <span className="text-xs font-mono text-[#8C6819] font-bold">৳{maxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="15000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full h-8 accent-[#C5A059] cursor-pointer"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {PRICE_PRESETS.map((p) => (
                      <button
                        key={`m-${p.label}`}
                        onClick={() => handlePricePreset(p.min, p.max)}
                        className={`text-xs font-mono min-h-[44px] py-2 px-2 rounded-lg border cursor-pointer ${
                          minPrice === p.min && maxPrice === p.max
                            ? 'bg-[#C5A059] text-white border-[#C5A059] font-bold'
                            : 'bg-[#FAF6ED] text-[#5C5248] border-[#E8DFC8] hover:border-[#C5A059]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-2 pt-3 border-t border-[#E8DFC8]">
                  <h4 className="text-xs font-serif tracking-widest uppercase font-bold text-[#1F1B17]">Sizes</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {SIZES.map((sz) => {
                      const active = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          onClick={() => toggleSize(sz)}
                          className={`min-h-[44px] text-xs font-mono font-semibold flex items-center justify-center rounded-lg border cursor-pointer ${
                            active
                              ? 'bg-[#C5A059] text-white border-[#C5A059]'
                              : 'bg-[#FAF6ED] text-[#5C5248] border-[#E8DFC8] hover:border-[#C5A059]'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-2 pt-3 border-t border-[#E8DFC8]">
                  <h4 className="text-xs font-serif tracking-widest uppercase font-bold text-[#1F1B17]">Colors</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {COLORS.map((col) => {
                      const active = selectedColors.includes(col.name);
                      return (
                        <button
                          key={col.name}
                          onClick={() => toggleColor(col.name)}
                          className={`min-h-[44px] min-w-[44px] h-11 w-11 rounded-full border border-[#D1C7B7] flex items-center justify-center cursor-pointer transition-transform ${
                            active ? 'ring-2 ring-offset-2 ring-[#C5A059] scale-105' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                          aria-label={`Filter by color ${col.name}`}
                        >
                          {active && (
                            <Check className={`h-4 w-4 ${col.hex === '#F9F6F0' || col.hex === '#FFFFF0' ? 'text-[#1F1B17]' : 'text-white'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fabrics */}
                <div className="space-y-2 pt-3 border-t border-[#E8DFC8]">
                  <h4 className="text-xs font-serif tracking-widest uppercase font-bold text-[#1F1B17]">Fabrics</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {FABRICS.map((fab) => {
                      const active = selectedFabrics.includes(fab);
                      return (
                        <label key={fab} className="flex items-center space-x-2.5 min-h-[44px] py-1 text-xs text-[#5C5248] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => toggleFabric(fab)}
                            className="rounded border-[#E8DFC8] text-[#C5A059] h-5 w-5 cursor-pointer"
                          />
                          <span>{fab}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* In Stock */}
                <div className="pt-3 border-t border-[#E8DFC8]">
                  <label className="flex items-center space-x-2.5 min-h-[44px] py-1 text-xs text-[#5C5248] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={() => {
                        setInStockOnly(!inStockOnly);
                        setCurrentPage(1);
                      }}
                      className="rounded border-[#E8DFC8] text-[#C5A059] h-5 w-5 cursor-pointer"
                    />
                    <span>Available / In Stock Only</span>
                  </label>
                </div>

              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-[#E8DFC8] space-y-2.5 mt-6">
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-full min-h-[48px] py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] font-bold text-xs font-sans tracking-widest uppercase rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  View ({filteredProducts.length}) Masterworks
                </button>
                <button
                  onClick={() => {
                    resetFilters();
                    setIsFilterDrawerOpen(false);
                  }}
                  className="w-full min-h-[44px] py-2.5 bg-white border border-[#E8DFC8] text-[#5C5248] text-xs font-sans tracking-widest uppercase rounded-lg hover:border-[#C5A059] hover:text-[#1F1B17] transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
