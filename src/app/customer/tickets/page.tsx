import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, LifeBuoy, ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function CustomerTicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: customer } = await supabase
    .from('customers').select('id').eq('profile_id', user.id).single();

  let tickets: any[] = [];
  if (customer) {
    const { data } = await supabase
      .from('tickets')
      .select('id, ticket_number, category, status, priority, created_at, location, contact_number, description')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });
    tickets = data || [];
  }

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = {
      OPEN: 'bg-red-100 text-red-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      RESOLVED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-gray-100 text-gray-600',
    };
    const labels: Record<string, string> = { OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[s] || 'bg-gray-100 text-gray-600'}`}>{labels[s] || s}</span>;
  };

  const priorityBadge = (p: string) => {
    const styles: Record<string, string> = {
      HIGH: 'text-red-600', MEDIUM: 'text-orange-500', LOW: 'text-green-600',
    };
    return <span className={`text-xs font-semibold ${styles[p] || 'text-gray-500'}`}>{p}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">Track service requests and technical support jobs.</p>
        </div>
        <Link
          href="/customer/tickets/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Raise New Ticket
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {tickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-6 py-3 font-semibold">Ticket #</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Location</th>
                  <th className="px-6 py-3 font-semibold">Priority</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        {t.ticket_number || '#' + t.id.split('-')[0].toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{t.category || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{t.location || '—'}</td>
                    <td className="px-6 py-4">{priorityBadge(t.priority)}</td>
                    <td className="px-6 py-4">{statusBadge(t.status)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(t.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/customer/tickets/${t.id}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
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
            <LifeBuoy className="mx-auto text-gray-200 mb-4" size={48} />
            <h3 className="text-base font-semibold text-gray-700">No tickets yet</h3>
            <p className="text-sm text-gray-400 mt-1">Need help? Raise a support ticket and our team will assist you.</p>
            <Link
              href="/customer/tickets/new"
              className="mt-5 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus size={16} /> Raise a Ticket
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
