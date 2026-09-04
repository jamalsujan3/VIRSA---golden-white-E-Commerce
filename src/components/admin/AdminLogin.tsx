import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, Sparkles } from 'lucide-react';
import { AdminUser, loadAdminUsers } from '../../lib/adminData';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('jamalsujan3@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<'super-admin' | 'manager' | 'order-staff' | 'support'>('super-admin');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    // Load registered admins
    const admins = loadAdminUsers();
    // In our robust prototype, we allow logging in with the chosen role for quick testing,
    // or look up by email.
    const matchedUser = admins.find(a => a.email.toLowerCase() === email.toLowerCase());

    if (matchedUser) {
      // Login matching user with chosen testing role
      const updatedUser = { ...matchedUser, role: selectedRole };
      onLoginSuccess(updatedUser);
    } else {
      // Create custom temp admin user
      const newUser: AdminUser = {
        id: 'adm-' + Date.now(),
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: selectedRole,
        isActive: true,
        lastLoginAt: new Date().toISOString()
      };
      onLoginSuccess(newUser);
    }
  };

  const testAccounts = [
    { name: 'Super Admin', email: 'jamalsujan3@gmail.com', role: 'super-admin' as const, desc: 'Full unlimited access' },
    { name: 'Manager', email: 'rahim@virsa.com', role: 'manager' as const, desc: 'Catalog, orders, and coupons' },
    { name: 'Order Staff', email: 'delivery@virsa.com', role: 'order-staff' as const, desc: 'Fulfillment & status workflow' },
    { name: 'Support Agent', email: 'support@virsa.com', role: 'support' as const, desc: 'Read-only tickets & customer CRM' }
  ];

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#C9A84C]/30 text-white">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 bg-[#161922] p-8 sm:p-10 rounded-2xl border border-white/10 shadow-2xl relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-serif tracking-[0.2em] text-[#C9A84C] font-semibold">VIRSA</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium font-mono">Atelier Control Panel</p>
        </div>

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/20 rounded-xl flex items-start space-x-3 text-red-400 text-xs">
            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-[11px] font-sans text-gray-400 uppercase tracking-wider mb-2 font-semibold">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1A1E29] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all font-sans"
                  placeholder="admin@virsa.com"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-sans text-gray-400 uppercase tracking-wider mb-2 font-semibold">
                Security Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1A1E29] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all font-sans"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              </div>
            </div>

            {/* Quick Testing Roles Selection Selector */}
            <div className="bg-[#1A1E29]/60 p-4 rounded-xl border border-white/5 space-y-3">
              <span className="block text-[10px] font-mono text-[#C9A84C] uppercase tracking-widest font-bold">
                🔒 Access Control Role (RBAC Mock)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {testAccounts.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => {
                      setEmail(account.email);
                      setSelectedRole(account.role);
                    }}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col justify-between cursor-pointer ${
                      selectedRole === account.role
                        ? 'border-[#C9A84C] bg-[#C9A84C]/5 text-white'
                        : 'border-white/5 bg-[#1F2433]/40 hover:border-white/10 text-gray-400'
                    }`}
                  >
                    <span className="font-semibold text-[11px] text-white font-sans">{account.name}</span>
                    <span className="text-[9px] text-gray-500 font-sans mt-0.5">{account.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#C9A84C] hover:bg-white text-[#0F1117] font-bold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg active:scale-[0.99] hover:shadow-[#C9A84C]/15"
            >
              Sign In to Atelier Control
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">
            © 2026 Virsa Atelier System. All Connections Encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}
