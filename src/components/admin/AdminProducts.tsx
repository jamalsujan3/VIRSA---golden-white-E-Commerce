import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit3, Eye, Filter, AlertTriangle, Layers, Folder, Clipboard, Image as ImageIcon, CheckCircle, HelpCircle } from 'lucide-react';
import { Product, Variant, ColorSwatch } from '../../types';
import { addActivityLog, loadCMSCategories, saveCMSCategories, CMSCategory } from '../../lib/adminData';

interface AdminProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currentAdmin: { name: string; role: string };
}

export default function AdminProducts({ products, setProducts, currentAdmin }: AdminProductsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'add' | 'categories' | 'inventory'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');

  // Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 1. ADD / EDIT PRODUCT FORM STATE
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<'panjabi' | 'koti' | 'sherwani' | 'jubbah' | 'kabli' | 'pajama' | 'kids'>('panjabi');
  const [price, setPrice] = useState(0);
  const [compareAtPrice, setCompareAtPrice] = useState(0);
  const [imageUrl1, setImageUrl1] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  const [tags, setTags] = useState('new-arrival');
  const [material, setMaterial] = useState('100% Egyptian Cotton');
  const [careInstructions, setCareInstructions] = useState('Dry clean recommended');
  
  // Matrix Stock States
  const [stockS, setStockS] = useState(10);
  const [stockM, setStockM] = useState(15);
  const [stockL, setStockL] = useState(12);
  const [stockXL, setStockXL] = useState(8);
  const [stockXXL, setStockXXL] = useState(5);

  const [selectedColor, setSelectedColor] = useState<ColorSwatch>({ name: 'Midnight Onyx', hex: '#0D0D0D' });

  // 2. CATEGORY CRUD STATE
  const [categories, setCategories] = useState<CMSCategory[]>(() => loadCMSCategories());
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState<string>('none');

  // 3. FILTERED PRODUCTS LIST
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      
      let matchesStock = true;
      const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
      if (stockStatus === 'out') {
        matchesStock = totalStock === 0;
      } else if (stockStatus === 'low') {
        matchesStock = totalStock > 0 && totalStock < 10;
      } else if (stockStatus === 'in') {
        matchesStock = totalStock >= 10;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockStatus]);

  // 4. INVENTORY ALERTS (Stock < 10)
  const lowStockProducts = useMemo(() => {
    return products.filter(p => {
      const total = p.variants.reduce((sum, v) => sum + v.stock, 0);
      return total < 10;
    });
  }, [products]);

  // Initialize form fields for editing
  const handleEditInit = (prod: Product) => {
    setEditingProduct(prod);
    setTitle(prod.name);
    setDescription(prod.description);
    setSku(prod.sku);
    setCategory(prod.category);
    setPrice(prod.price);
    setCompareAtPrice(prod.compareAtPrice || 0);
    setImageUrl1(prod.images[0]?.url || '');
    setImageUrl2(prod.images[1]?.url || '');
    setTags(prod.tags.join(', '));
    setMaterial(prod.fabricDetails?.material || '');
    setCareInstructions(prod.fabricDetails?.care?.join(', ') || '');
    
    // Extract stock metrics
    const getStock = (size: string) => prod.variants.find(v => v.size === size)?.stock || 0;
    setStockS(getStock('S'));
    setStockM(getStock('M'));
    setStockL(getStock('L'));
    setStockXL(getStock('XL'));
    setStockXXL(getStock('XXL'));

    setActiveSubTab('add');
  };

  // 5. SAVE / UPDATE PRODUCT HANDLER
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !sku || price <= 0) {
      alert('Please fill out required fields: Title, SKU, and Price.');
      return;
    }

    // Prepare generated variants matrix matching state sizes
    const generatedVariants: Variant[] = [
      { size: 'S', color: selectedColor, stock: stockS, sku: `${sku}-S` },
      { size: 'M', color: selectedColor, stock: stockM, sku: `${sku}-M` },
      { size: 'L', color: selectedColor, stock: stockL, sku: `${sku}-L` },
      { size: 'XL', color: selectedColor, stock: stockXL, sku: `${sku}-XL` },
      { size: 'XXL', color: selectedColor, stock: stockXXL, sku: `${sku}-XXL` }
    ];

    const generatedImages = [
      { url: imageUrl1 || 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop', alt: title, isPrimary: true },
      ...(imageUrl2 ? [{ url: imageUrl2, alt: `${title} Detail`, isPrimary: false }] : [])
    ];

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : 'prod-' + Date.now(),
      name: title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      sku: sku,
      category: category,
      description: description,
      fabricDetails: {
        material: material,
        care: careInstructions.split(',').map(s => s.trim())
      },
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      variants: generatedVariants,
      images: generatedImages,
      tags: tags.split(',').map(t => t.trim()),
      ratings: editingProduct ? editingProduct.ratings : { average: 5, count: 1 },
      reviews: editingProduct ? editingProduct.reviews : [],
      isActive: true,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProduct : p));
      addActivityLog(currentAdmin.name, currentAdmin.role, 'Edited Product', 'product', newProduct.id, `Modified catalog info for ${title}`);
      alert(`Product ${title} updated successfully.`);
    } else {
      setProducts(prev => [newProduct, ...prev]);
      addActivityLog(currentAdmin.name, currentAdmin.role, 'Created Product', 'product', newProduct.id, `Added new garment ${title} to catalog`);
      alert(`Product ${title} created successfully.`);
    }

    // Reset Form
    setEditingProduct(null);
    setTitle('');
    setDescription('');
    setSku('');
    setPrice(0);
    setCompareAtPrice(0);
    setImageUrl1('');
    setImageUrl2('');
    setActiveSubTab('list');
  };

  // Delete product (Soft delete)
  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to deactivate and remove this product from the storefront?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      addActivityLog(currentAdmin.name, currentAdmin.role, 'Deleted Product', 'product', productId, 'Deactivated catalog entry');
      alert('Product deactivated successfully.');
    }
  };

  // Add category Handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: CMSCategory = {
      id: 'cat-' + Date.now(),
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      parentId: newCatParent === 'none' ? null : newCatParent,
      displayOrder: categories.length + 1,
      isActive: true,
      showInNavigation: true,
      showInHomepageGrid: false
    };

    const updated = [...categories, newCat];
    setCategories(updated);
    saveCMSCategories(updated);
    setNewCatName('');
    setNewCatParent('none');
    alert(`Category ${newCat.name} created successfully.`);
  };

  return (
    <div className="space-y-8 font-sans text-gray-900">
      
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-2">
        <div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-[#0A0A0A]">Catalog & Inventory</h1>
          <p className="text-xs text-gray-500 font-sans mt-1">Direct control over products, sizes matrix, and hierarchical categories.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => { setActiveSubTab('list'); setEditingProduct(null); }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeSubTab === 'list' ? 'bg-white shadow-xs text-[#C9A84C]' : 'text-gray-400'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setActiveSubTab('add')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeSubTab === 'add' ? 'bg-white shadow-xs text-[#C9A84C]' : 'text-gray-400'
            }`}
          >
            {editingProduct ? 'Edit Product' : 'Add New'}
          </button>
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeSubTab === 'categories' ? 'bg-white shadow-xs text-[#C9A84C]' : 'text-gray-400'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeSubTab === 'inventory' ? 'bg-white shadow-xs text-[#C9A84C]' : 'text-gray-400'
            }`}
          >
            Stock Alerts
          </button>
        </div>
      </div>

      {/* SUBTAB 1: PRODUCT LIST WITH FILTERS */}
      {activeSubTab === 'list' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search specs, ID, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="panjabi">Panjabi</option>
                <option value="kabli">Kabli</option>
                <option value="koti">Koti</option>
                <option value="sherwani">Sherwani</option>
                <option value="jubbah">Jubbah</option>
                <option value="pajama">Pajama</option>
                <option value="kids">Kids</option>
              </select>

              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Stock Status</option>
                <option value="in">In Stock (10+)</option>
                <option value="low">Low Stock (&lt;10)</option>
                <option value="out">Out of Stock (0)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    <th className="py-3 px-6">Image</th>
                    <th className="py-3 px-6">Product Details</th>
                    <th className="py-3 px-6">SKU / Code</th>
                    <th className="py-3 px-6">Price Point</th>
                    <th className="py-3 px-6">Total Stock</th>
                    <th className="py-3 px-6 text-center">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {filteredProducts.map((p) => {
                    const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-3 px-6">
                          <img src={p.images[0]?.url} alt={p.name} className="h-12 w-12 object-cover rounded-lg border border-gray-100 bg-gray-50" referrerPolicy="no-referrer" />
                        </td>
                        <td className="py-3 px-6 font-sans">
                          <div className="font-bold text-gray-950 text-sm">{p.name}</div>
                          <div className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-bold mt-0.5">{p.category}</div>
                        </td>
                        <td className="py-3 px-6 font-mono font-semibold text-gray-600">{p.sku}</td>
                        <td className="py-3 px-6 font-bold text-gray-900">
                          <div>৳ {p.price.toLocaleString()}</div>
                          {p.compareAtPrice && <div className="text-[10px] text-gray-400 line-through font-semibold">৳ {p.compareAtPrice.toLocaleString()}</div>}
                        </td>
                        <td className="py-3 px-6">
                          <div className="font-bold text-gray-900">{totalStock} pcs</div>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {p.variants.map((v, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 text-[9px] font-mono rounded text-gray-500" title={`${v.color.name} stock`}>
                                {v.size}:{v.stock}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEditInit(p)}
                              className="p-1 text-gray-400 hover:text-blue-500"
                              title="Edit product"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1 text-gray-400 hover:text-rose-500"
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ADD / EDIT PRODUCT FORM */}
      {activeSubTab === 'add' && (
        <form onSubmit={handleSaveProduct} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3">
            {editingProduct ? 'Update Atelier Catalog Item' : 'Enroll New Garment in Catalog'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C9A84C]"
                  placeholder="Midnight Onyx Premium Cotton Panjabi"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                  Garment SKU *
                </label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                  placeholder="VRS-PNJ-001"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                >
                  <option value="panjabi">Panjabi</option>
                  <option value="koti">Koti</option>
                  <option value="sherwani">Sherwani</option>
                  <option value="jubbah">Jubbah</option>
                  <option value="kabli">Kabli</option>
                  <option value="pajama">Pajama</option>
                  <option value="kids">Kids</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                  Rich Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs h-32 focus:outline-none"
                  placeholder="A masterpiece of understated luxury..."
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                    Retail Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                    placeholder="4890"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                    Compare At Price (৳)
                  </label>
                  <input
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                    placeholder="5990"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5 text-[#C9A84C]" />
                  <span>Product Image 1 URL *</span>
                </label>
                <input
                  type="text"
                  required
                  value={imageUrl1}
                  onChange={(e) => setImageUrl1(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                  Product Image 2 URL (Detail View)
                </label>
                <input
                  type="text"
                  value={imageUrl2}
                  onChange={(e) => setImageUrl2(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              {/* Sizing & Stock Matrix Block */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                  Size Stock Quantity Matrix
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {[['S', stockS, setStockS], ['M', stockM, setStockM], ['L', stockL, setStockL], ['XL', stockXL, setStockXL], ['XXL', stockXXL, setStockXXL]].map(([sz, val, setVal]: any) => (
                    <div key={sz}>
                      <label className="block text-[10px] font-bold text-gray-400 text-center uppercase mb-1">{sz}</label>
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => setVal(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-center text-xs focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={() => { setActiveSubTab('list'); setEditingProduct(null); }}
              className="px-5 py-2.5 border border-gray-200 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#C9A84C] hover:bg-[#B5963E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              {editingProduct ? 'Save Changes' : 'Publish Masterpiece'}
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 3: CATEGORY HIERARCHY CRUD */}
      {activeSubTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* New Category Form */}
          <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Create New Category</h3>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Category Name</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
                placeholder="Festive Linens"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Parent Category (Hierarchy)</label>
              <select
                value={newCatParent}
                onChange={(e) => setNewCatParent(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none"
              >
                <option value="none">None (Top Level Category)</option>
                {categories.filter(c => c.parentId === null).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B5963E] transition cursor-pointer"
            >
              Save Category Structure
            </button>
          </form>

          {/* Current Category Tree hierarchy display */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Active Category Tree</h3>
            <div className="space-y-3 text-xs">
              {categories.filter(c => c.parentId === null).map((parent) => (
                <div key={parent.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                      <Folder className="h-4 w-4 text-[#C9A84C]" />
                      <span>{parent.name}</span>
                    </span>
                    <span className="text-[9px] bg-amber-50 text-[#C9A84C] px-1.5 py-0.5 rounded font-mono font-bold uppercase">Parent</span>
                  </div>
                  {/* Children / Subcategories */}
                  <div className="pl-6 space-y-1.5">
                    {categories.filter(sub => sub.parentId === parent.id).map((child) => (
                      <div key={child.id} className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                        <span>↳ {child.name}</span>
                        <span className="text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded font-mono">Sub</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: INVENTORY DASHBOARD (STOCK ALERTS) */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-3 text-rose-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-500" />
            <div>
              <h4 className="font-bold text-sm text-rose-900">Critical Stock Warning</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                The following active collections have fallen below the critical low stock threshold (&lt;10 total units). Replenish inventory immediately to avoid storefront checkout failures.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    <th className="py-3 px-6">Product</th>
                    <th className="py-3 px-6">SKU</th>
                    <th className="py-3 px-6">Current Inventory</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 font-sans">
                        ✓ Excellent. All active garments are fully stocked.
                      </td>
                    </tr>
                  ) : (
                    lowStockProducts.map(p => {
                      const total = p.variants.reduce((sum, v) => sum + v.stock, 0);
                      return (
                        <tr key={p.id} className="hover:bg-rose-50/10 transition">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <img src={p.images[0]?.url} alt="" className="h-10 w-10 object-cover rounded-lg bg-gray-50 border" />
                              <span className="font-bold text-gray-900">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-gray-500">{p.sku}</td>
                          <td className="py-4 px-6 font-bold text-rose-600 font-mono">{total} pcs left</td>
                          <td className="py-4 px-6 uppercase font-mono text-[10px] font-bold text-gray-400">{p.category}</td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider bg-rose-100 text-rose-700 animate-pulse">
                              Low Stock
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
