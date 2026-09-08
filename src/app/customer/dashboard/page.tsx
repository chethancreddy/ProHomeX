import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { 
  LifeBuoy, FileText, ShoppingCart, Receipt, ShieldCheck, Plus, ArrowRight, 
  CheckCircle2, Clock, Zap, Camera, Sun, Cpu, PhoneCall, HardHat
} from 'lucide-react';

export default async function CustomerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch customer record
  const { data: customer } = await supabase
    .from('customers')
    .select('id, name, company_name')
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-700 flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">ProHomeX Certified Client Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{greeting()}, {customer?.name || 'Valued Client'}</h1>
          <p className="mt-1 text-sm text-neutral-300">
            {customer?.company_name ? `${customer.company_name} • ` : ''}Real-time monitoring of your building infrastructure, warranties, and engineering services.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/customer/tickets/new"
            className="inline-flex items-center gap-2 bg-[#dceeb1] text-black px-5 py-2.5 rounded-full font-bold hover:bg-[#cbe394] transition-all shadow-sm text-sm"
          >
            <Plus size={16} />
            Raise Support Ticket
          </Link>
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2 bg-white/10 text-white hover:bg-white/20 px-4 py-2.5 rounded-full font-medium transition-all text-sm border border-white/20"
          >
            <PhoneCall size={15} />
            Priority Dispatch
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(c => (
          <Link key={c.href} href={c.href} className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all group ${colorMap[c.color]}`}>
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

      {/* Real Estate & Facility Infrastructure Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support Tickets Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <HardHat size={18} className="text-neutral-700" />
                <h2 className="font-bold text-gray-900">Recent Service & Engineering Tickets</h2>
              </div>
              <Link href="/customer/tickets" className="text-xs font-bold text-neutral-900 hover:text-blue-600">
                View all tickets →
              </Link>
            </div>
            {recentTickets.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentTickets.map((t: any) => (
                  <Link key={t.id} href={`/customer/tickets/${t.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.ticket_number || t.id.split('-')[0].toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.category || 'Engineering'} • {t.location || 'Main Site'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusBadge(t.status)}
                      <span className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <LifeBuoy className="mx-auto text-gray-300 mb-3" size={36} />
                <p className="text-gray-600 text-sm font-medium">All systems operating normally. No open tickets.</p>
                <Link href="/customer/tickets/new" className="mt-3 inline-block text-xs font-bold text-neutral-900 underline underline-offset-4 hover:text-blue-600">
                  Raise an engineering request
                </Link>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <CheckCircle2 size={14} /> 24/7 Priority SLA Active for Managed Sites
            </span>
            <span className="text-neutral-400">Avg Response: &lt; 2 hrs</span>
          </div>
        </div>

        {/* Facility Protection & AMC Summary */}
        <div className="bg-neutral-900 text-white rounded-2xl p-6 border border-neutral-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Site Protection</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE AMC
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Turnkey Infrastructure Health</h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Comprehensive maintenance cover for CCTV, Solar, Industrial UPS, and Building Automation nodes.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-800">
                <span className="text-neutral-300 flex items-center gap-1.5"><Camera size={13} className="text-lime-400" /> Perimeter Surveillance</span>
                <span className="text-emerald-400 font-semibold">100% Online</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-800">
                <span className="text-neutral-300 flex items-center gap-1.5"><Sun size={13} className="text-amber-400" /> Solar Generation</span>
                <span className="text-emerald-400 font-semibold">Grid-Synchronized</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-800">
                <span className="text-neutral-300 flex items-center gap-1.5"><Zap size={13} className="text-orange-400" /> UPS Emergency Backup</span>
                <span className="text-emerald-400 font-semibold">Ready (0ms Transfer)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-neutral-300 flex items-center gap-1.5"><Cpu size={13} className="text-cyan-400" /> Sump & Water Controller</span>
                <span className="text-emerald-400 font-semibold">Automated</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
            <Link href="/customer/warranty" className="text-xs font-bold text-[#dceeb1] hover:underline flex items-center gap-1">
              View Warranty Certificates <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/customer/warranty" className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-neutral-900 hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100"><ShieldCheck size={22} /></div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Warranty & AMC</p>
            <p className="text-xs text-gray-500">Check coverage & certificates</p>
          </div>
        </Link>
        <Link href="/customer/invoices" className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-neutral-900 hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100"><Receipt size={22} /></div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Billing & Invoices</p>
            <p className="text-xs text-gray-500">GST invoices & payment history</p>
          </div>
        </Link>
        <Link href="/customer/products" className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-neutral-900 hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100"><ShoppingCart size={22} /></div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Hardware Catalog</p>
            <p className="text-xs text-gray-500">Tier-1 OEM certified products</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

