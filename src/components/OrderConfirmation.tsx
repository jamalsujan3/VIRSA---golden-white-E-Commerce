import React, { useState } from 'react';
import { CheckCircle, Package, ArrowRight, Printer, Share2, Copy, Check, Clock, MapPin, Truck, Sparkles, Receipt } from 'lucide-react';
import { motion } from 'motion/react';
import { Order } from '../types';
import ThermalInvoice from './ThermalInvoice';
import InvoiceModal from './InvoiceModal';

interface OrderConfirmationProps {
  order: Order;
  onNavigate: (view: string, extra?: any) => void;
}

export default function OrderConfirmation({ order, onNavigate }: OrderConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const [showThermalInvoice, setShowThermalInvoice] = useState(false);
  const [showLuxuryInvoice, setShowLuxuryInvoice] = useState(false);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="order-confirmation-root" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-[#1F1B17]">
      {/* 1. SUCCESS HERO NOTIFICATION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 mb-12"
      >
        <div className="inline-flex p-4 rounded-full bg-[#FAF6ED] border border-[#C5A059]/40 text-[#8C6819] mb-2 shadow-sm">
          <CheckCircle className="h-12 w-12 text-[#8C6819]" />
        </div>
        <span className="text-xs font-sans tracking-[0.3em] text-[#8C6819] uppercase font-bold block">
          Order Confirmed & Received
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#1F1B17] tracking-wider uppercase font-bold">
          Thank You, {order.customer.name.split(' ')[0]}
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5248] font-sans max-w-lg mx-auto leading-relaxed">
          Your order has been recorded into the atelier registry. Our master drapers are preparing your garments.
        </p>
      </motion.div>

      {/* 2. ORDER NUMBER & QUICK ACTIONS BADGE */}
      <div className="bg-white border border-[#E8DFC8] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E8DFC8] pb-6">
          <div>
            <span className="text-[10px] font-sans tracking-widest text-[#6E645A] uppercase block">
              Permanent Tracking Reference
            </span>
            <div className="flex items-center space-x-3 mt-1">
              <span className="font-mono text-xl sm:text-2xl text-[#1F1B17] font-bold">
                {order.orderNumber}
              </span>
              <button
                onClick={handleCopyOrderNumber}
                className="p-1.5 rounded-md hover:bg-[#FAF8F5] border border-[#E8DFC8] text-[#6E645A] hover:text-[#1F1B17] transition-all cursor-pointer"
                title="Copy Order Reference"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowLuxuryInvoice(true)}
              className="px-4 py-2.5 bg-[#FAF6ED] hover:bg-[#FAF8F5] border border-[#C5A059]/40 text-[#8C6819] text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Receipt className="h-4 w-4 text-[#8C6819]" />
              <span>Full Luxury Invoice</span>
            </button>
            <button
              onClick={() => setShowThermalInvoice(true)}
              className="px-4 py-2.5 bg-white hover:bg-[#FAF8F5] border border-[#E8DFC8] text-[#1F1B17] text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="h-4 w-4 text-[#8C6819]" />
              <span>Print 4x6" Label</span>
            </button>
          </div>
        </div>

        {/* 3. ORDER TIMELINE & DISPATCH DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-[#8C6819] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[10px] font-sans font-bold tracking-widest text-[#6E645A] uppercase">
                Estimated Delivery
              </h4>
              <p className="text-xs text-[#1F1B17] font-semibold mt-0.5">
                {order.shippingMethod === 'express_dhaka' ? '24 - 48 Hours (Express)' : '2 - 4 Business Days'}
              </p>
              <p className="text-[10px] text-[#6E645A] mt-0.5">Hand-inspected before transit</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-[#8C6819] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[10px] font-sans font-bold tracking-widest text-[#6E645A] uppercase">
                Delivery Address
              </h4>
              <p className="text-xs text-[#1F1B17] font-semibold mt-0.5 truncate max-w-[200px]">
                {order.shippingAddress.address}
              </p>
              <p className="text-[10px] text-[#6E645A] mt-0.5">
                {order.shippingAddress.area}, {order.shippingAddress.city}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Truck className="h-5 w-5 text-[#8C6819] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[10px] font-sans font-bold tracking-widest text-[#6E645A] uppercase">
                Payment Channel
              </h4>
              <p className="text-xs text-[#1F1B17] font-semibold mt-0.5 uppercase">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
              </p>
              <p className="text-[10px] text-emerald-600 font-mono mt-0.5">
                Status: {order.paymentStatus.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ITEM SUMMARY LIST */}
      <div className="bg-white border border-[#E8DFC8] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
        <h3 className="font-serif text-lg text-[#1F1B17] font-bold tracking-wide uppercase mb-6 flex items-center gap-2">
          <Package className="h-5 w-5 text-[#8C6819]" />
          <span>Garments Ordered ({order.items.length})</span>
        </h3>

        <div className="divide-y divide-[#E8DFC8]">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-20 object-cover rounded-xl bg-[#FAF8F5] border border-[#E8DFC8]"
                />
                <div>
                  <h4 className="font-serif text-sm text-[#1F1B17] font-semibold">{item.name}</h4>
                  <div className="flex items-center space-x-3 text-xs text-[#6E645A] font-sans mt-1">
                    <span>Size: <strong className="text-[#1F1B17]">{item.size}</strong></span>
                    <span>•</span>
                    <span>Qty: <strong className="text-[#1F1B17]">{item.quantity}</strong></span>
                  </div>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-[#8C6819]">
                ৳{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Subtotals */}
        <div className="border-t border-[#E8DFC8] pt-6 mt-4 space-y-2 text-xs font-sans">
          <div className="flex justify-between text-[#6E645A]">
            <span>Subtotal</span>
            <span className="font-mono font-medium text-[#1F1B17]">৳{order.pricing.subtotal.toLocaleString()}</span>
          </div>
          {order.pricing.discount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Promotion Applied ({order.pricing.couponCode})</span>
              <span className="font-mono font-medium">-৳{order.pricing.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-[#6E645A]">
            <span>Delivery Transit</span>
            <span className="font-mono font-medium text-[#1F1B17]">
              {order.pricing.shippingCost === 0 ? 'Complimentary' : `৳${order.pricing.shippingCost.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-sm sm:text-base font-bold text-[#1F1B17] pt-2 border-t border-[#E8DFC8]">
            <span>Grand Total Due</span>
            <span className="font-mono text-[#8C6819] text-base sm:text-lg font-bold">
              ৳{order.pricing.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 5. RETURN TO SHOPPING BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => onNavigate('category', { category: 'all' })}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] text-xs font-sans font-bold tracking-[0.2em] uppercase rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Continue Exploring Collections</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* 6. MODALS FOR PRINTABLE INVOICES */}
      {showThermalInvoice && (
        <ThermalInvoice
          order={order}
          onClose={() => setShowThermalInvoice(false)}
        />
      )}

      {showLuxuryInvoice && (
        <InvoiceModal
          isOpen={showLuxuryInvoice}
          order={order}
          onClose={() => setShowLuxuryInvoice(false)}
        />
      )}
    </div>
  );
}
