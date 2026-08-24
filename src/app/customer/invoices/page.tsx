import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Receipt } from 'lucide-react';

export default async function CustomerInvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Use profile_id → customers.id chain — never guess by email
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!customer) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <Receipt className="text-orange-500" size={24} />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Account Setup Required</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          Your customer account is being set up. Please contact TechMaha support if this persists.
        </p>
        <Link href="/customer/dashboard" className="mt-5 inline-block text-sm text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, total_amount, status, created_at, due_date, paid_at')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching invoices:', error);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600',
      ISSUED: 'bg-orange-100 text-orange-700',
      PAID: 'bg-green-100 text-green-700',
      OVERDUE: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = { DRAFT: 'Processing', ISSUED: 'Unpaid', PAID: 'Paid', OVERDUE: 'Overdue' };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="mt-1 text-sm text-gray-500">View your billing history and download invoices.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-6 py-3 font-semibold">Invoice #</th>
                  <th className="px-6 py-3 font-semibold">Date Issued</th>
                  <th className="px-6 py-3 font-semibold">Due Date</th>
                  <th className="px-6 py-3 font-semibold text-right">Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-900">
                      {inv.invoice_number || 'INV-' + inv.id.split('-')[0].toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(inv.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                      ₹{inv.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="px-6 py-4">{statusBadge(inv.status)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {inv.status === 'ISSUED' && (
                        <span className="inline-block text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-green-700 transition-colors">
                          Pay Now
                        </span>
                      )}
                      <span className="inline-block text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-slate-200 transition-colors">
                        Download PDF
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Receipt className="mx-auto text-gray-200 mb-4" size={48} />
            <h3 className="text-base font-semibold text-gray-700">No invoices yet</h3>
            <p className="text-sm text-gray-400 mt-1">Invoices will appear here after your work orders are completed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
