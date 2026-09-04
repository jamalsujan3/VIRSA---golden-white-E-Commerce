/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, RotateCcw, Clock, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import Logo from './Logo';

interface FooterProps {
  onNavigate: (view: string, extra?: any) => void;
  onOpenTrackOrder?: () => void;
}

export default function Footer({ onNavigate, onOpenTrackOrder }: FooterProps) {
  return (
    <footer id="virsa-atelier-footer" className="bg-[#FAF6ED] border-t border-[#E8DFC8] text-[#1F1B17] relative z-10 pt-16 pb-24 md:pb-16 text-left">
      {/* 1. Atelier Trust Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-[#E8DFC8]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Trust 1 */}
          <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-white border border-[#E8DFC8] shadow-[0_4px_16px_rgba(197,160,89,0.06)]">
            <ShieldCheck className="h-6 w-6 text-[#8C6819] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif text-sm font-bold text-[#1F1B17] tracking-wide uppercase">
                100% Authentic Handloom
              </h4>
              <p className="text-xs text-[#6E645A] mt-0.5 leading-relaxed font-sans">
                Woven from pure Egyptian cotton, Mulberry silks, and genuine Zari needlework.
              </p>
            </div>
          </div>

          {/* Trust 2 */}
          <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-white border border-[#E8DFC8] shadow-[0_4px_16px_rgba(197,160,89,0.06)]">
            <RotateCcw className="h-6 w-6 text-[#8C6819] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif text-sm font-bold text-[#1F1B17] tracking-wide uppercase">
                7-Day Atelier Exchanges
              </h4>
              <p className="text-xs text-[#6E645A] mt-0.5 leading-relaxed font-sans">
                Hassle-free size and cut replacement with complimentary showroom tailoring.
              </p>
            </div>
          </div>

          {/* Trust 3 */}
          <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-white border border-[#E8DFC8] shadow-[0_4px_16px_rgba(197,160,89,0.06)]">
            <Clock className="h-6 w-6 text-[#8C6819] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif text-sm font-bold text-[#1F1B17] tracking-wide uppercase">
                24-48h Express Dispatch
              </h4>
              <p className="text-xs text-[#6E645A] mt-0.5 leading-relaxed font-sans">
                Fast nationwide courier tracking across all 64 districts in Bangladesh.
              </p>
            </div>
          </div>

          {/* Trust 4 */}
          <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-white border border-[#E8DFC8] shadow-[0_4px_16px_rgba(197,160,89,0.06)]">
            <Lock className="h-6 w-6 text-[#8C6819] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif text-sm font-bold text-[#1F1B17] tracking-wide uppercase">
                256-Bit SSL Protected
              </h4>
              <p className="text-xs text-[#6E645A] mt-0.5 leading-relaxed font-sans">
                Bank-grade encryption for card transactions, bKash, Nagad, and Cash on Delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation & Contact Matrix */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
        
        {/* Col 1: Brand & Contact Info (Spans 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Logo className="h-10 w-auto" />
          <p className="font-sans text-xs text-[#5C5248] leading-relaxed max-w-sm">
            VIRSA is a Dhaka-based haute couture atelier pioneering regal South Asian menswear, blending ancient heritage craftsmanship with contemporary bespoke silhouettes.
          </p>

          <div className="space-y-3 font-sans text-xs text-[#332D27]">
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-[#8C6819] shrink-0" />
              <span>Gulshan 2 Avenue, Road 45, Dhaka 1212</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-[#8C6819] shrink-0" />
              <a href="tel:+8801700000000" className="hover:text-[#8C6819] transition-colors font-medium">
                +880 1700-000000 (10 AM - 9 PM)
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-[#8C6819] shrink-0" />
              <a href="mailto:concierge@virsa.atelier" className="hover:text-[#8C6819] transition-colors font-medium">
                concierge@virsa.atelier
              </a>
            </div>
          </div>
        </div>

        {/* Col 2: Heritage Collections (Spans 3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="text-xs font-serif font-bold tracking-[0.2em] text-[#8C6819] uppercase border-b border-[#E8DFC8] pb-2">
            Haute Collections
          </h4>
          <ul className="space-y-2.5 font-sans text-xs text-[#5C5248]">
            {[
              { name: 'Royal Panjabis', cat: 'panjabi' },
              { name: 'Imperial Kabli Suits', cat: 'kabli' },
              { name: 'Velvet & Brocade Kotis', cat: 'koti' },
              { name: 'Wedding Sherwanis', cat: 'sherwani' },
              { name: 'Islamic Jubbahs', cat: 'jubbah' },
              { name: 'Fine Cotton Pajamas', cat: 'pajama' },
              { name: 'Junior Royal Kids', cat: 'kids' },
            ].map((item) => (
              <li key={item.cat}>
                <button
                  type="button"
                  onClick={() => onNavigate('category', { category: item.cat })}
                  className="hover:text-[#8C6819] transition-colors text-left cursor-pointer min-h-[32px] flex items-center font-medium"
                >
                  — {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Customer Care & Policies (Spans 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-serif font-bold tracking-[0.2em] text-[#8C6819] uppercase border-b border-[#E8DFC8] pb-2">
            Client Concierge
          </h4>
          <ul className="space-y-2.5 font-sans text-xs text-[#5C5248]">
            {onOpenTrackOrder && (
              <li>
                <button
                  type="button"
                  onClick={onOpenTrackOrder}
                  className="text-[#8C6819] hover:text-[#1F1B17] transition-colors text-left cursor-pointer font-bold min-h-[32px] flex items-center"
                >
                  Track Order Status
                </button>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="hover:text-[#8C6819] transition-colors text-left cursor-pointer min-h-[32px] flex items-center font-medium"
              >
                Atelier Showrooms
              </button>
            </li>
            <li>
              <span className="text-[#332D27] block">7-Day Return Guarantee</span>
            </li>
            <li>
              <span className="text-[#332D27] block">Bespoke Size Guidance</span>
            </li>
            <li>
              <span className="text-[#332D27] block">Worldwide Luxury Courier</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Verified Payment Badges (Spans 3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="text-xs font-serif font-bold tracking-[0.2em] text-[#8C6819] uppercase border-b border-[#E8DFC8] pb-2">
            Accepted Payments
          </h4>
          <p className="text-xs font-sans text-[#5C5248] leading-relaxed">
            Encrypted transactions powered by SSLCOMMERZ gateway, authorized MFS wallets, and Cash on Delivery.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2">
            {['bKash', 'Nagad', 'Rocket', 'Visa', 'Mastercard', 'Cash on Delivery'].map((m) => (
              <div
                key={m}
                className="px-2 py-1.5 bg-white border border-[#E8DFC8] shadow-2xs rounded text-[10px] font-sans font-semibold text-[#332D27] text-center tracking-wider"
              >
                {m}
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-emerald-700 flex items-center gap-1.5 font-sans font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>Bangladesh Bank Compliant</span>
          </div>
        </div>

      </div>

      {/* 3. Bottom Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 pt-6 border-t border-[#E8DFC8] flex flex-col sm:flex-row items-center justify-between text-[#6E645A] text-xs gap-3">
        <p className="tracking-wider uppercase text-[11px]">
          © {new Date().getFullYear()} VIRSA HAUTE COUTURE. ALL RIGHTS RESERVED.
        </p>
        <div className="flex items-center space-x-4 text-[11px] tracking-wider uppercase font-medium">
          <span>Dhaka • Chittagong • Sylhet</span>
        </div>
      </div>
    </footer>
  );
}
