import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function AdminSiteLoadsPage() {
  const supabase = await createClient();
  
  const { data: loads, error } = await supabase
    .from('ups_site_loads')
    .select(`
      id,
      calculated_kva,
      phase_type,
      last_assessed,
      customer_sites ( name, city, customers (company_name, profiles(full_name)) )
    `)
    .order('last_assessed', { ascending: false });

  if (error) {
    console.error('Error fetching site loads:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Electrical Load Assessments (UPS)</h1>
          <p className="mt-1 text-sm text-gray-500">Manage site electrical load requirements for accurate UPS sizing.</p>
        </div>
        <Button>New Assessment</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Site Requirements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Customer & Site</th>
                  <th className="px-6 py-3 font-medium text-right">Required Load (kVA)</th>
                  <th className="px-6 py-3 font-medium">Phase Type</th>
                  <th className="px-6 py-3 font-medium">Last Assessed</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loads && loads.length > 0 ? (
                  loads.map((l: any) => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-medium text-slate-900">
                          {l.customer_sites?.customers?.company_name || l.customer_sites?.customers?.profiles?.full_name || 'Unknown'}
                        </div>
                        <div className="text-slate-500 mt-0.5">{l.customer_sites?.name} ({l.customer_sites?.city})</div>
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-slate-900 text-right">
                        {l.calculated_kva} kVA
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                         {l.phase_type === 'SINGLE' ? 'Single Phase (1Φ)' : 'Three Phase (3Φ)'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                         {new Date(l.last_assessed).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" className="text-blue-600">Update Load</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No load assessments found.
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
