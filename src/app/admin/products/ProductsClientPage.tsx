'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, X, Edit2, ToggleLeft, ToggleRight, UploadCloud, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { createOrUpdateProduct, toggleProductActive, type ProductFormData } from './actions';

type Product = {
  id: string; name: string; sku: string; brand: string | null; model: string | null;
  description: string | null; unit: string; gst_rate: number; stock_quantity: number;
  low_stock_threshold: number; image_url: string | null; is_public: boolean;
  is_active: boolean; created_at: string; category_id: string | null;
  product_categories: { id: string; name: string; services: { id: string; name: string } | null } | null;
  product_prices: { purchase_price: number; selling_price: number; is_current: boolean }[];
};
type Category = { id: string; name: string; service_id: string; services: { name: string } | null };
type Service = { id: string; name: string };

const defaultForm: ProductFormData = {
  name: '', sku: '', category_id: '', brand: '', model: '', description: '',
  unit: 'pcs', hsn_sac: '', gst_rate: 18, purchase_price: 0, selling_price: 0,
  stock_quantity: 0, low_stock_threshold: 5, image_url: '', is_public: true, is_active: true,
};

function stockBadge(p: Product) {
  if (!p.is_active) return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Inactive</span>;
  if (p.stock_quantity === 0) return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 inline-flex items-center gap-1"><XCircle size={10} />Out of Stock</span>;
  if (p.stock_quantity <= p.low_stock_threshold) return <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 inline-flex items-center gap-1"><AlertTriangle size={10} />Low Stock</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 inline-flex items-center gap-1"><CheckCircle size={10} />In Stock</span>;
}

interface Props { products: Product[]; categories: Category[]; services: Service[]; }

export default function ProductsClientPage({ products, categories, services }: Props) {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(defaultForm);
  const [formError, setFormError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q);
      const matchService = !serviceFilter || p.product_categories?.services?.id === serviceFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.is_active) ||
        (statusFilter === 'inactive' && !p.is_active) ||
        (statusFilter === 'low' && p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0 && p.is_active) ||
        (statusFilter === 'out' && p.stock_quantity === 0 && p.is_active);
      return matchSearch && matchService && matchStatus;
    });
  }, [products, search, serviceFilter, statusFilter]);

  function openAddModal() {
    setEditingProduct(null);
    setForm(defaultForm);
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(p: Product) {
    const currentPrice = p.product_prices?.find(pp => pp.is_current);
    setEditingProduct(p);
    setForm({
      id: p.id, name: p.name, sku: p.sku, category_id: p.category_id || '',
      brand: p.brand || '', model: p.model || '', description: p.description || '',
      unit: p.unit || 'pcs', hsn_sac: '', gst_rate: p.gst_rate || 18,
      purchase_price: currentPrice?.purchase_price || 0,
      selling_price: currentPrice?.selling_price || 0,
      stock_quantity: p.stock_quantity, low_stock_threshold: p.low_stock_threshold,
      image_url: p.image_url || '', is_public: p.is_public, is_active: p.is_active,
    });
    setFormError('');
    setModalOpen(true);
  }

  function handleFormChange(field: keyof ProductFormData, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Product name is required'); return; }
    if (!form.sku.trim()) { setFormError('SKU is required'); return; }
    setFormError('');

    startTransition(async () => {
      try {
        await createOrUpdateProduct(form);
        setModalOpen(false);
        router.refresh();
      } catch (err: any) {
        setFormError(err.message);
      }
    });
  }

  function handleToggleActive(p: Product) {
    startTransition(async () => {
      try {
        await toggleProductActive(p.id, !p.is_active);
        router.refresh();
      } catch { /* ignore */ }
    });
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your product catalog. {products.length} total products.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/csv-upload" className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <UploadCloud size={15} /> Bulk Upload
          </Link>
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search name, SKU, brand…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">All Services</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <span className="self-center text-sm text-gray-500">{filteredProducts.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3">Product / SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Brand / Model</th>
                <th className="px-5 py-3 text-right">Selling Price</th>
                <th className="px-5 py-3 text-center">Stock</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? filteredProducts.map(p => {
                const currentPrice = p.product_prices?.find(pp => pp.is_current);
                return (
                  <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${!p.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                      <p className="text-xs font-mono text-slate-400">{p.sku}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {p.product_categories?.services?.name && <span className="text-slate-400 text-xs">{p.product_categories.services.name} / </span>}
                      {p.product_categories?.name || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {[p.brand, p.model].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900 text-right">
                      {currentPrice ? `₹${Number(currentPrice.selling_price).toLocaleString('en-IN')}` : <span className="text-slate-400 font-normal">Not set</span>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-base font-bold ${p.stock_quantity === 0 ? 'text-red-600' : p.stock_quantity <= p.low_stock_threshold ? 'text-orange-600' : 'text-slate-800'}`}>
                        {p.stock_quantity}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">{p.unit}</span>
                    </td>
                    <td className="px-5 py-4">{stockBadge(p)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditModal(p)} title="Edit" className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleToggleActive(p)} title={p.is_active ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-md transition-colors ${p.is_active ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                          {p.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    {search || serviceFilter || statusFilter !== 'all' ? 'No products match your filters.' : 'No products yet. Click "Add Product" to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={18} /></button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>}

              {/* Basic Info */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 mb-3 border-b">Basic Info</p>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Product Name <span className="text-red-500">*</span></label>
                    <input value={form.name} onChange={e => handleFormChange('name', e.target.value)} className={inputCls} placeholder="e.g. Hikvision 4MP IP Camera" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>SKU / Code <span className="text-red-500">*</span></label>
                      <input value={form.sku} onChange={e => handleFormChange('sku', e.target.value)} className={`${inputCls} font-mono`} placeholder="e.g. HK-CAM-4MP" required />
                    </div>
                    <div>
                      <label className={labelCls}>Unit</label>
                      <select value={form.unit} onChange={e => handleFormChange('unit', e.target.value)} className={inputCls}>
                        {['pcs', 'set', 'unit', 'meter', 'kg', 'box', 'pair', 'roll'].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={form.category_id} onChange={e => handleFormChange('category_id', e.target.value)} className={inputCls}>
                      <option value="">— Select Category —</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.services?.name ? `${c.services.name} / ` : ''}{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Brand */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 mb-3 border-b">Brand & Description</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Brand</label>
                      <input value={form.brand} onChange={e => handleFormChange('brand', e.target.value)} className={inputCls} placeholder="e.g. Hikvision" />
                    </div>
                    <div>
                      <label className={labelCls}>Model</label>
                      <input value={form.model} onChange={e => handleFormChange('model', e.target.value)} className={inputCls} placeholder="e.g. DS-2CD2143G2-I" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea value={form.description} onChange={e => handleFormChange('description', e.target.value)} className={`${inputCls} min-h-[80px] resize-none`} placeholder="Product details, specs, features…" />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 mb-3 border-b">Pricing</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Selling Price (₹)</label>
                    <input type="number" min="0" step="0.01" value={form.selling_price} onChange={e => handleFormChange('selling_price', parseFloat(e.target.value) || 0)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Purchase Price (₹)</label>
                    <input type="number" min="0" step="0.01" value={form.purchase_price} onChange={e => handleFormChange('purchase_price', parseFloat(e.target.value) || 0)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>GST Rate (%)</label>
                    <select value={form.gst_rate} onChange={e => handleFormChange('gst_rate', parseFloat(e.target.value))} className={inputCls}>
                      {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>HSN / SAC Code</label>
                    <input value={form.hsn_sac} onChange={e => handleFormChange('hsn_sac', e.target.value)} className={inputCls} placeholder="e.g. 8525" />
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 mb-3 border-b">Inventory</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Stock Quantity</label>
                    <input type="number" min="0" value={form.stock_quantity} onChange={e => handleFormChange('stock_quantity', parseInt(e.target.value, 10) || 0)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Low Stock Alert at</label>
                    <input type="number" min="0" value={form.low_stock_threshold} onChange={e => handleFormChange('low_stock_threshold', parseInt(e.target.value, 10) || 5)} className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 mb-3 border-b">Settings</p>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Image URL</label>
                    <input value={form.image_url} onChange={e => handleFormChange('image_url', e.target.value)} className={inputCls} placeholder="https://..." />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Visible on customer catalog</p>
                      <p className="text-xs text-gray-400">Customers can see and request quotes for this product</p>
                    </div>
                    <button type="button" onClick={() => handleFormChange('is_public', !form.is_public)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_public ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_public ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Active</p>
                      <p className="text-xs text-gray-400">Inactive products are hidden everywhere</p>
                    </div>
                    <button type="button" onClick={() => handleFormChange('is_active', !form.is_active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-green-600' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isPending}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {isPending ? 'Saving…' : editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
