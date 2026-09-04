/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Clock, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SHOWROOMS } from '../data';
import SEO from './SEO';
import { getBreadcrumbListSchema } from '../lib/seoSchemas';
import { sanitizeUGC, validateEmail, validateBDPhone, validateLength } from '../lib/sanitize';

interface ContactPageProps {
  onNavigate: (view: string, extra?: any) => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = sanitizeUGC(formData.name);
    const cleanEmail = sanitizeUGC(formData.email);
    const cleanPhone = sanitizeUGC(formData.phone);
    const cleanSubject = sanitizeUGC(formData.subject);
    const cleanMessage = sanitizeUGC(formData.message);

    // Client-side validation
    if (!validateLength(cleanName, 2, 80)) {
      setErrorMessage('Please provide your name (2-80 characters).');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (cleanPhone && !validateBDPhone(cleanPhone)) {
      setErrorMessage('Please provide a valid 11-digit phone number (e.g. 017XXXXXXXX).');
      return;
    }

    if (!validateLength(cleanMessage, 10, 2000)) {
      setErrorMessage('Your message must be between 10 and 2,000 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          subject: cleanSubject,
          message: cleanMessage
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setErrorMessage(data?.error || 'Unable to lodge inquiry. Please verify your details and try again.');
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });
    } catch {
      setErrorMessage('Unable to connect with the Atelier server. Please try again shortly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contact-page-root" className="w-full bg-[#FAF8F5] text-[#1F1B17] min-h-screen">
      <SEO
        title="Contact Atelier & Showrooms | VIRSA Luxury Menswear"
        description="Connect with VIRSA Atelier. Visit our flagship showrooms in Gulshan, Banani, and Dhanmondi, or reach out to our concierge for bespoke sizing and styling consultations."
        canonical="/contact"
        ogType="website"
        structuredData={getBreadcrumbListSchema([
          { name: 'Home', path: '/' },
          { name: 'Contact & Showrooms', path: '/contact' }
        ])}
      />
      {/* 1. HERO SECTION */}
      <section className="relative h-[32vh] w-full overflow-hidden bg-gradient-to-br from-[#FAF6ED] via-[#F5EFEB] to-[#ECE5D8] border-b border-[#E8DFC8] flex items-center justify-center">
        <div className="relative z-10 text-center max-w-3xl px-4 mt-4">
          <span className="text-xs font-sans tracking-[0.4em] text-[#8C6819] uppercase mb-2 block font-bold">
            ATELIER ASSISTANCE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#1F1B17] tracking-[0.08em] uppercase font-bold leading-tight mb-3">
            CONTACT US
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5248] font-sans tracking-wide leading-relaxed max-w-xl mx-auto">
            Reach out to our representatives for bespoke orders, styling consultations, or general assistance regarding your Virsa experience.
          </p>
        </div>
      </section>

      {/* 2. CONTACT CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* A. CONTACT INFRASTRUCTURE (5 COLS) */}
          <div className="lg:col-span-5 space-y-10 lg:pt-8">
            <div className="space-y-4">
              <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#8C6819] font-bold block">
                Heritage Support
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1F1B17] font-bold leading-tight">
                We are at your absolute service
              </h2>
              <p className="text-xs text-[#6E645A] font-sans leading-relaxed">
                Whether you need assistance with custom measurements, details about our luxury fabrics, or help track a celebration order, our concierge team is dedicated to providing an unparalleled experience.
              </p>
            </div>

            {/* Support Details */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-9 w-9 rounded-xl bg-white border border-[#E8DFC8] flex items-center justify-center shrink-0 shadow-2xs">
                  <Phone className="h-4 w-4 text-[#8C6819]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-serif tracking-wider uppercase text-[#6E645A] font-bold mb-0.5">Direct Helpline</h4>
                  <p className="text-xs font-mono text-[#1F1B17] font-bold">+880 9612-VIRSA (84772)</p>
                  <p className="text-[10px] text-[#6E645A] font-sans mt-0.5">Daily: 10:00 AM - 10:00 PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-9 w-9 rounded-xl bg-white border border-[#E8DFC8] flex items-center justify-center shrink-0 shadow-2xs">
                  <MessageSquare className="h-4 w-4 text-[#8C6819]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-serif tracking-wider uppercase text-[#6E645A] font-bold mb-0.5">WhatsApp VIP Concierge</h4>
                  <a
                    href="https://wa.me/8801700000000"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-[#8C6819] hover:underline flex items-center font-bold"
                  >
                    +880 1700-000000 (Chat Now)
                  </a>
                  <p className="text-[10px] text-[#6E645A] font-sans mt-0.5">Quick responses on styling and sizes</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-9 w-9 rounded-xl bg-white border border-[#E8DFC8] flex items-center justify-center shrink-0 shadow-2xs">
                  <Mail className="h-4 w-4 text-[#8C6819]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-serif tracking-wider uppercase text-[#6E645A] font-bold mb-0.5">Electronic Mail</h4>
                  <p className="text-xs font-sans text-[#1F1B17] font-medium">concierge@virsa-atelier.com</p>
                  <p className="text-[10px] text-[#6E645A] font-sans mt-0.5">For corporate and bespoke inquiries</p>
                </div>
              </div>
            </div>
          </div>

          {/* B. CONCIERGE MESSAGE FORM (7 COLS) */}
          <div className="lg:col-span-7 bg-white border border-[#E8DFC8] p-6 sm:p-10 rounded-2xl shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-6">
                <div className="h-16 w-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-[#1F1B17] font-bold">Message Successfully Lodged</h3>
                  <p className="text-xs text-[#6E645A] font-sans max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out to the Virsa Atelier. A dedicated concierge consultant will review your request and contact you within the next 12 to 24 hours.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] text-xs font-sans tracking-wider uppercase font-bold transition-all rounded-lg cursor-pointer shadow-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 border-b border-[#E8DFC8] pb-4">
                  <h3 className="font-serif text-lg text-[#1F1B17] font-bold">Send an Electronic Inquiry</h3>
                  <p className="text-[11px] text-[#6E645A] font-sans">Fill in the fields below and our atelier team will respond promptly.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-[10px] font-sans text-[#5C5248] tracking-wider uppercase font-bold">
                      Your Noble Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="e.g. Khan Bahadur"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E8DFC8] text-[#1F1B17] placeholder-[#9E948A] text-xs tracking-wider font-sans rounded-lg px-4 py-3 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-[10px] font-sans text-[#5C5248] tracking-wider uppercase font-bold">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="e.g. user@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E8DFC8] text-[#1F1B17] placeholder-[#9E948A] text-xs tracking-wider font-sans rounded-lg px-4 py-3 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="contact-phone" className="text-[10px] font-sans text-[#5C5248] tracking-wider uppercase font-bold">
                      Mobile Number (Optional)
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="e.g. +880 1700-000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E8DFC8] text-[#1F1B17] placeholder-[#9E948A] text-xs tracking-wider font-sans rounded-lg px-4 py-3 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="contact-subject" className="text-[10px] font-sans text-[#5C5248] tracking-wider uppercase font-bold">
                      Inquiry Subject
                    </label>
                    <div className="relative">
                      <select
                        id="contact-subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-[#FAF8F5] border border-[#E8DFC8] text-[#1F1B17] text-xs tracking-wider font-sans rounded-lg px-4 py-3 focus:outline-none focus:border-[#C5A059] cursor-pointer"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Bespoke/Custom Orders">Bespoke & Custom Sizing</option>
                        <option value="Styling Consultation">Virtual Styling Guidance</option>
                        <option value="Celebration Bulk Orders">Celebration / Bulk Inquiries</option>
                        <option value="Order Tracking Help">Order Tracking & Returns</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-[10px] font-sans text-[#5C5248] tracking-wider uppercase font-bold">
                    Your message to the Atelier *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="Provide detailed descriptions of your size requirements, fabric questions, or heritage inquiries..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E8DFC8] text-[#1F1B17] placeholder-[#9E948A] text-xs tracking-wider font-sans rounded-lg px-4 py-3 focus:outline-none focus:border-[#C5A059] resize-none"
                  />
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2 text-rose-600 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] font-bold text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center space-x-2 rounded-lg cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Transmit Concierge Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* 3. SHOWROOMS SECTION */}
        <div className="pt-12 border-t border-[#E8DFC8] space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#8C6819] font-bold block">
              Experience Our Collections In Store
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#1F1B17] font-bold tracking-wide">Our Flagship Showrooms</h3>
            <p className="text-xs text-[#6E645A] max-w-md mx-auto">
              Visit our physical ateliers to witness our legacy of craft, premium fabrics, and personalized services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SHOWROOMS.map((showroom) => (
              <div 
                key={showroom.id} 
                className="p-6 bg-white border border-[#E8DFC8] rounded-xl hover:border-[#C5A059] transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md"
              >
                <div>
                  {/* Circular Map Pin Marker */}
                  <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] border border-[#C5A059]/40 flex items-center justify-center mb-6">
                    <MapPin className="h-4 w-4 text-[#8C6819]" />
                  </div>

                  {/* Showroom Title */}
                  <h4 className="text-[#1F1B17] text-[17px] font-serif font-bold tracking-wide leading-snug mb-4 min-h-[50px] lg:min-h-[56px]">
                    {showroom.name}
                  </h4>

                  {/* Details Block */}
                  <div className="space-y-3 mb-6">
                    <p className="text-[11px] text-[#6E645A] font-sans leading-relaxed">
                      <span className="text-[#1F1B17] font-semibold">Address:</span> {showroom.address}
                    </p>
                    
                    <div className="flex items-center space-x-2 text-[11px] text-[#6E645A]">
                      <Phone className="h-3.5 w-3.5 text-[#8C6819] shrink-0" />
                      <span className="font-mono text-[#1F1B17] font-medium">{showroom.phone}</span>
                    </div>

                    <div className="flex items-start space-x-2 text-[11px] text-[#6E645A]">
                      <Clock className="h-3.5 w-3.5 text-[#8C6819] shrink-0 mt-0.5" />
                      <span className="text-[#5C5248] leading-relaxed">{showroom.hours}</span>
                    </div>
                  </div>
                </div>

                {/* GET DIRECTIONS Button */}
                <div className="pt-4 border-t border-[#E8DFC8] mt-auto">
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(showroom.name + " " + showroom.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 text-center border border-[#E8DFC8] hover:border-[#C5A059] hover:bg-[#FAF6ED] text-[#1F1B17] text-[10px] font-sans tracking-[0.2em] uppercase font-bold rounded-lg transition-all duration-300"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
