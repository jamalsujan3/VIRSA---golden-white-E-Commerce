import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Homepage from './components/Homepage';
import PLP from './components/PLP';
import PDP from './components/PDP';
import ContactPage from './components/ContactPage';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';
import CartDrawer from './components/CartDrawer';
import AdminPanel from './components/admin/AdminPanel';
import CustomerAuthModal from './components/CustomerAuthModal';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';

// Import category-specific components
import PanjabiPage from './components/PanjabiPage';
import KabliPage from './components/KabliPage';
import KotiPage from './components/KotiPage';
import SherwaniPage from './components/SherwaniPage';
import JubbahPage from './components/JubbahPage';
import PajamaPage from './components/PajamaPage';
import KidsPage from './components/KidsPage';
import WishlistPage from './components/WishlistPage';
import WhatsAppWidget from './components/WhatsAppWidget';

import { Product, Coupon, Order, CartItem, ColorSwatch, Showroom } from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_COUPONS, SHOWROOMS as INITIAL_SHOWROOMS } from './data';

export default function App() {
  // 1. STATE INITIALIZATIONS
  const [showrooms, setShowrooms] = useState<Showroom[]>(() => {
    const saved = localStorage.getItem('virsa_showrooms');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading showrooms", e);
      }
    }
    return INITIAL_SHOWROOMS;
  });

  useEffect(() => {
    localStorage.setItem('virsa_showrooms', JSON.stringify(showrooms));
  }, [showrooms]);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('virsa_customer_logged_in') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('virsa_customer_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'details' | 'orders' | 'wishlist' | 'login'>('login');

  useEffect(() => {
    localStorage.setItem('virsa_customer_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('virsa_customer_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('virsa_customer_user');
    }
  }, [currentUser]);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('virsa_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length < INITIAL_PRODUCTS.length) {
        return INITIAL_PRODUCTS;
      }
      return parsed;
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('virsa_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('virsa_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('virsa_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [ariaLiveAnnouncement, setAriaLiveAnnouncement] = useState<string>('');

  // Initial route resolution from URL pathname and search parameters
  const getInitialRoute = () => {
    try {
      const path = window.location.pathname;
      const search = window.location.search;
      const params = new URLSearchParams(search);

      if (path.startsWith('/product/')) {
        const prodId = path.replace('/product/', '').trim();
        return { view: 'product-detail', extra: { productId: prodId } };
      }
      if (
        path.startsWith('/category') ||
        params.has('category') ||
        params.has('q') ||
        params.has('search') ||
        params.has('size') ||
        params.has('color') ||
        params.has('minPrice') ||
        params.has('maxPrice')
      ) {
        const catFromPath = path.startsWith('/category/') ? path.replace('/category/', '').trim() : null;
        const cat = params.get('category') || catFromPath || 'all';
        const q = params.get('q') || params.get('search') || '';
        return { view: 'category', extra: { category: cat, searchQuery: q } };
      }
      if (path === '/checkout') return { view: 'checkout', extra: null };
      if (path === '/wishlist') return { view: 'wishlist', extra: null };
      if (path === '/contact') return { view: 'contact', extra: null };
      if (path === '/admin') return { view: 'admin', extra: null };
    } catch (e) {
      console.error(e);
    }
    return { view: 'homepage', extra: null };
  };

  const initialRoute = getInitialRoute();
  const [currentView, setCurrentView] = useState<string>(initialRoute.view);
  const [viewExtra, setViewExtra] = useState<any>(initialRoute.extra);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('virsa_applied_coupon');
    return saved ? JSON.parse(saved) : null;
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Popstate history listener for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      setCurrentView(route.view);
      setViewExtra(route.extra);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize collections to local storage when state changes
  useEffect(() => {
    localStorage.setItem('virsa_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('virsa_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('virsa_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('virsa_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('virsa_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('virsa_applied_coupon');
    }
  }, [appliedCoupon]);

  // Scroll to top on page view transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [currentView, viewExtra]);

  // Dynamic Browser Favicon Syncing
  useEffect(() => {
    const updateFavicon = () => {
      try {
        const saved = localStorage.getItem('virsa_brand_assets');
        if (saved) {
          const assets = JSON.parse(saved);
          const faviconAsset = assets.find((a: any) => a.type === 'favicon');
          if (faviconAsset?.url) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = faviconAsset.url;
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    updateFavicon();
    window.addEventListener('brand_assets_updated', updateFavicon);
    return () => window.removeEventListener('brand_assets_updated', updateFavicon);
  }, []);

  // 2. VIEW NAVIGATION ROUTER
  const onNavigate = (view: string, extra?: any) => {
    setCurrentView(view);
    setViewExtra(extra || null);

    try {
      let targetPath = '/';
      if (view === 'category') {
        const cat = extra?.category || 'all';
        const params = new URLSearchParams();
        if (extra?.searchQuery) params.set('q', extra.searchQuery);
        const qStr = params.toString();
        targetPath = `/category/${cat}${qStr ? `?${qStr}` : ''}`;
      } else if (view === 'product-detail') {
        targetPath = `/product/${extra?.productId || ''}`;
      } else if (view === 'checkout') {
        targetPath = '/checkout';
      } else if (view === 'wishlist') {
        targetPath = '/wishlist';
      } else if (view === 'contact') {
        targetPath = '/contact';
      } else if (view === 'admin') {
        targetPath = '/admin';
      } else if (view === 'order-confirmation') {
        targetPath = '/order-confirmation';
      }

      if (window.location.pathname + window.location.search !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. CART ACTIONS
  const handleAddToCart = (product: Product, size: string, color: ColorSwatch, quantity = 1) => {
    setCart((prev) => {
      const sku = `${product.id}-${size}-${color.name}`;
      const existing = prev.find((item) => item.sku === sku);
      const newCart = existing
        ? prev.map((item) =>
            item.sku === sku ? { ...item, quantity: item.quantity + quantity } : item
          )
        : [
            ...prev,
            {
              product,
              selectedSize: size,
              selectedColor: color,
              quantity,
              sku,
              price: product.price,
            },
          ];
      
      const totalUnits = newCart.reduce((sum, item) => sum + item.quantity, 0);
      setAriaLiveAnnouncement(
        `Added ${quantity} ${quantity > 1 ? 'items' : 'item'} of ${product.name}, Size ${size}, Color ${color.name} to shopping bag. Shopping bag now contains ${totalUnits} ${totalUnits === 1 ? 'item' : 'items'}.`
      );
      return newCart;
    });
  };

  const handleUpdateQuantity = (sku: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(sku);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveItem = (sku: string) => {
    setCart((prev) => prev.filter((item) => item.sku !== sku));
  };

  const handleRestoreItem = (itemToRestore: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.sku === itemToRestore.sku);
      if (existing) {
        return prev.map((item) =>
          item.sku === itemToRestore.sku
            ? { ...item, quantity: item.quantity + itemToRestore.quantity }
            : item
        );
      }
      return [...prev, itemToRestore];
    });
  };

  const handleBuyNow = (product: Product, size: string, color: ColorSwatch, quantity: number) => {
    handleAddToCart(product, size, color, quantity);
    setIsCartOpen(false);
    onNavigate('checkout');
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setAppliedCoupon(null);
    onNavigate('order-confirmation', { order: newOrder });
  };

  // 4. RENDER CORE ROUTED PANELS
  const renderContent = () => {
    switch (currentView) {
      case 'homepage':
      case 'home':
        return (
          <Homepage
            products={products}
            onNavigate={onNavigate}
            onAddToCart={handleAddToCart}
          />
        );

      case 'category': {
        const cat = viewExtra?.category || 'all';
        const searchQuery = viewExtra?.searchQuery || '';

        return (
          <PLP
            products={products}
            onNavigate={onNavigate}
            onAddToCart={handleAddToCart}
            initialCategory={cat}
            initialSearchQuery={searchQuery}
          />
        );
      }

      case 'product-detail': {
        const productId = viewExtra?.productId;
        const selectedProd = products.find((p) => p.id === productId);
        if (!selectedProd) {
          return (
            <div className="py-24 text-center">
              <p className="text-gray-400">Garment selection not found.</p>
              <button
                onClick={() => onNavigate('homepage')}
                className="mt-4 px-6 py-2 bg-[#C9A84C] text-black uppercase tracking-widest text-xs font-bold"
              >
                Back to Showroom
              </button>
            </div>
          );
        }
        return (
          <PDP
            product={selectedProd}
            allProducts={products}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onNavigate={onNavigate}
          />
        );
      }

      case 'wishlist': {
        // Automatically redirect to homepage and open the integrated wishlist in customer profile!
        setTimeout(() => {
          onNavigate('homepage');
          if (isLoggedIn) {
            setAuthDefaultTab('wishlist');
            setIsAuthOpen(true);
          } else {
            setAuthDefaultTab('login');
            setIsAuthOpen(true);
            alert('Please Sign In to view your saved masterworks wishlist.');
          }
        }, 0);
        return null;
      }

      case 'contact':
        return <ContactPage onNavigate={onNavigate} />;

      case 'checkout':
        return (
          <Checkout
            cart={cart}
            coupons={coupons}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={setAppliedCoupon}
            onPlaceOrder={handlePlaceOrder}
            onNavigate={onNavigate}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
          />
        );

      case 'order-confirmation': {
        const confirmedOrder = viewExtra?.order;
        if (!confirmedOrder) {
          return (
            <div className="py-24 text-center">
              <p className="text-gray-400">No order details found.</p>
              <button
                onClick={() => onNavigate('homepage')}
                className="mt-4 px-6 py-2 bg-[#C9A84C] text-black uppercase tracking-widest text-xs font-bold"
              >
                Back to Home
              </button>
            </div>
          );
        }
        return <OrderConfirmation order={confirmedOrder} onNavigate={onNavigate} />;
      }

      default:
        return (
          <Homepage
            products={products}
            onNavigate={onNavigate}
            onAddToCart={handleAddToCart}
            showrooms={showrooms}
          />
        );
    }
  };

  if (currentView === 'admin') {
    return (
      <AdminPanel
        products={products}
        setProducts={setProducts}
        orders={orders}
        setOrders={setOrders}
        coupons={coupons}
        setCoupons={setCoupons}
        showrooms={showrooms}
        setShowrooms={setShowrooms}
        onExitAdmin={() => onNavigate('homepage')}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div id="virsa-luxury-storefront" className="min-h-screen bg-[#121212] text-[#FFFFFF] flex flex-col font-sans selection:bg-[#C9A84C]/30 selection:text-[#C9A84C]">
      {/* Skip to Main Content Accessible Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-5 focus:py-2.5 focus:bg-[#C9A84C] focus:text-[#121212] focus:font-bold focus:rounded-lg focus:shadow-2xl focus:ring-2 focus:ring-white uppercase tracking-wider text-xs"
      >
        Skip to main content
      </a>

      {/* Screen Reader ARIA Live Region for Cart & Dynamic Actions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {ariaLiveAnnouncement}
      </div>

      {/* 1. BRAND NAVIGATION BAR */}
      <Navbar
        currentView={currentView}
        onNavigate={onNavigate}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={false}
        onToggleAdminMode={() => {}}
        products={products}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onOpenAuth={(tab) => {
          if (tab) {
            setAuthDefaultTab(tab as any);
          }
          setIsAuthOpen(true);
        }}
      />

      {/* 2. CORE VIEWPORT CONTAINER */}
      <main id="main-content" tabIndex={-1} className="flex-grow pb-16 md:pb-0 focus:outline-none">
        {renderContent()}
      </main>

      {/* 3. ATELIER GLOBAL FOOTER WITH TRUST SIGNALS */}
      {currentView !== 'checkout' && currentView !== 'order-confirmation' && (
        <Footer onNavigate={onNavigate} />
      )}

      {/* 4. MOBILE THUMB-REACHABLE BOTTOM NAVIGATION */}
      <BottomNav
        currentView={currentView}
        onNavigate={onNavigate}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => {
          onNavigate('category', { category: 'all' });
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        isLoggedIn={isLoggedIn}
      />

      {/* 5. SLIDING CART DRAWER ATELIER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onRestoreItem={handleRestoreItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          onNavigate('checkout');
        }}
        coupons={coupons}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={setAppliedCoupon}
      />



      {/* 5. FLOATING WHATSAPP CONCIERGE CHAT */}
      <WhatsAppWidget />

      {/* 6. CUSTOMER ACCOUNT PORTAL MODAL */}
      <CustomerAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        isLoggedIn={isLoggedIn}
        onLoginSuccess={(user) => {
          setIsLoggedIn(true);
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
        onLogout={() => {
          setIsLoggedIn(false);
          setCurrentUser(null);
          setCart([]); // Clear cart on logout for clean privacy
        }}
        currentUser={currentUser}
        products={products}
        onAddToCart={handleAddToCart}
        onNavigate={onNavigate}
      />
    </div>
  );
}
