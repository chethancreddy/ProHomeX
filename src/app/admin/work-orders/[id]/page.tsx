import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wrench, Calendar, User, MapPin, Building2, FileText, CheckCircle2 } from 'lucide-react';
import WorkOrderChanges from './WorkOrderChanges';
import WorkOrderStatusPanel from './WorkOrderStatusPanel';
import PrintButton from '@/components/ui/PrintButton';

interface Props { params: Promise<{ id: string }> }

const CHANGE_BADGE: Record<string, { cls: string; label: string }> = {
  ORIGINAL: { cls: 'bg-slate-100 text-slate-700', label: 'Original Quote' },
  ADDED: { cls: 'bg-green-100 text-green-700', label: '+ Added Item' },
  REMOVED: { cls: 'bg-red-100 text-red-700', label: '− Removed Item' },
  QTY_CHANGE: { cls: 'bg-blue-100 text-blue-700', label: '↕ Qty Changed' },
  PRICE_CHANGE: { cls: 'bg-orange-100 text-orange-700', label: '↕ Price Changed' },
  DISCOUNT: { cls: 'bg-purple-100 text-purple-700', label: '% Site Discount' },
  SERVICE: { cls: 'bg-teal-100 text-teal-700', label: '⚙ Service Charge' },
};

const fmt = (n: number) => (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default async function WorkOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [
    { data: wo, error },
    { data: technicians },
    { data: invoice },
    { data: products },
    { data: services },
    { data: categories },
    { data: productTypes },
  ] = await Promise.all([
    supabase.from('work_orders')
      .select(`
        id, work_order_number, status, scheduled_date, completed_date, notes, created_at,
        quotation_id,
        quotations ( id, quotation_number, title, total_amount, advance_amount ),
        customers ( id, company_name, tax_id, profiles ( full_name, email, phone_number ) ),
        customer_sites ( name, address_line1, city, state ),
        profiles:assigned_to ( id, full_name, email ),
        work_order_items (
          id, quotation_item_id, product_id, description, original_qty, original_price, gst_rate,
          change_type, revised_qty, revised_price, change_notes, changed_at,
          products ( name, sku, brand, model )
        )
      `)
      .eq('id', id)
      .single(),

    supabase.from('profiles')
      .select('id, full_name, email')
      .eq('role', 'ADMIN')
      .order('full_name'),

    supabase.from('invoices')
      .select('id, invoice_number, status, total_amount, balance_due')
      .eq('work_order_id', id)
      .maybeSingle(),

    supabase.from('products')
      .select(`
        id, name, sku, brand, model, unit, gst_rate, category_id, type_id,
        product_categories ( id, name, service_id, services ( id, name ) ),
        product_types ( id, name ),
        product_prices ( selling_price, is_current )
      `)
      .eq('is_active', true)
      .order('name'),

    supabase.from('services')
      .select('id, name')
      .order('name'),

    supabase.from('product_categories')
      .select('id, service_id, name')
      .order('name'),

    supabase.from('product_types')
      .select('id, category_id, name')
      .order('name'),
  ]);

  if (error || !wo) notFound();

  const customer = wo.customers as any;
  const profile = customer?.profiles;
  const site = wo.customer_sites as any;
  const tech = wo.profiles as any;
  const quotation = wo.quotations as any;
  const allItems = (wo.work_order_items as any[]) || [];

  const originalItems = allItems.filter(i => i.change_type === 'ORIGINAL');
  const changeItems = allItems.filter(i => i.change_type !== 'ORIGINAL');

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/work-orders" className="inline-flex items-center gap-1 hover:text-blue-600">
            <ArrowLeft size={14} /> Work Orders
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{wo.work_order_number}</span>
        </div>

        {/* Print / Job Sheet Button */}
        <div className="no-print">
          <PrintButton label="Print Job Sheet (PDF)" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Left takes full width on print) */}
        <div className="lg:col-span-2 space-y-6 print:col-span-3 print:w-full print:p-0">
          {/* Print Letterhead */}
          <div className="hidden print:block mb-4 pb-4 border-b border-gray-300">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">PROHOMEX SYSTEMS &amp; SOLUTIONS</h1>
                <p className="text-xs text-gray-600">On-Site Installation Job Sheet &amp; Technical Execution Plan</p>
                <p className="text-xs text-gray-500 mt-1">Field Support: +91 98765 43210 · support@prohomex.com</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded">WORK ORDER JOB SHEET</span>
                <p className="text-xs text-gray-500 font-mono mt-1">Date: {new Date(wo.created_at).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm print:border-none print:p-0 print:shadow-none">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  JOB SHEET / WORK ORDER
                </span>
                <h1 className="text-2xl font-extrabold text-gray-900 mt-2">{wo.work_order_number}</h1>
                {quotation?.title && <p className="text-slate-600 text-sm mt-1 font-medium">{quotation.title}</p>}
              </div>

              <div className="no-print">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  wo.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border border-green-200' :
                  wo.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                  wo.status === 'ASSIGNED' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                  'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {wo.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100 text-xs">
              <div>
                <p className="font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Building2 size={12} /> Customer
                </p>
                <p className="text-sm font-bold text-gray-900">{customer?.company_name || profile?.full_name}</p>
                {customer?.company_name && profile?.full_name && <p className="text-gray-500">{profile.full_name}</p>}
                {profile?.phone_number && <p className="text-gray-500 mt-0.5">{profile.phone_number}</p>}
              </div>

              <div>
                <p className="font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Installation Site
                </p>
                {site ? (
                  <>
                    <p className="text-sm font-bold text-gray-900">{site.name}</p>
                    <p className="text-gray-500">{site.address_line1}{site.city ? `, ${site.city}` : ''}</p>
                  </>
                ) : (
                  <p className="text-gray-400">Client default location</p>
                )}
              </div>

              <div>
                <p className="font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText size={12} /> Linked Quotation
                </p>
                {quotation ? (
                  <>
                    <Link href={`/admin/quotations/${wo.quotation_id}`} className="text-sm font-mono font-bold text-blue-600 hover:underline">
                      {quotation.quotation_number}
                    </Link>
                    <p className="text-gray-500 mt-0.5">Value: ₹{fmt(Number(quotation.total_amount))}</p>
                    <p className="text-emerald-600 font-medium">Advance: ₹{fmt(Number(quotation.advance_amount))}</p>
                  </>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Original Quotation Scope Items */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
              <h2 className="text-sm font-bold text-gray-900">Original Scope (from Quotation)</h2>
              <p className="text-xs text-gray-500 mt-0.5">Equipment and services agreed upon before installation</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wide border-b border-gray-200">
                    <th className="px-5 py-3">Item / Description</th>
                    <th className="px-5 py-3 text-center">Agreed Qty</th>
                    <th className="px-5 py-3 text-right">Unit Price</th>
                    <th className="px-5 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {originalItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-bold text-slate-900">{item.description}</p>
                        {item.products?.sku && (
                          <p className="text-xs font-mono text-slate-400">SKU: {item.products.sku} {item.products.brand ? `· ${item.products.brand}` : ''}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center text-sm font-semibold text-slate-700">{item.original_qty}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-mono text-slate-700">₹{fmt(Number(item.original_price))}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-mono font-bold text-slate-900">
                        ₹{fmt(Number(item.original_qty) * Number(item.original_price))}
                      </td>
                    </tr>
                  ))}
                  {originalItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-gray-400">No original items copied yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Installation Changes Logged on Site */}
          {changeItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-amber-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Installation Changes on Site ({changeItems.length})</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Additions, removals, quantity and price adjustments</p>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                  Reconciled in Final Invoice
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wide border-b border-gray-200">
                      <th className="px-5 py-3">Change Type</th>
                      <th className="px-5 py-3">Item Description</th>
                      <th className="px-5 py-3 text-center">Revised Qty</th>
                      <th className="px-5 py-3 text-right">Revised Price</th>
                      <th className="px-5 py-3">Site Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {changeItems.map((item: any) => {
                      const badge = CHANGE_BADGE[item.change_type] || CHANGE_BADGE.ORIGINAL;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.description}</td>
                          <td className="px-5 py-3.5 text-center text-sm font-mono">
                            {item.change_type === 'REMOVED' ? (
                              <span className="text-red-600 font-bold line-through">{item.original_qty} (Removed)</span>
                            ) : item.revised_qty !== null ? (
                              <span>{item.original_qty} → <strong className="text-blue-700">{item.revised_qty}</strong></span>
                            ) : (
                              item.original_qty
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right text-sm font-mono">
                            {item.change_type === 'DISCOUNT' ? (
                              <span className="text-purple-700 font-bold">−₹{fmt(Number(item.original_price))}</span>
                            ) : item.revised_price !== null ? (
                              <span>₹{fmt(Number(item.original_price))} → <strong className="text-blue-700">₹{fmt(Number(item.revised_price))}</strong></span>
                            ) : (
                              `₹${fmt(Number(item.original_price))}`
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500 max-w-[200px] truncate">
                            {item.change_notes || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Log Installation Change Form Component */}
          {wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED' && (
            <WorkOrderChanges
              workOrderId={wo.id}
              originalItems={originalItems.map((i: any) => ({
                id: i.id,
                quotationItemId: i.quotation_item_id || i.id,
                description: i.description,
                qty: Number(i.original_qty),
                price: Number(i.original_price),
                gstRate: Number(i.gst_rate) || 18,
              }))}
              products={(products || []) as any[]}
              services={(services || []) as any[]}
              categories={(categories || []) as any[]}
              productTypes={(productTypes || []) as any[]}
            />
          )}

          {/* Generated Invoice Banner */}
          {invoice && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-900">Final Tax Invoice Generated</h3>
                  <p className="text-xs text-emerald-700 mt-0.5 font-mono">
                    Invoice #{(invoice as any).invoice_number} · Total: ₹{fmt(Number((invoice as any).total_amount))} · Balance Due: ₹{fmt(Number((invoice as any).balance_due || 0))}
                  </p>
                </div>
              </div>
              <Link
                href={`/admin/invoices/${(invoice as any).id}`}
                className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                View Final Invoice →
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Status & Assignment Panel (Hidden on print) */}
        <div className="lg:col-span-1 no-print print:hidden">
          <WorkOrderStatusPanel
            workOrderId={wo.id}
            currentStatus={wo.status}
            assignedToId={tech?.id || ''}
            assignedToName={tech?.full_name || ''}
            scheduledDate={wo.scheduled_date}
            technicians={(technicians || []) as any[]}
            hasInvoice={!!invoice}
          />
        </div>
      </div>
    </div>
  );
}
