/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Compass, Search, ShoppingBag, User } from 'lucide-react';
import { CartItem } from '../types';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string, extra?: any) => void;
  cart: CartItem[];
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  isPDPStickyActive?: boolean;
}

export default function BottomNav({
  currentView,
  onNavigate,
  cart,
  onOpenCart,
  onOpenSearch,
  onOpenAuth,
  isLoggedIn,
  isPDPStickyActive = false
}: BottomNavProps) {
  // Hide on checkout or order confirmation to keep checkout conversion focused
  if (currentView === 'checkout' || currentView === 'order-confirmation' || currentView === 'admin') {
    return null;
  }

  // If sticky Add-to-Cart bar on PDP is active, we don't display the bottom nav to prevent clutter
  if (currentView === 'product-detail' && isPDPStickyActive) {
    return null;
  }

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isHomeActive = currentView === 'homepage' || currentView === 'home';
  const isCatalogActive = currentView === 'category';

  return (
    <nav
      id="virsa-mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E8DFC8] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {/* 1. Showroom / Home */}
        <button
          type="button"
          id="mobile-nav-home-btn"
          onClick={() => {
            onNavigate('homepage');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors cursor-pointer ${
            isHomeActive ? 'text-[#8C6819] font-bold' : 'text-[#6E645A] hover:text-[#1F1B17]'
          }`}
          aria-label="Atelier Showroom"
        >
          <Home className={`h-5 w-5 ${isHomeActive ? 'stroke-[2.2]' : 'stroke-[1.5]'}`} />
          <span className="text-[10px] font-sans tracking-wider uppercase mt-1">Showroom</span>
        </button>

        {/* 2. Collections / Catalog */}
        <button
          type="button"
          id="mobile-nav-catalog-btn"
          onClick={() => {
            onNavigate('category', { category: 'all' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors cursor-pointer ${
            isCatalogActive ? 'text-[#8C6819] font-bold' : 'text-[#6E645A] hover:text-[#1F1B17]'
          }`}
          aria-label="All Collections"
        >
          <Compass className={`h-5 w-5 ${isCatalogActive ? 'stroke-[2.2]' : 'stroke-[1.5]'}`} />
          <span className="text-[10px] font-sans tracking-wider uppercase mt-1">Catalog</span>
        </button>

        {/* 3. Search */}
        <button
          type="button"
          id="mobile-nav-search-btn"
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-[#6E645A] hover:text-[#8C6819] transition-colors cursor-pointer"
          aria-label="Search Collections"
        >
          <Search className="h-5 w-5 stroke-[1.5]" />
          <span className="text-[10px] font-sans tracking-wider uppercase mt-1">Search</span>
        </button>

        {/* 4. Cart Bag */}
        <button
          type="button"
          id="mobile-nav-bag-btn"
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-[#6E645A] hover:text-[#8C6819] transition-colors relative cursor-pointer"
          aria-label="Shopping Bag"
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 h-4 min-w-[16px] px-1 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] text-[9px] font-bold rounded-full flex items-center justify-center font-mono shadow-xs">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-sans tracking-wider uppercase mt-1">Bag</span>
        </button>

        {/* 5. Account / Sign In */}
        <button
          type="button"
          id="mobile-nav-account-btn"
          onClick={onOpenAuth}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-[#6E645A] hover:text-[#8C6819] transition-colors relative cursor-pointer"
          aria-label="Account Profile"
        >
          <div className="relative">
            <User className="h-5 w-5 stroke-[1.5]" />
            {isLoggedIn && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#C5A059] ring-2 ring-white" />
            )}
          </div>
          <span className="text-[10px] font-sans tracking-wider uppercase mt-1">
            {isLoggedIn ? 'Account' : 'Sign In'}
          </span>
        </button>
      </div>
    </nav>
  );
}
