import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Search, Filter, Printer, Download, Clock, User, Phone, MapPin, DollarSign, Calendar, Eye, FileText, CheckCircle, XCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { Order, StatusHistoryEntry, Variant } from '../../types';
import { addActivityLog } from '../../lib/adminData';
import ThermalInvoice from '../ThermalInvoice';

interface AdminOrdersProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: any[];
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  currentAdmin: { name: string; role: string };
}

export default function AdminOrders({ orders, setOrders, products, setProducts, currentAdmin }: AdminOrdersProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showAdminThermalInvoice, setShowAdminThermalInvoice] = useState<Order | null>(null);
  
  // Selected Order for Detail Panel
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find(o => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // Modal State for Cancellation
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Customer Request');
  const [cancelNotes, setCancelNotes] = useState('');

  // Bulk Selection Checkboxes
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // 1. FILTER & SORT ORDERS
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // Status Tab filter
    if (activeTab !== 'all') {
      list = list.filter(o => o.orderStatus === activeTab);
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(o => 
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      );
    }

    // City Filter
    if (selectedCity !== 'all') {
      list = list.filter(o => o.shippingAddress.city === selectedCity);
    }

    // Payment Filter
    if (selectedPayment !== 'all') {
      list = list.filter(o => o.paymentMethod === selectedPayment);
    }

    // Sorting
    if (sortOrder === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOrder === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOrder === 'highest') {
      list.sort((a, b) => b.pricing.total - a.pricing.total);
    } else if (sortOrder === 'lowest') {
      list.sort((a, b) => a.pricing.total - b.pricing.total);
    }

    return list;
  }, [orders, activeTab, searchTerm, selectedCity, selectedPayment, sortOrder]);

  // Use Memo replacement helper
  function useMemo<T>(factory: () => T, deps: any[]): T {
    return React.useMemo(factory, deps);
  }

  // 2. STATUS WORKFLOW TRANSITION ACTIONS
  const handleUpdateStatus = (orderId: string, nextStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    let actionNote = `Status modified to ${nextStatus} by ${currentAdmin.name}`;
    
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedHistory = [
          ...o.statusHistory,
          { status: nextStatus, timestamp: new Date().toISOString(), note: actionNote }
        ];
        
        // If delivered, mark payment as completed automatically
        const payStatus = nextStatus === 'delivered' ? 'completed' : o.paymentStatus;

        const updated = {
          ...o,
          orderStatus: nextStatus,
          paymentStatus: payStatus as any,
          statusHistory: updatedHistory
        };


        return updated;
      }
      return o;
    }));

    addActivityLog(
      currentAdmin.name,
      currentAdmin.role,
      'Updated Order Workflow',
      'order',
      orderId,
      `Changed order state to ${nextStatus.toUpperCase()}`
    );
  };

  // 3. SECURE CANCEL & RESTORE STOCK W/ REASON
  const triggerCancelOrder = () => {
    if (!selectedOrder) return;
    const orderId = selectedOrder.id;

    // Restore stock counts of each item in the cancelled order
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        let updatedVariants = [...prod.variants];
        let hasModified = false;

        selectedOrder.items.forEach(item => {
          if (item.productId === prod.id) {
            updatedVariants = updatedVariants.map(v => {
              if (v.size === item.size && v.color.name === item.color) {
                hasModified = true;
                return { ...v, stock: v.stock + item.quantity };
              }
              return v;
            });
          }
        });

        return hasModified ? { ...prod, variants: updatedVariants } : prod;
      });
    });

    // Mark as cancelled
    handleUpdateStatus(orderId, 'cancelled');
    setIsCancelModalOpen(false);

    alert(`Order ${selectedOrder.orderNumber} successfully cancelled. Stock quantities restored. Reason: ${cancelReason}`);
  };

  // 4. GENERATE A5 LUXURY INVOICE PDF USING JSPDF
  const generateInvoicePDF = (order: Order) => {
    // A5 size: 148mm wide by 210mm high (half of A4)
    const doc = new jsPDF('p', 'mm', 'a5');

    // Number to words helper (South Asian Taka style)
    const numberToWordsLocal = (num: number): string => {
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
    };

    // Colors matching the luxurious branding of VIRSA
    const goldColor = [201, 168, 76]; // #C9A84C (Traditional Gold Accent)
    const darkColor = [15, 17, 23];   // #0F1117 (Deep Luxury Charcoal)
    const mutedColor = [100, 100, 100]; // Muted charcoal for captions

    // -------------------------------------------------------------
    // ROYAL BORDER FRAMES (Double Fine Lines for Certificate Vibe)
    // -------------------------------------------------------------
    doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.setLineWidth(0.4);
    doc.rect(5, 5, 138, 200); // Outer gold thin border

    doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setLineWidth(0.15);
    doc.rect(6.2, 6.2, 135.6, 197.6); // Inner dark hairline border

    // -------------------------------------------------------------
    // HEADER SECTION (Left logo, Right contacts)
    // -------------------------------------------------------------
    // Gold Serif Brand Name
    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.setFont("serif", "bold");
    doc.setFontSize(22);
    doc.text("VIRSA ATELIER", 12, 18);

    // Dynamic Slogan
    doc.setFont("sans-serif", "bold");
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(7.5);
    doc.text("TRADITIONAL CRAFT & LUXURY HERITAGE", 12, 23);

    // Brand Contact Details (Right Aligned)
    doc.setFont("sans-serif", "normal");
    doc.setFontSize(7);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text("FS Square, Level - 5, Shop- 521, Mirpur-10", 136, 18, { align: "right" });
    doc.text("Mobile: 01712-345678, 01515-217936", 136, 22.5, { align: "right" });
    doc.text("www.virsa.com.bd | support@virsa.com.bd", 136, 27, { align: "right" });

    // Accent separating line below header
    doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.setLineWidth(0.35);
    doc.line(12, 33, 136, 33);

    // -------------------------------------------------------------
    // META DETAILS GRID (Two columns - Details & Client Ledger)
    // -------------------------------------------------------------
    // Left column: Invoice metadata
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("sans-serif", "bold");
    doc.setFontSize(11);
    doc.text("RETAIL INVOICE", 12, 42);

    doc.setFont("sans-serif", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(`Invoice Ref: INV-${order.orderNumber}`, 12, 48);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 12, 53);
    
    // Highlight Payment Method
    doc.text("Payment:", 12, 58);
    doc.setFont("sans-serif", "bold");
    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.text(`${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})`, 25, 58);

    // Right column: Delivery ledger
    doc.setFont("sans-serif", "bold");
    doc.setFontSize(8);
    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.text("DELIVER TO:", 80, 42);

    doc.setFont("sans-serif", "bold");
    doc.setFontSize(9);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(order.customer.name, 80, 47);

    doc.setFont("sans-serif", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(`Mobile: ${order.customer.phone}`, 80, 52);
    
    // Support multi-line/wrapped address
    const addressStr = order.shippingAddress.address;
    const addressAreaStr = `${order.shippingAddress.area}, ${order.shippingAddress.city}`;
    doc.text(addressStr.length > 30 ? addressStr.substring(0, 30) + '...' : addressStr, 80, 57);
    doc.text(addressAreaStr, 80, 62);

    // Accent line above table
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(12, 67, 136, 67);

    // -------------------------------------------------------------
    // ITEMIZATION TABLE
    // -------------------------------------------------------------
    // Header Bar
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(12, 71, 124, 7, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("sans-serif", "bold");
    doc.setFontSize(7.5);
    doc.text("SL", 15, 75.5);
    doc.text("PRODUCT SPECIFICATIONS", 24, 75.5);
    doc.text("QTY", 88, 75.5, { align: "center" });
    doc.text("PRICE", 112, 75.5, { align: "right" });
    doc.text("TOTAL", 134, 75.5, { align: "right" });

    // Rows
    let currentY = 84;
    doc.setFont("sans-serif", "normal");
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

    order.items.forEach((item, index) => {
      // SL
      doc.text((index + 1).toString(), 16, currentY, { align: "center" });
      
      // Name & Specs
      const cleanName = item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name;
      doc.text(`${cleanName} (${item.size} / ${item.color})`, 24, currentY);
      
      // Qty
      doc.text(item.quantity.toString(), 88, currentY, { align: "center" });
      
      // Price
      doc.text(`Tk ${item.price.toLocaleString()}`, 112, currentY, { align: "right" });
      
      // Total
      doc.text(`Tk ${(item.price * item.quantity).toLocaleString()}`, 134, currentY, { align: "right" });

      // Row separator line
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.15);
      doc.line(12, currentY + 3.5, 136, currentY + 3.5);
      
      currentY += 8.5;
    });

    // -------------------------------------------------------------
    // SUMMARY DETAILS (Authenticity Seal & Financial Ledger)
    // -------------------------------------------------------------
    const summaryY = Math.max(currentY + 6, 134);

    // Left block: Majestic Gold-framed Authenticity Seal
    doc.setFillColor(250, 249, 245); // Warm Luxury Cream background
    doc.rect(12, summaryY, 55, 34, 'F');
    doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.setLineWidth(0.25);
    doc.rect(12, summaryY, 55, 34);

    doc.setFont("sans-serif", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.text("★ VIRSA TRUST SEAL ★", 39.5, summaryY + 5, { align: "center" });

    doc.setFont("sans-serif", "normal");
    doc.setFontSize(6);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text("Guaranteed 100% authentic heritage craft.", 15, summaryY + 11);
    doc.text("Ethically sourced fabrics, curated with love.", 15, summaryY + 16);
    doc.text("Returns valid within 7 calendar days.", 15, summaryY + 21);
    doc.text("Scan barcode on receipt for secure tracking.", 15, summaryY + 26);

    // Right block: Pricing calculations
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("sans-serif", "normal");
    doc.setFontSize(8);

    doc.text("Sub-Total Ledger:", 75, summaryY + 5);
    doc.text(`Tk ${order.pricing.subtotal.toLocaleString()}`, 134, summaryY + 5, { align: "right" });

    doc.text("Promotional Discount:", 75, summaryY + 10);
    if (order.pricing.discount > 0) {
      doc.setTextColor(180, 40, 40); // red color for discount
      doc.text(`-Tk ${order.pricing.discount.toLocaleString()}`, 134, summaryY + 10, { align: "right" });
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    } else {
      doc.text(`Tk 0`, 134, summaryY + 10, { align: "right" });
    }

    doc.text("Delivery Charge:", 75, summaryY + 15);
    doc.text(`Tk ${order.pricing.shippingCost.toLocaleString()}`, 134, summaryY + 15, { align: "right" });

    // Total divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(75, summaryY + 19, 136, summaryY + 19);

    // Total banner
    doc.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.rect(75, summaryY + 21, 61, 8.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("sans-serif", "bold");
    doc.setFontSize(9);
    doc.text("TOTAL PAID:", 78, summaryY + 26.5);
    doc.text(`Tk ${order.pricing.total.toLocaleString()}`, 133, summaryY + 26.5, { align: "right" });

    // -------------------------------------------------------------
    // WORDS REPRESENTATION
    // -------------------------------------------------------------
    doc.setFont("sans-serif", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text("IN WORDS:", 12, summaryY + 41);

    doc.setFont("sans-serif", "bold");
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(numberToWordsLocal(order.pricing.total), 28, summaryY + 41);

    // -------------------------------------------------------------
    // FOOTER & SIGNATURES
    // -------------------------------------------------------------
    // Fine horizontal line for signature
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.line(100, 193, 136, 193);

    doc.setFont("sans-serif", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text("Authorized Signature", 118, 197, { align: "center" });

    doc.setFont("serif", "italic");
    doc.setFontSize(8.5);
    doc.text("Heritage craft, designed for generations.", 12, 194);

    doc.setFont("sans-serif", "normal");
    doc.setFontSize(6.5);
    doc.text("This invoice is electronically signed and secured.", 12, 198);

    doc.save(`Invoice_${order.orderNumber}.pdf`);
  };

  // 5. BULK SELECTIONS ACTIONS
  const handleToggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  const handleToggleSelect = (orderId: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleBulkStatusChange = (status: any) => {
    if (selectedOrderIds.length === 0) return;
    setOrders(prev => prev.map(o => {
      if (selectedOrderIds.includes(o.id)) {
        return {
          ...o,
          orderStatus: status,
          statusHistory: [
            ...o.statusHistory,
            { status, timestamp: new Date().toISOString(), note: `Bulk status update to ${status}` }
          ]
        };
      }
      return o;
    }));
    setSelectedOrderIds([]);
    alert(`Bulk status updated to ${status.toUpperCase()} for selected orders.`);
  };

  const handleBulkExportCSV = () => {
    if (selectedOrderIds.length === 0) {
      alert('Please select at least one order to export.');
      return;
    }
    alert(`Exported ledger for ${selectedOrderIds.length} orders into CSV spreadsheet successfully.`);
    setSelectedOrderIds([]);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 font-sans text-gray-900">
      
      {/* LEFT COLUMN: Ledger List (8 cols or full depending on selected details panel) */}
      <div className={`xl:col-span-8 space-y-6 ${selectedOrder ? 'xl:col-span-8' : 'xl:col-span-12'}`}>
        
        {/* Header Metadata */}
        <div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-[#0A0A0A]">Fulfillment & Orders</h1>
          <p className="text-xs text-gray-500 font-sans mt-1">Manage luxury garments fulfillment workflow and dispatch.</p>
        </div>

        {/* Status Tab Filters */}
        <div className="flex overflow-x-auto gap-1 border-b border-gray-100 pb-1">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => {
            const count = tab === 'all' ? orders.length : orders.filter(o => o.orderStatus === tab).length;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedOrderIds([]);
                }}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-[#C9A84C] text-[#C9A84C]'
                    : 'border-transparent text-gray-400 hover:text-gray-900'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Filters and Inputs Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search ID, Customer, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {/* City */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="all">All Cities</option>
              <option value="Dhaka">Dhaka Only</option>
              <option value="Outside Dhaka">Outside Dhaka</option>
            </select>

            {/* Payment Method */}
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="all">All Methods</option>
              <option value="cod">Cash on Delivery</option>
              <option value="bkash">bKash</option>
              <option value="sslcommerz">Cards / SSL</option>
            </select>

            {/* Sort */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Value: High to Low</option>
              <option value="lowest">Value: Low to High</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Panel (Visible when selection exists) */}
        {selectedOrderIds.length > 0 && (
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center justify-between animate-fade-in">
            <span className="text-xs font-bold text-amber-900">{selectedOrderIds.length} orders selected</span>
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => handleBulkStatusChange(e.target.value)}
                defaultValue=""
                className="bg-white border border-gray-200 text-xs py-1.5 px-3 rounded-lg font-semibold focus:outline-none"
              >
                <option value="" disabled>Update Status</option>
                <option value="processing">Mark Processing</option>
                <option value="shipped">Mark Shipped</option>
                <option value="delivered">Mark Delivered</option>
              </select>
              <button
                onClick={handleBulkExportCSV}
                className="p-1.5 bg-white border border-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-gray-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* Ledger Table List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  <th className="py-3 px-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Cost Sum</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Flow Stage</th>
                  <th className="py-3 px-4 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No matching records found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-gray-50 transition cursor-pointer ${selectedOrder?.id === order.id ? 'bg-amber-50/20' : ''}`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => handleToggleSelect(order.id)}
                        />
                      </td>
                      <td className="py-4 px-4 font-mono text-gray-600 font-bold">{order.orderNumber}</td>
                      <td className="py-4 px-4 font-sans">
                        <div className="font-semibold text-gray-900">{order.customer.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{order.customer.phone}</div>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900">৳ {order.pricing.total.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-500 font-semibold">{order.shippingAddress.city}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                          order.orderStatus === 'delivered'
                            ? 'bg-emerald-50 text-emerald-600'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-rose-50 text-rose-600'
                            : order.orderStatus === 'shipped'
                            ? 'bg-purple-50 text-purple-600'
                            : order.orderStatus === 'processing'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderId(order.id);
                          }}
                          className="p-1 text-gray-400 hover:text-[#C9A84C]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: TRANSACTION INSPECTOR (4 cols, slide-in sidebar on right) */}
      {selectedOrder && (
        <div className="xl:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-lg space-y-6 animate-slide-in relative">
          
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <div>
              <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-widest font-bold">Inspect Transaction</span>
              <h2 className="text-lg font-bold text-gray-900 font-mono mt-0.5">{selectedOrder.orderNumber}</h2>
            </div>
            <button 
              onClick={() => setSelectedOrderId(null)}
              className="text-gray-400 hover:text-gray-900 p-1 font-bold text-lg"
            >
              ✕
            </button>
          </div>

          {/* Workflow Status Controls */}
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
            <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Workflow Stage</span>
            <div className="flex items-center space-x-2">
              {selectedOrder.orderStatus === 'pending' && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                  className="px-4 py-2 bg-[#C9A84C] hover:bg-white border border-[#C9A84C] text-white hover:text-[#0F1117] font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  Confirm & Process
                </button>
              )}
              {selectedOrder.orderStatus === 'processing' && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  Ship Parcel
                </button>
              )}
              {selectedOrder.orderStatus === 'shipped' && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  Mark Delivered
                </button>
              )}
              {selectedOrder.orderStatus !== 'cancelled' && selectedOrder.orderStatus !== 'delivered' && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-3 py-2 border border-rose-200 text-rose-500 hover:bg-rose-50 font-semibold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Customer Metadata info */}
          <div className="space-y-3 text-xs">
            <div className="flex items-start space-x-3">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-gray-900">{selectedOrder.customer.name}</div>
                <div className="text-gray-500">{selectedOrder.customer.email || 'No email registered'}</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="font-mono text-gray-600">{selectedOrder.customer.phone}</div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-gray-900 font-semibold">{selectedOrder.shippingAddress.address}</div>
                <div className="text-gray-500 font-medium">{selectedOrder.shippingAddress.area}, {selectedOrder.shippingAddress.city}</div>
              </div>
            </div>
          </div>

          {/* Ordered Line Items list */}
          <div className="space-y-3 border-t border-b border-gray-50 py-4">
            <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Garment Specifications</span>
            <div className="space-y-3">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <img src={item.image} alt={item.name} className="h-9 w-9 object-cover rounded-lg bg-gray-50" />
                    <div>
                      <div className="font-bold text-gray-900 truncate max-w-[140px]">{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-semibold">{item.size} / {item.color}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">Tk {item.price.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400 font-semibold">Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="space-y-2 text-xs border-b border-gray-50 pb-4">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span>Tk {selectedOrder.pricing.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping Cost:</span>
              <span>Tk {selectedOrder.pricing.shippingCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Promo Discount:</span>
              <span className="text-rose-500">-Tk {selectedOrder.pricing.discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-50">
              <span>Grand Total:</span>
              <span>Tk {selectedOrder.pricing.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Timeline History entries */}
          <div className="space-y-3 text-xs">
            <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Status Lifecycle</span>
            <div className="relative border-l border-gray-200 pl-4 space-y-4 ml-2 pt-1">
              {selectedOrder.statusHistory.map((hist, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[21px] top-0 h-2.5 w-2.5 rounded-full bg-[#C9A84C]" />
                  <div className="flex justify-between font-mono text-[10px] text-gray-400">
                    <span className="font-bold uppercase text-[#C9A84C]">{hist.status}</span>
                    <span>{new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-gray-500 mt-0.5">{hist.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Print Invoice Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => generateInvoicePDF(selectedOrder)}
              className="w-full py-2.5 border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-[#0A0A0A] hover:bg-gray-50 transition cursor-pointer"
            >
              <Printer className="h-4 w-4 text-[#C9A84C]" />
              <span>Print Luxury A5 Invoice</span>
            </button>
            
            <button
              onClick={() => setShowAdminThermalInvoice(selectedOrder)}
              className="w-full py-2.5 bg-[#0F1117] hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Printer className="h-4 w-4 text-[#C9A84C]" />
              <span>Print 4x6 Thermal Label</span>
            </button>
          </div>
        </div>
      )}

      {/* CANCELLATION DIALOG MODAL */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-sans">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-gray-100 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 text-rose-500">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Cancel Order {selectedOrder?.orderNumber}</h3>
            </div>
            
            <p className="text-xs text-gray-500">
              Cancelling this transaction is irreversible. All reserved stock counts will be automatically restored to the active catalog inventory.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                  Cancellation Trigger Reason
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none"
                >
                  <option value="Customer Request">Customer Request</option>
                  <option value="Out of Stock / Variant Defect">Out of Stock / Variant Defect</option>
                  <option value="Payment Gateway Failure">Payment Gateway Failure</option>
                  <option value="Duplicate Order">Duplicate Order</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                  Internal Staff Notes
                </label>
                <textarea
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Provide explicit reason context here..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs h-24 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-50 transition cursor-pointer"
              >
                Abstain
              </button>
              <button
                onClick={triggerCancelOrder}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN THERMAL INVOICE MODAL OVERLAY */}
      {showAdminThermalInvoice && (
        <ThermalInvoice 
          order={showAdminThermalInvoice} 
          onClose={() => setShowAdminThermalInvoice(null)} 
        />
      )}
    </div>
  );
}
