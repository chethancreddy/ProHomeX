import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch real KPIs
  const [tickets, orders, leads, customers] = await Promise.all([
    supabase.from('tickets').select('id', { count: 'exact' }).in('status', ['OPEN', 'IN_PROGRESS']),
    supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'PROCESSING'),
    supabase.from('leads').select('id', { count: 'exact' }).eq('status', 'NEW'),
    supabase.from('customers').select('id', { count: 'exact' }),
  ]);

  const stats = [
    { label: 'Open Tickets', value: tickets.count || 0, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    { label: 'Orders In Progress', value: orders.count || 0, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'New Leads', value: leads.count || 0, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { label: 'Total Customers', value: customers.count || 0, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  ];

  // Recent tickets
  const { data: recentTickets } = await supabase
    .from('tickets')
    .select('id, ticket_number, category, status, priority, created_at, customers(profiles(full_name))')
    .order('created_at', { ascending: false })
    .limit(5);

  // Recent leads
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('id, reference_number, name, service, phone, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = {
      OPEN: 'bg-red-100 text-red-700', IN_PROGRESS: 'bg-blue-100 text-blue-700',
      RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-gray-100 text-gray-600',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[s] || 'bg-gray-100 text-gray-600'}`}>{s.replace('_', ' ')}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live overview of ProHomeX operations.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`bg-white rounded-xl border ${s.border} p-5 shadow-sm`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{s.label}</p>
            <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Tickets</h2>
            <a href="/admin/tickets" className="text-xs text-blue-600 hover:text-blue-800">View all →</a>
          </div>
          {recentTickets && recentTickets.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentTickets.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 font-mono">{t.ticket_number || '#' + t.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{t.category || 'General'} · {(t.customers as any)?.profiles?.full_name || 'Customer'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(t.status)}
                    <span className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No tickets yet.</p>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">New Leads</h2>
            <a href="/admin/leads" className="text-xs text-blue-600 hover:text-blue-800">View all →</a>
          </div>
          {recentLeads && recentLeads.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentLeads.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{l.name}</p>
                    <p className="text-xs text-gray-500">{l.service} · {l.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-600">{l.reference_number}</span>
                    <span className="text-xs text-gray-400">{new Date(l.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No leads yet. Share your website to start receiving enquiries.</p>
          )}
        </div>
      </div>
    </div>
  );
}
