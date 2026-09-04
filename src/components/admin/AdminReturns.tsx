import React, { useState, useEffect } from 'react';
import { loadReturnRequests, saveReturnRequests, ReturnRequest, addActivityLog } from '../../lib/adminData';
import { RefreshCw, Check, X, ShieldAlert, Sparkles, Image as ImageIcon } from 'lucide-react';

interface AdminReturnsProps {
  currentAdmin: { name: string; role: string };
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AdminReturns({ currentAdmin, setProducts }: AdminReturnsProps) {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  useEffect(() => {
    setReturns(loadReturnRequests());
  }, []);

  const filteredReturns = returns.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleDecision = (requestId: string, approve: boolean) => {
    const nextStatus = approve ? 'approved' : 'rejected';
    
    const updated = returns.map(r => {
      if (r.id === requestId) {
        const u = { ...r, status: nextStatus as any };
        if (selectedReturn?.id === requestId) {
          setSelectedReturn(u);
        }
        return u;
      }
      return r;
    });

    setReturns(updated);
    saveReturnRequests(updated);

    // If approved, log audit log
    addActivityLog(
      currentAdmin.name,
      currentAdmin.role,
      approve ? 'Approved Return' : 'Rejected Return',
      'return_request',
      requestId,
      `Marked return ticket ${requestId} as ${nextStatus.toUpperCase()}. Notes: ${decisionNotes}`
    );

    alert(`Return Request ${requestId} successfully ${nextStatus}.`);
    setDecisionNotes('');
  };

  return (
    <div className="space-y-8 font-sans text-gray-900">
      
      {/* Header Info */}
      <div>
        <h1 className="text-2xl font-bold font-sans tracking-tight text-[#0A0A0A]">Returns & Reverse Logistics</h1>
        <p className="text-xs text-gray-500 font-sans mt-1">Review active customer return requests, inspect uploaded damage photos, and issue refunds.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Tickets list (7 cols) */}
        <div className={`xl:col-span-7 space-y-6 ${selectedReturn ? 'xl:col-span-7' : 'xl:col-span-12'}`}>
          <div className="flex gap-2 border-b border-gray-100 pb-2">
            {['all', 'pending', 'approved', 'rejected'].map(t => {
              const count = t === 'all' ? returns.length : returns.filter(r => r.status === t).length;
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition ${
                    filter === t
                      ? 'border-[#C9A84C] text-[#C9A84C]'
                      : 'border-transparent text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {t} ({count})
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    <th className="py-3 px-6">ID</th>
                    <th className="py-3 px-6">Order ID</th>
                    <th className="py-3 px-6">Customer</th>
                    <th className="py-3 px-6">Refund Amount</th>
                    <th className="py-3 px-6">Reason</th>
                    <th className="py-3 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {filteredReturns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 font-sans">
                        No return tickets found.
                      </td>
                    </tr>
                  ) : (
                    filteredReturns.map(ret => (
                      <tr
                        key={ret.id}
                        className={`hover:bg-gray-50 transition cursor-pointer ${selectedReturn?.id === ret.id ? 'bg-amber-50/20' : ''}`}
                        onClick={() => setSelectedReturn(ret)}
                      >
                        <td className="py-4 px-6 font-mono text-gray-600 font-bold">{ret.id}</td>
                        <td className="py-4 px-6 font-mono font-semibold text-gray-500">{ret.orderNumber}</td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{ret.customerName}</div>
                          <div className="text-[10px] text-gray-400">{ret.customerPhone}</div>
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900">৳ {ret.amount.toLocaleString()}</td>
                        <td className="py-4 px-6 text-gray-500 font-medium">{ret.reason}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                            ret.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-600'
                              : ret.status === 'rejected'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}>
                            {ret.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Inspector (5 cols) */}
        {selectedReturn && (
          <div className="xl:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-lg space-y-6 animate-slide-in">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-widest font-bold">Inspect Ticket</span>
                <h2 className="text-base font-bold text-gray-900 font-mono mt-0.5">{selectedReturn.id}</h2>
              </div>
              <button onClick={() => setSelectedReturn(null)} className="text-gray-400 hover:text-gray-900 p-1">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">Customer & Origin</span>
                <p className="font-bold text-gray-900">{selectedReturn.customerName} ({selectedReturn.customerPhone})</p>
                <p className="text-gray-500 mt-1 font-mono">Order Reference: {selectedReturn.orderNumber}</p>
              </div>

              <div>
                <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">Returned Item Specs</span>
                <p className="font-semibold text-gray-800">{selectedReturn.productName}</p>
                <p className="text-[#C9A84C] font-bold mt-1">Est. Refundable Sum: ৳ {selectedReturn.amount.toLocaleString()}</p>
              </div>

              <div>
                <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">Stated Reason</span>
                <p className="text-gray-900 font-medium font-sans">"{selectedReturn.reasonDetail}"</p>
              </div>

              {/* Photos Panel */}
              <div>
                <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5 text-[#C9A84C]" />
                  <span>Customer Uploaded Evidence</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {selectedReturn.images.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group relative">
                      <img src={img} alt="Evidence" className="h-full w-full object-cover group-hover:scale-105 transition duration-300" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Decision Form */}
              {selectedReturn.status === 'pending' ? (
                <div className="pt-4 border-t border-gray-50 space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                      Reviewer Decision Notes
                    </label>
                    <textarea
                      value={decisionNotes}
                      onChange={(e) => setDecisionNotes(e.target.value)}
                      placeholder="Add explicit reasons for approval or rejection..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs h-20 focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDecision(selectedReturn.id, false)}
                      className="py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-500 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject Ticket</span>
                    </button>
                    <button
                      onClick={() => handleDecision(selectedReturn.id, true)}
                      className="py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-500 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve Refund</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-start space-x-3 text-gray-500">
                  <ShieldAlert className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px]">
                    This reverse logistic ticket has already been marked as <strong className="uppercase">{selectedReturn.status}</strong>. No further adjustments are permissible.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
