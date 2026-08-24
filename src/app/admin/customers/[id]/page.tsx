import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Building2, Mail, Phone, MapPin, Plus, FileText, Wrench, Receipt, ArrowLeft } from 'lucide-react';

interface Props { params: Promise<{ id: string }> }

const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-purple-100 text-purple-700',
  ADVANCE_RECEIVED: 'bg-teal-100 text-teal-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PENDING: 'bg-gray-100 text-gray-700',
  ASSIGNED: 'bg-purple-100 text-purple-700',
  ISSUED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
};

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [
    { data: customer, error },
    { data: sites },
    { data: quotations },
    { data: workOrders },
    { data: invoices },
    { data: tickets },
  ] = await Promise.all([
    supabase.from('customers')
      .select('id, company_name, tax_id, created_at, profiles(full_name, email, phone_number)')
      .eq('id', id)
      .single(),

    supabase.from('customer_sites')
      .select('id, name, address_line1, city, state, zip')
      .eq('customer_id', id)
      .order('name'),

    supabase.from('quotations')
      .select('id, quotation_number, title, status, total_amount, advance_amount, created_at')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),

    supabase.from('work_orders')
      .select('id, work_order_number, status, scheduled_date, created_at, profiles:assigned_to(full_name)')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),

    supabase.from('invoices')
      .select('id, invoice_number, status, total_amount, balance_due, created_at')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),

    supabase.from('tickets')
      .select('id, ticket_number, category, status, priority, created_at')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (error || !customer) notFound();

  const profile = customer.profiles as any;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/customers" className="inline-flex items-center gap-1 hover:text-blue-600">
            <ArrowLeft size={14} /> Customers
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{customer.company_name || profile?.full_name || 'Customer Details'}</span>
        </div>
        <Link href={`/admin/quotations/new?customerId=${customer.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={15} /> Create Quotation
        </Link>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {(customer.company_name || profile?.full_name || 'C')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{customer.company_name || profile?.full_name}</h1>
              {customer.company_name && profile?.full_name && (
                <p className="text-sm font-medium text-slate-600 mt-0.5">Contact: {profile.full_name}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-blue-600">
                    <Mail size={14} className="text-gray-400" /> {profile.email}
                  </a>
                )}
                {profile?.phone_number && (
                  <a href={`tel:${profile.phone_number}`} className="flex items-center gap-1.5 hover:text-blue-600">
                    <Phone size={14} className="text-gray-400" /> {profile.phone_number}
                  </a>
                )}
                {customer.tax_id && (
                  <span className="flex items-center gap-1.5 text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    GSTIN: {customer.tax_id}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right text-xs text-gray-400">
            Customer Since: {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Sites */}
        {sites && sites.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <MapPin size={13} /> Registered Installation Sites ({sites.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sites.map(s => (
                <div key={s.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.address_line1}{s.city ? `, ${s.city}` : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs / Multi-Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quotations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900">Quotations ({quotations?.length || 0})</h2>
            </div>
            <Link href={`/admin/quotations/new?customerId=${customer.id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              + New Quote
            </Link>
          </div>
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {quotations && quotations.length > 0 ? (
              quotations.map(q => (
                <Link key={q.id} href={`/admin/quotations/${q.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-mono text-xs font-bold text-blue-600">{q.quotation_number}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{q.title || 'Quotation'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{fmt(Number(q.total_amount))}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${STATUS_BADGE[q.status] || 'bg-gray-100 text-gray-600'}`}>
                      {q.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="p-6 text-center text-xs text-gray-400">No quotations created yet.</p>
            )}
          </div>
        </div>

        {/* Work Orders */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-purple-600" />
              <h2 className="text-sm font-bold text-gray-900">Work Orders ({workOrders?.length || 0})</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {workOrders && workOrders.length > 0 ? (
              workOrders.map(wo => (
                <Link key={wo.id} href={`/admin/work-orders/${wo.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-mono text-xs font-bold text-purple-600">{wo.work_order_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tech: {(wo.profiles as any)?.full_name || 'Unassigned'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[wo.status] || 'bg-gray-100 text-gray-600'}`}>
                      {wo.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="p-6 text-center text-xs text-gray-400">No work orders yet.</p>
            )}
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-900">Invoices ({invoices?.length || 0})</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {invoices && invoices.length > 0 ? (
              invoices.map(inv => (
                <Link key={inv.id} href={`/admin/invoices/${inv.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-mono text-xs font-bold text-emerald-600">{inv.invoice_number}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(inv.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{fmt(Number(inv.total_amount))}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${STATUS_BADGE[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                      {inv.status} · Due: ₹{fmt(Number(inv.balance_due || 0))}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="p-6 text-center text-xs text-gray-400">No invoices generated yet.</p>
            )}
          </div>
        </div>

        {/* Support Tickets */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Support Tickets ({tickets?.length || 0})</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {tickets && tickets.length > 0 ? (
              tickets.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-mono text-xs font-bold text-slate-700">{t.ticket_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.category} · Priority: {t.priority}</p>
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-xs text-gray-400">No support tickets for this customer.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
