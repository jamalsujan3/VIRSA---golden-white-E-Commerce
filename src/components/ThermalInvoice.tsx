import React, { useEffect } from 'react';
import { Printer, X, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface ThermalInvoiceProps {
  order: Order;
  onClose: () => void;
  autoPrint?: boolean;
}

// Convert numbers to text words dynamically (Taka Style)
export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanOneThousand = (n: number): string => {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        str += ones[n];
      } else {
        str += tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      }
    }
    return str.trim();
  };

  let temp = num;
  let words = '';

  const crore = Math.floor(temp / 10000000);
  temp %= 10000000;
  if (crore > 0) {
    words += convertLessThanOneThousand(crore) + ' Crore ';
  }

  const lakh = Math.floor(temp / 100000);
  temp %= 100000;
  if (lakh > 0) {
    words += convertLessThanOneThousand(lakh) + ' Lakh ';
  }

  const thousand = Math.floor(temp / 1000);
  temp %= 1000;
  if (thousand > 0) {
    words += convertLessThanOneThousand(thousand) + ' Thousand ';
  }

  if (temp > 0) {
    words += convertLessThanOneThousand(temp);
  }

  return words.trim() + ' Taka Only';
}

export default function ThermalInvoice({ order, onClose, autoPrint = false }: ThermalInvoiceProps) {
  useEffect(() => {
    const linkId = 'thermal-fonts-link';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Libre+Barcode+39&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  const barcodeValue = `*${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '')}*`;
  
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const trackingUrl = `https://virsa.com.bd/track?id=${order.orderNumber}`;
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(trackingUrl)}&color=000000`;

  return (
    <div className="fixed inset-0 bg-[#1F1B17]/70 z-[100] flex flex-col items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      
      {/* Action panel at the top - hidden during printing */}
      <div className="flex items-center justify-between w-full max-w-[4.2in] bg-white border border-[#E8DFC8] p-3 rounded-t-xl text-[#1F1B17] print:hidden shadow-lg">
        <div className="flex items-center space-x-2">
          <Printer className="h-4 w-4 text-[#8C6819]" />
          <span className="text-xs font-sans font-bold tracking-widest uppercase text-[#8C6819]">Print Thermal Invoice (4x6")</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] text-[10px] font-sans font-bold uppercase tracking-wider rounded-lg transition cursor-pointer shadow-sm"
          >
            Print Label
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#FAF8F5] text-[#6E645A] hover:text-[#1F1B17] rounded-lg transition cursor-pointer border border-[#E8DFC8]"
            aria-label="Close Preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Printable Area */}
      <div 
        id="thermal-printable-invoice"
        className="bg-[#FAF9F5] text-black p-[8px] border border-black/20 shadow-2xl relative select-text"
        style={{
          width: '4in',
          height: '6in',
          minWidth: '4in',
          minHeight: '6in',
          maxWidth: '4in',
          maxHeight: '6in',
          fontFamily: '"Roboto", "Inter", sans-serif',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            body * {
              visibility: hidden;
              background-color: transparent !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #thermal-printable-invoice, #thermal-printable-invoice * {
              visibility: visible;
              background-color: #ffffff !important;
              color: #000000 !important;
              border-color: #000000 !important;
              box-shadow: none !important;
              text-shadow: none !important;
              filter: none !important;
            }
            #thermal-printable-invoice {
              position: fixed;
              left: 0;
              top: 0;
              width: 4in !important;
              height: 6in !important;
              padding: 6px !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
              box-sizing: border-box !important;
              page-break-inside: avoid !important;
            }
            #thermal-printable-invoice img, 
            #thermal-printable-invoice canvas {
              image-rendering: -webkit-optimize-contrast !important;
              image-rendering: crisp-edges !important;
              image-rendering: pixelated !important;
              -ms-interpolation-mode: nearest-neighbor !important;
            }
            .text-gray-500, .text-gray-600, .text-gray-400 {
              color: #000000 !important;
              font-weight: 500 !important;
            }
            .border-gray-100, .border-gray-200, .border-gray-300 {
              border-color: #000000 !important;
              border-width: 1px !important;
            }
            @page {
              size: 4in 6in;
              margin: 0;
            }
          }
        `}} />

        <div className="h-full border border-black p-[6px] flex flex-col justify-between box-border">
          {/* Header section with brand and details */}
          <div className="text-center">
            <div className="font-serif text-lg font-black tracking-[0.2em] leading-tight uppercase text-black">
              VIRSA
            </div>
            <div className="text-[7px] tracking-widest uppercase font-sans text-gray-600">
              Traditional Craft & Luxury
            </div>
            <p className="my-0 text-[8px] leading-tight text-black font-sans">
              FS Square, Level - 5, Shop- 521, Mirpur-10
            </p>
            <p className="m-0 text-[8px] leading-tight text-black font-sans">
              Mobile: 01712-345678, 01515-217936
            </p>
          </div>

          {/* Barcode representation */}
          <div className="text-center my-0.5">
            <span 
              className="block leading-none tracking-normal" 
              style={{ 
                fontFamily: '"Libre Barcode 39", "Courier New", monospace', 
                fontSize: '32px' 
              }}
            >
              {barcodeValue}
            </span>
            <span className="block text-[8px] font-mono font-bold tracking-widest text-black -mt-1 uppercase">
              {order.orderNumber}
            </span>
          </div>

          {/* Info grid */}
          <div className="text-[8px] leading-tight space-y-0.5 border-t border-b border-black py-1">
            <div className="flex justify-between">
              <span><strong>DATE:</strong> {formattedDate}</span>
              <span><strong>METHOD:</strong> {order.paymentMethod.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="truncate max-w-[150px]"><strong>NAME:</strong> {order.customer.name}</span>
              <span><strong>PHONE:</strong> {order.customer.phone}</span>
            </div>
            <div className="truncate">
              <strong>ADDR:</strong> {order.shippingAddress.address}, {order.shippingAddress.area}, {order.shippingAddress.city}
            </div>
          </div>

          {/* Item Table representation */}
          <div className="flex-1 my-1 overflow-hidden flex flex-col">
            <table className="w-full text-[8px] border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="border-b border-black text-[7px] uppercase font-bold text-center">
                  <th style={{ width: '8%', padding: '1px' }}>SL</th>
                  <th style={{ width: '56%', padding: '1px', textAlign: 'left' }}>Item Description</th>
                  <th style={{ width: '10%', padding: '1px' }}>Qty</th>
                  <th style={{ width: '11%', padding: '1px', textAlign: 'right' }}>Price</th>
                  <th style={{ width: '15%', padding: '1px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="text-center font-sans border-b border-dashed border-gray-300">
                    <td style={{ padding: '2px 1px' }}>{index + 1}</td>
                    <td style={{ padding: '2px 1px', textAlign: 'left' }} className="truncate">
                      {item.name} ({item.size})
                    </td>
                    <td style={{ padding: '2px 1px' }}>{item.quantity}</td>
                    <td style={{ padding: '2px 1px', textAlign: 'right' }}>{item.price}/-</td>
                    <td style={{ padding: '2px 1px', textAlign: 'right' }}>{item.price * item.quantity}/-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & QR code Row */}
          <div className="flex justify-between items-end border-t border-black pt-1">
            <div className="flex flex-col items-center justify-center">
              <img 
                src={qrCodeSrc} 
                alt="Scan Tracking URL" 
                className="w-14 h-14 border border-black/10 p-0.5 rounded-xs"
                referrerPolicy="no-referrer"
              />
              <span className="text-[6px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">Scan to Track</span>
            </div>

            <div className="w-[140px]">
              <table className="w-full text-[8px] leading-tight">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="text-left font-medium text-gray-600">Subtotal:</td>
                    <td className="text-right font-semibold">{order.pricing.subtotal}/-</td>
                  </tr>
                  {order.pricing.discount > 0 && (
                    <tr className="border-b border-gray-200">
                      <td className="text-left font-medium text-gray-600">Discount:</td>
                      <td className="text-right font-semibold text-rose-600">-{order.pricing.discount}/-</td>
                    </tr>
                  )}
                  <tr className="border-b border-gray-200">
                    <td className="text-left font-medium text-gray-600">Delivery Charge:</td>
                    <td className="text-right font-semibold">{order.pricing.shippingCost}/-</td>
                  </tr>
                  <tr className="font-bold text-[9px] border-t border-black">
                    <td className="text-left">Grand Total:</td>
                    <td className="text-right font-black">{order.pricing.total}/-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* In Words Section */}
          <div className="text-[7.5px] border-t border-dashed border-black pt-1 mt-0.5 text-left">
            <span className="font-bold mr-1 text-gray-600">In Words:</span>
            <span className="italic font-bold bg-gray-100 px-1 py-0.5 rounded-xs border border-gray-300">
              {numberToWords(order.pricing.total)}
            </span>
          </div>

          {/* Bottom Footer Notice */}
          <div className="text-center mt-1 pt-0.5 border-t border-black text-[6.5px] text-gray-500 font-sans tracking-tight">
            Thank you for purchasing tradition. Authorized E-receipt.
          </div>
        </div>
      </div>

    </div>
  );
}
