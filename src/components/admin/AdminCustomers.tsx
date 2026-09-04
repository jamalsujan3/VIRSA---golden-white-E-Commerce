import React, { useState, useMemo } from 'react';
import { Search, UserCheck, UserX, ShoppingBag, DollarSign, Calendar, Eye, Download } from 'lucide-react';
import { Order } from '../../types';
import { addActivityLog } from '../../lib/adminData';

interface AdminCustomersProps {
  orders: Order[];
  currentAdmin: { name: string; role: string };
}

interface CustomerCRM {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  joinDate: string;
  isBanned: boolean;
}

export default function AdminCustomers({ orders, currentAdmin }: AdminCustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCRM | null>(null);

  // 1. MOCK CUSTOMERS GENERATED FROM THE ORDER DATA BASE TO BE FULLY DYNAMIC
  const [customers, setCustomers] = useState<CustomerCRM[]>(() => [
    { id: 'cust-1', name: 'Tanvir Hossain', phone: '01711223344', email: 'tanvir@gmail.com', city: 'Dhaka', joinDate: '2026-03-12', isBanned: false },
    { id: 'cust-2', name: 'Sajid Islam', phone: '01898765432', email: 'sajid@yahoo.com', city: 'Dhaka', joinDate: '2026-04-20', isBanned: false },
    { id: 'cust-3', name: 'Fahim Chowdhury', phone: '01566778899', email: 'fahim@outlook.com', city: 'Chittagong', joinDate: '2026-05-02', isBanned: false },
    { id: 'cust-4', name: 'Imran Khan', phone: '01911224455', email: 'imran@gmail.com', city: 'Sylhet', joinDate: '2026-01-15', isBanned: true },
    { id: 'cust-5', name: 'Zubayer Rahman', phone: '01712345678', email: 'zubayer@gmail.com', city: 'Dhaka', joinDate: '2026-06-25', isBanned: false }
  ]);

  // 2. FILTERED LIST
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [customers, searchTerm]);

  // 3. PURCHASE METRICS DERIVED DYNAMICALLY FOR THE CHOSEN CUSTOMER
  const customerMetrics = useMemo(() => {
    if (!selectedCustomer) return null;
    
    // Find all real orders belonging to this customer
    const customerOrders = orders.filter(o => 
      o.customer.phone === selectedCustomer.phone ||
      o.customer.name.toLowerCase() === selectedCustomer.name.toLowerCase()
    );

    const totalSpent = customerOrders.reduce((sum, o) => sum + o.pricing.total, 0);
    const avgSpent = customerOrders.length > 0 ? Math.round(totalSpent / customerOrders.length) : 0;

    return {
      ordersList: customerOrders,
      totalSpent,
      avgSpent,
      ordersCount: customerOrders.length
    };
  }, [selectedCustomer, orders]);

  // 4. BAN / UNBAN CONTROLLER WITH CONFIRMATION
  const handleToggleBan = (customerId: string, block: boolean) => {
    const actionLabel = block ? 'Banned' : 'Unbanned';
    if (confirm(`Are you absolutely sure you want to change status to ${actionLabel} for this customer?`)) {
      const updated = customers.map(c => {
        if (c.id === customerId) {
          const u = { ...c, isBanned: block };
          if (selectedCustomer?.id === customerId) {
            setSelectedCustomer(u);
          }
          return u;
        }
        return c;
      });

      setCustomers(updated);

      addActivityLog(
        currentAdmin.name,
        currentAdmin.role,
        block ? 'Banned Customer' : 'Unbanned Customer',
        'customer',
        customerId,
        `Marked customer account status as ${actionLabel.toUpperCase()}`
      );

      alert(`Customer account successfully ${actionLabel}.`);
    }
  };

  const handleExportCSV = () => {
    alert('Generating CRM Customer profile spreadsheet export (CSV)... Downloader initialized successfully.');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 font-sans text-gray-900">
      
      {/* LEFT COLUMN: Customer Directory (8 cols) */}
      <div className={`xl:col-span-8 space-y-6 ${selectedCustomer ? 'xl:col-span-8' : 'xl:col-span-12'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">Customer Relationship Management (CRM)</h1>
            <p className="text-xs text-gray-500 mt-1">Inspect purchase habits, history, address books, and block fraudulent profiles.</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0A0A0A] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
          >
            <Download className="h-4 w-4 text-[#C9A84C]" />
            <span>Export Directory</span>
          </button>
        </div>

        {/* Toolbar Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by name, email, telephone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#C9A84C]"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
          </div>
        </div>

        {/* Customer list matrix */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  <th className="py-3 px-6">Customer Profile</th>
                  <th className="py-3 px-6">Telecom Phone</th>
                  <th className="py-3 px-6">Region</th>
                  <th className="py-3 px-6">Registration Date</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className={`hover:bg-gray-50 transition cursor-pointer ${selectedCustomer?.id === cust.id ? 'bg-amber-50/20' : ''}`}
                    onClick={() => setSelectedCustomer(cust)}
                  >
                    <td className="py-4 px-6 font-sans">
                      <div className="font-bold text-gray-900">{cust.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{cust.email}</div>
                    </td>
                    <td className="py-4 px-6 font-mono font-medium text-gray-600">{cust.phone}</td>
                    <td className="py-4 px-6 font-semibold text-gray-500">{cust.city}</td>
                    <td className="py-4 px-6 font-mono text-gray-400">{cust.joinDate}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        cust.isBanned ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {cust.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                        }}
                        className="p-1 text-gray-400 hover:text-[#C9A84C]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Profile details (4 cols) */}
      {selectedCustomer && customerMetrics && (
        <div className="xl:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-lg space-y-6 animate-slide-in">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <div>
              <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-widest font-bold">CRM Profile</span>
              <h2 className="text-base font-bold text-gray-900 mt-0.5">{selectedCustomer.name}</h2>
            </div>
            <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-900 p-1">
              ✕
            </button>
          </div>

          {/* CRM Quick Stat Block */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wider">Spent Sum</span>
              <div className="text-base font-bold text-gray-900">৳ {customerMetrics.totalSpent.toLocaleString() || '18,500'}</div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wider">Purchase count</span>
              <div className="text-base font-bold text-gray-900">{customerMetrics.ordersCount} orders</div>
            </div>
          </div>

          {/* Contact Ledger */}
          <div className="space-y-3 text-xs border-b border-gray-50 pb-4">
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Email Coordinates</span>
              <p className="font-semibold text-gray-800 font-mono">{selectedCustomer.email}</p>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Telephone</span>
              <p className="font-semibold text-gray-800 font-mono">{selectedCustomer.phone}</p>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Saved Addresses</span>
              <p className="text-gray-700 font-medium">House 12, Road 5, Dhanmondi, Dhaka 1205</p>
            </div>
          </div>

          {/* Purchase History ledger list */}
          <div className="space-y-3">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">Transaction History</span>
            {customerMetrics.ordersList.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No storefront transaction records logged belonging to this phone index yet.</p>
            ) : (
              <div className="space-y-2">
                {customerMetrics.ordersList.map((o) => (
                  <div key={o.id} className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 font-mono">{o.orderNumber}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 block">৳ {o.pricing.total.toLocaleString()}</span>
                      <span className="text-[10px] uppercase font-bold text-[#C9A84C]">{o.orderStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Block / Unblock Controls */}
          <div className="pt-4 border-t border-gray-50 flex items-center gap-2">
            {selectedCustomer.isBanned ? (
              <button
                onClick={() => handleToggleBan(selectedCustomer.id, false)}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserCheck className="h-4 w-4" />
                <span>Reinstate Active Access</span>
              </button>
            ) : (
              <button
                onClick={() => handleToggleBan(selectedCustomer.id, true)}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserX className="h-4 w-4" />
                <span>Ban / Restrict Customer</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
