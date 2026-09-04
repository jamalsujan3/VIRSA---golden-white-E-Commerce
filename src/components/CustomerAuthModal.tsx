import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, Award, ShoppingBag, Trash2, Heart, LogOut, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { useWishlist } from '../lib/wishlist';

interface CustomerUser {
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'VIP';
  points: number;
}

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginSuccess: (user: CustomerUser) => void;
  onLogout: () => void;
  currentUser: CustomerUser | null;
  products: Product[];
  onAddToCart: (product: Product, size: string, color: any) => void;
  onNavigate: (view: string, extra?: any) => void;
}

const DEMO_USERS: CustomerUser[] = [
  {
    name: 'Suhan Chowdhury',
    email: 'suhan@virsa.com',
    phone: '01712-345678',
    address: 'House 24, Road 12, Dhanmondi, Dhaka-1209',
    membershipLevel: 'VIP',
    points: 2450
  },
  {
    name: 'Naila Amin',
    email: 'naila@virsa.com',
    phone: '01819-987654',
    address: 'Apartment 5B, RM Tower, Road 82, Gulshan-2, Dhaka-1212',
    membershipLevel: 'Platinum',
    points: 1820
  }
];

export default function CustomerAuthModal({
  isOpen,
  onClose,
  isLoggedIn,
  onLoginSuccess,
  onLogout,
  currentUser,
  products,
  onAddToCart,
  onNavigate
}: CustomerAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [profileActiveTab, setProfileActiveTab] = useState<'details' | 'orders' | 'wishlist'>('details');

  // Login inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  // Wishlist hook
  const { wishlist, toggle } = useWishlist();
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  // Simulated customer order history
  const [simulatedOrders, setSimulatedOrders] = useState<any[]>([]);

  // Generate some premium past orders for the customer
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const userOrders = [
        {
          orderId: `VRS-20260615-${Math.floor(Math.random() * 9000) + 1000}`,
          date: 'June 15, 2026',
          status: 'delivered',
          total: 5990,
          items: [
            {
              name: 'Rosewood Dynasty Premium Raw Silk Panjabi',
              price: 5990,
              qty: 1
            }
          ]
        },
        {
          orderId: `VRS-20260408-${Math.floor(Math.random() * 9000) + 1000}`,
          date: 'April 08, 2026',
          status: 'delivered',
          total: 10480,
          items: [
            {
              name: 'Midnight Blue Elite Cotton Satin Panjabi',
              price: 4790,
              qty: 1
            },
            {
              name: 'Deep Ruby Velvet Heritage Koti',
              price: 5690,
              qty: 1
            }
          ]
        }
      ];
      setSimulatedOrders(userOrders);
    }
  }, [isLoggedIn, currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!emailInput.trim()) {
      setLoginError('Email is required.');
      return;
    }

    const matchedDemo = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (matchedDemo) {
      onLoginSuccess(matchedDemo);
      clearInputs();
    } else {
      const customUser: CustomerUser = {
        name: emailInput.split('@')[0].toUpperCase(),
        email: emailInput.trim().toLowerCase(),
        phone: '017XXXXXXXX',
        address: 'Bespoke Residence, Dhaka, Bangladesh',
        membershipLevel: 'Bronze',
        points: 100
      };
      onLoginSuccess(customUser);
      clearInputs();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Full Name and Email are required.');
      return;
    }

    const newUser: CustomerUser = {
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim() || '017XXXXXXXX',
      address: regAddress.trim() || 'Dhaka, Bangladesh',
      membershipLevel: 'Bronze',
      points: 200
    };

    onLoginSuccess(newUser);
    clearInputs();
  };

  const clearInputs = () => {
    setEmailInput('');
    setPasswordInput('');
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegAddress('');
    setRegPassword('');
    setLoginError('');
    setRegError('');
  };

  const selectDemoUser = (user: CustomerUser) => {
    setEmailInput(user.email);
    setPasswordInput('password');
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const availableVariant = product.variants.find((v) => v.stock > 0);
    if (availableVariant) {
      onAddToCart(product, availableVariant.size, availableVariant.color);
    }
  };

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

          {/* Modal Content */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Atelier Member Portal"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-[#E8DFC8] rounded-2xl shadow-2xl text-[#1F1B17] z-10 text-left"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#FAF8F5] text-[#6E645A] hover:text-[#1F1B17] transition-all duration-200 cursor-pointer z-30"
              aria-label="Close Member Portal modal"
            >
              <X className="h-5 w-5" />
            </button>

            {!isLoggedIn ? (
              /* =========================================================================
                 UNAUTHENTICATED / SIGN-IN & SIGN-UP FLOWS
                 ========================================================================= */
              <div className="p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-2 pb-2 border-b border-[#E8DFC8]">
                  <span className="text-xs font-serif tracking-[0.25em] text-[#8C6819] uppercase font-bold">
                    Bespoke Atelier Member Portal
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#1F1B17] uppercase tracking-wider font-semibold">
                    Sign In to VIRSA
                  </h3>
                  <p className="text-[11px] font-sans text-[#6E645A] tracking-wider">
                    Access your curated orders, boutique cart, and personal wishlist.
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#E8DFC8]">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-3 text-xs tracking-widest uppercase font-mono font-bold border-b-2 transition-all cursor-pointer ${
                      activeTab === 'login'
                        ? 'border-[#C5A059] text-[#8C6819]'
                        : 'border-transparent text-[#6E645A] hover:text-[#1F1B17]'
                    }`}
                  >
                    Bespoke Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 py-3 text-xs tracking-widest uppercase font-mono font-bold border-b-2 transition-all cursor-pointer ${
                      activeTab === 'register'
                        ? 'border-[#C5A059] text-[#8C6819]'
                        : 'border-transparent text-[#6E645A] hover:text-[#1F1B17]'
                    }`}
                  >
                    Create New Account
                  </button>
                </div>

                {activeTab === 'login' ? (
                  /* LOGIN VIEW */
                  <div className="space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                      {loginError && (
                        <div className="bg-rose-50 border border-rose-200 rounded px-4 py-2 text-xs text-rose-600 text-center font-sans">
                          {loginError}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label htmlFor="auth-email-input" className="text-[10px] font-serif tracking-widest uppercase text-[#5C5248] block font-bold">
                          Patron Email Address
                        </label>
                        <div className="relative">
                          <input
                            id="auth-email-input"
                            type="email"
                            required
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="patron@virsa-luxury.com"
                            className="w-full bg-[#FAF8F5] border border-[#E8DFC8] focus:border-[#C5A059] text-[#1F1B17] rounded-lg px-4 py-3 pl-10 text-xs font-mono tracking-wider focus:outline-none transition-all"
                          />
                          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#6E645A]" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="auth-password-input" className="text-[10px] font-serif tracking-widest uppercase text-[#5C5248] block font-bold">
                          Security Password
                        </label>
                        <div className="relative">
                          <input
                            id="auth-password-input"
                            type="password"
                            required
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-[#FAF8F5] border border-[#E8DFC8] focus:border-[#C5A059] text-[#1F1B17] rounded-lg px-4 py-3 pl-10 text-xs font-mono tracking-wider focus:outline-none transition-all"
                          />
                          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#6E645A]" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] font-bold text-xs tracking-widest uppercase py-3.5 rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        Sign In Securely
                      </button>
                    </form>

                    <div className="pt-2 border-t border-[#E8DFC8] flex justify-between items-center text-[10px] text-[#6E645A] font-sans">
                      <span>Authorized personnel only</span>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('admin');
                        }}
                        className="text-[#8C6819] hover:underline font-mono tracking-wider uppercase font-semibold cursor-pointer"
                      >
                        Atelier Control Panel →
                      </button>
                    </div>

                    {/* Predefined Demo Accounts to help testing */}
                    <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-4 space-y-3">
                      <span className="text-[10px] font-serif tracking-widest uppercase text-[#8C6819] block font-bold">
                        🔑 Quick Sign-In for Testing
                      </span>
                      <p className="text-[10px] text-[#6E645A] font-sans">
                        Select an honored luxury VIP account to preview tailored order history and member rewards instantly:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {DEMO_USERS.map((user) => (
                          <button
                            key={user.email}
                            type="button"
                            onClick={() => selectDemoUser(user)}
                            className="flex items-center justify-between text-left p-2.5 rounded-lg bg-white border border-[#E8DFC8] hover:border-[#C5A059] transition-all text-xs cursor-pointer shadow-2xs"
                          >
                            <div>
                              <p className="font-semibold text-[#1F1B17] font-serif">{user.name}</p>
                              <p className="text-[9px] text-[#6E645A] font-mono">{user.email}</p>
                            </div>
                            <span className="text-[9px] bg-[#FAF6ED] text-[#8C6819] border border-[#C5A059] px-2 py-0.5 rounded-full uppercase font-bold">
                              {user.membershipLevel}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* REGISTER VIEW */
                  <form onSubmit={handleRegister} className="space-y-4">
                    {regError && (
                      <div className="bg-rose-50 border border-rose-200 rounded px-4 py-2 text-xs text-rose-600 text-center font-sans">
                        {regError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="reg-name-input" className="text-[10px] font-serif tracking-widest uppercase text-[#5C5248] block font-bold">
                          Full Name
                        </label>
                        <div className="relative">
                          <input
                            id="reg-name-input"
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Tahmid Ahmed"
                            className="w-full bg-[#FAF8F5] border border-[#E8DFC8] focus:border-[#C5A059] text-[#1F1B17] rounded-lg px-4 py-3 pl-10 text-xs font-mono tracking-wider focus:outline-none transition-all"
                          />
                          <User className="absolute left-3 top-3.5 h-4 w-4 text-[#6E645A]" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="reg-email-input" className="text-[10px] font-serif tracking-widest uppercase text-[#5C5248] block font-bold">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            id="reg-email-input"
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="tahmid@outlook.com"
                            className="w-full bg-[#FAF8F5] border border-[#E8DFC8] focus:border-[#C5A059] text-[#1F1B17] rounded-lg px-4 py-3 pl-10 text-xs font-mono tracking-wider focus:outline-none transition-all"
                          />
                          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#6E645A]" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="reg-phone-input" className="text-[10px] font-serif tracking-widest uppercase text-[#5C5248] block font-bold">
                          Mobile Phone
                        </label>
                        <div className="relative">
                          <input
                            id="reg-phone-input"
                            type="text"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="01711-223344"
                            className="w-full bg-[#FAF8F5] border border-[#E8DFC8] focus:border-[#C5A059] text-[#1F1B17] rounded-lg px-4 py-3 pl-10 text-xs font-mono tracking-wider focus:outline-none transition-all"
                          />
                          <Phone className="absolute left-3 top-3.5 h-4 w-4 text-[#6E645A]" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="reg-password-input" className="text-[10px] font-serif tracking-widest uppercase text-[#5C5248] block font-bold">
                          Security Password
                        </label>
                        <div className="relative">
                          <input
                            id="reg-password-input"
                            type="password"
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Create Password"
                            className="w-full bg-[#FAF8F5] border border-[#E8DFC8] focus:border-[#C5A059] text-[#1F1B17] rounded-lg px-4 py-3 pl-10 text-xs font-mono tracking-wider focus:outline-none transition-all"
                          />
                          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#6E645A]" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="reg-address-input" className="text-[10px] font-serif tracking-widest uppercase text-[#5C5248] block font-bold">
                        Delivery Address
                      </label>
                      <div className="relative">
                        <textarea
                          id="reg-address-input"
                          rows={2}
                          value={regAddress}
                          onChange={(e) => setRegAddress(e.target.value)}
                          placeholder="House, Flat, Road, Area, City"
                          className="w-full bg-[#FAF8F5] border border-[#E8DFC8] focus:border-[#C5A059] text-[#1F1B17] rounded-lg px-4 py-3 text-xs font-mono tracking-wider focus:outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] font-bold text-xs tracking-widest uppercase py-3.5 rounded-lg transition-all cursor-pointer shadow-sm"
                    >
                      Establish Account & Sign In
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* =========================================================================
                 AUTHENTICATED / CUSTOMER PROFILE PANELS
                 ========================================================================= */
              <div className="p-6 sm:p-8 space-y-6">
                {/* Header Profile Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8DFC8]">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA8232] flex items-center justify-center text-[#1F1B17] font-serif text-lg font-bold shadow-xs">
                      {currentUser?.name ? currentUser.name[0] : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-serif text-xl font-bold text-[#1F1B17] uppercase">{currentUser?.name}</h3>
                        <span className="text-[9px] bg-[#FAF6ED] text-[#8C6819] border border-[#C5A059] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          {currentUser?.membershipLevel} Patron
                        </span>
                      </div>
                      <p className="text-xs text-[#6E645A] font-mono mt-0.5">{currentUser?.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-mono tracking-widest uppercase transition-all duration-200 self-start sm:self-auto cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Navigation Inner Tabs */}
                <div className="flex border-b border-[#E8DFC8] bg-[#FAF8F5] p-1 rounded-xl">
                  <button
                    onClick={() => setProfileActiveTab('details')}
                    className={`flex-1 py-2 text-[10px] sm:text-xs tracking-widest uppercase font-sans font-bold rounded-lg transition-all cursor-pointer ${
                      profileActiveTab === 'details'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] shadow-2xs'
                        : 'text-[#6E645A] hover:text-[#1F1B17]'
                    }`}
                  >
                    Profile & Loyalty
                  </button>
                  <button
                    onClick={() => setProfileActiveTab('orders')}
                    className={`flex-1 py-2 text-[10px] sm:text-xs tracking-widest uppercase font-sans font-bold rounded-lg transition-all cursor-pointer ${
                      profileActiveTab === 'orders'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] shadow-2xs'
                        : 'text-[#6E645A] hover:text-[#1F1B17]'
                    }`}
                  >
                    Atelier Orders
                  </button>
                  <button
                    onClick={() => setProfileActiveTab('wishlist')}
                    className={`flex-1 py-2 text-[10px] sm:text-xs tracking-widest uppercase font-sans font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      profileActiveTab === 'wishlist'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] shadow-2xs'
                        : 'text-[#6E645A] hover:text-[#1F1B17]'
                    }`}
                  >
                    <span>My Wishlist</span>
                    <span className={`text-[9px] px-1.5 py-0.25 rounded-full font-bold ${
                      profileActiveTab === 'wishlist' ? 'bg-[#1F1B17]/20 text-[#1F1B17]' : 'bg-[#FAF6ED] text-[#8C6819]'
                    }`}>
                      {wishlist.length}
                    </span>
                  </button>
                </div>

                {/* Tab content renderer */}
                <div className="space-y-4">
                  {profileActiveTab === 'details' && (
                    <div className="space-y-5">
                      {/* Loyalty Board Card */}
                      <div className="bg-gradient-to-br from-[#FAF6ED] via-[#F5EFEB] to-[#ECE5D8] border border-[#C5A059]/40 rounded-xl p-5 relative overflow-hidden shadow-2xs">
                        <div className="absolute right-0 top-0 bottom-0 opacity-15 pointer-events-none flex items-center justify-center p-4">
                          <Award className="w-40 h-40 text-[#8C6819]" />
                        </div>
                        <div className="relative space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono tracking-widest text-[#8C6819] uppercase font-bold">
                              Loyalty & Rewards Ledger
                            </span>
                            <span className="text-[10px] text-[#6E645A] font-mono">ID: VRS-PT-{currentUser?.name?.substring(0,3).toUpperCase()}</span>
                          </div>
                          <div className="flex items-baseline space-x-3">
                            <span className="text-3xl font-mono text-[#8C6819] font-extrabold">{currentUser?.points}</span>
                            <span className="text-xs text-[#5C5248] uppercase tracking-widest font-semibold">Available Heritage Points</span>
                          </div>
                          <div className="text-xs text-[#6E645A] font-sans leading-relaxed">
                            Earn 10 points for every ৳1,000 spent. Redeem points for custom drapes, silk lining upgrades, or bespoke monogram embroidery on your next Panjabi selection.
                          </div>
                        </div>
                      </div>

                      {/* Info Fields Grid */}
                      <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-5 space-y-4 text-xs font-sans">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase text-[#6E645A] tracking-wider font-bold">Patron Mobile</span>
                            <p className="text-[#1F1B17] font-mono font-medium">{currentUser?.phone}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase text-[#6E645A] tracking-wider font-bold">Acquisition Status</span>
                            <p className="text-[#8C6819] font-semibold uppercase tracking-wider">{currentUser?.membershipLevel} Level Active</p>
                          </div>
                        </div>

                        <div className="space-y-1 border-t border-[#E8DFC8] pt-3">
                          <span className="text-[10px] uppercase text-[#6E645A] tracking-wider font-bold flex items-center space-x-1">
                            <MapPin className="h-3.5 w-3.5 text-[#8C6819]" />
                            <span>Default Atelier Shipping Destination</span>
                          </span>
                          <p className="text-[#5C5248] leading-relaxed font-medium mt-1">{currentUser?.address}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {profileActiveTab === 'orders' && (
                    <div className="space-y-4">
                      {simulatedOrders.length === 0 ? (
                        <div className="py-12 text-center text-[#6E645A] text-xs">
                          No boutique order history found yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {simulatedOrders.map((order, idx) => (
                            <div key={idx} className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-4 space-y-3 hover:border-[#C5A059] transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFC8] pb-2 text-xs">
                                <div>
                                  <span className="font-mono text-[#1F1B17] font-bold">{order.orderId}</span>
                                  <span className="text-[#6E645A] font-mono ml-2">Placed: {order.date}</span>
                                </div>
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-2 py-0.5 uppercase tracking-wider font-bold text-center self-start sm:self-auto">
                                  {order.status}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {order.items.map((it: any, i: number) => (
                                  <div key={i} className="flex justify-between items-center text-xs">
                                    <span className="text-[#5C5248] font-serif font-medium">{it.name} (x{it.qty})</span>
                                    <span className="font-mono text-[#6E645A]">৳{it.price.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center border-t border-[#E8DFC8] pt-2 text-xs">
                                <span className="text-[#6E645A]">Transaction Aggregate</span>
                                <span className="font-mono text-[#8C6819] font-bold">৳{order.total.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {profileActiveTab === 'wishlist' && (
                    <div className="space-y-4">
                      {wishlistedProducts.length === 0 ? (
                        <div className="py-16 text-center max-w-sm mx-auto space-y-4">
                          <div className="inline-flex p-3 rounded-full bg-[#FAF6ED] text-[#8C6819]">
                            <Heart className="h-6 w-6 stroke-[1.25]" />
                          </div>
                          <div>
                            <h4 className="font-serif text-sm text-[#1F1B17] font-semibold">Your Wishlist is Empty</h4>
                            <p className="text-[11px] text-[#6E645A] font-sans leading-relaxed mt-1">
                              Save luxurious traditional pieces such as raw silk Panjabis, velvet Kotis, or imperial Sherwanis directly in your profile.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              onNavigate('category');
                              onClose();
                            }}
                            className="inline-flex items-center space-x-1.5 text-[10px] font-sans tracking-widest uppercase font-bold text-[#8C6819] hover:underline cursor-pointer"
                          >
                            <span>Explore Showroom</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                          {wishlistedProducts.map((prod) => (
                            <div
                              key={prod.id}
                              className="bg-white border border-[#E8DFC8] rounded-xl p-3 flex gap-3 hover:border-[#C5A059] transition-all group shadow-2xs"
                            >
                              <img
                                src={prod.images[0].url}
                                alt={prod.name}
                                className="w-16 h-20 object-cover rounded-lg bg-[#FAF8F5] border border-[#E8DFC8] shrink-0 cursor-pointer"
                                onClick={() => {
                                  onNavigate('product-detail', { productId: prod.id });
                                  onClose();
                                }}
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                                <div className="space-y-0.5">
                                  <h4
                                    onClick={() => {
                                      onNavigate('product-detail', { productId: prod.id });
                                      onClose();
                                    }}
                                    className="text-xs font-serif text-[#1F1B17] group-hover:text-[#8C6819] transition-colors truncate font-semibold cursor-pointer"
                                  >
                                    {prod.name}
                                  </h4>
                                  <p className="text-[9px] font-mono text-[#6E645A] uppercase">{prod.category}</p>
                                  <p className="text-[11px] font-mono font-semibold text-[#8C6819] mt-0.5">
                                    ৳{prod.price.toLocaleString()}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={(e) => handleQuickAdd(e, prod)}
                                    className="flex-grow bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] py-1 px-2 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-2xs"
                                  >
                                    <ShoppingBag className="h-3 w-3" />
                                    <span>Quick Add</span>
                                  </button>
                                  <button
                                    onClick={() => toggle(prod.id)}
                                    className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#E8DFC8] text-[#6E645A] hover:text-rose-600 hover:border-rose-300 transition-all cursor-pointer"
                                    title="Remove from Wishlist"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
