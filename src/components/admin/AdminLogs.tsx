import React, { useState, useEffect } from 'react';
import { loadActivityLogs, ActivityLog } from '../../lib/adminData';
import { ShieldCheck, Search, Filter, Calendar, Clock, Trash } from 'lucide-react';

export default function AdminLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    setLogs(loadActivityLogs());
  }, []);

  const filteredLogs = logs.filter(log => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      log.adminName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);

    const matchesRole = selectedRole === 'all' || log.adminRole === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleClearLogs = () => {
    if (confirm('Are you absolutely sure you want to flush and purge all audit logs? This action is irreversible.')) {
      localStorage.setItem('virsa_activity_logs', JSON.stringify([]));
      setLogs([]);
      alert('Logs cleared successfully.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-gray-900">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">Security Audit Ledger</h1>
          <p className="text-xs text-gray-500 mt-1">Audit log of all admin operations, state transitions, and platform adjustments.</p>
        </div>
        <button
          onClick={handleClearLogs}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition cursor-pointer"
        >
          <Trash className="h-4 w-4" />
          <span>Purge Ledger</span>
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search action logs, admin, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
        </div>

        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-[#C9A84C]"
          >
            <option value="all">All Clearance Clearances</option>
            <option value="super-admin">Super Admin</option>
            <option value="manager">Manager</option>
            <option value="order-staff">Order Staff</option>
            <option value="support">Support Agent</option>
          </select>
        </div>
      </div>

      {/* Table Ledger list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Admin Name</th>
                <th className="py-3 px-6">Clearance Role</th>
                <th className="py-3 px-6">Action Triggered</th>
                <th className="py-3 px-6">Operational Details</th>
                <th className="py-3 px-6 text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 font-sans">
                    No active audit entries match the current query criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 font-mono text-gray-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">{log.adminName}</td>
                    <td className="py-4 px-6 uppercase font-mono text-[9px] font-bold text-gray-400 tracking-wider">
                      {log.adminRole}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-800">{log.action}</td>
                    <td className="py-4 px-6 text-gray-500 font-medium max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <ShieldCheck className="h-4 w-4 text-emerald-500 inline-block" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
