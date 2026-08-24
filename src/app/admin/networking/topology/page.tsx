import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function AdminNetworkTopologyPage() {
  const supabase = await createClient();
  
  const { data: racks, error } = await supabase
    .from('net_racks')
    .select(`
      id,
      rack_name,
      location_details,
      u_height,
      customer_sites ( name, customers (company_name, profiles(full_name)) ),
      net_cable_drops ( quantity, drop_type, tested_and_certified )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching racks:', error);
  }

  // Helper to sum drops
  const summarizeDrops = (dropsArray: any[]) => {
    let total = 0;
    let certified = 0;
    
    dropsArray.forEach(d => {
      total += d.quantity;
      if (d.tested_and_certified) {
        certified += d.quantity;
      }
    });

    return { total, certified };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Network Topology (Racks & IDF)</h1>
          <p className="mt-1 text-sm text-gray-500">Manage physical network infrastructure and rack locations across sites.</p>
        </div>
        <Button>Register New Rack</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployed Infrastructure</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Customer & Site</th>
                  <th className="px-6 py-3 font-medium">Rack Designation</th>
                  <th className="px-6 py-3 font-medium">Location Details</th>
                  <th className="px-6 py-3 font-medium">Total Cable Drops</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {racks && racks.length > 0 ? (
                  racks.map((r: any) => {
                    const stats = summarizeDrops(r.net_cable_drops || []);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div className="font-medium text-slate-900">
                            {r.customer_sites?.customers?.company_name || r.customer_sites?.customers?.profiles?.full_name || 'Unknown'}
                          </div>
                          <div className="text-slate-500 mt-0.5">{r.customer_sites?.name}</div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-slate-900">{r.rack_name}</div>
                           <div className="text-xs text-slate-500 mt-0.5">{r.u_height}U Capacity</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                           {r.location_details || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-2">
                             <span className="font-medium text-slate-900">{stats.total} Nodes</span>
                             {stats.total > 0 && (
                                <span className={`text-xs ${stats.certified === stats.total ? 'text-green-600' : 'text-orange-600'}`}>
                                  ({stats.certified} Certified)
                                </span>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button variant="ghost" size="sm" className="text-blue-600">Manage Devices</Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No racks registered.
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
