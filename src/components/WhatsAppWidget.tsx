/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CONCIERGE_NUMBER = '8801700000000'; // Standard Bangladesh placeholder for the concierge

interface InquiryOption {
  id: string;
  label: string;
  message: string;
}

const INQUIRY_OPTIONS: InquiryOption[] = [
  {
    id: 'sizing',
    label: 'Bespoke Size & Fit Help',
    message: 'Hello Virsa Atelier, I am looking for assistance with choosing the perfect custom size for my order.'
  },
  {
    id: 'custom_order',
    label: 'Custom Tailoring Request',
    message: 'Hello Virsa Atelier, I would like to inquire about custom fabrics and specialized embroidery designs.'
  },
  {
    id: 'order_status',
    label: 'Check My Order Status',
    message: 'Hello Virsa Atelier, I would like to get an update on my current order shipment.'
  },
  {
    id: 'general',
    label: 'General Concierge Inquiry',
    message: 'Hello Virsa Atelier, I would like to connect with a personal shopping assistant.'
  }
];

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('sizing');
  const [customText, setCustomText] = useState<string>('');

  // Find current message content based on selection
  const currentOption = INQUIRY_OPTIONS.find(opt => opt.id === selectedOption);
  const baseMessage = currentOption ? currentOption.message : INQUIRY_OPTIONS[0].message;
  const messageToSend = customText.trim() ? customText : baseMessage;

  const handleLaunchWhatsApp = () => {
    const encodedMessage = encodeURIComponent(messageToSend);
    const whatsappUrl = `https://wa.me/${CONCIERGE_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="whatsapp-widget-root" className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mb-4 w-80 sm:w-96 bg-white border border-[#E8DFC8] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#1F1B17]"
          >
            {/* Widget Header */}
            <div className="bg-[#FAF6ED] px-5 py-4 border-b border-[#E8DFC8] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-white border border-[#C5A059]/40 flex items-center justify-center shadow-2xs">
                    <MessageCircle className="h-5 w-5 text-[#8C6819]" />
                  </div>
                  {/* Pulsing online status indicator */}
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold tracking-wider text-[#1F1B17] uppercase flex items-center gap-1.5">
                    VIRSA CONCIERGE
                    <Sparkles className="h-3.5 w-3.5 text-[#8C6819]" />
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-semibold tracking-wider uppercase">
                    Active Atelier Support
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#6E645A] hover:text-[#1F1B17] rounded-full hover:bg-white transition-all cursor-pointer border border-[#E8DFC8]"
                aria-label="Close Concierge Panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Widget Body */}
            <div className="p-5 space-y-4 max-h-[350px] overflow-y-auto bg-white">
              <p className="text-xs text-[#5C5248] leading-relaxed">
                Welcome to Virsa Atelier's bespoke chat service. Select an option below to initiate a chat directly with our master drapers:
              </p>

              {/* Sizing Pre-filled Options */}
              <div className="space-y-2">
                <span className="text-[10px] font-sans font-bold tracking-widest text-[#6E645A] uppercase block mb-1">
                  How can we assist you?
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {INQUIRY_OPTIONS.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSelectedOption(opt.id);
                          setCustomText('');
                        }}
                        className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#FAF6ED] border-[#C5A059] text-[#8C6819] font-bold shadow-2xs'
                            : 'bg-[#FAF8F5] border-[#E8DFC8] text-[#5C5248] hover:border-[#C5A059] hover:text-[#1F1B17]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-[#C5A059]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Free-form Input Area */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-sans font-bold tracking-widest text-[#6E645A] uppercase block">
                  Or write a custom message
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={baseMessage}
                  className="w-full bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl px-3 py-2 text-xs text-[#1F1B17] placeholder-[#9E948A] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] h-16 resize-none font-sans"
                />
              </div>
            </div>

            {/* Widget Footer */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#E8DFC8]">
              <button
                onClick={handleLaunchWhatsApp}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-sans font-bold text-xs tracking-widest uppercase rounded-xl hover:brightness-110 transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Start WhatsApp Chat</span>
              </button>
              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-[#6E645A] font-sans tracking-wide mt-2.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#8C6819]" />
                <span>Official Atelier Direct Support</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing Toggle Floating Button */}
      <motion.button
        id="whatsapp-chat-toggle"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center relative cursor-pointer border ${
          isOpen
            ? 'bg-[#1F1B17] text-white border-[#1F1B17]'
            : 'bg-white border-[#C5A059] text-[#8C6819] hover:bg-[#FAF6ED] shadow-md'
        }`}
        title="Chat with Concierge"
        aria-label="Toggle WhatsApp Concierge Widget"
      >
        <MessageCircle className="h-6 w-6" />
        
        {/* Unread notification ping dot */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#C5A059]" />
          </span>
        )}
      </motion.button>
    </div>
  );
}
