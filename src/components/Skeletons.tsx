/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Single Product Card Skeleton Loader
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-[#E8DFC8] rounded-xl overflow-hidden flex flex-col h-full animate-pulse shadow-2xs">
      {/* 3:4 Aspect ratio image box */}
      <div className="aspect-[3/4] bg-[#F5EFEB] relative flex items-center justify-center overflow-hidden">
        <div className="w-12 h-12 rounded-full border border-[#E8DFC8] bg-white/40" />
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-2">
          {/* Category & Tag */}
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-16 bg-[#C5A059]/30 rounded" />
            <div className="h-2.5 w-10 bg-[#E8DFC8] rounded" />
          </div>

          {/* Product Title */}
          <div className="h-4 w-5/6 bg-[#E8DFC8] rounded" />
          <div className="h-3 w-3/5 bg-[#F5EFEB] rounded" />
        </div>

        {/* Color Swatch Dots & Price */}
        <div className="pt-2 border-t border-[#E8DFC8] flex items-center justify-between">
          <div className="flex space-x-1.5">
            <div className="h-3 w-3 rounded-full bg-[#E8DFC8]" />
            <div className="h-3 w-3 rounded-full bg-[#E8DFC8]" />
            <div className="h-3 w-3 rounded-full bg-[#E8DFC8]" />
          </div>
          <div className="h-4 w-16 bg-[#C5A059]/40 rounded font-mono" />
        </div>
      </div>
    </div>
  );
}

/**
 * Product Grid Skeleton Loader
 */
export function ProductGridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: 3 | 4 }) {
  const colClass =
    columns === 3
      ? 'grid grid-cols-2 md:grid-cols-3 gap-6'
      : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';

  return (
    <div className={colClass} aria-label="Loading garments...">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * Product Detail Page (PDP) Skeleton Loader
 */
export function PDPSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse text-left">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="h-3 w-12 bg-[#E8DFC8] rounded" />
        <div className="h-3 w-2 bg-[#D1C7B7] rounded" />
        <div className="h-3 w-16 bg-[#E8DFC8] rounded" />
        <div className="h-3 w-2 bg-[#D1C7B7] rounded" />
        <div className="h-3 w-32 bg-[#C5A059]/30 rounded" />
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Thumbnails + Main Image */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails strip */}
          <div className="flex md:flex-col flex-row gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-16 h-20 sm:w-20 sm:h-24 bg-[#F5EFEB] border border-[#E8DFC8] rounded-md"
              />
            ))}
          </div>

          {/* Main Large Image */}
          <div className="flex-1 aspect-[3/4] bg-[#F5EFEB] border border-[#E8DFC8] rounded-xl relative overflow-hidden flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-[#E8DFC8] bg-white/40" />
          </div>
        </div>

        {/* Right Column: Product Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tag & Category */}
          <div className="flex items-center space-x-2">
            <div className="h-3 w-20 bg-[#C5A059]/40 rounded" />
            <div className="h-3 w-2 bg-[#E8DFC8] rounded" />
            <div className="h-3 w-16 bg-[#E8DFC8] rounded" />
          </div>

          {/* Product Title */}
          <div className="space-y-2">
            <div className="h-7 w-5/6 bg-[#E8DFC8] rounded" />
            <div className="h-5 w-3/4 bg-[#E8DFC8] rounded" />
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="h-4 w-24 bg-[#C5A059]/30 rounded" />
            <div className="h-3 w-16 bg-[#E8DFC8] rounded" />
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-3 py-2 border-y border-[#E8DFC8]">
            <div className="h-8 w-28 bg-[#C5A059]/50 rounded font-mono" />
            <div className="h-5 w-20 bg-[#E8DFC8] rounded font-mono" />
          </div>

          {/* Color Selection Skeleton */}
          <div className="space-y-3">
            <div className="h-3.5 w-24 bg-[#E8DFC8] rounded" />
            <div className="flex space-x-3">
              {[1, 2, 3].map((c) => (
                <div key={c} className="h-9 w-9 rounded-full bg-[#F5EFEB] border border-[#E8DFC8]" />
              ))}
            </div>
          </div>

          {/* Size Selection Skeleton */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-3.5 w-24 bg-[#E8DFC8] rounded" />
              <div className="h-3 w-16 bg-[#C5A059]/30 rounded" />
            </div>
            <div className="flex flex-wrap gap-2">
              {['38', '40', '42', '44', '46'].map((s) => (
                <div key={s} className="h-10 w-12 rounded-lg bg-white border border-[#E8DFC8]" />
              ))}
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-4">
            <div className="flex gap-4">
              <div className="h-12 w-28 bg-white border border-[#E8DFC8] rounded-lg" />
              <div className="h-12 flex-1 bg-[#C5A059]/40 rounded-lg" />
            </div>
            <div className="h-12 w-full bg-white border border-[#E8DFC8] rounded-lg" />
          </div>

          {/* Atelier Highlights */}
          <div className="border border-[#E8DFC8] bg-[#FAF6ED] rounded-xl p-4 space-y-3">
            <div className="h-4 w-36 bg-[#E8DFC8] rounded" />
            <div className="h-3 w-full bg-[#E8DFC8] rounded" />
            <div className="h-3 w-4/5 bg-[#E8DFC8] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Search Suggestion Skeleton (for live search drawer)
 */
export function SearchSuggestionsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center space-x-4 p-3 bg-white border border-[#E8DFC8] rounded-xl shadow-2xs"
        >
          <div className="h-14 w-14 bg-[#F5EFEB] rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-12 bg-[#C5A059]/30 rounded" />
            <div className="h-3.5 w-32 bg-[#E8DFC8] rounded" />
            <div className="h-3 w-16 bg-[#C5A059]/40 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
