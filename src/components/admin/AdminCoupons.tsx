import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit3, Ticket, Calendar, DollarSign, Percent, Info } from 'lucide-react';
import { Coupon } from '../../types';
import { addActivityLog } from '../../lib/adminData';

interface AdminCouponsProps {
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  currentAdmin: { name: string; role: string };
}

export default function AdminCoupons({ coupons, setCoupons, currentAdmin }: AdminCouponsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'flat'>('percentage');
  const [value, setValue] = useState(0);
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(100);
  const [expiresAt, setExpiresAt] = useState('2026-07-31');

  const handleEditInit = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setType(c.type);
    setValue(c.value);
    setMinOrderValue(c.minOrderValue);
    setMaxDiscount(c.maxDiscount || 0);
    setUsageLimit(c.usageLimit);
    setExpiresAt(c.expiresAt.substring(0, 10));
    setIsFormOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || value <= 0) {
      alert('Please fill out required fields: Coupon Code and Discount Value.');
      return;
    }

    const couponCode = code.trim().toUpperCase();

    const newCoupon: Coupon = {
      id: editingCoupon ? editingCoupon.id : 'coup-' + Date.now(),
      code: couponCode,
      type: type,
      value: Number(value),
      minOrderValue: Number(minOrderValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      usageLimit: Number(usageLimit),
      usedCount: editingCoupon ? editingCoupon.usedCount : 0,
      expiresAt: new Date(expiresAt).toISOString(),
      isActive: true
    };

    if (editingCoupon) {
      setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? newCoupon : c));
      addActivityLog(currentAdmin.name, currentAdmin.role, 'Edited Coupon', 'coupon', newCoupon.id, `Modified coupon criteria for ${couponCode}`);
      alert(`Coupon ${couponCode} updated successfully.`);
    } else {
      setCoupons(prev => [newCoupon, ...prev]);
      addActivityLog(currentAdmin.name, currentAdmin.role, 'Created Coupon', 'coupon', newCoupon.id, `Created new coupon campaign ${couponCode}`);
      alert(`Coupon ${couponCode} launched successfully.`);
    }

    // Reset State
    setIsFormOpen(false);
    setEditingCoupon(null);
    setCode('');
    setValue(0);
    setMinOrderValue(0);
    setMaxDiscount(0);
  };

  const handleDeleteCoupon = (couponId: string, couponCode: string) => {
    if (confirm(`Are you sure you want to delete and deactivate coupon campaign ${couponCode}?`)) {
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      addActivityLog(currentAdmin.name, currentAdmin.role, 'Deleted Coupon', 'coupon', couponId, `Deleted coupon campaign ${couponCode}`);
      alert('Coupon deactivated successfully.');
    }
  };

  return (
    <div className="space-y-8 font-sans text-gray-900">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">Campaigns & Coupon Discounts</h1>
          <p className="text-xs text-gray-500 mt-1">Configure automated seasonal coupon codes, discounts, and order caps.</p>
        </div>
        <button
          onClick={() => { setEditingCoupon(null); setIsFormOpen(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#C9A84C] hover:bg-[#B5963E] rounded-xl transition cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Launch New Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Table List (8 cols or 12) */}
        <div className={`space-y-6 ${isFormOpen ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    <th className="py-3 px-6">Coupon Info</th>
                    <th className="py-3 px-6">Benefit Type</th>
                    <th className="py-3 px-6">Min Order</th>
                    <th className="py-3 px-6">Redeem Status</th>
                    <th className="py-3 px-6">Expires Date</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6 font-sans">
                        <div className="flex items-center space-x-2">
                          <Ticket className="h-4 w-4 text-[#C9A84C]" />
                          <span className="font-bold text-gray-900 bg-gray-100 text-[11px] font-mono px-2 py-0.5 rounded tracking-wider">{c.code}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-800">
                        {c.type === 'percentage' ? (
                          <span className="inline-flex items-center gap-0.5">
                            <Percent className="h-3.5 w-3.5 text-gray-400" />
                            <span>{c.value}% Off {c.maxDiscount ? `(Max ৳${c.maxDiscount})` : ''}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5">
                            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                            <span>৳ {c.value} Flat Off</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-500">৳ {c.minOrderValue.toLocaleString()}</td>
                      <td className="py-4 px-6 font-semibold text-gray-600">
                        {c.usedCount} / {c.usageLimit === 0 || c.usageLimit === 99999 ? '∞' : c.usageLimit} redemptions
                      </td>
                      <td className="py-4 px-6 font-mono text-gray-500">
                        {new Date(c.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditInit(c)}
                            className="p-1 text-gray-400 hover:text-[#C9A84C]"
                            title="Edit campaign criteria"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.id, c.code)}
                            className="p-1 text-gray-400 hover:text-rose-500"
                            title="Delete campaign"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Drawer Form (5 cols) */}
        {isFormOpen && (
          <form onSubmit={handleSaveCoupon} className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-lg space-y-4 animate-slide-in">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">{editingCoupon ? 'Update Campaign Specs' : 'Deploy New Campaign Coupon'}</h3>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Campaign Promo Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C9A84C] font-mono tracking-wider uppercase"
                  placeholder="EID2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Benefit Form</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                  >
                    <option value="percentage">Percentage Off</option>
                    <option value="flat">Flat BDT Value Off</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Benefit Value *</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Min Cart Threshold (৳)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                    placeholder="3000"
                  />
                </div>

                {type === 'percentage' && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Max Cap Discount (৳)</label>
                    <input
                      type="number"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                      placeholder="1000"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Total Limit Quota</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Campaign Expiration</label>
                  <input
                    type="date"
                    required
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#C9A84C] hover:bg-[#B5963E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                {editingCoupon ? 'Apply Updates' : 'Deploy Campaign'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
