import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, Phone, Tag } from 'lucide-react';

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get customer record
  const { data: customer } = await supabase
    .from('customers').select('id').eq('profile_id', user.id).single();
  if (!customer) redirect('/customer/dashboard');

  // Fetch ticket — must belong to this customer
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      id, ticket_number, category, status, priority, description,
      location, contact_number, created_at, updated_at,
      profiles:assigned_to ( full_name )
    `)
    .eq('id', id)
    .eq('customer_id', customer.id)
    .single();

  if (error || !ticket) notFound();

  // Fetch ticket logs
  const { data: logs } = await supabase
    .from('ticket_logs')
    .select('id, comment, status_change, created_at, profiles:user_id ( full_name )')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  const statusColors: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-700 border-red-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
    RESOLVED: 'bg-green-100 text-green-700 border-green-200',
    CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const statusLabels: Record<string, string> = { OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/customer/tickets" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {(ticket as any).ticket_number || `Ticket #${id.split('-')[0].toUpperCase()}`}
          </h1>
          <p className="text-sm text-gray-500">Support ticket details</p>
        </div>
      </div>

      {/* Ticket Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Ticket Information</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[(ticket as any).status] || statusColors.OPEN}`}>
            {statusLabels[(ticket as any).status] || (ticket as any).status}
          </span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow icon={Tag} label="Category" value={(ticket as any).category || 'General'} />
          <InfoRow icon={MapPin} label="Location" value={(ticket as any).location || 'Not specified'} />
          <InfoRow icon={Phone} label="Contact Number" value={(ticket as any).contact_number || 'Not provided'} />
          <InfoRow icon={Clock} label="Created" value={new Date((ticket as any).created_at).toLocaleString('en-IN')} />
          <InfoRow
            icon={Clock}
            label="Assigned Technician"
            value={(ticket as any).profiles?.full_name || 'Not yet assigned'}
            valueClass={(ticket as any).profiles ? 'text-gray-900' : 'text-orange-600 font-medium'}
          />
          <InfoRow icon={Tag} label="Priority" value={(ticket as any).priority || 'MEDIUM'} />
        </div>

        {(ticket as any).description && (
          <div className="px-6 pb-6 border-t border-gray-50 pt-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Problem Description</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{(ticket as any).description}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Activity Timeline</h2>
        </div>
        <div className="p-6">
          {logs && logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log: any, i: number) => (
                <div key={log.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                    {i < (logs?.length || 0) - 1 && <div className="w-0.5 bg-gray-200 flex-1 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-gray-700">{log.comment}</p>
                    {log.status_change && (
                      <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        Status → {statusLabels[log.status_change] || log.status_change}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {log.profiles?.full_name || 'System'} · {new Date(log.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No activity logged yet. Our team will update this ticket once work begins.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, valueClass = 'text-gray-900' }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="p-2 rounded-lg bg-gray-50 text-gray-400 h-fit">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-medium mt-0.5 ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}
