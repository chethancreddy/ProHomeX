import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function AdminNetMeteringPage() {
  const supabase = await createClient();
  
  const { data: applications, error } = await supabase
    .from('solar_net_metering')
    .select(`
      id,
      application_number,
      status,
      submission_date,
      approval_date,
      tickets ( id ),
      customer_sites ( name, customers (company_name, profiles(full_name)) )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching net metering applications:', error);
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DOCUMENT_COLLECTION': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-medium">Doc Collection</span>;
      case 'SUBMITTED': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">Submitted</span>;
      case 'APPROVED': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Approved</span>;
      case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">Rejected</span>;
      case 'COMMISSIONED': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">Commissioned</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Net Metering Applications (Solar)</h1>
          <p className="mt-1 text-sm text-gray-500">Track grid interconnection applications and utility approvals.</p>
        </div>
        <Button>New Application</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">App Number</th>
                  <th className="px-6 py-3 font-medium">Customer & Site</th>
                  <th className="px-6 py-3 font-medium">Installation Ticket</th>
                  <th className="px-6 py-3 font-medium">Dates</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications && applications.length > 0 ? (
                  applications.map((app: any) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-slate-900">
                        {app.application_number || <span className="text-slate-400 italic">Pending</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-medium text-slate-900">
                           {app.customer_sites?.customers?.company_name || app.customer_sites?.customers?.profiles?.full_name || 'Unknown'}
                        </div>
                        <div className="text-slate-500 mt-0.5">{app.customer_sites?.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {app.tickets ? (
                           <span className="font-mono text-xs">{app.tickets.id.split('-')[0].toUpperCase()}</span>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                         {app.submission_date && <div className="text-xs">Sub: {new Date(app.submission_date).toLocaleDateString()}</div>}
                         {app.approval_date && <div className="text-xs text-green-600">App: {new Date(app.approval_date).toLocaleDateString()}</div>}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {app.status === 'DOCUMENT_COLLECTION' && (
                          <Button variant="ghost" size="sm" className="text-blue-600">Submit</Button>
                        )}
                        {app.status === 'SUBMITTED' && (
                          <Button variant="ghost" size="sm" className="text-green-600">Mark Approved</Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No net metering applications found.
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
