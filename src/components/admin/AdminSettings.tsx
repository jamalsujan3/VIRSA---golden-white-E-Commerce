import React, { useState, useEffect } from 'react';
import { 
  loadStoreSettings, 
  saveStoreSettings, 
  StoreSetting, 
  loadAdminUsers, 
  saveAdminUsers, 
  AdminUser, 
  addActivityLog,
  loadBrandAssets,
  saveBrandAssets,
  BrandAsset
} from '../../lib/adminData';
import { 
  Settings, CreditCard, Truck, Shield, UserPlus, ToggleLeft, ToggleRight, 
  Check, CheckCircle, HelpCircle, Upload, Image, RefreshCw, Globe, Trash2,
  Edit, X, User, Lock
} from 'lucide-react';

interface AdminSettingsProps {
  currentAdmin: AdminUser | null;
  onUpdateCurrentAdmin?: (admin: AdminUser) => void;
}

export default function AdminSettings({ currentAdmin, onUpdateCurrentAdmin }: AdminSettingsProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'store' | 'branding' | 'payments' | 'shipping' | 'admins'>('store');
  const [settings, setSettings] = useState<StoreSetting[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);

  // Admin User Creation State
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'super-admin' | 'manager' | 'order-staff' | 'support'>('order-staff');

  // Editing Admin states
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminRole, setEditAdminRole] = useState<'super-admin' | 'manager' | 'order-staff' | 'support'>('order-staff');
  const [editAdminIsActive, setEditAdminIsActive] = useState(true);

  // My profile fields states
  const [myProfileName, setMyProfileName] = useState('');
  const [myProfileEmail, setMyProfileEmail] = useState('');

  // Synchronize my profile states when currentAdmin changes
  useEffect(() => {
    if (currentAdmin) {
      setMyProfileName(currentAdmin.name);
      setMyProfileEmail(currentAdmin.email);
    }
  }, [currentAdmin]);

  useEffect(() => {
    setSettings(loadStoreSettings());
    setAdminUsers(loadAdminUsers());
    setBrandAssets(loadBrandAssets());
  }, []);

  const getSettingValue = (key: string, def: any = '') => {
    return settings.find(s => s.key === key)?.value ?? def;
  };

  const handleUpdateSetting = (key: string, value: any) => {
    const updated = settings.map(s => {
      if (s.key === key) {
        return { ...s, value };
      }
      return s;
    });
    setSettings(updated);
    saveStoreSettings(updated);
  };

  const handleUpdateBrandAsset = (type: string, url: string, altText?: string) => {
    const updated = brandAssets.map(asset => {
      if (asset.type === type) {
        return { ...asset, url, altText: altText !== undefined ? altText : asset.altText };
      }
      return asset;
    });
    setBrandAssets(updated);
    saveBrandAssets(updated);
    // Notify all listeners
    window.dispatchEvent(new Event('brand_assets_updated'));
  };

  const handleFileUpload = (type: string, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        handleUpdateBrandAsset(type, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 1. ADD NEW ADMIN USER HANDLER
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      alert('Please fill out required fields: Name and Email Address.');
      return;
    }

    // Check if email already exists
    if (adminUsers.some(a => a.email.toLowerCase() === newAdminEmail.trim().toLowerCase())) {
      alert('An administrator with this email already exists.');
      return;
    }

    const newUser: AdminUser = {
      id: 'adm-' + Date.now(),
      name: newAdminName.trim(),
      email: newAdminEmail.trim().toLowerCase(),
      role: newAdminRole,
      isActive: true,
      lastLoginAt: 'Never logged in'
    };

    const updatedAdmins = [...adminUsers, newUser];
    setAdminUsers(updatedAdmins);
    saveAdminUsers(updatedAdmins);

    addActivityLog(
      currentAdmin?.name || 'Admin',
      currentAdmin?.role || 'super-admin',
      'Created Admin User',
      'admin_user',
      newUser.id,
      `Provisioned credentials for ${newAdminName} as ${newAdminRole.toUpperCase()}`
    );

    alert(`Credentials successfully provisioned for ${newAdminName}.`);
    setNewAdminName('');
    setNewAdminEmail('');
  };

  // 2. TOGGLE ADMIN ACTIVATION HANDLER
  const handleToggleAdminStatus = (adminId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const actionLabel = nextStatus ? 'Activated' : 'Deactivated';

    const updated = adminUsers.map(a => {
      if (a.id === adminId) {
        return { ...a, isActive: nextStatus };
      }
      return a;
    });

    setAdminUsers(updated);
    saveAdminUsers(updated);

    addActivityLog(
      currentAdmin?.name || 'Admin',
      currentAdmin?.role || 'super-admin',
      'Toggle Admin Activation',
      'admin_user',
      adminId,
      `Changed activation state of ${adminId} to ${actionLabel.toUpperCase()}`
    );

    alert(`Account successfully ${actionLabel}.`);
  };

  // 3. UPDATE CURRENT ADMIN PROFILE HANDLER
  const handleUpdateMyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;

    if (!myProfileName.trim() || !myProfileEmail.trim()) {
      alert('Please fill out Name and Email.');
      return;
    }

    const updatedUser: AdminUser = {
      ...currentAdmin,
      name: myProfileName.trim(),
      email: myProfileEmail.trim().toLowerCase()
    };

    // Update in list
    const updatedUsers = adminUsers.map(u => u.id === currentAdmin.id ? updatedUser : u);
    setAdminUsers(updatedUsers);
    saveAdminUsers(updatedUsers);

    // Save session
    localStorage.setItem('virsa_logged_admin', JSON.stringify(updatedUser));
    
    // Call parent trigger
    if (onUpdateCurrentAdmin) {
      onUpdateCurrentAdmin(updatedUser);
    }

    addActivityLog(
      updatedUser.name,
      updatedUser.role,
      'Updated Own Profile',
      'admin_user',
      updatedUser.id,
      `Updated personal profile details (Name: ${myProfileName}, Email: ${myProfileEmail})`
    );

    alert('Your profile details have been successfully updated.');
  };

  // 4. ADMIN SELECTION FOR EDITING
  const handleStartEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditAdminName(admin.name);
    setEditAdminEmail(admin.email);
    setEditAdminRole(admin.role);
    setEditAdminIsActive(admin.isActive);
  };

  const handleCancelEditAdmin = () => {
    setEditingAdmin(null);
  };

  // 5. UPDATE EXISTING ADMIN USER HANDLER
  const handleUpdateAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    if (!editAdminName.trim() || !editAdminEmail.trim()) {
      alert('Please fill out Name and Email.');
      return;
    }

    // Check email duplicates excluding self
    if (adminUsers.some(a => a.id !== editingAdmin.id && a.email.toLowerCase() === editAdminEmail.trim().toLowerCase())) {
      alert('An administrator with this email already exists.');
      return;
    }

    const updatedAdmin: AdminUser = {
      ...editingAdmin,
      name: editAdminName.trim(),
      email: editAdminEmail.trim().toLowerCase(),
      role: editAdminRole,
      isActive: editAdminIsActive
    };

    const updatedUsers = adminUsers.map(u => u.id === editingAdmin.id ? updatedAdmin : u);
    setAdminUsers(updatedUsers);
    saveAdminUsers(updatedUsers);

    // If edited self through list, update logged in state too
    if (currentAdmin && editingAdmin.id === currentAdmin.id) {
      localStorage.setItem('virsa_logged_admin', JSON.stringify(updatedAdmin));
      if (onUpdateCurrentAdmin) {
        onUpdateCurrentAdmin(updatedAdmin);
      }
    }

    addActivityLog(
      currentAdmin?.name || 'Admin',
      currentAdmin?.role || 'super-admin',
      'Updated Admin Profile',
      'admin_user',
      editingAdmin.id,
      `Modified details of ${editAdminName} (${editAdminRole.toUpperCase()})`
    );

    alert(`Successfully updated profile of ${editAdminName}.`);
    setEditingAdmin(null);
  };

  // 6. DELETE ADMIN USER HANDLER
  const handleDeleteAdmin = (adminId: string, adminName: string) => {
    if (currentAdmin && adminId === currentAdmin.id) {
      alert('You cannot delete your own logged-in administrator account.');
      return;
    }

    if (confirm(`Are you absolutely sure you want to permanently delete the administrator profile for "${adminName}"? This action is irreversible.`)) {
      const updatedUsers = adminUsers.filter(u => u.id !== adminId);
      setAdminUsers(updatedUsers);
      saveAdminUsers(updatedUsers);

      addActivityLog(
        currentAdmin?.name || 'Admin',
        currentAdmin?.role || 'super-admin',
        'Deleted Admin Profile',
        'admin_user',
        adminId,
        `Permanently removed administrator account for ${adminName}`
      );

      alert(`Account for "${adminName}" has been permanently removed.`);
    }
  };

  return (
    <div className="space-y-8 font-sans text-gray-900">
      
      {/* Tab select bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">Atelier Settings Panel</h1>
          <p className="text-xs text-gray-500 mt-1">Configure merchant gateways, shipping costs, and team clearances.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveSettingsTab('store')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeSettingsTab === 'store' ? 'bg-white shadow-xs text-[#C9A84C]' : 'text-gray-400'
            }`}
          >
            Store Info
          </button>
          <button
            onClick={() => setActiveSettingsTab('branding')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeSettingsTab === 'branding' ? 'bg-white shadow-xs text-[#C9A84C]' : 'text-gray-400'
            }`}
          >
            Branding Settings
          </button>
          <button
            onClick={() => setActiveSettingsTab('payments')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeSettingsTab === 'payments' ? 'bg-white shadow-xs text-[#C9A84C]' : 'text-gray-400'
            }`}
          >
            Payment Gateways
          </button>
          <button
            onClick={() => setActiveSettingsTab('shipping')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeSettingsTab === 'shipping' ? 'bg-white shadow-xs text-[#C9A84C]' : 'text-gray-400'
            }`}
          >
            Shipping & VAT
          </button>
          <button
            onClick={() => setActiveSettingsTab('admins')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeSettingsTab === 'admins' ? 'bg-white shadow-xs text-[#C9A84C]' : 'text-gray-400'
            }`}
          >
            Team Clearances
          </button>
        </div>
      </div>

      {/* SETTINGS 1: STORE PROFILE INFO */}
      {activeSettingsTab === 'store' && (
        <div className="space-y-6">
          {/* Store Details Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Store Profile Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Merchant Store Name</label>
                <input
                  type="text"
                  value={getSettingValue('storeName', 'VIRSA Atelier')}
                  onChange={(e) => handleUpdateSetting('storeName', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Support Helpline Phone</label>
                <input
                  type="text"
                  value={getSettingValue('supportPhone', '+880 1712-345678')}
                  onChange={(e) => handleUpdateSetting('supportPhone', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Customer Support Email</label>
                <input
                  type="email"
                  value={getSettingValue('supportEmail', 'support@virsa.com.bd')}
                  onChange={(e) => handleUpdateSetting('supportEmail', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-50">
              <button
                onClick={() => alert('Atelier configuration profile successfully saved and deployed.')}
                className="px-5 py-2.5 bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B5963E] transition cursor-pointer"
              >
                Save Store Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BRANDING SETTINGS: BRAND VISUAL ASSETS */}
      {activeSettingsTab === 'branding' && (
        <div className="space-y-6">
          {/* Brand Visual Assets Card (Logo & Favicon) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="border-b border-gray-50 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Brand Visual Identity (Logo & Favicon)</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Upload brand assets or specify dynamic image URLs. Custom logos update immediately across headers & navigation.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
              
              {/* Header Logo Upload */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700 block text-[10px] uppercase tracking-wider">Header/Navbar Logo (হেডার লোগো)</span>
                  <button 
                    type="button"
                    onClick={() => handleUpdateBrandAsset('header_logo', '')}
                    className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer flex items-center space-x-1"
                    title="Reset to default brand logo"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Reset to SVG Default</span>
                  </button>
                </div>

                <div className="flex items-start space-x-4">
                  {/* Preview box */}
                  <div className="h-16 w-32 bg-[#121212] rounded-xl border border-white/5 flex items-center justify-center overflow-hidden p-2 relative group flex-shrink-0">
                    {brandAssets.find(a => a.type === 'header_logo')?.url ? (
                      <img 
                        src={brandAssets.find(a => a.type === 'header_logo')?.url} 
                        alt="Header Logo Preview" 
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="text-[8px] font-mono font-bold text-[#C9A84C] tracking-widest">SVG DEFAULTS</span>
                      </div>
                    )}
                  </div>

                  {/* Upload details */}
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] text-gray-400">Supports PNG, JPG, SVG, or WEBP. Max 2MB. Upload a light/gold logo for the dark header.</p>
                    
                    <div className="flex items-center space-x-2">
                      <label className="px-3 py-1.5 bg-[#C9A84C]/10 border border-[#C9A84C]/20 hover:bg-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center space-x-1">
                        <Upload className="h-3 w-3" />
                        <span>Upload Logo File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('header_logo', file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Direct Logo Image URL (Alternative Link)</label>
                  <input
                    type="text"
                    value={brandAssets.find(a => a.type === 'header_logo')?.url || ''}
                    placeholder="https://example.com/logo.png"
                    onChange={(e) => handleUpdateBrandAsset('header_logo', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 font-mono text-[10px] focus:outline-none"
                  />
                </div>
              </div>

              {/* Favicon Upload */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700 block text-[10px] uppercase tracking-wider">Browser Favicon Icon (ফ্যাভিকন আইকন)</span>
                  <button 
                    type="button"
                    onClick={() => handleUpdateBrandAsset('favicon', '')}
                    className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer flex items-center space-x-1"
                    title="Reset to vector favicon"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Reset to Default</span>
                  </button>
                </div>

                <div className="flex items-start space-x-4">
                  {/* Browser Tab Preview mockup */}
                  <div className="h-16 w-32 bg-white rounded-xl border border-gray-200 flex flex-col justify-start overflow-hidden flex-shrink-0">
                    <div className="bg-gray-100 h-5 border-b border-gray-200 px-2 flex items-center space-x-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 bg-white p-2 flex items-center space-x-1.5">
                      <div className="h-4 w-4 bg-gray-50 border border-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                        {brandAssets.find(a => a.type === 'favicon')?.url ? (
                          <img 
                            src={brandAssets.find(a => a.type === 'favicon')?.url} 
                            alt="Favicon Preview" 
                            className="h-3 w-3 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-[#C9A84C]" />
                        )}
                      </div>
                      <span className="text-[8px] font-semibold text-gray-500 truncate">VIRSA Atelier...</span>
                    </div>
                  </div>

                  {/* Upload details */}
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] text-gray-400">Displayed in browser tab header. Ideal dimensions: 32x32px or 16x16px (PNG, ICO, SVG).</p>
                    
                    <div className="flex items-center space-x-2">
                      <label className="px-3 py-1.5 bg-[#C9A84C]/10 border border-[#C9A84C]/20 hover:bg-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center space-x-1">
                        <Upload className="h-3 w-3" />
                        <span>Upload Favicon File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('favicon', file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Direct Favicon Image URL (Alternative Link)</label>
                  <input
                    type="text"
                    value={brandAssets.find(a => a.type === 'favicon')?.url || ''}
                    placeholder="https://example.com/favicon.png"
                    onChange={(e) => handleUpdateBrandAsset('favicon', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 font-mono text-[10px] focus:outline-none"
                  />
                </div>
              </div>

            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-50">
              <button
                type="button"
                onClick={() => alert('Branding visual assets successfully updated and applied globally.')}
                className="px-5 py-2.5 bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B5963E] transition cursor-pointer"
              >
                Apply Visual Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS 2: PAYMENT GATEWAY credentials */}
      {activeSettingsTab === 'payments' && (
        <div className="space-y-6">
          {/* Cash On Delivery Toggle */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900 text-sm">💵 Cash on Delivery (COD)</h4>
              <p className="text-xs text-gray-400">Allows customer checkout with cash payment upon physical parcel dispatch.</p>
            </div>
            <button
              onClick={() => handleUpdateSetting('codEnabled', !getSettingValue('codEnabled', true))}
              className="text-gray-400 hover:text-gray-900 focus:outline-none"
            >
              {getSettingValue('codEnabled', true) ? (
                <ToggleRight className="h-10 w-10 text-emerald-500 cursor-pointer" />
              ) : (
                <ToggleLeft className="h-10 w-10 text-gray-300 cursor-pointer" />
              )}
            </button>
          </div>

          {/* bKash Payment Credentials */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <div className="space-y-0.5">
                <h4 className="font-bold text-gray-900 text-sm">📱 bKash Merchant API Integration</h4>
                <p className="text-xs text-gray-400">Receive online mobile payments immediately across Bangladesh.</p>
              </div>
              <button
                onClick={() => handleUpdateSetting('bkashEnabled', !getSettingValue('bkashEnabled', true))}
                className="text-gray-400 focus:outline-none"
              >
                {getSettingValue('bkashEnabled', true) ? (
                  <ToggleRight className="h-10 w-10 text-emerald-500 cursor-pointer" />
                ) : (
                  <ToggleLeft className="h-10 w-10 text-gray-300 cursor-pointer" />
                )}
              </button>
            </div>

            {getSettingValue('bkashEnabled', true) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fade-in">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">bKash App Key</label>
                  <input
                    type="password"
                    value="••••••••••••••••••••"
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">bKash App Secret</label>
                  <input
                    type="password"
                    value="••••••••••••••••••••"
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS 3: SHIPPING COSTS & VAT */}
      {activeSettingsTab === 'shipping' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Shipping Charges & VAT Ledger</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Regular Shipping Cost Inside Dhaka (৳)</label>
              <input
                type="number"
                value={getSettingValue('dhakaCost', 60)}
                onChange={(e) => handleUpdateSetting('dhakaCost', Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Regular Shipping Cost Outside Dhaka (৳)</label>
              <input
                type="number"
                value={getSettingValue('outsideCost', 120)}
                onChange={(e) => handleUpdateSetting('outsideCost', Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Free Delivery Orders Limit (৳)</label>
              <input
                type="number"
                value={getSettingValue('freeThreshold', 5000)}
                onChange={(e) => handleUpdateSetting('freeThreshold', Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Tax / VAT Percentage (%)</label>
              <input
                type="number"
                value={getSettingValue('vatPercent', 5)}
                onChange={(e) => handleUpdateSetting('vatPercent', Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50">
            <button
              onClick={() => alert('Atelier shipping matrices and tax models compiled successfully.')}
              className="px-5 py-2.5 bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B5963E] transition cursor-pointer"
            >
              Compile Shipping Specs
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS 4: TEAM CLEARANCE (ADMIN USER CRUD) */}
      {activeSettingsTab === 'admins' && (
        <div className="space-y-8">
          
          {/* MY PROFILE SECTION */}
          {currentAdmin && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-50 rounded-lg text-[#C9A84C]">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">আমার প্রোফাইল (My Admin Profile)</h3>
                    <p className="text-[10px] text-gray-400">আপনার নিজস্ব অ্যাডমিন নাম ও ইমেইল পরিবর্তন করুন।</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-[#C9A84C]/10 text-[#C9A84C] rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold">
                  Role: {currentAdmin.role}
                </span>
              </div>

              <form onSubmit={handleUpdateMyProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">My Full Name</label>
                  <input
                    type="text"
                    required
                    value={myProfileName}
                    onChange={(e) => setMyProfileName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] font-semibold text-gray-800"
                    placeholder="E.g. Jamal Chowdhury"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">My Registered Email</label>
                  <input
                    type="email"
                    required
                    value={myProfileEmail}
                    onChange={(e) => setMyProfileEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] font-mono text-gray-700"
                    placeholder="E.g. jamalsujan3@gmail.com"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#C9A84C] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#B5963E] transition cursor-pointer flex items-center space-x-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Update My Profile</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TEAM MEMBERS & OTHER CLEARANCES SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Block: Create OR Edit Form (5 cols) */}
            <div className="xl:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  {editingAdmin ? 'Edit Team Member Profile' : 'Invite New Team Member'}
                </h3>
                {editingAdmin && (
                  <button
                    onClick={handleCancelEditAdmin}
                    className="text-xs text-rose-500 hover:underline flex items-center space-x-1 cursor-pointer font-bold"
                  >
                    <X className="h-3 w-3" />
                    <span>Cancel Edit</span>
                  </button>
                )}
              </div>

              {editingAdmin ? (
                /* EDIT ADMIN PROFILE FORM */
                <form onSubmit={handleUpdateAdminProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">Profile Name</label>
                    <input
                      type="text"
                      required
                      value={editAdminName}
                      onChange={(e) => setEditAdminName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">Helpline Email</label>
                    <input
                      type="email"
                      required
                      value={editAdminEmail}
                      onChange={(e) => setEditAdminEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">Atelier Clearance Level</label>
                    <select
                      value={editAdminRole}
                      onChange={(e: any) => setEditAdminRole(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] font-medium"
                    >
                      <option value="super-admin">Super Admin (Level 1 - Unlimited Control)</option>
                      <option value="manager">Manager (Level 2 - Catalog & Fulfillment)</option>
                      <option value="order-staff">Order Staff (Level 3 - Dispatch & Tracking)</option>
                      <option value="support">Support Agent (Level 4 - Helpdesk & Inquiries)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">Clearance Status</label>
                    <div className="flex items-center space-x-3 mt-1">
                      <button
                        type="button"
                        onClick={() => setEditAdminIsActive(true)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          editAdminIsActive 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}
                      >
                        Clear (Authorized)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditAdminIsActive(false)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          !editAdminIsActive 
                            ? 'bg-rose-50 border-rose-200 text-rose-600' 
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}
                      >
                        Banned (Suspended)
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B5963E] transition cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* CREATE NEW TEAM MEMBER FORM */
                <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">Name Profile</label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C]"
                      placeholder="Rafiq Chowdhury"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">Helpline Email</label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] font-mono"
                      placeholder="rafiq@virsa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">Atelier Role Clearance</label>
                    <select
                      value={newAdminRole}
                      onChange={(e: any) => setNewAdminRole(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="super-admin">Super Admin (Clearance Level 1)</option>
                      <option value="manager">Manager (Clearance Level 2)</option>
                      <option value="order-staff">Order Staff (Fulfillment Level 3)</option>
                      <option value="support">Support Agent (Read-only Helpdesk)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B5963E] transition cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Provision Credentials</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Block: Active Users List (7 cols) */}
            <div className="xl:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Active Atelier Clearances</h3>
              <div className="space-y-3 text-xs">
                {adminUsers.map((a) => (
                  <div key={a.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gray-200 transition">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">{a.name}</span>
                        {currentAdmin && a.id === currentAdmin.id && (
                          <span className="bg-amber-100 text-[#C9A84C] text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">You</span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400">{a.email}</div>
                      <div className="text-[9px] uppercase font-mono tracking-widest font-bold text-[#C9A84C] mt-1">{a.role}</div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono tracking-wider ${
                        a.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {a.isActive ? 'Clear' : 'Banned'}
                      </span>
                      
                      <div className="flex items-center space-x-3 text-[10px] font-bold font-mono uppercase tracking-wider mt-1">
                        {/* Edit admin details button */}
                        <button
                          type="button"
                          onClick={() => handleStartEditAdmin(a)}
                          className="text-[#C9A84C] hover:underline cursor-pointer flex items-center space-x-0.5"
                          title="Edit administrator details"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </button>

                        {/* Ban / Authorize status toggling */}
                        {(!currentAdmin || a.id !== currentAdmin.id) && a.email !== 'jamalsujan3@gmail.com' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleAdminStatus(a.id, a.isActive)}
                              className={`cursor-pointer hover:underline ${
                                a.isActive ? 'text-amber-600' : 'text-emerald-600'
                              }`}
                            >
                              {a.isActive ? 'Suspend' : 'Clear'}
                            </button>

                            {/* Permanently delete administrator */}
                            <button
                              type="button"
                              onClick={() => handleDeleteAdmin(a.id, a.name)}
                              className="text-rose-600 hover:underline cursor-pointer"
                              title="Delete profile permanently"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
