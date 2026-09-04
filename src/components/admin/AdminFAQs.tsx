import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, HelpCircle, Filter, Check, X, 
  ChevronDown, ChevronUp, Sparkles, AlertCircle, RefreshCw,
  Droplets, Scissors, Truck, Info, Layers, Heart
} from 'lucide-react';
import { 
  FAQItem, loadFAQItems, saveFAQItems, addActivityLog, AdminUser,
  FAQCategory, loadFAQCategories, saveFAQCategories
} from '../../lib/adminData';

interface AdminFAQsProps {
  currentAdmin: AdminUser | null;
}

const getIconComponent = (name?: string) => {
  switch (name) {
    case 'Droplets': return Droplets;
    case 'Scissors': return Scissors;
    case 'Truck': return Truck;
    case 'HelpCircle': return HelpCircle;
    case 'Info': return Info;
    case 'Layers': return Layers;
    case 'Heart': return Heart;
    default: return HelpCircle;
  }
};

const selectableIcons = ['Droplets', 'Scissors', 'Truck', 'HelpCircle', 'Info', 'Layers', 'Heart'];
const selectableColors = [
  { label: 'Blue', value: 'text-blue-500 bg-blue-50' },
  { label: 'Purple', value: 'text-purple-500 bg-purple-50' },
  { label: 'Amber', value: 'text-amber-500 bg-amber-50' },
  { label: 'Emerald', value: 'text-emerald-500 bg-emerald-50' },
  { label: 'Rose', value: 'text-rose-500 bg-rose-50' },
  { label: 'Indigo', value: 'text-indigo-500 bg-indigo-50' },
  { label: 'Slate', value: 'text-slate-600 bg-slate-50' }
];

export default function AdminFAQs({ currentAdmin }: AdminFAQsProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [faqSubTab, setFaqSubTab] = useState<'faqs' | 'categories'>('faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Create / Edit FAQ states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [catId, setCatId] = useState('fabric');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [formError, setFormError] = useState('');

  // Create / Edit Category states
  const [isCatFormOpen, setIsCatFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [catSlug, setCatSlug] = useState('');
  const [catTitle, setCatTitle] = useState('');
  const [catIconName, setCatIconName] = useState('HelpCircle');
  const [catColor, setCatColor] = useState('text-blue-500 bg-blue-50');
  const [catError, setCatError] = useState('');

  useEffect(() => {
    setFaqs(loadFAQItems());
    setCategories(loadFAQCategories());
  }, []);

  const triggerLiveUpdate = (updatedFaqs: FAQItem[]) => {
    setFaqs(updatedFaqs);
    saveFAQItems(updatedFaqs);
    // Dispatch custom event to notify front-end FAQs component
    window.dispatchEvent(new CustomEvent('virsa_faqs_updated'));
  };

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setCatId('fabric');
    // Set next display order for chosen category
    const count = faqs.filter(f => f.catId === 'fabric').length;
    setDisplayOrder(count + 1);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (faq: FAQItem) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCatId(faq.catId);
    setDisplayOrder(faq.displayOrder || 1);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFaq(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!question.trim() || !answer.trim()) {
      setFormError('Please fill out both the question and answer.');
      return;
    }

    if (editingFaq) {
      // Edit mode
      const updated = faqs.map(f => {
        if (f.id === editingFaq.id) {
          return {
            ...f,
            question: question.trim(),
            answer: answer.trim(),
            catId,
            displayOrder: Number(displayOrder) || 1
          };
        }
        return f;
      });
      triggerLiveUpdate(updated);

      addActivityLog(
        currentAdmin?.name || 'Admin',
        currentAdmin?.role || 'super-admin',
        'Updated FAQ Item',
        'faq',
        editingFaq.id,
        `Updated FAQ item question: "${question.substring(0, 40)}..." in category "${catId}"`
      );

      alert('FAQ item updated successfully.');
    } else {
      // Create mode
      const newFaq: FAQItem = {
        id: 'faq-' + Date.now(),
        question: question.trim(),
        answer: answer.trim(),
        catId,
        displayOrder: Number(displayOrder) || 1
      };

      const updated = [...faqs, newFaq];
      triggerLiveUpdate(updated);

      addActivityLog(
        currentAdmin?.name || 'Admin',
        currentAdmin?.role || 'super-admin',
        'Created FAQ Item',
        'faq',
        newFaq.id,
        `Created new FAQ item: "${question.substring(0, 40)}..." in category "${catId}"`
      );

      alert('New FAQ item created successfully.');
    }

    setIsFormOpen(false);
    setEditingFaq(null);
  };

  const handleDelete = (id: string, qText: string) => {
    if (confirm(`Are you sure you want to delete this FAQ item?\n\n"${qText.substring(0, 60)}..."`)) {
      const updated = faqs.filter(f => f.id !== id);
      triggerLiveUpdate(updated);

      addActivityLog(
        currentAdmin?.name || 'Admin',
        currentAdmin?.role || 'super-admin',
        'Deleted FAQ Item',
        'faq',
        id,
        `Deleted FAQ item question: "${qText.substring(0, 40)}..."`
      );

      alert('FAQ item deleted successfully.');
    }
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const sortedFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < sortedFaqs.length) {
      // Swap displayOrder values
      const tempOrder = sortedFaqs[index].displayOrder;
      sortedFaqs[index].displayOrder = sortedFaqs[targetIndex].displayOrder;
      sortedFaqs[targetIndex].displayOrder = tempOrder;

      // Also swap position in list
      const temp = sortedFaqs[index];
      sortedFaqs[index] = sortedFaqs[targetIndex];
      sortedFaqs[targetIndex] = temp;

      triggerLiveUpdate(sortedFaqs);
    }
  };

  const triggerCategoryLiveUpdate = (updatedCats: FAQCategory[]) => {
    setCategories(updatedCats);
    saveFAQCategories(updatedCats);
    window.dispatchEvent(new CustomEvent('virsa_faqs_updated'));
  };

  const handleOpenCatCreate = () => {
    setEditingCategory(null);
    setCatSlug('');
    setCatTitle('');
    setCatIconName('HelpCircle');
    setCatColor('text-blue-500 bg-blue-50');
    setCatError('');
    setIsCatFormOpen(true);
  };

  const handleOpenCatEdit = (cat: FAQCategory) => {
    setEditingCategory(cat);
    setCatSlug(cat.id);
    setCatTitle(cat.title);
    setCatIconName(cat.iconName || 'HelpCircle');
    setCatColor(cat.color || 'text-blue-500 bg-blue-50');
    setCatError('');
    setIsCatFormOpen(true);
  };

  const handleCloseCatForm = () => {
    setIsCatFormOpen(false);
    setEditingCategory(null);
  };

  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');

    const trimmedSlug = catSlug.trim().toLowerCase().replace(/\s+/g, '-');
    const trimmedTitle = catTitle.trim();

    if (!trimmedSlug || !trimmedTitle) {
      setCatError('Slug (ID) and Title are required.');
      return;
    }

    if (editingCategory) {
      const updated = categories.map(c => {
        if (c.id === editingCategory.id) {
          return {
            ...c,
            title: trimmedTitle,
            iconName: catIconName,
            color: catColor
          };
        }
        return c;
      });

      triggerCategoryLiveUpdate(updated);

      addActivityLog(
        currentAdmin?.name || 'Admin',
        currentAdmin?.role || 'super-admin',
        'Updated FAQ Category',
        'faq_category',
        editingCategory.id,
        `Updated FAQ category title to "${trimmedTitle}"`
      );

      alert('FAQ Category updated successfully.');
      setEditingCategory(null);
      setIsCatFormOpen(false);
    } else {
      if (categories.some(c => c.id === trimmedSlug)) {
        setCatError('A category with this ID/Slug already exists.');
        return;
      }

      const newCat: FAQCategory = {
        id: trimmedSlug,
        title: trimmedTitle,
        iconName: catIconName,
        color: catColor
      };

      const updated = [...categories, newCat];
      triggerCategoryLiveUpdate(updated);

      addActivityLog(
        currentAdmin?.name || 'Admin',
        currentAdmin?.role || 'super-admin',
        'Created FAQ Category',
        'faq_category',
        trimmedSlug,
        `Created FAQ category "${trimmedTitle}"`
      );

      alert('New FAQ Category created successfully.');
      setIsCatFormOpen(false);
    }

    setCatSlug('');
    setCatTitle('');
  };

  const handleCatDelete = (cat: FAQCategory) => {
    const faqCountInCat = faqs.filter(f => f.catId === cat.id).length;
    let confirmMsg = `Are you absolutely sure you want to delete the category "${cat.title}"?`;
    if (faqCountInCat > 0) {
      confirmMsg += `\n\nWarning: There are ${faqCountInCat} FAQ items in this category. They will be automatically reassigned to the "general" category.`;
    }

    if (confirm(confirmMsg)) {
      const updatedFaqs = faqs.map(f => {
        if (f.catId === cat.id) {
          return { ...f, catId: 'general' };
        }
        return f;
      });

      const updatedCats = categories.filter(c => c.id !== cat.id);

      triggerLiveUpdate(updatedFaqs);
      triggerCategoryLiveUpdate(updatedCats);

      addActivityLog(
        currentAdmin?.name || 'Admin',
        currentAdmin?.role || 'super-admin',
        'Deleted FAQ Category',
        'faq_category',
        cat.id,
        `Deleted FAQ category "${cat.title}"`
      );

      alert(`Category "${cat.title}" deleted successfully.`);
    }
  };

  // Filter and sort FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || faq.catId === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Sort by Category first, then by Display Order
    if (a.catId !== b.catId) {
      return a.catId.localeCompare(b.catId);
    }
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-[#C9A84C]/10 rounded-lg text-[#C9A84C]">
              <HelpCircle className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold font-serif text-gray-900 tracking-wide uppercase">
              FAQ Content Management
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            গ্রাহকদের জন্য ফ্রিকোয়েন্টলি আস্কড কোশ্চেনস (FAQ) এবং ক্যাটাগরি যোগ, সংশোধন ও মুছে ফেলুন।
          </p>
        </div>

        {faqSubTab === 'faqs' ? (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B5963E] transition cursor-pointer flex items-center justify-center space-x-2 self-start sm:self-center"
          >
            <Plus className="h-4 w-4" />
            <span>Add New FAQ</span>
          </button>
        ) : (
          <button
            onClick={handleOpenCatCreate}
            className="px-4 py-2.5 bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B5963E] transition cursor-pointer flex items-center justify-center space-x-2 self-start sm:self-center"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Category</span>
          </button>
        )}
      </div>

      {/* Sub tabs switcher */}
      <div className="flex border-b border-gray-100 space-x-4 bg-white px-6 py-2 rounded-xl shadow-xs border border-gray-100">
        <button
          onClick={() => { setFaqSubTab('faqs'); setIsFormOpen(false); setIsCatFormOpen(false); }}
          className={`py-2 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
            faqSubTab === 'faqs' 
              ? 'border-[#C9A84C] text-[#C9A84C]' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Manage FAQs (প্রশ্ন ও উত্তর)
        </button>
        <button
          onClick={() => { setFaqSubTab('categories'); setIsFormOpen(false); setIsCatFormOpen(false); }}
          className={`py-2 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
            faqSubTab === 'categories' 
              ? 'border-[#C9A84C] text-[#C9A84C]' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Manage Categories (ক্যাটাগরি কাস্টমাইজেশন)
        </button>
      </div>

      {/* Main Content Area */}
      {faqSubTab === 'faqs' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left column: FAQ List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Controls: Search and Filter */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search FAQs by question or answer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#C9A84C] font-semibold"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
                  <Filter className="h-3 w-3" />
                  <span>Filter:</span>
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none font-medium"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List items */}
            <div className="space-y-3">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => {
                  const catInfo = categories.find(c => c.id === faq.catId) || {
                    id: 'general',
                    title: 'General Inquiries',
                    iconName: 'HelpCircle',
                    color: 'text-gray-500 bg-gray-50'
                  };
                  const CatIcon = getIconComponent(catInfo.iconName);
                  return (
                    <div 
                      key={faq.id} 
                      className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs hover:shadow-sm hover:border-gray-200 transition relative group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          
                          {/* Category badge */}
                          <div className="flex items-center space-x-1.5">
                            <span className={`p-1 rounded-md ${catInfo.color}`}>
                              <CatIcon className="h-3 w-3" />
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                              {catInfo.title}
                            </span>
                            <span className="text-[8px] font-mono text-gray-300 font-bold bg-gray-50 px-1.5 py-0.5 rounded-sm">
                              Order: {faq.displayOrder}
                            </span>
                          </div>

                          {/* Question */}
                          <h4 className="font-serif text-sm font-bold text-gray-900 leading-snug">
                            {faq.question}
                          </h4>

                          {/* Answer */}
                          <p className="text-xs text-gray-500 leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-dashed border-gray-100 font-sans">
                            {faq.answer}
                          </p>
                        </div>

                        {/* Side Controls */}
                        <div className="flex flex-col items-center space-y-2 opacity-80 group-hover:opacity-100 transition">
                          
                          {/* Reordering indicators */}
                          <div className="flex flex-col rounded-md border border-gray-100 bg-gray-50/50">
                            <button
                              onClick={() => handleMoveOrder(index, 'up')}
                              disabled={index === 0}
                              className={`p-1 hover:text-[#C9A84C] transition ${index === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500'}`}
                              title="Move Up"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleMoveOrder(index, 'down')}
                              disabled={index === filteredFaqs.length - 1}
                              className={`p-1 hover:text-[#C9A84C] transition ${index === filteredFaqs.length - 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500'}`}
                              title="Move Down"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(faq)}
                            className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 hover:text-amber-700 transition"
                            title="Edit FAQ"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(faq.id, faq.question)}
                            className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition"
                            title="Delete FAQ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white p-12 rounded-xl border border-gray-100 text-center space-y-2">
                  <HelpCircle className="h-12 w-12 text-gray-200 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-800">No FAQ items matched your criteria.</h4>
                  <p className="text-xs text-gray-400">সব ক্যাটাগরি দেখতে অথবা নতুন কোশ্চেন যোগ করতে অ্যাডমিন ফর্ম ব্যবহার করুন।</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Manage Sidebar Form (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-6 space-y-4">
              
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-amber-50 text-[#C9A84C] rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-gray-900">
                    {editingFaq ? 'Edit Selected FAQ' : 'Create New FAQ'}
                  </h3>
                </div>
                
                {editingFaq && (
                  <button
                    onClick={handleCloseForm}
                    className="text-xs text-rose-500 hover:underline flex items-center space-x-1 cursor-pointer font-bold"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{formError}</span>
                  </div>
                )}

                {/* FAQ Question */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                    FAQ Question (প্রশ্ন)
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] font-semibold text-gray-800 leading-relaxed"
                    placeholder="E.g. What is the Atelier Perfect Fit Guarantee?"
                  />
                </div>

                {/* FAQ Answer */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                    FAQ Answer (উত্তর)
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] text-gray-700 leading-relaxed font-medium"
                    placeholder="Explain details thoroughly..."
                  />
                </div>

                {/* FAQ Category */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                    Category Clearance (ক্যাটাগরি)
                  </label>
                  <select
                    value={catId}
                    onChange={(e) => {
                      setCatId(e.target.value);
                      // Dynamically set order count
                      const count = faqs.filter(f => f.catId === e.target.value).length;
                      setDisplayOrder(count + 1);
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                    Display Order (অবস্থান নম্বর)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value) || 1)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] font-semibold text-gray-800"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block leading-relaxed">
                    The smaller the number, the higher the position this item will appear in its category.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B5963E] transition cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Check className="h-4 w-4" />
                  <span>{editingFaq ? 'Update FAQ Item' : 'Publish FAQ Item'}</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Category list */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Active FAQ Categories
              </h3>
              
              <div className="space-y-3">
                {categories.length > 0 ? (
                  categories.map((cat) => {
                    const CatIcon = getIconComponent(cat.iconName);
                    const count = faqs.filter(f => f.catId === cat.id).length;
                    return (
                      <div 
                        key={cat.id} 
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:shadow-sm hover:border-gray-200 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`p-2 rounded-lg ${cat.color || 'text-gray-500 bg-gray-50'}`}>
                            <CatIcon className="h-4 w-4" />
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                              {cat.title}
                              <span className="text-[9px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                ID: {cat.id}
                              </span>
                            </h4>
                            <p className="text-[10px] text-gray-400">
                              {count} questions mapped in this category
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 opacity-80 group-hover:opacity-100 transition">
                          {/* Edit Category */}
                          <button
                            onClick={() => handleOpenCatEdit(cat)}
                            className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 hover:text-amber-700 transition"
                            title="Edit Category"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          {/* Delete Category */}
                          <button
                            onClick={() => handleCatDelete(cat)}
                            className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition"
                            title="Delete Category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    No categories found. Click Add New Category to create one.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Category Form */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-6 space-y-4">
              
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-amber-50 text-[#C9A84C] rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-gray-900">
                    {editingCategory ? 'Edit Selected Category' : 'Create New Category'}
                  </h3>
                </div>
                
                {editingCategory && (
                  <button
                    onClick={handleCloseCatForm}
                    className="text-xs text-rose-500 hover:underline flex items-center space-x-1 cursor-pointer font-bold"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleCatSubmit} className="space-y-4 text-xs">
                {catError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{catError}</span>
                  </div>
                )}

                {/* Category ID / Slug */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                    Category ID / Slug (একক আইডি)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCategory}
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] font-semibold text-gray-800 disabled:opacity-50"
                    placeholder="e.g. materials, accessories"
                  />
                  {!editingCategory && (
                    <span className="text-[9px] text-gray-400 mt-1 block">
                      This will be used internally (lowercase, e.g. "materials"). Cannot be changed later.
                    </span>
                  )}
                </div>

                {/* Category Title */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                    Category Title (বাংলা/ইংরেজি শিরোনাম)
                  </label>
                  <input
                    type="text"
                    required
                    value={catTitle}
                    onChange={(e) => setCatTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] font-semibold text-gray-800"
                    placeholder="e.g. Heritage Materials & Weaves"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                    Select Display Icon (আইকন)
                  </label>
                  <select
                    value={catIconName}
                    onChange={(e) => setCatIconName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] font-semibold"
                  >
                    {selectableIcons.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                {/* Color Scheme Selection */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                    Color Theme Accent (রং পছন্দ করুন)
                  </label>
                  <select
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C9A84C] font-semibold"
                  >
                    {selectableColors.map(col => (
                      <option key={col.value} value={col.value}>{col.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B5963E] transition cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Check className="h-4 w-4" />
                  <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
