import React, { useState } from 'react';
import { X, Search, Truck, Scissors, FileText, CheckCircle, MapPin, Package, Calendar, Clock, DollarSign, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderItem, StatusHistoryEntry } from '../types';
import { INITIAL_ORDERS } from '../data';
import { sanitizeUGC } from '../lib/sanitize';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackOrderModal({ isOpen, onClose }: TrackOrderModalProps) {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = sanitizeUGC(orderIdInput.trim());
    if (!query) return;

    setLoading(true);

    // 1. Check server-side tracking API first
    try {
      const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(query)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.order) {
        setFoundOrder(data.order);
        setIsDemo(false);
        setSearched(true);
        setLoading(false);
        return;
      }
    } catch {
      // Continue to local storage check
    }

    // 2. Check local storage for real placed orders
    let allOrders: Order[] = [];
    try {
      const savedOrders = localStorage.getItem('virsa_orders');
      if (savedOrders) {
        allOrders = JSON.parse(savedOrders);
      } else {
        allOrders = INITIAL_ORDERS;
      }
    } catch {
      allOrders = INITIAL_ORDERS;
    }

    // Match exact ID or Order Number (case insensitive)
    const matched = allOrders.find(
      (o) =>
        o.id.toLowerCase() === query.toLowerCase() ||
        o.orderNumber.toLowerCase() === query.toLowerCase() ||
        o.orderNumber.toLowerCase().includes(query.toLowerCase())
    );

    if (matched) {
      setFoundOrder(matched);
      setIsDemo(false);
      setSearched(true);
    } else {
      // 3. Fallback to generating a simulated order for preview demonstration
      const simulatedOrder: Order = generateMockOrder(query);
      setFoundOrder(simulatedOrder);
      setIsDemo(true);
      setSearched(true);
    }
    setLoading(false);
  };

  // Helper to generate a realistic mock order on-the-fly for any search
  const generateMockOrder = (inputCode: string): Order => {
    const formattedId = inputCode.toUpperCase().startsWith('VRS-') 
      ? inputCode.toUpperCase() 
      : `VRS-20260711-${inputCode.replace(/[^0-9]/g, '') || '8249'}`;

    const states: Array<'pending' | 'processing' | 'shipped' | 'delivered'> = [
      'pending', 'processing', 'shipped', 'delivered'
    ];
    const statusIndex = (inputCode.length + 2) % 4;
    const orderStatus = states[statusIndex];

    const history: StatusHistoryEntry[] = [];
    
    history.push({
      status: 'pending',
      timestamp: '2026-07-10T09:30:00-07:00',
      note: 'Order placed securely via Credit Card. Secured by SSLCommerz.'
    });

    if (orderStatus === 'processing' || orderStatus === 'shipped' || orderStatus === 'delivered') {
      history.push({
        status: 'processing',
        timestamp: '2026-07-10T14:15:00-07:00',
        note: 'Garment fabric hand-picked & tailoring initiated by our master drapers at Dhanmondi Atelier.'
      });
    }

    if (orderStatus === 'shipped' || orderStatus === 'delivered') {
      history.push({
        status: 'shipped',
        timestamp: '2026-07-11T11:00:00-07:00',
        note: 'Garment finished inspection, sealed in protective cedar-infused packaging, and handed over to Pathao Express Hub.'
      });
    }

    if (orderStatus === 'delivered') {
      history.push({
        status: 'delivered',
        timestamp: '2026-07-11T15:45:00-07:00',
        note: 'Delivered successfully to the consignee. Thank you for choosing VIRSA.'
      });
    }

    const itemsList: OrderItem[] = [
      {
        productId: 'mock-p1',
        name: 'Zari Embroidered Premium Silk Panjabi',
        size: '42',
        color: 'Royal Navy',
        quantity: 1,
        price: 5890,
        image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop'
      }
    ];

    if (inputCode.length % 2 === 0) {
      itemsList.push({
        productId: 'mock-p2',
        name: 'Imperial Velvet Wedding Koti',
        size: 'L',
        color: 'Deep Burgundy',
        quantity: 1,
        price: 5490,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop'
      });
    }

    const subtotal = itemsList.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = subtotal > 5000 ? 0 : 120;
    const total = subtotal + shippingCost;

    return {
      id: `ord-sim-${inputCode}`,
      orderNumber: formattedId,
      customer: {
        name: 'Honored Patron',
        phone: '0171XXXXXXX',
        email: 'patron@virsa-luxury.com'
      },
      shippingAddress: {
        address: 'Bespoke Delivery Residence',
        area: 'Gulshan-2',
        city: 'Dhaka',
        postalCode: '1212'
      },
      items: itemsList,
      pricing: {
        subtotal,
        shippingCost,
        discount: 0,
        couponCode: null,
        total
      },
      shippingMethod: 'express_dhaka',
      paymentMethod: 'sslcommerz',
      paymentStatus: 'completed',
      orderStatus,
      statusHistory: history,
      notes: 'Please double-check cuff-button stitching before dispatch.',
      createdAt: '2026-07-10T09:30:00-07:00'
    };
  };

  const getStatusStepClass = (stepStatus: string, currentStatus: string) => {
    const statesOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIdx = statesOrder.indexOf(currentStatus);
    const stepIdx = statesOrder.indexOf(stepStatus);

    if (stepIdx < currentIdx) {
      return {
        line: 'bg-[#C5A059]',
        circle: 'bg-[#FAF6ED] text-[#8C6819] border-[#C5A059]',
        label: 'text-[#1F1B17] font-semibold',
        time: 'text-[#6E645A]'
      };
    } else if (stepIdx === currentIdx) {
      return {
        line: 'bg-[#E8DFC8]',
        circle: 'bg-white text-[#8C6819] border-[#C5A059] ring-4 ring-[#C5A059]/25 animate-pulse shadow-md',
        label: 'text-[#8C6819] font-bold',
        time: 'text-[#8C6819]'
      };
    } else {
      return {
        line: 'bg-[#E8DFC8]',
        circle: 'bg-[#FAF8F5] text-[#9E948A] border-[#E8DFC8]',
        label: 'text-[#6E645A] font-normal',
        time: 'text-[#9E948A]'
      };
    }
  };

  const getStatusHeaderBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'processing':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      default:
        return 'bg-rose-50 text-rose-800 border-rose-300';
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-[#E8DFC8] rounded-2xl shadow-2xl text-[#1F1B17] z-10 font-sans"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-5 border-b border-[#E8DFC8] flex items-center justify-between z-20">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#D4AF37] to-[#AA8232] rounded-full" />
                <div>
                  <h3 className="text-base font-serif tracking-widest text-[#8C6819] uppercase font-bold">Atelier Order Tracker</h3>
                  <p className="text-[10px] font-mono tracking-wider text-[#6E645A] uppercase">Virsa Couture Delivery Network</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#FAF8F5] text-[#6E645A] hover:text-[#1F1B17] transition-all duration-200 cursor-pointer border border-[#E8DFC8]"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main content body */}
            <div className="p-6 space-y-6">
              {/* Tracker search bar */}
              <form onSubmit={handleTrack} className="space-y-3 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-5 shadow-2xs">
                <label className="block text-xs font-serif tracking-wider uppercase text-[#5C5248] font-bold">
                  Enter Order Number or ID
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={orderIdInput}
                      onChange={(e) => setOrderIdInput(e.target.value)}
                      placeholder="e.g. VRS-20260708-1042"
                      className="w-full bg-white border border-[#E8DFC8] hover:border-[#C5A059] focus:border-[#C5A059] rounded-lg px-4 py-3 pl-10 text-xs font-mono tracking-wider text-[#1F1B17] focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all placeholder:text-[#9E948A]"
                    />
                    <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-[#6E645A] pointer-events-none" />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] font-bold text-xs tracking-widest uppercase px-6 py-3 rounded-lg transition-all duration-200 cursor-pointer shadow-sm whitespace-nowrap active:scale-[0.98]"
                  >
                    Track Shipment
                  </button>
                </div>
                {/* Suggestions */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 items-center pt-1 text-[10px] text-[#6E645A] font-mono">
                  <span>Available samples for lookup:</span>
                  <button
                    type="button"
                    onClick={() => setOrderIdInput('VRS-20260708-1042')}
                    className="text-[#8C6819] hover:underline font-bold cursor-pointer"
                  >
                    VRS-20260708-1042
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setOrderIdInput('VRS-20260707-1039')}
                    className="text-[#8C6819] hover:underline font-bold cursor-pointer"
                  >
                    VRS-20260707-1039
                  </button>
                </div>
              </form>

              {/* Search Results */}
              <AnimatePresence mode="wait">
                {searched && foundOrder && (
                  <motion.div
                    key={foundOrder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Demo/Simulation Banner */}
                    {isDemo && (
                      <div className="bg-[#FAF6ED] border border-[#C5A059]/40 rounded-lg px-4 py-2 text-center text-xs text-[#8C6819] font-sans tracking-wide">
                        ✨ Simulated Preview: Showing tracking timeline details for reference: <span className="font-mono text-[#1F1B17] font-bold">{orderIdInput}</span>
                      </div>
                    )}

                    {/* Order summary info bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-4 gap-4 shadow-2xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-serif text-[#6E645A] uppercase tracking-wide">Order reference:</span>
                          <span className="text-sm font-mono tracking-wider text-[#1F1B17] font-bold">{foundOrder.orderNumber}</span>
                        </div>
                        <p className="text-[11px] text-[#6E645A] font-mono mt-0.5">Placed: {formatTimestamp(foundOrder.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif text-[#6E645A] uppercase">Shipment Status:</span>
                        <span className={`text-[10px] font-bold tracking-widest uppercase border rounded-full px-3 py-1 ${getStatusHeaderBadge(foundOrder.orderStatus)}`}>
                          {foundOrder.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Timeline Progress tracker */}
                    <div className="bg-white border border-[#E8DFC8] rounded-xl p-6 shadow-2xs">
                      <h4 className="text-xs font-serif text-[#8C6819] tracking-[0.15em] uppercase mb-6 text-center font-bold">Delivery Milestone Timeline</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute left-0 right-0 top-5 h-[2px] bg-[#E8DFC8] -z-10">
                          <div 
                            className="h-full bg-[#C5A059] transition-all duration-500" 
                            style={{ 
                              width: foundOrder.orderStatus === 'pending' ? '0%' :
                                     foundOrder.orderStatus === 'processing' ? '33.33%' :
                                     foundOrder.orderStatus === 'shipped' ? '66.66%' : '100%' 
                            }}
                          />
                        </div>

                        {/* Milestone 1: Placed */}
                        {(() => {
                          const cls = getStatusStepClass('pending', foundOrder.orderStatus);
                          const entry = foundOrder.statusHistory.find(h => h.status === 'pending');
                          return (
                            <div className="flex md:flex-col items-center md:text-center space-x-4 md:space-x-0 relative z-10">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-xs transition-all duration-300 ${cls.circle}`}>
                                <FileText className="h-4.5 w-4.5" />
                              </div>
                              <div className="mt-0 md:mt-3 flex-grow">
                                <h5 className={`text-xs uppercase tracking-wider ${cls.label}`}>Order Placed</h5>
                                {entry && <p className="text-[10px] text-[#6E645A] font-mono mt-0.5">{formatTimestamp(entry.timestamp).split(',')[0]}</p>}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Milestone 2: Handcrafting / Processing */}
                        {(() => {
                          const cls = getStatusStepClass('processing', foundOrder.orderStatus);
                          const entry = foundOrder.statusHistory.find(h => h.status === 'processing');
                          return (
                            <div className="flex md:flex-col items-center md:text-center space-x-4 md:space-x-0 relative z-10">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-xs transition-all duration-300 ${cls.circle}`}>
                                <Scissors className="h-4.5 w-4.5" />
                              </div>
                              <div className="mt-0 md:mt-3 flex-grow">
                                <h5 className={`text-xs uppercase tracking-wider ${cls.label}`}>Atelier Tailoring</h5>
                                {entry ? (
                                  <p className="text-[10px] text-[#6E645A] font-mono mt-0.5">{formatTimestamp(entry.timestamp).split(',')[0]}</p>
                                ) : (
                                  <p className="text-[10px] text-[#9E948A] font-mono mt-0.5">Pending</p>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Milestone 3: Shipped */}
                        {(() => {
                          const cls = getStatusStepClass('shipped', foundOrder.orderStatus);
                          const entry = foundOrder.statusHistory.find(h => h.status === 'shipped');
                          return (
                            <div className="flex md:flex-col items-center md:text-center space-x-4 md:space-x-0 relative z-10">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-xs transition-all duration-300 ${cls.circle}`}>
                                <Truck className="h-4.5 w-4.5" />
                              </div>
                              <div className="mt-0 md:mt-3 flex-grow">
                                <h5 className={`text-xs uppercase tracking-wider ${cls.label}`}>Dispatched</h5>
                                {entry ? (
                                  <p className="text-[10px] text-[#6E645A] font-mono mt-0.5">{formatTimestamp(entry.timestamp).split(',')[0]}</p>
                                ) : (
                                  <p className="text-[10px] text-[#9E948A] font-mono mt-0.5">Pending</p>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Milestone 4: Delivered */}
                        {(() => {
                          const cls = getStatusStepClass('delivered', foundOrder.orderStatus);
                          const entry = foundOrder.statusHistory.find(h => h.status === 'delivered');
                          return (
                            <div className="flex md:flex-col items-center md:text-center space-x-4 md:space-x-0 relative z-10">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-xs transition-all duration-300 ${cls.circle}`}>
                                <CheckCircle className="h-4.5 w-4.5" />
                              </div>
                              <div className="mt-0 md:mt-3 flex-grow">
                                <h5 className={`text-xs uppercase tracking-wider ${cls.label}`}>Handed Over</h5>
                                {entry ? (
                                  <p className="text-[10px] text-[#6E645A] font-mono mt-0.5">{formatTimestamp(entry.timestamp).split(',')[0]}</p>
                                ) : (
                                  <p className="text-[10px] text-[#9E948A] font-mono mt-0.5">Pending</p>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Detailed Log Entries */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-serif text-[#6E645A] uppercase tracking-widest pl-1 flex items-center space-x-2 font-bold">
                        <Clock className="h-4 w-4 text-[#8C6819]" />
                        <span>Tracking Event Registry Logs</span>
                      </h4>
                      <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl divide-y divide-[#E8DFC8]">
                        {foundOrder.statusHistory.map((log, index) => (
                          <div key={index} className="p-4 flex gap-4 text-xs font-sans">
                            <span className="text-[#8C6819] font-mono whitespace-nowrap pt-0.5 font-semibold">{formatTimestamp(log.timestamp).split(',')[1]?.trim()}</span>
                            <div className="space-y-1">
                              <span className="text-[#1F1B17] font-semibold uppercase tracking-wider text-[11px] font-serif">
                                {log.status}
                              </span>
                              <p className="text-[#5C5248] leading-relaxed text-[12px]">{log.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Items & Shipping Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Shipping info */}
                      <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-5 space-y-3 shadow-2xs">
                        <h4 className="text-xs font-serif text-[#8C6819] uppercase tracking-widest flex items-center gap-2 font-bold">
                          <MapPin className="h-4 w-4" />
                          <span>Delivery Consignee</span>
                        </h4>
                        <div className="space-y-1.5 font-sans text-xs text-[#5C5248]">
                          <p className="text-[#1F1B17] font-bold text-sm">{foundOrder.customer.name}</p>
                          <p>{foundOrder.shippingAddress.address}</p>
                          <p>{foundOrder.shippingAddress.area}, {foundOrder.shippingAddress.city}</p>
                          {foundOrder.shippingAddress.postalCode && <p>Postal Code: {foundOrder.shippingAddress.postalCode}</p>}
                          <p className="font-mono text-[#6E645A] pt-1 font-medium">Tel: {foundOrder.customer.phone}</p>
                        </div>
                      </div>

                      {/* Financial summary */}
                      <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-5 space-y-3 shadow-2xs">
                        <h4 className="text-xs font-serif text-[#8C6819] uppercase tracking-widest flex items-center gap-2 font-bold">
                          <DollarSign className="h-4 w-4" />
                          <span>Financial Ledger</span>
                        </h4>
                        <div className="space-y-2 font-mono text-xs">
                          <div className="flex justify-between text-[#6E645A]">
                            <span>Bespoke Subtotal:</span>
                            <span className="font-semibold text-[#1F1B17]">৳{foundOrder.pricing.subtotal.toLocaleString()}</span>
                          </div>
                          {foundOrder.pricing.discount > 0 && (
                            <div className="flex justify-between text-rose-600">
                              <span>Promo Privilege Discount:</span>
                              <span className="font-semibold">-৳{foundOrder.pricing.discount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-[#6E645A]">
                            <span>Premium Courier Transit:</span>
                            <span className="font-semibold text-[#1F1B17]">{foundOrder.pricing.shippingCost === 0 ? 'Complimentary' : `৳${foundOrder.pricing.shippingCost}`}</span>
                          </div>
                          <div className="border-t border-[#E8DFC8] pt-2 flex justify-between text-[#1F1B17] font-bold">
                            <span>Grand Total:</span>
                            <span className="text-[#8C6819] font-extrabold text-sm">৳{foundOrder.pricing.total.toLocaleString()}</span>
                          </div>
                          <div className="text-[10px] text-[#6E645A] pt-1 flex justify-between items-center font-sans">
                            <span>Acquisition Channel:</span>
                            <span className="uppercase text-[#1F1B17] tracking-wider font-semibold">{foundOrder.paymentMethod} ({foundOrder.paymentStatus})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Garments in package */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-serif text-[#6E645A] uppercase tracking-widest pl-1 flex items-center gap-2 font-bold">
                        <Package className="h-4 w-4 text-[#8C6819]" />
                        <span>Enclosed Atelier Garments ({foundOrder.items.length})</span>
                      </h4>
                      <div className="space-y-3">
                        {foundOrder.items.map((item, index) => (
                          <div key={index} className="flex bg-white border border-[#E8DFC8] rounded-xl p-3 gap-4 items-center shadow-2xs">
                            <img
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-14 h-16 object-cover rounded-lg bg-[#FAF8F5] border border-[#E8DFC8]"
                            />
                            <div className="flex-grow min-w-0">
                              <h5 className="text-xs font-serif text-[#1F1B17] font-semibold truncate">{item.name}</h5>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#6E645A] font-mono mt-1">
                                <span>Size: <strong className="text-[#1F1B17]">{item.size}</strong></span>
                                <span>•</span>
                                <span>Color: <strong className="text-[#1F1B17]">{item.color}</strong></span>
                                <span>•</span>
                                <span>Qty: <strong className="text-[#1F1B17]">{item.quantity}</strong></span>
                              </div>
                            </div>
                            <div className="text-right font-mono text-xs font-bold text-[#8C6819]">
                              ৳{item.price.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Footer */}
            <div className="border-t border-[#E8DFC8] bg-[#FAF8F5] px-6 py-4 text-center text-[10px] tracking-widest text-[#6E645A] uppercase font-mono">
              VIRSA LUXURY TRADITIONAL ATELIER COUTURE SHIPMENTS
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
