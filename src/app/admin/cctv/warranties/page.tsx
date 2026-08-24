import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function AdminWarrantiesPage() {
  const supabase = await createClient();
  
  const { data: warranties, error } = await supabase
    .from('site_warranties')
    .select(`
      id,
      start_date,
      end_date,
      status,
      products ( name, brand, model ),
      customer_sites ( name, customers (company_name, profiles(full_name)) ),
      tickets ( id )
    `)
    .order('end_date', { ascending: true }); // Show soonest to expire first

  if (error) {
    console.error('Error fetching warranties:', error);
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Active</span>;
      case 'EXPIRED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">Expired</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hardware Warranties (CCTV)</h1>
          <p className="mt-1 text-sm text-gray-500">Track active warranties and product coverages across all sites.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hardware Coverages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Hardware (Product)</th>
                  <th className="px-6 py-3 font-medium">Customer & Site</th>
                  <th className="px-6 py-3 font-medium">Installation Ticket</th>
                  <th className="px-6 py-3 font-medium">Validity</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {warranties && warranties.length > 0 ? (
                  warranties.map((w: any) => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-medium text-slate-900">{w.products?.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{w.products?.brand} {w.products?.model}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-medium text-slate-900">
                          {w.customer_sites?.customers?.company_name || w.customer_sites?.customers?.profiles?.full_name || 'Unknown'}
                        </div>
                        <div className="text-slate-500 mt-0.5">{w.customer_sites?.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {w.tickets ? (
                           <span className="font-mono text-xs">{w.tickets.id.split('-')[0].toUpperCase()}</span>
                        ) : 'Manual'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div>From: {new Date(w.start_date).toLocaleDateString()}</div>
                        <div className="text-slate-900 font-medium">To: {new Date(w.end_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(w.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No warranties found.
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
