import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default async function CustomerWarrantyPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;

  // Find customer ID based on user profile
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', session.user.id)
    .single();

  if (!customer) return <div>Customer profile not found</div>;

  // Fetch warranties for this customer
  const { data: warranties, error } = await supabase
    .from('site_warranties')
    .select(`
      id,
      start_date,
      end_date,
      status,
      customer_sites!inner ( name, customer_id ),
      products ( name, brand, model )
    `)
    .eq('customer_sites.customer_id', customer.id)
    .order('end_date', { ascending: true });

  if (error) console.error('Error fetching warranties:', error);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warranty & AMC Contracts</h1>
          <p className="mt-1 text-sm text-gray-500">Track active warranties and Annual Maintenance Contracts for your deployed hardware.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hardware Warranties</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Product / Model</th>
                  <th className="px-6 py-3 font-medium">Site</th>
                  <th className="px-6 py-3 font-medium">Valid From</th>
                  <th className="px-6 py-3 font-medium">Valid Until</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {warranties && warranties.length > 0 ? (
                  warranties.map((w: any) => {
                    const isExpired = new Date(w.end_date) < new Date();
                    return (
                      <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div className="font-medium text-slate-900">{w.products?.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{w.products?.brand} {w.products?.model}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {w.customer_sites?.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(w.start_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {new Date(w.end_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {isExpired || w.status !== 'ACTIVE' ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">Expired</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Active</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No warranties found for your sites.
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
