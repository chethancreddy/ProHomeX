import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: customer } = await supabase
    .from('customers').select('id').eq('profile_id', user.id).single();
  if (!customer) redirect('/customer/dashboard');

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, status, total_amount, created_at, updated_at,
      quotations ( id ),
      order_items ( id, quantity, unit_price, products ( name, sku ) )
    `)
    .eq('id', id)
    .eq('customer_id', customer.id)
    .single();

  if (error || !order) notFound();

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const o = order as any;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/customer/orders" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ORD-{id.split('-')[0].toUpperCase()}</h1>
          <p className="text-sm text-gray-500">Order Details</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-4 border ${statusColors[o.status] || 'bg-gray-100'} flex items-center justify-between`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Order Status</p>
          <p className="text-lg font-bold">{o.status}</p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-70">Total Amount</p>
          <p className="text-lg font-bold">₹{o.total_amount?.toLocaleString('en-IN') || '0'}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Order Items</h2>
        </div>
        {o.order_items?.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-200">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3 text-center">Qty</th>
                <th className="px-6 py-3 text-right">Unit Price</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {o.order_items.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.products?.name || 'Product'}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{item.products?.sku || '—'}</td>
                  <td className="px-6 py-4 text-sm text-center text-slate-700">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-right text-slate-700">₹{item.unit_price?.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-slate-900">
                    ₹{(item.quantity * item.unit_price)?.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">Total</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">₹{o.total_amount?.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p className="px-6 py-8 text-sm text-slate-400 text-center">No items listed for this order.</p>
        )}
      </div>

      <div className="text-sm text-gray-400 text-right">
        Order placed on {new Date(o.created_at).toLocaleString('en-IN')}
      </div>
    </div>
  );
}
