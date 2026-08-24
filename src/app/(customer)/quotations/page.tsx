import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function CustomerQuotationsPage() {
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

  // Fetch quotations for this customer
  const { data: quotations, error } = await supabase
    .from('quotations')
    .select(`
      id,
      title,
      total_amount,
      status,
      created_at,
      valid_until,
      customer_sites ( name )
    `)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching quotations:', error);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DRAFT': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">Draft</span>;
      case 'SENT': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium animate-pulse">Pending Review</span>;
      case 'ACCEPTED': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Accepted</span>;
      case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">Rejected</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Quotations</h1>
          <p className="mt-1 text-sm text-gray-500">Review and approve project proposals and quotes.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Quotations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Quote ID & Title</th>
                  <th className="px-6 py-3 font-medium">Site</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quotations && quotations.length > 0 ? (
                  quotations.map((q: any) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-medium text-slate-900">{q.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">{q.id.split('-')[0]}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {q.customer_sites?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(q.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                        ${q.total_amount?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(q.status)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {q.status === 'SENT' && (
                           <Button variant="ghost" size="sm" className="text-green-600">Accept</Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-blue-600">View PDF</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No quotations found for your account.
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
