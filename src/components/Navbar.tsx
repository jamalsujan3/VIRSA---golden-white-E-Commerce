/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Compass, MapPin, Search, ChevronDown, Heart, ChevronLeft, ChevronRight, User, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Product } from '../types';
import Logo from './Logo';
import { useWishlist } from '../lib/wishlist';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, extra?: any) => void;
  cart: CartItem[];
  onOpenCart: () => void;
  isAdmin: boolean;
  onToggleAdminMode: () => void;
  products: Product[];
  isLoggedIn: boolean;
  currentUser: any;
  onOpenAuth: (tab?: 'details' | 'orders' | 'wishlist' | 'login') => void;
}

interface AnnouncementItem {
  badge: string;
  text: string;
  actionText?: string;
  actionCategory?: string;
}

const ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    badge: "FREE DELIVERY",
    text: "Complimentary express delivery on all premium orders across Bangladesh",
    actionText: "Shop Collection",
    actionCategory: "all"
  },
  {
    badge: "SEASONAL OFFER",
    text: "Use code 'VIRSA10' for an extra 10% off luxury festive selections",
    actionText: "Claim Offer",
    actionCategory: "panjabi"
  },
  {
    badge: "BESPOKE FIT",
    text: "Complimentary made-to-measure tailoring on all Panjabi & Sherwani",
    actionText: "Explore",
    actionCategory: "sherwani"
  },
  {
    badge: "FLAGSHIP ATELIERS",
    text: "Experience the heritage collection in Gulshan 2 (Dhaka) & GEC (Chittagong)",
    actionText: "View Stores",
    actionCategory: "all"
  }
];

export default function Navbar({
  currentView,
  onNavigate,
  cart,
  onOpenCart,
  isAdmin,
  onToggleAdminMode,
  products,
  isLoggedIn,
  currentUser,
  onOpenAuth
}: NavbarProps) {
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDirection('right');
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNextAnnouncement = () => {
    setSlideDirection('right');
    setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  const handlePrevAnnouncement = () => {
    setSlideDirection('left');
    setAnnouncementIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const slideVariants = {
    initial: (direction: 'left' | 'right') => ({
      opacity: 0,
      x: direction === 'right' ? '100%' : '-100%',
    }),
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: (direction: 'left' | 'right') => ({
      opacity: 0,
      x: direction === 'right' ? '-100%' : '100%',
    }),
  };
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const { wishlist } = useWishlist();

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('virsa_recent_searches');
      return saved ? JSON.parse(saved) : ['Panjabi', 'Sherwani', 'Koti', 'Emerald'];
    } catch {
      return ['Panjabi', 'Sherwani', 'Koti', 'Emerald'];
    }
  });

  const saveSearchToRecent = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const filtered = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
    setRecentSearches(filtered);
    localStorage.setItem('virsa_recent_searches', JSON.stringify(filtered));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('virsa_recent_searches');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    { name: 'Panjabi', category: 'panjabi' },
    { name: 'Kabli', category: 'kabli' },
    { name: 'Koti', category: 'koti' },
    { name: 'Sherwani', category: 'sherwani' },
    { name: 'Jubbah', category: 'jubbah' },
    { name: 'Pajama', category: 'pajama' },
    { name: 'Kids', category: 'kids' }
  ];

  // Real-time search matching (limits to top 6)
  const searchResults = searchText.trim().length >= 1
    ? products.filter(product => {
        const query = searchText.toLowerCase().trim();
        return (
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some(tag => tag.toLowerCase().includes(query)) ||
          product.fabricDetails?.material?.toLowerCase().includes(query)
        );
      }).slice(0, 6)
    : [];

  const handleSelectResult = (productId: string) => {
    onNavigate('product-detail', { productId });
    setSearchText('');
    setIsSearchOpen(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchText.trim()) {
      saveSearchToRecent(searchText.trim());
      onNavigate('category', { category: 'all', searchQuery: searchText.trim() });
      setSearchText('');
      setIsSearchOpen(false);
    }
  };

  return (
    <header id="main-header" className="sticky top-0 z-50 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8DFC8] transition-all duration-300 shadow-[0_2px_15px_rgba(197,160,89,0.06)]">
      
      {/* Slim, High-Contrast Luxury Announcement Bar */}
      <div id="announcement-bar" className="w-full bg-[#141210] border-b border-[#B88E2F]/40 py-1.5 sm:py-2 text-center relative overflow-hidden flex items-center justify-between px-2 sm:px-6 lg:px-8 shadow-sm">
        <button
          onClick={handlePrevAnnouncement}
          className="text-[#DFB847] hover:text-white hover:bg-white/10 p-1 rounded-full transition-all hover:scale-110 cursor-pointer active:scale-95 shrink-0 z-10"
          aria-label="Previous Announcement"
        >
          <ChevronLeft className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>

        <div className="flex-grow overflow-hidden relative h-5 flex items-center justify-center mx-2">
          <AnimatePresence initial={false} custom={slideDirection}>
            <motion.div
              key={announcementIndex}
              custom={slideDirection}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
              className="flex items-center justify-center space-x-2 absolute w-full px-1"
            >
              {/* Badge */}
              <span className="hidden xs:inline-flex items-center gap-1 bg-gradient-to-r from-[#DFB847] to-[#C99E32] text-[#18181B] text-[9px] sm:text-[10px] font-mono font-black tracking-widest uppercase px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                <Sparkles className="h-2.5 w-2.5 text-[#18181B]" />
                {ANNOUNCEMENTS[announcementIndex].badge}
              </span>

              {/* Offer Text */}
              <span className="text-[10px] sm:text-[11px] md:text-xs font-sans font-medium tracking-wide text-white/95 truncate">
                {ANNOUNCEMENTS[announcementIndex].text}
              </span>

              {/* Action Link */}
              {ANNOUNCEMENTS[announcementIndex].actionText && (
                <button
                  onClick={() => onNavigate('category', { category: ANNOUNCEMENTS[announcementIndex].actionCategory || 'all' })}
                  className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-sans font-bold text-[#FDE047] hover:text-white underline decoration-[#FDE047]/60 hover:decoration-white transition-colors cursor-pointer shrink-0 ml-1"
                >
                  <span>{ANNOUNCEMENTS[announcementIndex].actionText}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={handleNextAnnouncement}
          className="text-[#DFB847] hover:text-white hover:bg-white/10 p-1 rounded-full transition-all hover:scale-110 cursor-pointer active:scale-95 shrink-0 z-10"
          aria-label="Next Announcement"
        >
          <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
      </div>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 relative">
          
          {/* Mobile Menu Toggle & Search Toggle on Left */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              id="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-[#1F1B17] p-2 hover:text-[#B38E36] transition-colors cursor-pointer"
              aria-label="Open Menu"
            >
              <Menu className="h-6 w-6 stroke-[1.5]" />
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-[#1F1B17] p-2 hover:text-[#B38E36] transition-colors cursor-pointer"
              aria-label="Search collections"
            >
              <Search className="h-5 w-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Left: Brand Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Home */}
            <button
              onClick={() => onNavigate('homepage')}
              className={`text-sm tracking-widest uppercase transition-all duration-300 relative py-2 cursor-pointer font-sans ${
                currentView === 'homepage'
                  ? 'text-[#8C6819] font-bold border-b-2 border-[#C5A059]'
                  : 'text-[#332D27] hover:text-[#8C6819] font-medium'
              }`}
            >
              Home
            </button>

            {/* Products with Hover Dropdown */}
            <div 
              className="relative py-2 group"
              onMouseEnter={() => setIsProductsDropdownOpen(true)}
              onMouseLeave={() => setIsProductsDropdownOpen(false)}
            >
              <button
                onClick={() => onNavigate('category', { category: 'all' })}
                className={`text-sm tracking-widest uppercase transition-all duration-300 flex items-center cursor-pointer font-sans ${
                  (currentView !== 'homepage' && (currentView.includes('page') || currentView === 'category' || currentView === 'product-detail'))
                    ? 'text-[#8C6819] font-bold border-b-2 border-[#C5A059]'
                    : 'text-[#332D27] hover:text-[#8C6819] font-medium'
                }`}
              >
                <span>Products</span>
              </button>

              {/* Luxury Dropdown */}
              <AnimatePresence>
                {isProductsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-52 bg-white/98 backdrop-blur-md border border-[#E8DFC8] shadow-[0_12px_32px_rgba(197,160,89,0.18)] py-2.5 z-50 rounded-lg"
                  >
                    {navLinks.map((link) => (
                      <button
                        key={link.category}
                        onClick={() => {
                          onNavigate('category', { category: link.category });
                          setIsProductsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs uppercase tracking-widest text-[#332D27] hover:text-[#8C6819] hover:bg-[#FAF8F5] transition-colors cursor-pointer font-medium flex items-center justify-between"
                      >
                        <span>{link.name}</span>
                        <ChevronRight className="h-3 w-3 text-[#C5A059] opacity-70" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contact */}
            <button
              onClick={() => onNavigate('contact')}
              className={`text-sm tracking-widest uppercase transition-all duration-300 relative py-2 cursor-pointer font-sans ${
                currentView === 'contact'
                  ? 'text-[#8C6819] font-bold border-b-2 border-[#C5A059]'
                  : 'text-[#332D27] hover:text-[#8C6819] font-medium'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Center: Brand Identity Logo (Absolutely Centered) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
            <button
              id="brand-logo"
              onClick={() => onNavigate('homepage')}
              className="inline-block text-center cursor-pointer group focus:outline-none"
            >
              <Logo className="h-10 sm:h-12 md:h-14 w-auto transition-transform duration-300 group-hover:scale-105" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            
            {/* Elegant Search Trigger Icon */}
            <div className="relative hidden md:block z-50">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-[#1F1B17] hover:text-[#8C6819] p-2 transition-all hover:scale-105 active:scale-95 cursor-pointer relative flex items-center space-x-2 group"
                aria-label="Search collections"
                title="Search collections"
              >
                <Search className="h-5 w-5 stroke-[1.5] group-hover:text-[#8C6819] transition-colors" />
                <span className="text-[10px] uppercase tracking-widest text-[#6E645A] group-hover:text-[#1F1B17] font-semibold transition-colors">Search</span>
              </button>
            </div>

            {/* Showroom locator quick-link */}
            <button
              id="nav-showroom-btn"
              onClick={() => {
                onNavigate('homepage');
                setTimeout(() => {
                  document.getElementById('showroom-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-[#1F1B17] hover:text-[#8C6819] p-2 transition-colors hidden sm:block cursor-pointer"
              title="Our Showrooms"
            >
              <MapPin className="h-5 w-5 stroke-[1.5]" />
            </button>

            {/* Wishlist Trigger (Only shown if logged in, opening directly in customer's profile!) */}
            {isLoggedIn && (
              <button
                id="nav-wishlist-trigger"
                onClick={() => onOpenAuth('wishlist')}
                className="relative p-2 text-[#1F1B17] hover:text-[#8C6819] transition-colors group cursor-pointer"
                aria-label="Open wishlist"
                title="My Wishlist (In Profile)"
              >
                <Heart className={`h-5 w-5 stroke-[1.5] ${wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                <AnimatePresence>
                  {wishlist.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold font-mono h-4 w-4 rounded-full flex items-center justify-center shadow"
                    >
                      {wishlist.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )}

            {/* Shopping Cart Trigger (Available for all shoppers including guests) */}
            <button
              id="nav-cart-trigger"
              onClick={onOpenCart}
              className="relative p-2 text-[#1F1B17] hover:text-[#8C6819] transition-colors group cursor-pointer"
              aria-label="Open shopping bag"
            >
              <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-[#B38E36] to-[#8C6819] text-white text-[10px] font-bold font-mono h-4 w-4 rounded-full flex items-center justify-center shadow-md"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Customer Account Portal Trigger */}
            <button
              id="nav-auth-trigger"
              onClick={() => onOpenAuth(isLoggedIn ? 'details' : 'login')}
              className={`relative p-2 transition-all hover:scale-105 active:scale-95 group cursor-pointer ${
                isLoggedIn ? 'text-[#8C6819]' : 'text-[#1F1B17] hover:text-[#8C6819]'
              }`}
              aria-label="Customer portal"
              title={isLoggedIn ? "My Atelier Account" : "Sign In to Virsa"}
            >
              <User className="h-5 w-5 stroke-[1.5]" />
              {isLoggedIn && (
                <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-[#B38E36] border border-white animate-pulse" />
              )}
            </button>
          </div>

        </div>
      </div>



      {/* Mobile Menu Sidebar / Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 left-0 bottom-0 w-[82%] max-w-sm bg-[#FAF8F5] border-r border-[#E8DFC8] z-50 p-6 flex flex-col justify-between md:hidden shadow-2xl overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#E8DFC8]">
                  <div className="text-left">
                    <Logo className="h-9 sm:h-10 w-auto" />
                  </div>
                  <button
                    id="close-mobile-menu"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[#1F1B17] p-2 hover:text-[#8C6819] transition-colors cursor-pointer"
                  >
                    <X className="h-6 w-6 stroke-[1.5]" />
                  </button>
                </div>

                {/* Mobile Drawer Search Bar Shortcut */}
                <div className="py-4 border-b border-[#E8DFC8]">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="w-full bg-white border border-[#E8DFC8] text-[#6E645A] text-xs tracking-wider font-sans rounded-full py-2.5 px-4 flex items-center justify-between hover:border-[#C5A059] shadow-sm transition-all duration-300"
                  >
                    <span>Search collections...</span>
                    <Search className="h-4 w-4 text-[#8C6819]" />
                  </button>
                </div>

                <div className="py-6 space-y-4 border-b border-[#E8DFC8]">
                  <div className="flex flex-col space-y-4">
                    {/* Member Portal Login / Profile */}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenAuth(isLoggedIn ? 'details' : 'login');
                      }}
                      className="text-left text-lg font-serif tracking-widest uppercase text-[#8C6819] hover:text-[#1F1B17] transition-colors cursor-pointer border-b border-[#C5A059]/40 pb-2 flex items-center justify-between"
                    >
                      <span className="font-bold">{isLoggedIn ? `${currentUser?.name?.split(' ')[0]} Profile` : 'Member Sign In'}</span>
                      <User className="h-4 w-4 text-[#8C6819]" />
                    </button>

                    {/* Home */}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onNavigate('homepage');
                      }}
                      className="text-left text-lg font-serif tracking-widest uppercase text-[#1F1B17] hover:text-[#8C6819] transition-colors cursor-pointer border-b border-[#E8DFC8] pb-2 font-medium"
                    >
                      Home
                    </button>

                    {/* Products (Accordion) */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
                        className="w-full flex items-center justify-between text-left text-lg font-serif tracking-widest uppercase text-[#1F1B17] hover:text-[#8C6819] transition-colors cursor-pointer border-b border-[#E8DFC8] pb-2 font-medium"
                      >
                        <span>Products</span>
                        <ChevronDown className={`h-5 w-5 text-[#8C6819] transition-transform duration-300 ${isMobileProductsOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isMobileProductsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pl-4 flex flex-col space-y-3.5 pt-1 overflow-hidden"
                          >
                            {navLinks.map((link) => (
                              <button
                                key={link.category}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  onNavigate('category', { category: link.category });
                                }}
                                className="text-left text-sm font-sans tracking-widest uppercase text-[#5C5248] hover:text-[#8C6819] transition-colors cursor-pointer"
                              >
                                — {link.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Contact */}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onNavigate('contact');
                      }}
                      className="text-left text-lg font-serif tracking-widest uppercase text-[#1F1B17] hover:text-[#8C6819] transition-colors cursor-pointer border-b border-[#E8DFC8] pb-2 font-medium"
                    >
                      Contact
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E8DFC8] space-y-4">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('homepage');
                      setTimeout(() => {
                        document.getElementById('brand-story-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 200);
                    }}
                    className="flex items-center space-x-3 text-sm text-[#5C5248] hover:text-[#8C6819] transition-colors cursor-pointer w-full text-left"
                  >
                    <Compass className="h-4 w-4 text-[#8C6819]" />
                    <span>Our Brand Story</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('homepage');
                      setTimeout(() => {
                        document.getElementById('showroom-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 200);
                    }}
                    className="flex items-center space-x-3 text-sm text-[#5C5248] hover:text-[#8C6819] transition-colors cursor-pointer w-full text-left"
                  >
                    <MapPin className="h-4 w-4 text-[#8C6819]" />
                    <span>Store Locator</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Immersive Luxury Search Overlay in Golden-White */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-[#FAF8F5]/98 backdrop-blur-xl flex flex-col justify-start"
          >
            {/* Header / Top Bar of Search Overlay */}
            <div className="w-full border-b border-[#E8DFC8] py-4 px-6 sm:px-8 flex items-center justify-between bg-white/80">
              <Logo className="h-8 sm:h-10 w-auto" />
              <div className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.25em] text-[#8C6819] uppercase hidden sm:block">
                Luxury Showroom Search
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="group flex items-center space-x-2 text-[#1F1B17] hover:text-[#8C6819] transition-colors duration-300 p-2 cursor-pointer"
                aria-label="Close Search"
              >
                <span className="text-[10px] tracking-widest font-sans uppercase font-bold text-[#6E645A] group-hover:text-[#8C6819] transition-colors hidden sm:inline">
                  Close (ESC)
                </span>
                <div className="h-8 w-8 rounded-full border border-[#E8DFC8] group-hover:border-[#C5A059] flex items-center justify-center transition-all duration-300 group-hover:rotate-90 bg-white">
                  <X className="h-4 w-4 stroke-[1.5]" />
                </div>
              </button>
            </div>

            {/* Main Search Panel Container */}
            <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col items-center">
              
              {/* Massive Search Input Form */}
              <form onSubmit={handleSearchSubmit} className="w-full max-w-3xl relative mb-10 sm:mb-14">
                <div className="relative flex items-center border-b-2 border-[#E8DFC8] focus-within:border-[#C5A059] transition-colors duration-300 py-3 sm:py-5">
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 text-[#8C6819] shrink-0 mr-4 stroke-[1.5]" />
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full bg-transparent text-[#1F1B17] font-serif text-xl sm:text-3xl md:text-4xl tracking-wide placeholder-[#8C8075]/40 focus:outline-none"
                    autoFocus
                  />
                  {searchText && (
                    <button
                      type="button"
                      onClick={() => setSearchText('')}
                      className="text-[#6E645A] hover:text-[#1F1B17] p-1 transition-colors"
                      aria-label="Clear text"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                {/* Search helper caption */}
                <div className="flex items-center justify-between mt-3 text-[10px] sm:text-xs font-sans text-[#6E645A]">
                  <span>Press <kbd className="bg-white border border-[#E8DFC8] px-1.5 py-0.5 rounded text-[#332D27] shadow-xs">Enter</kbd> to search the full showroom</span>
                  {searchText.trim().length > 0 && (
                    <span className="text-[#8C6819] font-bold">
                      {products.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()) || p.category.toLowerCase().includes(searchText.toLowerCase())).length} matches found
                    </span>
                  )}
                </div>
              </form>

              {/* Grid Content */}
              <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 flex-1">
                
                {/* Left Side: Curated & Recent Searches (Spans 4 columns) */}
                <div className="md:col-span-4 space-y-8 text-left">
                  {/* Recent Searches */}
                  <div>
                    <div className="flex items-center justify-between mb-4 border-b border-[#E8DFC8] pb-2">
                      <h4 className="text-xs font-sans font-bold tracking-[0.15em] text-[#8C6819] uppercase">Recent Searches</h4>
                      {recentSearches.length > 0 && (
                        <button
                          onClick={clearRecentSearches}
                          className="text-[9px] font-sans font-semibold tracking-wider text-[#6E645A] hover:text-rose-600 uppercase transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {recentSearches.length === 0 ? (
                      <p className="text-xs text-[#6E645A] font-sans italic">No recent searches</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, idx) => (
                          <div key={term + idx} className="flex items-center bg-white hover:bg-[#FAF6ED] border border-[#E8DFC8] hover:border-[#C5A059] rounded-full pl-3.5 pr-2 py-1.5 transition-all text-xs font-sans text-[#332D27] hover:text-[#8C6819] shadow-2xs cursor-pointer">
                            <span onClick={() => setSearchText(term)} className="mr-2">
                              {term}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const filtered = recentSearches.filter((_, i) => i !== idx);
                                setRecentSearches(filtered);
                                localStorage.setItem('virsa_recent_searches', JSON.stringify(filtered));
                              }}
                              className="text-[#8C8075] hover:text-[#1F1B17] p-0.5 rounded-full hover:bg-black/5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Trending Curations */}
                  <div>
                    <h4 className="text-xs font-sans font-bold tracking-[0.15em] text-[#8C6819] uppercase mb-4 border-b border-[#E8DFC8] pb-2">Trending Collections</h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      {navLinks.map((link) => (
                        <button
                          key={link.category}
                          onClick={() => {
                            saveSearchToRecent(link.name);
                            onNavigate('category', { category: link.category });
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 bg-white hover:bg-[#FAF6ED] border border-[#E8DFC8] hover:border-[#C5A059] text-xs font-sans uppercase tracking-widest text-[#332D27] hover:text-[#8C6819] rounded-md transition-all shadow-2xs cursor-pointer font-medium"
                        >
                          {link.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Fabric Tags */}
                  <div>
                    <h4 className="text-xs font-sans font-bold tracking-[0.15em] text-[#8C6819] uppercase mb-3 border-b border-[#E8DFC8] pb-2">By Premium Fabric</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Cotton', 'Pure Silk', 'Bespoke Linen', 'Premium Viscose', 'Imperial Velvet', 'Royal Brocade'].map((fabric) => (
                        <button
                          key={fabric}
                          onClick={() => {
                            const term = fabric.replace(/(Pure|Bespoke|Premium|Imperial|Royal)\s+/, '');
                            saveSearchToRecent(fabric);
                            onNavigate('category', { category: 'all', searchQuery: term });
                            setIsSearchOpen(false);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-[#FAF6ED] border border-[#E8DFC8] hover:border-[#C5A059] text-[10px] font-sans font-medium tracking-widest uppercase text-[#5C5248] hover:text-[#8C6819] rounded-md shadow-2xs transition-colors cursor-pointer"
                        >
                          {fabric}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Search Results / Curated Recommendations (Spans 8 columns) */}
                <div className="md:col-span-8 flex flex-col h-full min-h-[300px] text-left">
                  
                  {searchText.trim().length === 0 ? (
                    /* Showroom Highlights when not typing */
                    <div className="flex-grow flex flex-col h-full">
                      <h4 className="text-xs font-sans font-bold tracking-[0.15em] text-[#5C5248] uppercase mb-4 flex items-center justify-between">
                        <span>Showroom Highlights</span>
                        <span className="text-[10px] font-sans text-[#8C8075] font-normal">Luxury Selections</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                        {products.slice(0, 4).map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              onNavigate('product-detail', { productId: prod.id });
                              setIsSearchOpen(false);
                            }}
                            className="group flex flex-row items-center space-x-4 p-3.5 bg-white hover:bg-[#FAF6ED] border border-[#E8DFC8] hover:border-[#C5A059] rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
                          >
                            <img
                              src={prod.images[0]?.url}
                              alt={prod.name}
                              className="w-16 h-16 object-cover rounded-lg bg-gray-100 border border-[#E8DFC8] group-hover:scale-105 transition-transform duration-300 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-grow min-w-0">
                              <span className="text-[9px] font-sans text-[#8C6819] uppercase tracking-wider font-bold block">{prod.category}</span>
                              <h5 className="text-xs font-serif text-[#1F1B17] group-hover:text-[#8C6819] transition-colors truncate mt-0.5 font-bold">{prod.name}</h5>
                              <p className="text-[10px] font-mono font-bold text-[#8C6819] mt-1">৳{prod.price.toLocaleString()}</p>
                              {prod.ratings && (
                                <div className="flex items-center space-x-1 mt-1 text-[9px] text-amber-600 font-sans font-semibold">
                                  <span>★</span>
                                  <span>{prod.ratings.average} ({prod.ratings.count})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Dynamic Real-time Matches */
                    <div className="flex-grow flex flex-col h-full justify-between">
                      <div>
                        <h4 className="text-xs font-sans font-bold tracking-[0.15em] text-[#8C6819] uppercase mb-4 flex items-center justify-between">
                          <span>Live Match Suggestions</span>
                          <span className="text-[10px] text-[#8C8075] lowercase font-normal">Showing top matches for "{searchText}"</span>
                        </h4>
                        
                        {searchResults.length === 0 ? (
                          <div className="flex-grow flex flex-col items-center justify-center border border-dashed border-[#E8DFC8] rounded-xl p-8 text-center bg-white">
                            <p className="text-sm text-[#5C5248] font-serif mb-2">No matching collections found</p>
                            <p className="text-xs text-[#8C8075] font-sans max-w-sm mx-auto">
                              We couldn't find matches for "{searchText}". Try searching for categories like <strong className="text-[#332D27]">Panjabi</strong>, materials like <strong className="text-[#332D27]">Silk</strong>, or other color tones.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {searchResults.map((prod) => (
                              <button
                                key={prod.id}
                                onClick={() => {
                                  saveSearchToRecent(searchText);
                                  handleSelectResult(prod.id);
                                }}
                                className="group flex items-center space-x-4 p-3.5 bg-white hover:bg-[#FAF6ED] border border-[#E8DFC8] hover:border-[#C5A059] rounded-xl transition-all text-left w-full cursor-pointer shadow-sm"
                              >
                                <img
                                  src={prod.images[0]?.url}
                                  alt={prod.name}
                                  className="h-14 w-14 object-cover rounded-lg bg-gray-100 border border-[#E8DFC8] shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="text-[8px] font-sans font-bold text-[#8C6819] uppercase tracking-wider block">{prod.category}</span>
                                  <h4 className="text-xs font-serif text-[#1F1B17] group-hover:text-[#8C6819] transition-colors truncate mt-0.5 font-bold">{prod.name}</h4>
                                  <p className="text-[10px] font-mono text-[#6E645A] line-clamp-1 mt-0.5">{prod.fabricDetails?.material || prod.description}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs font-mono font-bold text-[#8C6819]">
                                      ৳{prod.price.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Big View All Results CTA at bottom */}
                      {searchResults.length > 0 && (
                        <div className="pt-6">
                          <button
                            onClick={() => {
                              saveSearchToRecent(searchText);
                              handleSearchSubmit();
                            }}
                            className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B38E36] text-[#141210] text-xs font-sans font-bold tracking-[0.2em] uppercase rounded-lg shadow-md hover:brightness-105 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                          >
                            <span>Explore All Matches ({products.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()) || p.category.toLowerCase().includes(searchText.toLowerCase())).length})</span>
                            <span>→</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
