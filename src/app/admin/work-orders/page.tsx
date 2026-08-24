import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Wrench, Clock, CheckCircle2, User, Calendar } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  ASSIGNED: 'bg-purple-100 text-purple-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default async function AdminWorkOrdersPage() {
  const supabase = createAdminClient();

  const { data: workOrders, error } = await supabase
    .from('work_orders')
    .select(`
      id, work_order_number, status, scheduled_date, completed_date, created_at,
      quotations(quotation_number, title),
      customers(company_name, profiles(full_name)),
      customer_sites(name, city),
      profiles:assigned_to(full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching work orders:', error.message);

  const counts = (workOrders || []).reduce((acc: Record<string, number>, wo: any) => {
    acc[wo.status] = (acc[wo.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Installation jobs auto-generated from confirmed quotations.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { key: 'PENDING', label: 'Pending', color: 'border-gray-200 bg-gray-50 text-gray-700' },
          { key: 'ASSIGNED', label: 'Assigned', color: 'border-purple-200 bg-purple-50 text-purple-700' },
          { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-200 bg-blue-50 text-blue-700' },
          { key: 'COMPLETED', label: 'Completed', color: 'border-green-200 bg-green-50 text-green-700' },
        ].map(s => (
          <div key={s.key} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{counts[s.key] || 0}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {workOrders && workOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Work Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Site</th>
                  <th className="px-5 py-3">Quotation</th>
                  <th className="px-5 py-3">Technician</th>
                  <th className="px-5 py-3">Scheduled</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(workOrders as any[]).map(wo => {
                  const customer = wo.customers;
                  const site = wo.customer_sites;
                  const tech = wo.profiles;
                  const quotation = wo.quotations;
                  return (
                    <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-mono text-sm font-bold text-slate-900">{wo.work_order_number}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(wo.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">{customer?.company_name || customer?.profiles?.full_name || '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">{site ? `${site.name}${site.city ? `, ${site.city}` : ''}` : '—'}</td>
                      <td className="px-5 py-4">
                        {quotation ? (
                          <p className="text-xs font-mono text-blue-600">{quotation.quotation_number}</p>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        {tech?.full_name
                          ? <span className="flex items-center gap-1 text-sm text-slate-700"><User size={12} />{tech.full_name}</span>
                          : <span className="text-xs text-orange-600 font-medium">Unassigned</span>}
                      </td>
                      <td className="px-5 py-4">
                        {wo.scheduled_date
                          ? <span className="flex items-center gap-1 text-xs text-slate-600"><Calendar size={11} />{new Date(wo.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[wo.status] || 'bg-gray-100 text-gray-600'}`}>
                          {wo.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/admin/work-orders/${wo.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          Manage →
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
            <Wrench className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-base font-semibold text-gray-600">No work orders yet</p>
            <p className="text-sm text-gray-400 mt-1">Work orders are created automatically when advance payment is received on a confirmed quotation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
