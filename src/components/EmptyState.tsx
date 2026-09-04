/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Heart, Search, Filter, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

export type EmptyStateType = 'cart' | 'wishlist' | 'search' | 'filter' | 'generic';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  searchQuery?: string;
  activeFilters?: { label: string; onRemove?: () => void }[];
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  suggestedTags?: { label: string; onClick: () => void }[];
  children?: ReactNode;
}

export function EmptyState({
  type,
  title,
  description,
  searchQuery,
  activeFilters = [],
  primaryAction,
  secondaryAction,
  suggestedTags = [],
  children
}: EmptyStateProps) {
  // Default titles, descriptions, and icons by type
  const config = {
    cart: {
      icon: ShoppingBag,
      defaultTitle: 'Your Atelier Bag is Empty',
      defaultDesc:
        'Your shopping bag is currently unoccupied. Explore our master-loomed Panjabis, Italian velvet Kotis, and royal ceremonial Sherwanis.',
      defaultPrimaryLabel: 'Explore Collections'
    },
    wishlist: {
      icon: Heart,
      defaultTitle: 'Your Wishlist is Empty',
      defaultDesc:
        'Curate your personal gallery of bespoke garments. Save your favorite Panjabis and festive attire to review or reserve whenever you desire.',
      defaultPrimaryLabel: 'Discover Masterworks'
    },
    search: {
      icon: Search,
      defaultTitle: searchQuery
        ? `No Masterworks Found for "${searchQuery}"`
        : 'No Matching Garments Found',
      defaultDesc:
        'We could not locate any garments matching your exact query. Please verify the spelling or explore our curated fabric selections below.',
      defaultPrimaryLabel: 'Clear Search'
    },
    filter: {
      icon: Filter,
      defaultTitle: 'No Garments Match Selected Filters',
      defaultDesc:
        'The combination of sizes, colorways, fabrics, or price ranges currently filters out all items. Try widening your criteria to view available pieces.',
      defaultPrimaryLabel: 'Reset All Filters'
    },
    generic: {
      icon: Sparkles,
      defaultTitle: 'No Records Found',
      defaultDesc: 'There is currently no information available for this criteria.',
      defaultPrimaryLabel: 'Return to Showroom'
    }
  }[type];

  const IconComponent = config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayDesc = description || config.defaultDesc;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="py-16 px-4 text-center max-w-lg mx-auto space-y-6"
    >
      {/* Icon Crest */}
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute -inset-2 bg-gradient-to-r from-[#C5A059]/20 to-transparent rounded-full blur-md pointer-events-none" />
        <div className="h-20 w-20 rounded-full bg-[#FAF6ED] border border-[#C5A059] flex items-center justify-center text-[#8C6819] relative shadow-xs">
          <IconComponent className="h-9 w-9 stroke-[1.25]" />
        </div>
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h3 className="font-serif text-2xl sm:text-3xl text-[#1F1B17] font-bold tracking-wide">
          {displayTitle}
        </h3>
        <p className="text-xs sm:text-sm text-[#5C5248] font-sans leading-relaxed max-w-md mx-auto">
          {displayDesc}
        </p>
      </div>

      {/* Active Filter Pills (if type is filter) */}
      {activeFilters.length > 0 && (
        <div className="pt-2">
          <span className="text-[10px] font-sans tracking-widest text-[#8C6819] uppercase font-bold block mb-2">
            Active Restrictive Filters
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {activeFilters.map((f, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white border border-[#E8DFC8] text-xs text-[#1F1B17] rounded-full shadow-2xs"
              >
                <span>{f.label}</span>
                {f.onRemove && (
                  <button
                    onClick={f.onRemove}
                    className="text-[#6E645A] hover:text-[#1F1B17] ml-1 font-bold text-xs cursor-pointer"
                    title="Remove this filter"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Search / Category Tags */}
      {suggestedTags.length > 0 && (
        <div className="pt-2 space-y-2">
          <span className="text-[10px] font-sans tracking-widest text-[#6E645A] uppercase block font-semibold">
            Suggested Collections
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {suggestedTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={tag.onClick}
                className="px-3 py-1 bg-white hover:bg-[#FAF6ED] border border-[#E8DFC8] hover:border-[#C5A059] text-xs font-sans text-[#1F1B17] hover:text-[#8C6819] rounded-full transition-all duration-200 cursor-pointer shadow-2xs"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="inline-flex items-center space-x-2 px-7 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] font-bold text-xs font-sans tracking-widest uppercase rounded-lg shadow-sm transition-all duration-300 cursor-pointer"
          >
            <span>{primaryAction.label}</span>
            {primaryAction.icon || <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        )}

        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-white hover:bg-[#FAF6ED] border border-[#E8DFC8] text-[#1F1B17] text-xs font-sans tracking-widest uppercase rounded-lg transition-all duration-200 cursor-pointer shadow-2xs"
          >
            {secondaryAction.icon || <RotateCcw className="h-3.5 w-3.5" />}
            <span>{secondaryAction.label}</span>
          </button>
        )}
      </div>

      {children && <div className="pt-6">{children}</div>}
    </motion.div>
  );
}

export default EmptyState;
