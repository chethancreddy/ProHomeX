import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function CustomerInvoicesPage() {
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

  // Fetch invoices for this customer
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      due_date,
      paid_at,
      tickets ( id )
    `)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching invoices:', error);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DRAFT': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">Processing</span>;
      case 'ISSUED': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium animate-pulse">Unpaid</span>;
      case 'PAID': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Paid</span>;
      case 'VOID': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">Void</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">View billing history and download invoices for completed work orders.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Invoice ID</th>
                  <th className="px-6 py-3 font-medium">Date Issued</th>
                  <th className="px-6 py-3 font-medium">Due Date</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices && invoices.length > 0 ? (
                  invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                        {inv.id.split('-')[0]}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                        ${inv.total_amount?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {inv.status === 'ISSUED' && (
                           <Button variant="ghost" size="sm" className="text-green-600">Pay Now</Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-blue-600">Download PDF</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No invoices found for your account.
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
