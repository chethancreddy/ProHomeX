import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function AdminAMCPage() {
  const supabase = await createClient();
  
  const { data: contracts, error } = await supabase
    .from('site_amc_contracts')
    .select(`
      id,
      start_date,
      end_date,
      status,
      visits_included,
      visits_completed,
      contract_value,
      customers ( company_name, profiles(full_name) ),
      customer_sites ( name, city )
    `)
    .order('end_date', { ascending: true }); // Show soonest to expire first

  if (error) {
    console.error('Error fetching AMC contracts:', error);
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Active</span>;
      case 'RENEWAL_DUE': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium animate-pulse">Renewal Due</span>;
      case 'EXPIRED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">Expired</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AMC Contracts (CCTV)</h1>
          <p className="mt-1 text-sm text-gray-500">Manage Annual Maintenance Contracts and track renewals.</p>
        </div>
        <Button>New AMC Contract</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Contracts Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Customer & Site</th>
                  <th className="px-6 py-3 font-medium">Validity</th>
                  <th className="px-6 py-3 font-medium">Visits (Done/Total)</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {contracts && contracts.length > 0 ? (
                  contracts.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-medium text-slate-900">{c.customers?.company_name || c.customers?.profiles?.full_name || 'Unknown'}</div>
                        <div className="text-slate-500 mt-0.5">{c.customer_sites?.name} ({c.customer_sites?.city})</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div>From: {new Date(c.start_date).toLocaleDateString()}</div>
                        <div className="text-slate-900 font-medium">To: {new Date(c.end_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-900">{c.visits_completed}</span>
                            <span className="text-slate-400">/</span>
                            <span>{c.visits_included}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(c.status)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {(c.status === 'RENEWAL_DUE' || c.status === 'EXPIRED') && (
                          <Button variant="ghost" size="sm" className="text-orange-600">Renew</Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-blue-600">Manage</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No AMC contracts found.
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
