/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Star, Plus, Minus, X, Check, Eye, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ColorSwatch } from '../types';
import SizeGuideModal from './SizeGuideModal';
import { formatPrice } from '../lib/formatters';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: ColorSwatch, quantity: number) => void;
  onNavigate: (view: string, extra?: any) => void;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onNavigate
}: QuickViewModalProps) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<ColorSwatch>({ name: '', hex: '' });
  const [quantity, setQuantity] = useState<number>(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [selectionError, setSelectionError] = useState(false);

  // Initialize selected color with first available variant, but require explicit size choice
  useEffect(() => {
    if (product && product.variants.length > 0) {
      const inStock = product.variants.find((v) => v.stock > 0) || product.variants[0];
      setSelectedSize('');
      setSelectedColor(inStock.color);
    }
    setActiveImgIndex(0);
    setQuantity(1);
    setSelectionError(false);
  }, [product]);

  if (!product) return null;

  const selectedVariant = selectedSize
    ? product.variants.find(
        (v) => v.size === selectedSize && v.color.name === selectedColor.name
      )
    : null;

  const currentVariantStock = selectedSize ? (selectedVariant?.stock || 0) : 1;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSelectionError(true);
      return;
    }

    const stock = selectedVariant?.stock || 0;
    if (stock === 0) return;

    onAddToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSelectionError(true);
      return;
    }

    const stock = selectedVariant?.stock || 0;
    if (stock === 0) return;

    onAddToCart(product, selectedSize, selectedColor, quantity);
    onClose();
    onNavigate('checkout');
  };

  const colors = product.variants.reduce((acc: ColorSwatch[], cur) => {
    if (!acc.some((c) => c.name === cur.color.name)) acc.push(cur.color);
    return acc;
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1F1B17]/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl bg-white border border-[#E8DFC8] rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] overflow-y-auto text-[#1F1B17]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 text-[#6E645A] hover:text-[#1F1B17] bg-[#FAF8F5] hover:bg-[#F5EFEB] rounded-full transition-all duration-200 cursor-pointer border border-[#E8DFC8]"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 p-6 sm:p-8">
              {/* Left Side: Images (5 cols) */}
              <div className="md:col-span-5 flex flex-col space-y-4">
                {/* Primary Image Viewport */}
                <div className="relative aspect-[3/4] bg-[#FAF8F5] rounded-xl overflow-hidden border border-[#E8DFC8]">
                  <img
                    src={product.images[activeImgIndex].url}
                    alt={product.images[activeImgIndex].alt}
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {product.compareAtPrice && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] text-[9px] font-sans font-bold tracking-widest uppercase px-2 py-0.5 rounded shadow-2xs">
                        Special Offer
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails strip */}
                <div className="flex gap-2 overflow-x-auto pb-1 justify-start">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={`relative w-14 h-18 bg-[#FAF8F5] overflow-hidden border transition-all rounded-lg flex-shrink-0 cursor-pointer ${
                        activeImgIndex === idx ? 'border-[#C5A059] ring-2 ring-[#C5A059]' : 'border-[#E8DFC8] hover:border-[#C5A059]'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover object-center"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Side: Product Configuration (7 cols) */}
              <div className="md:col-span-7 text-left flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-sans tracking-[0.25em] text-[#8C6819] uppercase font-bold">
                      {product.category} Collection
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-[#1F1B17] mt-1">
                      {product.name}
                    </h2>
                    <p className="text-[11px] font-mono text-[#6E645A] mt-0.5">SKU: {product.sku}</p>
                  </div>

                  {/* Reviews Star count */}
                  <div className="flex items-center space-x-2">
                    <div className="flex text-[#8C6819]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.ratings.average) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#D5C9B3]'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#1F1B17]">
                      {product.ratings.average}
                    </span>
                    <span className="text-xs text-[#6E645A] font-sans">({product.ratings.count} verified reviews)</span>
                  </div>

                  {/* Pricing Row */}
                  <div className="flex items-center space-x-3 pt-1">
                    <span className="text-2xl font-bold text-[#8C6819] font-mono tracking-tight">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-[#9E948A] line-through font-mono">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  {/* Description Snippet */}
                  <p className="text-xs text-[#5C5248] font-sans leading-relaxed line-clamp-3">
                    {product.description}
                  </p>

                  <div className="border-t border-[#E8DFC8] my-2" />

                  {/* Colors Section */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-sans font-bold tracking-wider text-[#1F1B17] uppercase block">
                      Color: <span className="font-normal text-[#6E645A] font-mono text-[10px]">{selectedColor.name}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      {colors.map((col) => {
                        const active = selectedColor.name === col.name;
                        return (
                          <button
                            key={col.name}
                            onClick={() => setSelectedColor(col)}
                            className={`h-8 w-8 rounded-full border border-[#E8DFC8] flex items-center justify-center transition-transform cursor-pointer ${
                              active ? 'ring-2 ring-offset-2 ring-[#C5A059] scale-105' : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          >
                            {active && (
                              <Check className={`h-3.5 w-3.5 ${col.hex === '#F9F6F0' || col.hex === '#FFFFF0' || col.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sizes Section */}
                  <div className={`space-y-2.5 p-3 rounded-xl transition-all duration-300 ${
                    selectionError
                      ? 'bg-rose-50 border border-rose-300 ring-2 ring-rose-200'
                      : 'bg-[#FAF8F5] border border-[#E8DFC8]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-sans font-bold tracking-wider text-[#1F1B17] uppercase block">
                          Size:
                        </span>
                        {selectedSize ? (
                          <span className="font-mono text-xs text-[#8C6819] font-bold bg-[#FAF6ED] border border-[#C5A059] px-2.5 py-0.5 rounded">
                            {selectedSize}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-800 font-sans font-medium">
                            (Please select a size)
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="text-[11px] font-sans text-[#8C6819] hover:text-[#1F1B17] uppercase tracking-wider font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Ruler className="h-3.5 w-3.5" />
                        <span>Size Guide</span>
                      </button>
                    </div>

                    {/* Interactive Size Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {Array.from(new Set(product.variants.map((v) => v.size)))
                        .sort((a, b) => {
                          const numA = parseInt(a, 10);
                          const numB = parseInt(b, 10);
                          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                          return a.localeCompare(b);
                        })
                        .map((sz) => {
                          const variant = product.variants.find((v) => v.size === sz && v.color.name === selectedColor.name);
                          const hasStock = variant ? variant.stock > 0 : product.variants.some((v) => v.size === sz && v.stock > 0);
                          const active = selectedSize === sz;

                          return (
                            <button
                              key={sz}
                              type="button"
                              disabled={!hasStock}
                              onClick={() => {
                                setSelectedSize(sz);
                                setSelectionError(false);
                              }}
                              className={`relative h-10 text-xs font-mono font-bold border rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                active
                                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] border-[#C5A059] shadow-xs scale-[1.03] ring-2 ring-[#C5A059]'
                                  : hasStock
                                  ? 'bg-white text-[#1F1B17] border-[#E8DFC8] hover:border-[#C5A059] hover:bg-[#FAF6ED]'
                                  : 'bg-[#FAF8F5] text-[#9E948A] border-[#E8DFC8] cursor-not-allowed line-through opacity-50'
                              }`}
                            >
                              {sz}
                              {active && (
                                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1F1B17] text-[#C5A059] shadow">
                                  <Check className="h-2.5 w-2.5 text-[#D4AF37]" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                    {selectionError && (
                      <p className="text-[10px] text-rose-600 font-sans font-medium pt-1">
                        Please choose a size above before adding this item to your cart.
                      </p>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center space-x-3 pt-1">
                    <span className="text-[11px] font-sans font-bold tracking-wider text-[#1F1B17] uppercase">Quantity:</span>
                    <div className="flex items-center border border-[#E8DFC8] rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-2.5 py-1.5 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3 text-[#1F1B17]" />
                      </button>
                      <span className="px-4 text-xs font-mono font-semibold text-[#1F1B17]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(currentVariantStock, q + 1))}
                        className="px-2.5 py-1.5 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3 text-[#1F1B17]" />
                      </button>
                    </div>
                    {selectedSize && currentVariantStock > 0 && currentVariantStock < 5 && (
                      <span className="text-[10px] text-rose-600 font-sans font-medium">
                        Only {currentVariantStock} left!
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Row - Highlighted Buy Now & Compact Add to Cart */}
                <div className="pt-4 space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch gap-3">
                    {/* Compact Add to Cart Button */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={selectedSize ? currentVariantStock === 0 : false}
                      className={`sm:w-2/5 min-h-[46px] px-4 text-xs font-sans font-bold tracking-wider uppercase transition-all duration-300 rounded-lg flex items-center justify-center space-x-1.5 ${
                        selectedSize && currentVariantStock === 0
                          ? 'bg-[#E2D9C5] text-[#6B7280] cursor-not-allowed'
                          : 'bg-white hover:bg-[#FAF6ED] text-[#854D0E] border-2 border-[#854D0E] hover:border-[#713F12] cursor-pointer shadow-2xs active:scale-[0.98]'
                      }`}
                    >
                      <span>Add to Cart</span>
                    </button>

                    {/* Prominent Highlighted Buy Now Button */}
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={selectedSize ? currentVariantStock === 0 : false}
                      className={`flex-1 min-h-[50px] px-6 text-sm font-serif font-extrabold tracking-widest uppercase transition-all duration-300 rounded-lg shadow-md flex items-center justify-center space-x-2 ${
                        selectedSize && currentVariantStock === 0
                          ? 'bg-[#E2D9C5] text-[#6B7280] cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#DFB847] via-[#E6C65E] to-[#C99E32] hover:brightness-105 text-[#18181B] border border-[#854D0E] shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/50 cursor-pointer active:scale-[0.98]'
                      }`}
                    >
                      <span>⚡ Buy Now</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('product-detail', { productId: product.id });
                    }}
                    className="w-full py-2 text-[#854D0E] hover:text-[#18181B] text-[11px] font-sans font-bold tracking-widest uppercase transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Full Details & Sizing →</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <SizeGuideModal
            isOpen={isSizeGuideOpen}
            onClose={() => setIsSizeGuideOpen(false)}
            defaultCategory={product.category}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
