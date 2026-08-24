import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id, status, total_amount, created_at,
      customers ( id, company_name, profiles ( full_name ) )
    `)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching orders:', error);

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[s] || 'bg-gray-100'}`}>{s}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">All customer service orders.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-900">ORD-{o.id.split('-')[0].toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {o.customers?.company_name || o.customers?.profiles?.full_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">₹{o.total_amount?.toLocaleString('en-IN') || '0'}</td>
                    <td className="px-6 py-4">{statusBadge(o.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-gray-400">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
