import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import StockAdjuster from './StockAdjuster';
import { Package, AlertTriangle, XCircle, UploadCloud } from 'lucide-react';

export default async function AdminInventoryPage() {
  const supabase = createAdminClient();

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id, name, sku, stock_quantity, low_stock_threshold, is_active, unit,
      product_categories ( name, services ( name ) )
    `)
    .order('name');

  if (error) console.error('Inventory fetch error:', error.message);

  const total = products?.length || 0;
  const outOfStock = products?.filter((p: any) => p.stock_quantity === 0 && p.is_active).length || 0;
  const lowStock = products?.filter((p: any) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold && p.is_active).length || 0;

  function stockBadge(p: any) {
    if (!p.is_active) return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactive</span>;
    if (p.stock_quantity === 0) return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1"><XCircle size={11} />Out of Stock</span>;
    if (p.stock_quantity <= p.low_stock_threshold) return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1"><AlertTriangle size={11} />Low Stock</span>;
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">In Stock</span>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">View and adjust stock levels for all products.</p>
        </div>
        <Link
          href="/admin/inventory/csv-upload"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
        >
          <UploadCloud size={16} />
          Bulk Upload
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">Total Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
              <AlertTriangle size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lowStock}</p>
              <p className="text-xs text-gray-500">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{outOfStock}</p>
              <p className="text-xs text-gray-500">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3">Product / SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-center">Current Stock</th>
                <th className="px-5 py-3 text-center">Threshold</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products && products.length > 0 ? products.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{p.sku}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    <span className="text-slate-400">{(p.product_categories as any)?.services?.name}</span>
                    {(p.product_categories as any)?.services?.name && <span className="text-slate-300 mx-1">/</span>}
                    {(p.product_categories as any)?.name || '—'}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-lg font-bold ${p.stock_quantity === 0 ? 'text-red-600' : p.stock_quantity <= p.low_stock_threshold ? 'text-orange-600' : 'text-slate-900'}`}>
                      {p.stock_quantity}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">{p.unit || 'pcs'}</span>
                  </td>
                  <td className="px-5 py-4 text-center text-sm text-slate-500">{p.low_stock_threshold}</td>
                  <td className="px-5 py-4">{stockBadge(p)}</td>
                  <td className="px-5 py-4 text-right">
                    <StockAdjuster productId={p.id} currentStock={p.stock_quantity} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No products found. <Link href="/admin/products" className="text-blue-600 hover:underline">Add products first.</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
