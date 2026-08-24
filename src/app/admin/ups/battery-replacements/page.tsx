import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function AdminBatteryReplacementsPage() {
  const supabase = await createClient();
  
  const { data: batteries, error } = await supabase
    .from('ups_battery_lifecycles')
    .select(`
      id,
      quantity,
      installation_date,
      expected_life_months,
      replacement_status,
      products ( name, brand, model ),
      customer_sites ( name, city, customers (company_name, profiles(full_name)) ),
      tickets ( id )
    `)
    .order('installation_date', { ascending: true }); // Oldest installations first

  if (error) {
    console.error('Error fetching battery lifecycles:', error);
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'HEALTHY': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Healthy</span>;
      case 'REPLACE_SOON': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium animate-pulse">Replace Soon</span>;
      case 'REPLACED': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">Replaced</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{status}</span>;
    }
  };

  const calculateExpiryDate = (installDate: string, months: number) => {
    const d = new Date(installDate);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Battery Replacements (UPS)</h1>
          <p className="mt-1 text-sm text-gray-500">Track battery degradation lifecycles to generate replacement sales leads.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Installed Batteries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Battery Model</th>
                  <th className="px-6 py-3 font-medium">Customer & Site</th>
                  <th className="px-6 py-3 font-medium">Installed On</th>
                  <th className="px-6 py-3 font-medium">Expected Expiry</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {batteries && batteries.length > 0 ? (
                  batteries.map((b: any) => {
                     const expiryDate = calculateExpiryDate(b.installation_date, b.expected_life_months);
                     return (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="font-medium text-slate-900">{b.quantity}x {b.products?.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{b.products?.brand} {b.products?.model}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="font-medium text-slate-900">
                              {b.customer_sites?.customers?.company_name || b.customer_sites?.customers?.profiles?.full_name || 'Unknown'}
                            </div>
                            <div className="text-slate-500 mt-0.5">{b.customer_sites?.name} ({b.customer_sites?.city})</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(b.installation_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {expiryDate.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(b.replacement_status)}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {b.replacement_status === 'REPLACE_SOON' && (
                              <Button variant="ghost" size="sm" className="text-orange-600">Create Quote</Button>
                            )}
                            <Button variant="ghost" size="sm" className="text-blue-600">Update</Button>
                          </td>
                        </tr>
                     );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No battery records found.
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
