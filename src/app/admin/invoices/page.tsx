import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Receipt, CheckCircle2, AlertCircle, Clock, Plus } from 'lucide-react';

const fmt = (n: number) => (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_STYLE: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ISSUED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

export default async function AdminInvoicesPage() {
  const supabase = createAdminClient();

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, status, total_amount, subtotal, gst_total,
      advance_paid, balance_due, created_at, paid_at,
      customers ( id, company_name, tax_id, profiles ( full_name, email, phone_number ) )
    `)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching invoices:', error.message);

  const totalInvoiced = (invoices || []).reduce((s, i) => s + (Number(i.total_amount) || 0), 0);
  const totalBalanceDue = (invoices || []).reduce((s, i) => s + (Number(i.balance_due) || 0), 0);
  const totalPaid = totalInvoiced - totalBalanceDue;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Final tax invoices generated from completed work orders and quotations.
          </p>
        </div>
        <Link
          href="/admin/accounting"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          View GST &amp; Accounting Portal →
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Invoiced</p>
          <p className="text-2xl font-bold text-gray-900 font-mono">₹{fmt(totalInvoiced)}</p>
          <p className="text-xs text-gray-400">{invoices?.length || 0} invoice(s)</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-1">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-700 font-mono">₹{fmt(totalPaid)}</p>
          <p className="text-xs text-emerald-600">Settled &amp; Advance payments</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-1">
          <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Outstanding Balance Due</p>
          <p className="text-2xl font-bold text-red-700 font-mono">₹{fmt(totalBalanceDue)}</p>
          <p className="text-xs text-red-500">Pending customer dues</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Invoice #</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Taxable</th>
                  <th className="px-5 py-3 text-right">GST Total</th>
                  <th className="px-5 py-3 text-right">Total Amount</th>
                  <th className="px-5 py-3 text-right">Balance Due</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv: any) => {
                  const customer = inv.customers;
                  const profile = customer?.profiles;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-sm font-bold text-blue-600">
                        {inv.invoice_number}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {customer?.company_name || profile?.full_name || 'Customer'}
                        </p>
                        {customer?.tax_id && (
                          <p className="text-xs font-mono text-slate-400">GST: {customer.tax_id}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-right text-xs font-mono text-slate-600">
                        ₹{fmt(inv.subtotal)}
                      </td>
                      <td className="px-5 py-4 text-right text-xs font-mono text-purple-700">
                        ₹{fmt(inv.gst_total)}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-bold font-mono text-slate-900">
                        ₹{fmt(inv.total_amount)}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-bold font-mono">
                        {Number(inv.balance_due) > 0 ? (
                          <span className="text-red-600">₹{fmt(inv.balance_due)}</span>
                        ) : (
                          <span className="text-green-600">Paid</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[inv.status] || 'bg-gray-100'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/invoices/${inv.id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View &amp; Pay →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <Receipt size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-base font-semibold text-gray-700">No invoices generated yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Invoices are automatically created when a Work Order is marked as Complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
