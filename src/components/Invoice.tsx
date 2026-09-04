import React, { useEffect } from 'react';
import { Order } from '../types';

interface InvoiceProps {
  order: Order;
  autoPrint?: boolean;
}

// Convert numbers to text words dynamically (South Asian Taka Style)
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

export default function Invoice({ order, autoPrint = false }: InvoiceProps) {
  // Inject Google Fonts dynamically when the component mounts to support thermal/luxury fonts
  useEffect(() => {
    const linkId = 'invoice-barcode-fonts-link';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Libre+Barcode+39&family=Inter:wght@400;500;600;700;800&family=Cinzel:wght@600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Handle autoPrint trigger if enabled
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  // Format the order date
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Code 39 barcode formatting (requires asterisk bounds)
  const barcodeValue = `*${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '')}*`;

  // Dynamic QR Code link for secure tracking
  const trackingUrl = `https://virsa.com.bd/track?id=${order.orderNumber}`;
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(trackingUrl)}&color=000000`;

  return (
    <div 
      id="invoice-4x6-printable"
      className="bg-[#FAF9F5] text-black p-[8px] border border-black/20 shadow-lg relative select-text"
      style={{
        width: '4in',
        height: '6in',
        minWidth: '4in',
        minHeight: '6in',
        maxWidth: '4in',
        maxHeight: '6in',
        fontFamily: '"Inter", sans-serif',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Nested print styling to guarantee standard thermal page alignment and pure high-contrast monochrome ink */}
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
          #invoice-4x6-printable, #invoice-4x6-printable * {
            visibility: visible;
            background-color: #ffffff !important;
            color: #000000 !important;
            border-color: #000000 !important;
            box-shadow: none !important;
            text-shadow: none !important;
            filter: none !important;
          }
          #invoice-4x6-printable {
            position: fixed;
            left: 0;
            top: 0;
            width: 4in !important;
            height: 6in !important;
            padding: 8px !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background-color: #ffffff !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
          }
          /* High contrast overrides for thermal text & barcode scanning */
          #invoice-4x6-printable img, 
          #invoice-4x6-printable canvas {
            image-rendering: -webkit-optimize-contrast !important;
            image-rendering: crisp-edges !important;
            image-rendering: pixelated !important;
            -ms-interpolation-mode: nearest-neighbor !important;
          }
          /* Ensure all gray/muted text elements are deep solid black for 203dpi/300dpi thermal heads */
          .text-gray-500, .text-gray-600, .text-gray-400 {
            color: #000000 !important;
            font-weight: 500 !important;
          }
          /* Force solid thin border lines to remain sharp */
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

      <div className="h-full border border-black p-[5px] flex flex-col justify-between box-border">
        {/* Invoice Header */}
        <div className="text-center">
          <div 
            className="font-black tracking-[0.25em] leading-none uppercase text-black"
            style={{ fontFamily: '"Cinzel", serif', fontSize: '18px' }}
          >
            VIRSA
          </div>
          <div className="text-[6.5px] tracking-[0.18em] uppercase font-bold text-gray-600 mt-1">
            Heritage Craftsmanship
          </div>
          <p className="my-0.5 text-[7.5px] leading-snug text-black font-medium">
            FS Square, Level - 5, Shop- 521, Mirpur-10, Dhaka
          </p>
          <p className="m-0 text-[7.5px] leading-snug text-black font-semibold font-mono">
            01712-345678, 01515-217936
          </p>
        </div>

        {/* Machine Readable Barcode */}
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
          <span 
            className="block text-[7.5px] tracking-widest text-black -mt-1 uppercase font-bold"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            {order.orderNumber}
          </span>
        </div>

        {/* Invoice Details Grid */}
        <div className="text-[7.5px] leading-normal space-y-0.5 border-t border-b border-black py-1">
          <div className="flex justify-between">
            <span>
              <strong>INVOICE:</strong>{' '}
              <span className="font-mono font-semibold">{order.orderNumber}</span>
            </span>
            <span>
              <strong>DATE:</strong>{' '}
              <span className="font-mono font-semibold">{formattedDate}</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="truncate max-w-[150px]">
              <strong>NAME:</strong> <span className="font-semibold">{order.customer.name}</span>
            </span>
            <span>
              <strong>MOBILE:</strong>{' '}
              <span className="font-mono font-semibold">{order.customer.phone}</span>
            </span>
          </div>
          <div className="truncate">
            <strong>ADDRESS:</strong>{' '}
            <span className="font-medium">
              {order.shippingAddress.address}, {order.shippingAddress.area}, {order.shippingAddress.city}
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="flex-1 my-1 overflow-hidden flex flex-col">
          <table className="w-full text-[7.5px] border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="border-b border-black text-[6.5px] uppercase font-extrabold text-center">
                <th style={{ width: '8%', padding: '1px' }}>SL</th>
                <th style={{ width: '54%', padding: '1px', textAlign: 'left' }}>Product Name</th>
                <th style={{ width: '10%', padding: '1px' }}>Qty</th>
                <th style={{ width: '13%', padding: '1px', textAlign: 'right' }}>Price</th>
                <th style={{ width: '15%', padding: '1px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="text-center border-b border-dashed border-gray-300">
                  <td style={{ padding: '2px 1px' }} className="font-mono font-medium">{index + 1}</td>
                  <td style={{ padding: '2px 1px', textAlign: 'left' }} className="truncate font-medium">
                    {item.name} ({item.size})
                  </td>
                  <td style={{ padding: '2px 1px' }} className="font-mono font-medium">{item.quantity}</td>
                  <td style={{ padding: '2px 1px', textAlign: 'right' }} className="font-mono font-medium">
                    {item.price}/-
                  </td>
                  <td style={{ padding: '2px 1px', textAlign: 'right' }} className="font-mono font-semibold">
                    {item.price * item.quantity}/-
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* QR Code and Pricing Totals block */}
        <div className="flex justify-between items-end border-t border-black pt-1">
          {/* Tracking QR Code */}
          <div className="flex flex-col items-center justify-center">
            <img 
              src={qrCodeSrc} 
              alt="Scan to Track" 
              className="w-12 h-12 border border-black/10 p-0.5 rounded-xs"
              referrerPolicy="no-referrer"
            />
            <span className="text-[5.5px] font-extrabold uppercase tracking-widest text-gray-500 mt-1">Scan to Track</span>
          </div>

          {/* Pricing Totals */}
          <div className="w-[145px]">
            <table className="w-full text-[7.5px] leading-normal font-sans">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="text-left font-medium text-gray-500">Sub-Total</td>
                  <td className="text-right font-semibold font-mono">{order.pricing.subtotal}/-</td>
                </tr>
                {order.pricing.discount > 0 && (
                  <tr className="border-b border-gray-100">
                    <td className="text-left font-medium text-gray-500">Discount</td>
                    <td className="text-right font-bold text-rose-700 font-mono">-{order.pricing.discount}/-</td>
                  </tr>
                )}
                <tr className="border-b border-gray-100">
                  <td className="text-left font-medium text-gray-500">Delivery Charge</td>
                  <td className="text-right font-semibold font-mono">{order.pricing.shippingCost}/-</td>
                </tr>
                <tr className="text-[8.5px] border-t border-black pt-0.5">
                  <td className="text-left font-bold uppercase">Total Due</td>
                  <td className="text-right font-black font-mono text-[9px]">{order.pricing.total}/-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Currency in Words */}
        <div className="text-[7px] border-t border-dashed border-black pt-1 mt-1 text-left flex items-center">
          <span className="font-extrabold mr-1 text-gray-600 uppercase tracking-wider text-[6px]">In Words:</span>
          <span className="italic font-bold bg-black/[0.03] px-1 py-0.5 rounded-xs border border-black/5 flex-1 truncate">
            {numberToWords(order.pricing.total)}
          </span>
        </div>

        {/* Footer info text */}
        <div className="text-center mt-1 pt-1 border-t border-black text-[6px] text-gray-500 font-medium tracking-tight uppercase">
          Thank you for choosing VIRSA • Authorized Thermal E-receipt
        </div>
      </div>
    </div>
  );
}
