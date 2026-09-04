import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { useWishlist } from '../lib/wishlist';
import SEO from './SEO';
import { formatPrice } from '../lib/formatters';
import { EmptyState } from './EmptyState';

interface WishlistPageProps {
  products: Product[];
  onNavigate: (view: string, extra?: any) => void;
  onAddToCart: (product: Product, size: string, color: any) => void;
}

export default function WishlistPage({ products, onNavigate, onAddToCart }: WishlistPageProps) {
  const { wishlist, toggle } = useWishlist();

  // Find all products that are in the wishlist
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const availableVariant = product.variants.find((v) => v.stock > 0);
    if (availableVariant) {
      onAddToCart(product, availableVariant.size, availableVariant.color);
    }
  };

  return (
    <div id="wishlist-page-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-[#1F1B17]">
      <SEO
        title="Saved Masterworks & Wishlist | VIRSA"
        description="View your saved VIRSA Panjabis, Kotis, and luxury menswear creations. Save your favorites for festive occasions and upcoming celebrations."
        canonical="/wishlist"
        noindex={true}
      />
      
      {/* Header Info */}
      <div className="text-center mb-16">
        <span className="text-xs font-sans tracking-[0.3em] text-[#8C6819] uppercase font-bold block mb-1">
          Your Curated Collection
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1F1B17] tracking-wider uppercase mt-1 font-bold">
          Saved Masterworks
        </h1>
        <p className="text-xs font-sans tracking-widest text-[#6E645A] uppercase mt-2">
          {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'garment' : 'garments'} reserved in your wishlist
        </p>
        <div className="w-12 h-[2px] bg-[#C5A059] mx-auto mt-4" />
      </div>

      <AnimatePresence mode="popLayout">
        {wishlistedProducts.length === 0 ? (
          <EmptyState
            type="wishlist"
            primaryAction={{
              label: 'Explore Collections',
              onClick: () => onNavigate('category', { category: 'all' })
            }}
            suggestedTags={[
              {
                label: 'Silk Panjabi',
                onClick: () => onNavigate('category', { category: 'panjabi' })
              },
              {
                label: 'Royal Sherwani',
                onClick: () => onNavigate('category', { category: 'sherwani' })
              },
              {
                label: 'Imperial Kabli',
                onClick: () => onNavigate('category', { category: 'kabli' })
              },
              {
                label: 'Velvet Koti',
                onClick: () => onNavigate('category', { category: 'koti' })
              }
            ]}
          />
        ) : (
          <motion.div
            key="wishlist-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {wishlistedProducts.map((prod) => (
              <motion.div
                layout
                key={prod.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => onNavigate('product-detail', { productId: prod.id })}
                className="group bg-white border border-[#E8DFC8] rounded-xl overflow-hidden shadow-2xs hover:border-[#C5A059] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                {/* Image Area with toggles */}
                <div className="relative aspect-[3/4] bg-[#FAF8F5] overflow-hidden">
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

                  {/* Heart button inside card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(prod.id);
                    }}
                    className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs border border-[#E8DFC8] text-[#8C6819] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-xs"
                    title="Remove from Wishlist"
                  >
                    <Heart className="h-4 w-4 fill-[#C5A059] text-[#C5A059]" />
                  </button>

                  {/* Quick view available sizes panel */}
                  <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-xs border-t border-[#E8DFC8] py-4 px-3 flex flex-col items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={(e) => handleQuickAdd(e, prod)}
                      className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] py-2 text-[10px] font-mono font-bold rounded-lg transition-all flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Quick Add Garment</span>
                    </button>
                  </div>
                </div>

                {/* Card Meta Info */}
                <div className="p-4 flex-1 flex flex-col justify-between text-left">
                  <div>
                    <span className="text-xs font-sans tracking-widest text-[#8C6819] uppercase mb-1 block font-bold">
                      {prod.category}
                    </span>
                    <h3 className="font-serif text-sm text-[#1F1B17] group-hover:text-[#8C6819] transition-colors font-semibold line-clamp-1 mb-2">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline justify-between pt-3 border-t border-[#E8DFC8] mt-3">
                    <span className="text-[10px] font-mono font-medium text-[#6E645A]">Atelier Price</span>
                    <div className="flex items-center space-x-1.5">
                      {prod.compareAtPrice && (
                        <span className="text-[10px] text-[#9E948A] line-through font-mono">
                          {formatPrice(prod.compareAtPrice)}
                        </span>
                      )}
                      <span className="text-xs font-bold text-[#8C6819] font-mono">
                        {formatPrice(prod.price)}
                      </span>
                    </div>
                  </div>
                </div>

              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
