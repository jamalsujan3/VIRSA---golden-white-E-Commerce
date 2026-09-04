import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Layers, Undo2, Users, Ticket, Settings, 
  ShieldAlert, LogOut, Bell, Shield, Sparkles, AlertTriangle, CheckCircle,
  Sun, Moon, MapPin, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, Product, Coupon, Showroom } from '../../types';
import { AdminUser, addActivityLog } from '../../lib/adminData';

// Import sub-pages
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminReturns from './AdminReturns';
import AdminCustomers from './AdminCustomers';
import AdminCoupons from './AdminCoupons';
import AdminSettings from './AdminSettings';
import AdminLogs from './AdminLogs';
import AdminLocations from './AdminLocations';
import AdminFAQs from './AdminFAQs';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  showrooms: Showroom[];
  setShowrooms: React.Dispatch<React.SetStateAction<Showroom[]>>;
  onExitAdmin: () => void;
  onNavigate: (view: string, extra?: any) => void;
}

interface AlertNotification {
  id: string;
  type: 'stock' | 'order' | 'return';
  text: string;
  isRead: boolean;
  time: string;
}

export default function AdminPanel({
  products,
  setProducts,
  orders,
  setOrders,
  coupons,
  setCoupons,
  showrooms,
  setShowrooms,
  onExitAdmin,
  onNavigate
}: AdminPanelProps) {
  
  // Current logged in admin profile
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('virsa_logged_admin');
    return saved ? JSON.parse(saved) : null;
  });

  // Active module tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('virsa_admin_active_tab');
    if (saved) {
      localStorage.removeItem('virsa_admin_active_tab');
      return saved;
    }
    return 'dashboard';
  });

  // Color & Theme Customization States
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('virsa_admin_theme_mode') as 'light' | 'dark') || 'dark';
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('virsa_admin_theme_accent') || 'gold';
  });

  const toggleThemeMode = () => {
    const nextMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextMode);
    localStorage.setItem('virsa_admin_theme_mode', nextMode);
  };

  const handleAccentChange = (accent: 'gold' | 'indigo' | 'crimson' | 'emerald') => {
    setAccentColor(accent);
    localStorage.setItem('virsa_admin_theme_accent', accent);
  };

  // Notification states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AlertNotification[]>([
    { id: 'not-1', type: 'stock', text: 'Low Stock Alert: Classic Cotton Koti has only 3 left.', isRead: false, time: '5 mins ago' },
    { id: 'not-2', type: 'order', text: 'New Order Placed: VRS-1002 from Tanvir Hossain.', isRead: false, time: '12 mins ago' },
    { id: 'not-3', type: 'return', text: 'Return Ticket Initiated: Defective fabric reported on VRS-1004.', isRead: true, time: '2 hrs ago' }
  ]);

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentAdmin(user);
    localStorage.setItem('virsa_logged_admin', JSON.stringify(user));
    
    // Set default accessible tab based on role
    if (user.role === 'order-staff') {
      setActiveTab('orders');
    } else {
      const savedTab = localStorage.getItem('virsa_admin_active_tab');
      if (savedTab) {
        setActiveTab(savedTab);
        localStorage.removeItem('virsa_admin_active_tab');
      } else {
        setActiveTab('dashboard');
      }
    }

    addActivityLog(user.name, user.role, 'Logged In', 'auth', user.id, 'User successfully authenticated via role-switcher');
  };

  const handleLogout = () => {
    if (currentAdmin) {
      addActivityLog(currentAdmin.name, currentAdmin.role, 'Logged Out', 'auth', currentAdmin.id, 'User manually logged out of admin session');
    }
    setCurrentAdmin(null);
    localStorage.removeItem('virsa_logged_admin');
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setIsNotificationsOpen(false);
  };

  // 1. RBAC PERMISSIONS CONTROLLER (Sidebar filter list)
  const isTabAllowed = (tab: string): boolean => {
    if (!currentAdmin) return false;
    const role = currentAdmin.role;

    if (role === 'super-admin') return true; // Full access

    if (role === 'manager') {
      // Dashboard, Products, Orders, Coupons, Customers, Locations, Settings, Logs, FAQs
      return ['dashboard', 'orders', 'products', 'returns', 'customers', 'coupons', 'locations', 'settings', 'logs', 'faqs'].includes(tab);
    }

    if (role === 'order-staff') {
      // Orders only
      return ['orders'].includes(tab);
    }

    if (role === 'support') {
      // Dashboard (view), Orders (view), Customers (view), FAQs
      return ['dashboard', 'orders', 'returns', 'customers', 'faqs'].includes(tab);
    }

    return false;
  };

  const sidebarTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders Management', icon: ShoppingBag },
    { id: 'products', label: 'Products & Catalog', icon: Layers },
    { id: 'returns', label: 'Returns logistics', icon: Undo2 },
    { id: 'customers', label: 'Customer CRM', icon: Users },
    { id: 'coupons', label: 'Promo Coupons', icon: Ticket },
    { id: 'locations', label: 'Showrooms', icon: MapPin },
    { id: 'faqs', label: 'FAQ Curation', icon: HelpCircle },
    { id: 'settings', label: 'Atelier Settings', icon: Settings },
    { id: 'logs', label: 'Audit Logs', icon: Shield }
  ];

  // If not logged in, render the login shield
  if (!currentAdmin) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-gray-900 flex font-sans selection:bg-[#C9A84C]/30 relative overflow-hidden">
      
      {/* 1. FIXED DARK SIDEBAR LAYOUT (Width 240px) */}
      <aside className="w-60 bg-[#0F1117] flex-shrink-0 flex flex-col justify-between border-r border-white/5 relative z-20">
        
        <div>
          {/* Brand header */}
          <div className="h-20 flex items-center px-6 border-b border-white/5 space-x-3 bg-[#0A0A0A]/40 justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-lg flex items-center justify-center text-[#C9A84C]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-serif tracking-[0.2em] text-[#C9A84C] font-bold">VIRSA</span>
                <span className="block text-[8px] font-mono text-gray-400 uppercase tracking-widest font-semibold mt-0.5">Atelier Control</span>
              </div>
            </div>
            {/* Direct exit storefront shortcut */}
            <button
              onClick={onExitAdmin}
              className="text-gray-500 hover:text-white text-[10px] font-mono tracking-wider font-semibold border border-white/10 rounded-md px-1.5 py-0.5 hover:bg-white/5 transition"
              title="Return to Customer Shop"
            >
              Exit
            </button>
          </div>

          {/* Navigation Links (Filtered by RBAC Clearance) */}
          <nav className="mt-6 px-4 space-y-1">
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon;
              const isAllowed = isTabAllowed(tab.id);
              if (!isAllowed) return null; // Hide restricted screens

              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all relative cursor-pointer ${
                    isActive
                      ? 'bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {/* Left indicator pin */}
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-[#C9A84C] rounded-r-full" />}
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom profile controls */}
        <div className="p-4 border-t border-white/5 bg-[#0A0A0A]/20">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-8 w-8 bg-[#C9A84C] rounded-xl flex items-center justify-center text-[#0F1117] font-bold text-xs uppercase">
              {currentAdmin.name.substring(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentAdmin.name}</div>
              <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mt-0.5">{currentAdmin.role}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500 hover:text-white text-rose-400 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Control</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className={`flex-1 flex flex-col min-h-screen overflow-y-auto transition-colors duration-300 ${themeMode === 'dark' ? 'admin-theme-dark' : ''}`}>
        
        {/* Dynamic Theme & Accent Style Injection */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --admin-accent: ${
              accentColor === 'gold' ? '#C9A84C' :
              accentColor === 'indigo' ? '#6366F1' :
              accentColor === 'crimson' ? '#EF4444' :
              '#10B981'
            };
            --admin-accent-hover: ${
              accentColor === 'gold' ? '#B5963E' :
              accentColor === 'indigo' ? '#4F46E5' :
              accentColor === 'crimson' ? '#DC2626' :
              '#059669'
            };
            --admin-accent-light: ${
              accentColor === 'gold' ? 'rgba(201, 168, 76, 0.15)' :
              accentColor === 'indigo' ? 'rgba(99, 102, 241, 0.15)' :
              accentColor === 'crimson' ? 'rgba(239, 68, 68, 0.15)' :
              'rgba(16, 185, 129, 0.15)'
            };
            --admin-accent-border: ${
              accentColor === 'gold' ? 'rgba(201, 168, 76, 0.25)' :
              accentColor === 'indigo' ? 'rgba(99, 102, 241, 0.25)' :
              accentColor === 'crimson' ? 'rgba(239, 68, 68, 0.25)' :
              'rgba(16, 185, 129, 0.25)'
            };
          }

          /* Accent Custom Utility Overrides */
          .text-\\[\\#C9A84C\\] {
            color: var(--admin-accent) !important;
          }
          .bg-\\[\\#C9A84C\\] {
            background-color: var(--admin-accent) !important;
          }
          .border-\\[\\#C9A84C\\] {
            border-color: var(--admin-accent) !important;
          }
          .bg-\\[\\#C9A84C\\]\\/10 {
            background-color: var(--admin-accent-light) !important;
          }
          .bg-\\[\\#C9A84C\\]\\/15 {
            background-color: var(--admin-accent-light) !important;
          }
          .border-\\[\\#C9A84C\\]\\/20 {
            border-color: var(--admin-accent-border) !important;
          }
          .border-\\[\\#C9A84C\\]\\/25 {
            border-color: var(--admin-accent-border) !important;
          }
          .hover\\:bg-\\[\\#B5963E\\]:hover {
            background-color: var(--admin-accent-hover) !important;
          }
          .hover\\:text-\\[\\#C9A84C\\]:hover {
            color: var(--admin-accent) !important;
          }
          .focus\\:border-\\[\\#C9A84C\\]:focus {
            border-color: var(--admin-accent) !important;
          }

          /* Scoped Dark Mode Overrides */
          .admin-theme-dark {
            background-color: #0B0C10 !important;
          }
          .admin-theme-dark header {
            background-color: #12141D !important;
            border-bottom-color: rgba(255, 255, 255, 0.08) !important;
          }
          .admin-theme-dark main {
            background-color: #0B0C10 !important;
          }
          .admin-theme-dark .bg-white {
            background-color: #12141D !important;
          }
          .admin-theme-dark .text-gray-900,
          .admin-theme-dark .text-gray-800 {
            color: #F3F4F6 !important;
          }
          .admin-theme-dark .text-gray-700,
          .admin-theme-dark .text-gray-600 {
            color: #E5E7EB !important;
          }
          .admin-theme-dark .text-gray-500 {
            color: #9CA3AF !important;
          }
          .admin-theme-dark .bg-gray-50 {
            background-color: #171A26 !important;
          }
          .admin-theme-dark .bg-gray-100 {
            background-color: #202434 !important;
          }
          .admin-theme-dark .border-gray-100,
          .admin-theme-dark .border-gray-200 {
            border-color: rgba(255, 255, 255, 0.08) !important;
          }
          .admin-theme-dark .divide-gray-50 > *,
          .admin-theme-dark .divide-gray-100 > * {
            border-color: rgba(255, 255, 255, 0.08) !important;
          }
          .admin-theme-dark input,
          .admin-theme-dark select,
          .admin-theme-dark textarea {
            background-color: #171A26 !important;
            border-color: rgba(255, 255, 255, 0.12) !important;
            color: #FFFFFF !important;
          }
          .admin-theme-dark table th {
            background-color: #171A26 !important;
            color: #9CA3AF !important;
          }
          .admin-theme-dark table tr:hover {
            background-color: rgba(255, 255, 255, 0.03) !important;
          }
          .admin-theme-dark .shadow-xs,
          .admin-theme-dark .shadow-sm,
          .admin-theme-dark .shadow-md,
          .admin-theme-dark .shadow-lg {
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.3) !important;
          }

          /* Hardcoded text color overrides (e.g. h1 heading in AdminDashboard) */
          .admin-theme-dark .text-\\[\\#0A0A0A\\] {
            color: #FFFFFF !important;
          }

          /* Amber pending card color fixes in dark mode */
          .admin-theme-dark .bg-amber-50\\/50 {
            background-color: rgba(245, 158, 11, 0.12) !important;
          }
          .admin-theme-dark .text-amber-900 {
            color: #FBBF24 !important;
          }
          .admin-theme-dark .border-amber-100 {
            border-color: rgba(245, 158, 11, 0.25) !important;
          }
          .admin-theme-dark .bg-amber-100\\/60 {
            background-color: rgba(245, 158, 11, 0.2) !important;
          }
          .admin-theme-dark .text-amber-700 {
            color: #F59E0B !important;
          }

          /* Status Badges transparent color overrides for dark mode */
          .admin-theme-dark .bg-emerald-50 {
            background-color: rgba(16, 185, 129, 0.15) !important;
            color: #34D399 !important;
          }
          .admin-theme-dark .bg-rose-50 {
            background-color: rgba(239, 68, 68, 0.15) !important;
            color: #F87171 !important;
          }
          .admin-theme-dark .bg-purple-50 {
            background-color: rgba(139, 92, 246, 0.15) !important;
            color: #C084FC !important;
          }
          .admin-theme-dark .bg-blue-50 {
            background-color: rgba(59, 130, 246, 0.15) !important;
            color: #60A5FA !important;
          }
          .admin-theme-dark .bg-amber-50 {
            background-color: rgba(245, 158, 11, 0.15) !important;
            color: #FBBF24 !important;
          }

          /* Chart grid gridline adjustment in dark mode */
          .admin-theme-dark .recharts-cartesian-grid-horizontal line {
            stroke: rgba(255, 255, 255, 0.08) !important;
          }
        ` }} />
        
        {/* Top Header Bar */}
        <header className={`h-20 border-b flex items-center justify-between px-8 flex-shrink-0 relative z-10 transition-colors duration-300 ${
          themeMode === 'dark' 
            ? 'bg-[#12141D] border-white/5 text-white' 
            : 'bg-white border-gray-100 text-gray-900'
        }`}>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-[#C9A84C]" />
            <span className="text-[10px] font-mono font-bold uppercase text-[#C9A84C] tracking-widest bg-[#C9A84C]/15 border border-[#C9A84C]/25 px-2 py-0.5 rounded-full">
              {currentAdmin.role} Clearance Active
            </span>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Color & Theme Mode Customizer Control */}
            <div className={`flex items-center space-x-3 px-3 py-1.5 rounded-full border text-xs transition-colors duration-300 ${
              themeMode === 'dark' 
                ? 'bg-white/5 border-white/10' 
                : 'bg-gray-50 border-gray-100'
            }`}>
              {/* Circular Color Accent Picker Pills */}
              <div className={`flex items-center space-x-1.5 border-r pr-2.5 ${
                themeMode === 'dark' ? 'border-white/10' : 'border-gray-200'
              }`}>
                <button
                  type="button"
                  onClick={() => handleAccentChange('gold')}
                  className={`h-3.5 w-3.5 rounded-full bg-[#C9A84C] border transition-transform cursor-pointer ${
                    accentColor === 'gold' ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                  }`}
                  title="Luxury Gold Accent"
                />
                <button
                  type="button"
                  onClick={() => handleAccentChange('indigo')}
                  className={`h-3.5 w-3.5 rounded-full bg-[#6366F1] border transition-transform cursor-pointer ${
                    accentColor === 'indigo' ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                  }`}
                  title="Royal Indigo Accent"
                />
                <button
                  type="button"
                  onClick={() => handleAccentChange('crimson')}
                  className={`h-3.5 w-3.5 rounded-full bg-[#EF4444] border transition-transform cursor-pointer ${
                    accentColor === 'crimson' ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                  }`}
                  title="Deep Crimson Accent"
                />
                <button
                  type="button"
                  onClick={() => handleAccentChange('emerald')}
                  className={`h-3.5 w-3.5 rounded-full bg-[#10B981] border transition-transform cursor-pointer ${
                    accentColor === 'emerald' ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                  }`}
                  title="Emerald Green Accent"
                />
              </div>

              {/* Theme Mode Toggle Button */}
              <button
                type="button"
                onClick={toggleThemeMode}
                className={`p-0.5 rounded-full transition cursor-pointer ${
                  themeMode === 'dark' ? 'text-amber-400 hover:text-amber-300' : 'text-gray-500 hover:text-gray-900'
                }`}
                title={themeMode === 'dark' ? 'Switch to Cosmic Light' : 'Switch to Royal Charcoal'}
              >
                {themeMode === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Notification bell trigger dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 rounded-xl relative transition cursor-pointer ${
                  themeMode === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Bell className="h-5 w-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-[#C9A84C] text-white text-[8px] font-mono h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Real alert Notifications Popover dropdown */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute right-0 mt-2 w-80 shadow-2xl rounded-2xl overflow-hidden divide-y z-50 text-left border ${
                        themeMode === 'dark' 
                          ? 'bg-[#12141D] divide-white/5 border-white/10 text-white' 
                          : 'bg-white divide-gray-50 border-gray-100 text-gray-900'
                      }`}
                    >
                      <div className={`p-4 flex items-center justify-between ${themeMode === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <span className="text-xs font-bold">Notifications Log</span>
                        {unreadNotificationsCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-bold text-[#C9A84C] hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className={`divide-y max-h-64 overflow-y-auto ${themeMode === 'dark' ? 'divide-white/5' : 'divide-gray-50'}`}>
                        {notifications.map((not) => (
                          <div key={not.id} className={`p-4 flex items-start space-x-3 text-xs ${not.isRead ? 'opacity-60' : 'bg-amber-50/10'}`}>
                            {not.type === 'stock' ? (
                              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className={`font-semibold ${themeMode === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{not.text}</p>
                              <span className="text-[10px] text-gray-400 font-mono mt-1 block">{not.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile indicator */}
            <div className={`h-8 w-px ${themeMode === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`} />
            <div className="text-right hidden sm:block">
              <div className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentAdmin.name}</div>
              <div className="text-[10px] text-gray-400 font-medium font-mono">{currentAdmin.email}</div>
            </div>
          </div>
        </header>

        {/* Main Fluid Scrollable Content viewport area */}
        <main className={`flex-1 p-8 transition-colors duration-300 ${
          themeMode === 'dark' ? 'bg-[#0B0C10]' : 'bg-[#F8F9FC]'
        }`}>
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <AdminDashboard 
                orders={orders} 
                products={products} 
                onNavigate={onNavigate}
                onTabChange={(tab) => {
                  if (isTabAllowed(tab)) setActiveTab(tab);
                }}
              />
            )}
            {activeTab === 'orders' && (
              <AdminOrders
                orders={orders}
                setOrders={setOrders}
                products={products}
                setProducts={setProducts}
                currentAdmin={currentAdmin}
              />
            )}
            {activeTab === 'products' && (
              <AdminProducts
                products={products}
                setProducts={setProducts}
                currentAdmin={currentAdmin}
              />
            )}
            {activeTab === 'returns' && (
              <AdminReturns
                currentAdmin={currentAdmin}
                setProducts={setProducts}
              />
            )}
            {activeTab === 'customers' && (
              <AdminCustomers
                orders={orders}
                currentAdmin={currentAdmin}
              />
            )}
            {activeTab === 'coupons' && (
              <AdminCoupons
                coupons={coupons}
                setCoupons={setCoupons}
                currentAdmin={currentAdmin}
              />
            )}
            {activeTab === 'locations' && (
              <AdminLocations
                showrooms={showrooms}
                setShowrooms={setShowrooms}
                currentAdmin={currentAdmin}
              />
            )}
            {activeTab === 'faqs' && (
              <AdminFAQs
                currentAdmin={currentAdmin}
              />
            )}
            {activeTab === 'settings' && (
              <AdminSettings
                currentAdmin={currentAdmin}
                onUpdateCurrentAdmin={setCurrentAdmin}
              />
            )}
            {activeTab === 'logs' && (
              <AdminLogs />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
