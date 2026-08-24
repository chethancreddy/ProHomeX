import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import InvoiceActions from './InvoiceActions';
import PrintButton from '@/components/ui/PrintButton';

interface Props { params: Promise<{ id: string }> }

const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ITEM_TYPE_STYLE: Record<string, string> = {
  PRODUCT: 'text-slate-900',
  SERVICE: 'text-teal-700',
  DISCOUNT: 'text-red-600',
  ADVANCE: 'text-orange-600',
  ADJUSTMENT: 'text-blue-600',
  LABOUR: 'text-purple-700',
};

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: inv, error }, { data: payments }] = await Promise.all([
    supabase.from('invoices')
      .select(`
        id, invoice_number, status, total_amount, subtotal, gst_total, discount_total,
        advance_paid, balance_due, terms, created_at, paid_at,
        customers(id, company_name, profiles(full_name, email, phone_number)),
        work_orders(work_order_number),
        quotations(quotation_number, title),
        invoice_items(
          id, description, quantity, unit_price, gst_rate, gst_amount, discount, amount, item_type, sort_order
        )
      `)
      .eq('id', id)
      .single(),

    supabase.from('payments')
      .select('id, payment_number, payment_type, amount, payment_method, received_at, reference_number')
      .eq('invoice_id', id)
      .order('received_at'),
  ]);

  if (error || !inv) notFound();

  const customer = inv.customers as any;
  const profile = customer?.profiles;
  const wo = inv.work_orders as any;
  const quotation = inv.quotations as any;
  const items = [...((inv.invoice_items as any[]) || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const productItems = items.filter(i => !['DISCOUNT', 'ADVANCE', 'ADJUSTMENT'].includes(i.item_type));
  const deductItems = items.filter(i => ['DISCOUNT', 'ADVANCE', 'ADJUSTMENT'].includes(i.item_type));
  const totalPaid = ((payments as any[]) || []).reduce((s, p) => s + Number(p.amount), 0);

  const statusStyle: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    ISSUED: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/invoices" className="hover:text-blue-600">Invoices</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{(inv as any).invoice_number}</span>
        </div>
        <PrintButton label="Print Tax Invoice / Save PDF" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5 print:col-span-3 print:w-full print:p-0">
          <div className="hidden print:block mb-4 pb-4 border-b border-gray-300">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">PROHOMEX SYSTEMS &amp; SOLUTIONS</h1>
                <p className="text-xs text-gray-600">Security, CCTV, UPS, Solar &amp; Networking Infrastructure</p>
                <p className="text-xs text-gray-500 mt-1">GSTIN: 29ABCDE1234F1Z5 · support@prohomex.com</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded">TAX INVOICE</span>
                <p className="text-xs text-gray-500 font-mono mt-1">Date: {new Date((inv as any).created_at).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 print:border-none print:p-0 print:shadow-none">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl font-bold text-gray-900">{(inv as any).invoice_number}</h1>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle[(inv as any).status] || 'bg-gray-100 text-gray-600'} no-print`}>
                    {(inv as any).status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {new Date((inv as any).created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900 font-mono">₹{fmt(Number((inv as any).total_amount || 0))}</p>
                <p className={`text-sm font-semibold mt-1 ${Number((inv as any).balance_due) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {Number((inv as any).balance_due) > 0
                    ? `Balance Due: ₹${fmt(Number((inv as any).balance_due))}`
                    : '✓ Fully Paid'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Bill To</p>
                <p className="font-semibold text-gray-900">{customer?.company_name || profile?.full_name}</p>
                {customer?.company_name && profile?.full_name && <p className="text-sm text-gray-600">{profile.full_name}</p>}
                {profile?.email && <p className="text-sm text-gray-500">{profile.email}</p>}
                {profile?.phone_number && <p className="text-sm text-gray-500">{profile.phone_number}</p>}
                {customer?.tax_id && <p className="text-xs font-mono text-slate-700 mt-1">GSTIN: {customer.tax_id}</p>}
              </div>
              {wo && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Work Order</p>
                  <Link href={`/admin/work-orders/${(inv as any).work_order_id}`}
                    className="text-sm font-mono text-blue-600 hover:text-blue-800">{wo.work_order_number}</Link>
                </div>
              )}
              {quotation && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Quotation Ref</p>
                  <Link href={`/admin/quotations/${(inv as any).quotation_id}`}
                    className="text-sm font-mono text-blue-600 hover:text-blue-800">{quotation.quotation_number}</Link>
                  {quotation.title && <p className="text-xs text-slate-400 truncate">{quotation.title}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden print:border-none print:shadow-none">
            <div className="px-5 py-4 border-b border-gray-100 print:px-0">
              <h2 className="text-sm font-bold text-gray-700">Line Items &amp; Tax Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="px-4 py-2.5 w-8">#</th>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-3 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-right">Unit Price</th>
                    <th className="px-3 py-2.5 text-center">GST%</th>
                    <th className="px-4 py-2.5 text-right">GST Amount</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productItems.map((item: any, idx: number) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className={`text-sm font-medium ${ITEM_TYPE_STYLE[item.item_type] || 'text-slate-900'}`}>{item.description}</p>
                        {item.item_type !== 'PRODUCT' && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">{item.item_type}</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-slate-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-xs font-mono text-slate-700">₹{fmt(Number(item.unit_price))}</td>
                      <td className="px-3 py-3 text-center text-xs text-slate-500">{item.gst_rate || 0}%</td>
                      <td className="px-4 py-3 text-right text-xs font-mono text-slate-500">₹{fmt(Number(item.gst_amount || 0))}</td>
                      <td className="px-4 py-3 text-right text-xs font-semibold font-mono text-slate-900">₹{fmt(Number(item.amount))}</td>
                    </tr>
                  ))}
                  {productItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-gray-400">No product items.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td colSpan={5} />
                    <td className="px-4 py-2 text-right text-xs text-slate-500 font-semibold">Subtotal</td>
                    <td className="px-4 py-2 text-right text-xs font-mono font-semibold">₹{fmt(Number((inv as any).subtotal || (inv as any).total_amount))}</td>
                  </tr>
                  {Number((inv as any).gst_total) > 0 && (
                    <tr className="bg-slate-50">
                      <td colSpan={5} />
                      <td className="px-4 py-1 text-right text-xs text-slate-400">Total GST</td>
                      <td className="px-4 py-1 text-right text-xs font-mono text-slate-600">₹{fmt(Number((inv as any).gst_total))}</td>
                    </tr>
                  )}
                  {Number((inv as any).discount_total) > 0 && (
                    <tr className="bg-slate-50">
                      <td colSpan={5} />
                      <td className="px-4 py-1 text-right text-xs text-orange-600">Discount</td>
                      <td className="px-4 py-1 text-right text-xs font-mono text-orange-600">−₹{fmt(Number((inv as any).discount_total))}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-100 border-t border-slate-200">
                    <td colSpan={5} />
                    <td className="px-4 py-2.5 text-right text-sm font-bold text-slate-700">Invoice Total</td>
                    <td className="px-4 py-2.5 text-right text-sm font-bold font-mono text-slate-900">₹{fmt(Number((inv as any).total_amount))}</td>
                  </tr>
                  {Number((inv as any).advance_paid) > 0 && (
                    <tr className="bg-green-50">
                      <td colSpan={5} />
                      <td className="px-4 py-2 text-right text-xs text-green-700 font-semibold">Advance Received</td>
                      <td className="px-4 py-2 text-right text-sm text-green-800 font-bold font-mono">−₹{fmt(Number((inv as any).advance_paid))}</td>
                    </tr>
                  )}
                  <tr className="bg-blue-50">
                    <td colSpan={5} />
                    <td className="px-4 py-2.5 text-right text-sm font-bold text-blue-800">Balance Due</td>
                    <td className="px-4 py-2.5 text-right text-base font-bold font-mono text-blue-900">₹{fmt(Number((inv as any).balance_due || 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {(inv as any).terms && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xs font-bold text-gray-400 uppercase mb-2">Terms</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">{(inv as any).terms}</p>
            </div>
          )}

          {payments && payments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden no-print">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-700">Payment History ({payments.length})</h2>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="px-5 py-3">Receipt #</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(payments as any[]).map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-xs font-mono text-slate-600">{p.payment_number || '—'}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{p.payment_type}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600">{p.payment_method?.replace('_', ' ')}</td>
                      <td className="px-5 py-3 text-xs text-slate-400">{p.reference_number || '—'}</td>
                      <td className="px-5 py-3 text-sm font-bold text-slate-900 text-right font-mono">₹{fmt(Number(p.amount))}</td>
                      <td className="px-5 py-3 text-xs text-slate-400">{new Date(p.received_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 no-print print:hidden">
          <InvoiceActions
            invoiceId={id}
            customerId={customer?.id}
            quotationId={(inv as any).quotation_id}
            workOrderId={(inv as any).work_order_id}
            currentStatus={(inv as any).status}
            balanceDue={Number((inv as any).balance_due || 0)}
            totalPaid={totalPaid}
          />
        </div>
      </div>
    </div>
  );
}
