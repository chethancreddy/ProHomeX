import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function AdminTicketsPage() {
  const supabase = await createClient();
  
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      id,
      status,
      priority,
      created_at,
      assigned_to,
      profiles:assigned_to ( full_name ),
      customers ( company_name, profiles(full_name) ),
      customer_sites ( name, city )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', error);
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">Open</span>;
      case 'IN_PROGRESS': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">In Progress</span>;
      case 'RESOLVED': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Resolved</span>;
      case 'CLOSED': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">Closed (Invoiced)</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Orders & Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">Manage technical jobs, assignments, and inventory requests.</p>
        </div>
        <Button>Create Ticket</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">ID / Priority</th>
                  <th className="px-6 py-3 font-medium">Customer & Site</th>
                  <th className="px-6 py-3 font-medium">Assignee</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tickets && tickets.length > 0 ? (
                  tickets.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm text-slate-900">{t.id.split('-')[0].toUpperCase()}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{t.priority} Priority</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-medium text-slate-900">{t.customers?.company_name || t.customers?.profiles?.full_name || 'Unknown'}</div>
                        <div className="text-slate-500 mt-0.5">{t.customer_sites?.name || 'Primary'} ({t.customer_sites?.city || 'N/A'})</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {t.profiles?.full_name || <span className="text-orange-600 font-medium text-xs">Unassigned</span>}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {t.status === 'RESOLVED' && (
                          <Button variant="ghost" size="sm" className="text-green-600">Close & Bill</Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-blue-600">Manage</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
