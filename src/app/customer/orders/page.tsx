import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShoppingCart, ArrowRight } from 'lucide-react';

export default async function CustomerOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: customer } = await supabase
    .from('customers').select('id').eq('profile_id', user.id).single();

  let orders: any[] = [];
  if (customer) {
    const { data } = await supabase
      .from('orders')
      .select(`
        id, status, total_amount, created_at,
        quotations ( id )
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });
    orders = data || [];
  }

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-1 text-sm text-gray-500">Track your service orders and installation progress.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-6 py-3 font-semibold">Order ID</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-900">
                      ORD-{o.id.split('-')[0].toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(o.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ₹{o.total_amount?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="px-6 py-4">{statusBadge(o.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/customer/orders/${o.id}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <ShoppingCart className="mx-auto text-gray-200 mb-4" size={48} />
            <h3 className="text-base font-semibold text-gray-700">No orders yet</h3>
            <p className="text-sm text-gray-400 mt-1">Your confirmed orders will appear here.</p>
            <Link href="/customer/quotations" className="mt-5 inline-block text-sm text-blue-600 hover:underline font-medium">
              View your quotations →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
