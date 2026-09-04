import React from 'react';
import { Printer, X } from 'lucide-react';
import { Order } from '../types';
import Invoice from './Invoice';

interface InvoiceModalProps {
  order: Order;
  isOpen?: boolean;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-[#1F1B17]/70 z-[100] flex flex-col items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      
      {/* Control / Action Panel above the preview */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-[4in] bg-white border border-[#E8DFC8] p-3.5 rounded-t-2xl text-[#1F1B17] shadow-xl print:hidden">
        <div className="flex items-center space-x-2">
          <Printer className="h-4 w-4 text-[#8C6819]" />
          <span className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase text-[#8C6819]">Label Preview (4x6")</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] text-[10px] font-sans font-extrabold uppercase tracking-widest rounded-lg transition duration-200 shadow-sm cursor-pointer"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#FAF8F5] text-[#6E645A] hover:text-[#1F1B17] rounded-lg transition duration-200 border border-[#E8DFC8] cursor-pointer"
            aria-label="Close Invoice Preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 4x6 Preview Wrapper */}
      <div className="relative z-10 select-none print:shadow-none print:border-none">
        <div className="relative overflow-hidden border border-black/20 rounded-b-lg shadow-2xl bg-[#FAF9F5]">
          <Invoice order={order} autoPrint={false} />
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="relative z-10 mt-4 text-center print:hidden">
        <p className="text-[11px] text-[#FAF8F5] font-sans tracking-wide max-w-xs leading-relaxed">
          Verify the layout margins, barcode, and details. Click <strong className="text-[#C5A059] font-bold">Print</strong> to dispatch to your printer or label machine.
        </p>
      </div>

    </div>
  );
}
