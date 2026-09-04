import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit3, MapPin, Phone, Clock, Navigation, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Showroom } from '../../types';
import { addActivityLog } from '../../lib/adminData';

interface AdminLocationsProps {
  showrooms: Showroom[];
  setShowrooms: React.Dispatch<React.SetStateAction<Showroom[]>>;
  currentAdmin: { name: string; role: string };
}

export default function AdminLocations({ showrooms, setShowrooms, currentAdmin }: AdminLocationsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [mapUrl, setMapUrl] = useState('');

  const handleEditInit = (store: Showroom) => {
    setEditingShowroom(store);
    setName(store.name);
    setAddress(store.address);
    setPhone(store.phone);
    setHours(store.hours);
    setMapUrl(store.mapUrl || '');
    setIsFormOpen(true);
  };

  const handleSaveShowroom = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !address.trim() || !phone.trim() || !hours.trim()) {
      alert('Please fill out all required fields: Title, Address, Phone, and Active Time.');
      return;
    }

    const updatedShowroom: Showroom = {
      id: editingShowroom ? editingShowroom.id : 'sr-' + Date.now(),
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      hours: hours.trim(),
      mapUrl: mapUrl.trim() ? mapUrl.trim() : undefined,
    };

    if (editingShowroom) {
      setShowrooms(prev => prev.map(s => s.id === editingShowroom.id ? updatedShowroom : s));
      addActivityLog(
        currentAdmin.name,
        currentAdmin.role,
        'Edited Location',
        'showroom',
        updatedShowroom.id,
        `Modified showroom details for ${updatedShowroom.name}`
      );
      alert(`Showroom "${updatedShowroom.name}" updated successfully.`);
    } else {
      setShowrooms(prev => [...prev, updatedShowroom]);
      addActivityLog(
        currentAdmin.name,
        currentAdmin.role,
        'Created Location',
        'showroom',
        updatedShowroom.id,
        `Created new showroom flagship location ${updatedShowroom.name}`
      );
      alert(`Showroom "${updatedShowroom.name}" added successfully.`);
    }

    // Reset State
    setIsFormOpen(false);
    setEditingShowroom(null);
    setName('');
    setAddress('');
    setPhone('');
    setHours('');
    setMapUrl('');
  };

  const handleDeleteShowroom = (showroomEvt: Showroom) => {
    if (confirm(`Are you sure you want to delete showroom flagship "${showroomEvt.name}"?`)) {
      setShowrooms(prev => prev.filter(s => s.id !== showroomEvt.id));
      addActivityLog(
        currentAdmin.name,
        currentAdmin.role,
        'Deleted Location',
        'showroom',
        showroomEvt.id,
        `Removed showroom location "${showroomEvt.name}"`
      );
      alert('Showroom removed successfully.');
    }
  };

  const filteredShowrooms = showrooms.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans text-gray-900">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">VRS Showrooms & Flagship Locations</h1>
          <p className="text-xs text-gray-500 mt-1">Add, edit, or decommission physical ateliers and brand experiences.</p>
        </div>
        <button
          onClick={() => {
            setEditingShowroom(null);
            setName('');
            setAddress('');
            setPhone('');
            setHours('');
            setMapUrl('');
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#C9A84C] hover:bg-[#B5963E] rounded-xl transition cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Showroom</span>
        </button>
      </div>

      {/* Info Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
        <Info className="h-5 w-5 shrink-0 text-amber-400" />
        <div className="space-y-1">
          <p className="font-semibold">Bespoke Storefront Display Notice</p>
          <p className="text-gray-400">
            Showroom changes made in this module are instantly propagated to the storefront locator section on the homepage, allowing patrons to query hours and fetch directions seamlessly.
          </p>
        </div>
      </div>

      {/* Editor Modal / Form Container */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-xl transition-all">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-gray-900">
              {editingShowroom ? 'Edit Flagship Showroom' : 'Add New Flagship Showroom'}
            </h3>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditingShowroom(null);
              }}
              className="text-xs text-gray-500 hover:text-black font-semibold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveShowroom} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-gray-500 tracking-wider block font-bold">
                  Showroom Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Banani Noblesse Flagroom"
                  className="w-full text-xs font-mono border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-gray-500 tracking-wider block font-bold">
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +880 1711-223344"
                  className="w-full text-xs font-mono border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-gray-500 tracking-wider block font-bold">
                Showroom Physical Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. House 45, Road 11, Block G, Banani, Dhaka"
                className="w-full text-xs font-mono border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-gray-500 tracking-wider block font-bold">
                  Active Hours / timing *
                </label>
                <input
                  type="text"
                  required
                  value={hours}
                  onChange={e => setHours(e.target.value)}
                  placeholder="e.g. 11:00 AM - 09:30 PM (Closed on Thursday)"
                  className="w-full text-xs font-mono border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-gray-500 tracking-wider block font-bold">
                  Google Maps Direction URL (Optional)
                </label>
                <input
                  type="url"
                  value={mapUrl}
                  onChange={e => setMapUrl(e.target.value)}
                  placeholder="e.g. https://maps.app.goo.gl/..."
                  className="w-full text-xs font-mono border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingShowroom(null);
                }}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#C9A84C] hover:bg-[#B5963E] rounded-xl transition cursor-pointer"
              >
                {editingShowroom ? 'Update Showroom' : 'Establish Showroom'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main content grid: Search and list */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search ateliers by name or address..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-10 py-3 text-xs focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        {filteredShowrooms.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No flagship showrooms match your current criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShowrooms.map(store => (
              <div
                key={store.id}
                className="border border-gray-100 hover:border-[#C9A84C]/30 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:shadow-xs transition-all bg-gray-50/30"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-semibold bg-white px-2 py-0.5 border border-gray-100 rounded-md">
                      ID: {store.id}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditInit(store)}
                        className="p-1.5 text-gray-500 hover:text-[#C9A84C] hover:bg-white rounded border border-transparent hover:border-gray-100 transition cursor-pointer"
                        title="Edit Location"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteShowroom(store)}
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-white rounded border border-transparent hover:border-gray-100 transition cursor-pointer"
                        title="Decommission Location"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif text-base font-bold text-gray-900 tracking-wide">
                    {store.name}
                  </h3>

                  <div className="space-y-1.5 text-xs text-gray-600 leading-relaxed text-left">
                    <p className="flex items-start">
                      <MapPin className="h-3.5 w-3.5 text-[#C9A84C] mr-2 shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </p>
                    <p className="flex items-center">
                      <Phone className="h-3.5 w-3.5 text-[#C9A84C] mr-2 shrink-0" />
                      <span>{store.phone}</span>
                    </p>
                    <p className="flex items-center">
                      <Clock className="h-3.5 w-3.5 text-[#C9A84C] mr-2 shrink-0" />
                      <span>{store.hours}</span>
                    </p>
                    {store.mapUrl && (
                      <p className="flex items-center truncate text-[11px] text-gray-400 font-mono">
                        <Navigation className="h-3.5 w-3.5 text-[#C9A84C] mr-2 shrink-0" />
                        <span className="truncate">{store.mapUrl}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Atelier Location Status: Active</span>
                  <a
                    href={store.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#C9A84C] hover:underline font-semibold"
                  >
                    <span>View Map Directions</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
