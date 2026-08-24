import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Plus, FileText, Clock, CheckCircle2, XCircle, Banknote, Wrench, TrendingUp } from 'lucide-react';

const PIPELINE: { status: string; label: string; color: string }[] = [
  { status: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  { status: 'SENT', label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  { status: 'CONFIRMED', label: 'Confirmed', color: 'bg-purple-100 text-purple-700' },
  { status: 'ADVANCE_RECEIVED', label: 'Advance Paid', color: 'bg-green-100 text-green-700' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-orange-100 text-orange-700' },
  { status: 'COMPLETED', label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
];

function statusBadge(s: string) {
  const map: Record<string, { cls: string; label: string }> = {
    DRAFT: { cls: 'bg-gray-100 text-gray-600', label: 'Draft' },
    SENT: { cls: 'bg-blue-100 text-blue-700', label: 'Sent' },
    ACCEPTED: { cls: 'bg-purple-100 text-purple-700', label: 'Confirmed' },
    CONFIRMED: { cls: 'bg-purple-100 text-purple-700', label: 'Confirmed' },
    ADVANCE_RECEIVED: { cls: 'bg-green-100 text-green-700', label: 'Advance Paid' },
    IN_PROGRESS: { cls: 'bg-orange-100 text-orange-700', label: 'In Progress' },
    COMPLETED: { cls: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
    REJECTED: { cls: 'bg-red-100 text-red-700', label: 'Rejected' },
    EXPIRED: { cls: 'bg-slate-100 text-slate-500', label: 'Expired' },
    CANCELLED: { cls: 'bg-slate-100 text-slate-500', label: 'Cancelled' },
  };
  const { cls, label } = map[s] || { cls: 'bg-gray-100 text-gray-500', label: s };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
}

export const dynamic = 'force-dynamic';

export default async function AdminQuotationsPage() {
  const supabase = createAdminClient();
  const { data: quotations, error } = await supabase
    .from('quotations')
    .select(`
      id, quotation_number, title, status, total_amount, advance_amount, created_at, valid_until,
      customers(id, company_name, profiles(full_name, email)),
      quotation_items(id)
    `)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching quotations:', error.message);

  // Pipeline counts
  const counts = (quotations || []).reduce((acc: Record<string, number>, q: any) => {
    acc[q.status] = (acc[q.status] || 0) + 1;
    return acc;
  }, {});

  const totalValue = (quotations || [])
    .filter((q: any) => ['CONFIRMED', 'ADVANCE_RECEIVED', 'IN_PROGRESS', 'COMPLETED'].includes(q.status))
    .reduce((s: number, q: any) => s + Number(q.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage customer quotations and track the sales pipeline.</p>
        </div>
        <Link href="/admin/quotations/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={16} /> New Quotation
        </Link>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-6 gap-3">
        {PIPELINE.map(p => (
          <div key={p.status} className={`rounded-xl p-3 ${p.color} border border-current/10`}>
            <p className="text-2xl font-bold">{counts[p.status] || 0}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{p.label}</p>
          </div>
        ))}
      </div>

      {/* Confirmed pipeline value */}
      {totalValue > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
          <TrendingUp size={20} className="text-blue-600" />
          <p className="text-sm text-blue-800">
            <span className="font-bold">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span> confirmed pipeline value
          </p>
        </div>
      )}

      {/* Quotations table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {quotations && quotations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Quotation</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Advance</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q: any) => {
                  const customer = q.customers;
                  const profile = customer?.profiles;
                  const isExpiringSoon = q.valid_until &&
                    new Date(q.valid_until) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) &&
                    ['DRAFT', 'SENT'].includes(q.status);

                  return (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-mono text-sm font-bold text-blue-600">{q.quotation_number || `#${q.id.slice(0, 6).toUpperCase()}`}</p>
                        {q.title && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{q.title}</p>}
                        {isExpiringSoon && <p className="text-xs text-orange-600 font-medium mt-0.5">⚠ Expiring soon</p>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">{customer?.company_name || profile?.full_name || '—'}</p>
                        <p className="text-xs text-slate-400">{profile?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{q.quotation_items?.length || 0} items</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-900">₹{Number(q.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                      </td>
                      <td className="px-5 py-4">
                        {q.advance_amount > 0
                          ? <p className="text-sm text-green-700 font-medium">₹{Number(q.advance_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                          : <span className="text-xs text-slate-300">—</span>
                        }
                      </td>
                      <td className="px-5 py-4">{statusBadge(q.status)}</td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/admin/quotations/${q.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <FileText className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-base font-semibold text-gray-600">No quotations yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">Create your first quotation to get started.</p>
            <Link href="/admin/quotations/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              <Plus size={15} /> Create Quotation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
