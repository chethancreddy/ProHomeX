import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FileText, ArrowRight } from 'lucide-react';

export default async function CustomerQuotationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: customer } = await supabase
    .from('customers').select('id').eq('profile_id', user.id).single();

  let quotations: any[] = [];
  if (customer) {
    const { data } = await supabase
      .from('quotations')
      .select('id, status, total_amount, created_at, valid_until')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });
    quotations = data || [];
  }

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600',
      SENT: 'bg-blue-100 text-blue-700',
      ACCEPTED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      EXPIRED: 'bg-orange-100 text-orange-700',
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[s] || 'bg-gray-100'}`}>{s}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
        <p className="mt-1 text-sm text-gray-500">Review service quotations prepared for your account.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {quotations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-6 py-3 font-semibold">Quote ID</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Valid Until</th>
                  <th className="px-6 py-3 font-semibold text-right">Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q: any) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-900">QOT-{q.id.split('-')[0].toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(q.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{q.valid_until ? new Date(q.valid_until).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">₹{q.total_amount?.toLocaleString('en-IN') || '0'}</td>
                    <td className="px-6 py-4">{statusBadge(q.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                        View <ArrowRight size={14} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <FileText className="mx-auto text-gray-200 mb-4" size={48} />
            <h3 className="text-base font-semibold text-gray-700">No quotations yet</h3>
            <p className="text-sm text-gray-400 mt-1">Quotations prepared by our team will appear here.</p>
            <Link href="/request-quote" className="mt-5 inline-block text-sm text-blue-600 hover:underline font-medium">
              Request a new quote →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
