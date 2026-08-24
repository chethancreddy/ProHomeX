import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import QuotationAdminActions from './QuotationAdminActions';
import PrintButton from '@/components/ui/PrintButton';

interface Props { params: Promise<{ id: string }> }

const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default async function QuotationDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: q, error }, { data: workOrder }, { data: payments }] = await Promise.all([
    supabase.from('quotations')
      .select(`
        id, quotation_number, title, status, total_amount, subtotal, gst_total, discount_total,
        advance_percentage, advance_amount, advance_paid_at, terms, valid_until, created_at, confirmed_at,
        customers(id, company_name, profiles(full_name, email, phone_number)),
        customer_sites(name, address_line1, city),
        quotation_items(
          id, description, quantity, unit_price_at_time, gst_rate, gst_amount, discount, line_total, sort_order,
          products(name, sku, unit)
        )
      `)
      .eq('id', id)
      .single(),

    supabase.from('work_orders')
      .select('id, work_order_number, status')
      .eq('quotation_id', id)
      .maybeSingle(),

    supabase.from('payments')
      .select('id, payment_number, payment_type, amount, payment_method, received_at, reference_number')
      .eq('quotation_id', id)
      .order('received_at'),
  ]);

  if (error || !q) notFound();

  const customer = q.customers as any;
  const profile = customer?.profiles;
  const site = q.customer_sites as any;
  const items = [...(q.quotation_items as any[])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Print */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/quotations" className="hover:text-blue-600">Quotations</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{q.quotation_number}</span>
        </div>
        <PrintButton label="Print Quotation / Save PDF" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - left (takes full width on print) */}
        <div className="lg:col-span-2 space-y-5 print:col-span-3 print:w-full print:p-0">
          {/* Print Letterhead Header */}
          <div className="hidden print:block mb-4 pb-4 border-b border-gray-300">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">PROHOMEX SYSTEMS &amp; SOLUTIONS</h1>
                <p className="text-xs text-gray-600">Security, CCTV, UPS, Solar &amp; Networking Infrastructure</p>
                <p className="text-xs text-gray-500 mt-1">support@prohomex.com · www.prohomex.com</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded">FORMAL QUOTATION</span>
                <p className="text-xs text-gray-500 font-mono mt-1">Date: {new Date(q.created_at).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Quotation header card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 print:border-none print:p-0 print:shadow-none">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{q.quotation_number}</h1>
                {q.title && <p className="text-slate-500 mt-1">{q.title}</p>}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900 font-mono">₹{fmt(Number(q.total_amount || 0))}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-5 pt-5 border-t border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Quotation For</p>
                <p className="font-semibold text-gray-900">{customer?.company_name || profile?.full_name}</p>
                {customer?.company_name && profile?.full_name && <p className="text-sm text-gray-600">{profile.full_name}</p>}
                {profile?.email && <p className="text-sm text-gray-500">{profile.email}</p>}
                {profile?.phone_number && <p className="text-sm text-gray-500">{profile.phone_number}</p>}
              </div>
              <div>
                {site ? (
                  <>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Installation Site</p>
                    <p className="font-semibold text-gray-900">{site.name}</p>
                    <p className="text-sm text-gray-500">{site.address_line1}{site.city ? `, ${site.city}` : ''}</p>
                  </>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Validity</p>
                    {q.valid_until
                      ? <p className="font-semibold text-gray-900">Valid until {new Date(q.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      : <p className="text-sm text-gray-400 italic">Valid for 15 days</p>
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden print:border-none print:shadow-none">
            <div className="px-5 py-4 border-b border-gray-100 print:px-0">
              <h2 className="text-sm font-bold text-gray-700">Quotation Items &amp; Technical Scope</h2>
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
                    <th className="px-3 py-2.5 text-right">Discount</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item: any, idx: number) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">{item.description}</p>
                        {item.products?.sku && <p className="text-xs text-slate-400 font-mono mt-0.5">{item.products.sku}</p>}
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-slate-700">
                        {item.quantity} {item.products?.unit || 'units'}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-mono text-slate-700">₹{fmt(Number(item.unit_price_at_time))}</td>
                      <td className="px-3 py-3 text-center text-xs text-slate-500">{item.gst_rate || 0}%</td>
                      <td className="px-3 py-3 text-right text-xs text-orange-600">
                        {Number(item.discount) > 0 ? `−₹${fmt(Number(item.discount))}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold font-mono text-slate-900">₹{fmt(Number(item.line_total || (item.quantity * item.unit_price_at_time)))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td colSpan={5} />
                    <td className="px-4 py-2 text-right text-xs text-slate-500 font-semibold">Subtotal</td>
                    <td className="px-4 py-2 text-right text-xs font-mono font-semibold">₹{fmt(Number(q.subtotal || q.total_amount))}</td>
                  </tr>
                  {Number(q.gst_total) > 0 && (
                    <tr className="bg-slate-50">
                      <td colSpan={5} />
                      <td className="px-4 py-1 text-right text-xs text-slate-400">Total GST</td>
                      <td className="px-4 py-1 text-right text-xs font-mono text-slate-600">₹{fmt(Number(q.gst_total))}</td>
                    </tr>
                  )}
                  {Number(q.discount_total) > 0 && (
                    <tr className="bg-slate-50">
                      <td colSpan={5} />
                      <td className="px-4 py-1 text-right text-xs text-orange-600">Discount</td>
                      <td className="px-4 py-1 text-right text-xs font-mono text-orange-600">−₹{fmt(Number(q.discount_total))}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-100 border-t border-slate-200">
                    <td colSpan={5} />
                    <td className="px-4 py-2.5 text-right text-sm font-bold text-slate-700">Grand Total</td>
                    <td className="px-4 py-2.5 text-right text-sm font-bold font-mono text-slate-900">₹{fmt(Number(q.total_amount))}</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td colSpan={5} />
                    <td className="px-4 py-2 text-right text-xs text-blue-700 font-semibold">Advance Required ({q.advance_percentage}%)</td>
                    <td className="px-4 py-2 text-right text-sm text-blue-800 font-bold font-mono">₹{fmt(Number(q.advance_amount || 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Terms */}
          {q.terms && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 print:border-none print:p-0">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Terms &amp; Conditions</h2>
              <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{q.terms}</p>
            </div>
          )}

          {/* Payment history - hidden on print */}
          {payments && payments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden no-print">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-700">Payment History</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="px-5 py-3">Ref #</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(payments as any[]).map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-xs font-mono text-slate-600">{p.payment_number || p.reference_number || '—'}</td>
                      <td className="px-5 py-3 text-xs font-semibold text-green-700">{p.payment_type}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">{p.payment_method || '—'}</td>
                      <td className="px-5 py-3 text-sm font-bold text-slate-900">₹{fmt(Number(p.amount))}</td>
                      <td className="px-5 py-3 text-xs text-slate-400">{new Date(p.received_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: actions panel (Completely hidden on print!) */}
        <div className="lg:col-span-1 no-print print:hidden">
          <QuotationAdminActions
            quotationId={q.id}
            customerId={customer?.id}
            currentStatus={q.status}
            advanceAmount={Number(q.advance_amount || 0)}
            workOrder={workOrder as any}
            confirmedAt={q.confirmed_at}
            advancePaidAt={q.advance_paid_at}
            validUntil={q.valid_until}
          />
        </div>
      </div>
    </div>
  );
}
