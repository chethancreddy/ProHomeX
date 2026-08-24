import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function AdminCableDropsPage() {
  const supabase = await createClient();
  
  const { data: drops, error } = await supabase
    .from('net_cable_drops')
    .select(`
      id,
      drop_type,
      quantity,
      tested_and_certified,
      created_at,
      net_racks ( rack_name, customer_sites(name, customers(company_name, profiles(full_name))) ),
      tickets ( id )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cable drops:', error);
  }

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'DATA': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">Data (RJ45)</span>;
      case 'VOICE': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">Voice</span>;
      case 'FIBER': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">Fiber Optic</span>;
      case 'CCTV': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">CCTV Link</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Structured Cabling Drops</h1>
          <p className="mt-1 text-sm text-gray-500">Log cable runs and track testing/certification statuses for billing.</p>
        </div>
        <Button>Log Drops</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Cabling Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Customer & Site</th>
                  <th className="px-6 py-3 font-medium">Termination Rack</th>
                  <th className="px-6 py-3 font-medium text-center">Drops</th>
                  <th className="px-6 py-3 font-medium">Testing Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {drops && drops.length > 0 ? (
                  drops.map((d: any) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-medium text-slate-900">
                          {d.net_racks?.customer_sites?.customers?.company_name || d.net_racks?.customer_sites?.customers?.profiles?.full_name || 'Unknown'}
                        </div>
                        <div className="text-slate-500 mt-0.5">{d.net_racks?.customer_sites?.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {d.net_racks?.rack_name || 'Unknown Rack'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-lg font-bold text-slate-900">{d.quantity}</div>
                        <div className="mt-1">{getTypeBadge(d.drop_type)}</div>
                      </td>
                      <td className="px-6 py-4">
                        {d.tested_and_certified ? (
                          <span className="flex items-center text-green-600 text-sm font-medium">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Certified
                          </span>
                        ) : (
                          <span className="flex items-center text-orange-600 text-sm font-medium">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Pending Test
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {!d.tested_and_certified && (
                           <Button variant="ghost" size="sm" className="text-green-600">Mark Tested</Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-blue-600">Details</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No cable drops logged.
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
