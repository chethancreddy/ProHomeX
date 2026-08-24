import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LifeBuoy, FileText, ShoppingCart, Receipt, ShieldCheck, Plus, ArrowRight } from 'lucide-react';

export default async function CustomerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch customer record
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  // Fetch real stats
  let stats = { quotations: 0, orders: 0, tickets: 0, invoices: 0 };
  let recentTickets: any[] = [];

  if (customer) {
    const [q, o, t, i] = await Promise.all([
      supabase.from('quotations').select('id', { count: 'exact' }).eq('customer_id', customer.id).in('status', ['DRAFT', 'SENT']),
      supabase.from('orders').select('id', { count: 'exact' }).eq('customer_id', customer.id).eq('status', 'PROCESSING'),
      supabase.from('tickets').select('id', { count: 'exact' }).eq('customer_id', customer.id).in('status', ['OPEN', 'IN_PROGRESS']),
      supabase.from('invoices').select('id', { count: 'exact' }).eq('customer_id', customer.id).eq('status', 'ISSUED'),
    ]);
    stats = {
      quotations: q.count || 0,
      orders: o.count || 0,
      tickets: t.count || 0,
      invoices: i.count || 0,
    };

    const { data: tickets } = await supabase
      .from('tickets')
      .select('id, ticket_number, category, status, created_at, location')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(5);
    recentTickets = tickets || [];
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    { label: 'Active Quotations', value: stats.quotations, href: '/customer/quotations', icon: FileText, color: 'blue' },
    { label: 'Active Orders', value: stats.orders, href: '/customer/orders', icon: ShoppingCart, color: 'indigo' },
    { label: 'Open Tickets', value: stats.tickets, href: '/customer/tickets', icon: LifeBuoy, color: 'orange' },
    { label: 'Unpaid Invoices', value: stats.invoices, href: '/customer/invoices', icon: Receipt, color: 'red' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      OPEN: 'bg-red-100 text-red-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      RESOLVED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-gray-100 text-gray-600',
    };
    const label: Record<string, string> = { OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-600'}`}>{label[s] || s}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting()}</h1>
          <p className="mt-1 text-sm text-gray-500">Here&apos;s an overview of your account.</p>
        </div>
        <Link
          href="/customer/tickets/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Raise a Ticket
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(c => (
          <Link key={c.href} href={c.href} className={`bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-all group ${colorMap[c.color]}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{c.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{c.value}</p>
              </div>
              <c.icon size={22} className="opacity-70" />
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-80 group-hover:opacity-100 transition-opacity">
              View all <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Support Tickets</h2>
          <Link href="/customer/tickets" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all →
          </Link>
        </div>
        {recentTickets.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {recentTickets.map((t: any) => (
              <Link key={t.id} href={`/customer/tickets/${t.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.ticket_number || t.id.split('-')[0].toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.category || 'General'} • {t.location || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(t.status)}
                  <span className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <LifeBuoy className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-gray-500 text-sm">No tickets raised yet.</p>
            <Link href="/customer/tickets/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline font-medium">
              Raise your first ticket
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/customer/warranty" className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-50 text-green-600"><ShieldCheck size={20} /></div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Warranty & AMC</p>
            <p className="text-xs text-gray-500">Check your coverage</p>
          </div>
        </Link>
        <Link href="/customer/invoices" className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-50 text-purple-600"><Receipt size={20} /></div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Billing & Invoices</p>
            <p className="text-xs text-gray-500">View payment history</p>
          </div>
        </Link>
        <Link href="/customer/profile" className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-100 text-slate-600"><LifeBuoy size={20} /></div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">My Profile</p>
            <p className="text-xs text-gray-500">Manage account settings</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
