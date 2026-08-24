import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export default async function CustomerWarrantyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: customer } = await supabase
    .from('customers').select('id').eq('profile_id', user.id).single();

  let warranties: any[] = [];
  let amcContracts: any[] = [];

  if (customer) {
    const [w, a] = await Promise.all([
      supabase
        .from('site_warranties')
        .select('id, start_date, end_date, status, notes, products(name), customer_sites(name, city)')
        .in('site_id', 
          (await supabase.from('customer_sites').select('id').eq('customer_id', customer.id)).data?.map((s: any) => s.id) || []
        )
        .order('end_date', { ascending: false }),
      supabase
        .from('site_amc_contracts')
        .select('id, start_date, end_date, status, contract_value, visits_included, visits_completed, customer_sites(name, city)')
        .eq('customer_id', customer.id)
        .order('end_date', { ascending: false }),
    ]);
    warranties = w.data || [];
    amcContracts = a.data || [];
  }

  const warrantyBadge = (s: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      EXPIRED: 'bg-gray-100 text-gray-600',
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[s] || 'bg-gray-100'}`}>{s}</span>;
  };

  const amcBadge = (s: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      EXPIRED: 'bg-gray-100 text-gray-600',
      RENEWAL_DUE: 'bg-orange-100 text-orange-700',
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[s] || 'bg-gray-100'}`}>{s.replace('_', ' ')}</span>;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Warranty & AMC</h1>
        <p className="mt-1 text-sm text-gray-500">View equipment warranties and Annual Maintenance Contract coverage.</p>
      </div>

      {/* Warranties */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Equipment Warranties</h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {warranties.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Site</th>
                  <th className="px-6 py-3">Start</th>
                  <th className="px-6 py-3">Expires</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warranties.map((w: any) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{w.products?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{w.customer_sites?.name || '—'}{w.customer_sites?.city ? `, ${w.customer_sites.city}` : ''}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(w.start_date).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(w.end_date).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4">{warrantyBadge(w.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-sm text-gray-400">No warranties registered for your account.</div>
          )}
        </div>
      </section>

      {/* AMC Contracts */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">AMC Contracts</h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {amcContracts.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Site</th>
                  <th className="px-6 py-3">Contract Period</th>
                  <th className="px-6 py-3">Value</th>
                  <th className="px-6 py-3">Visits</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {amcContracts.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{a.customer_sites?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(a.start_date).toLocaleDateString('en-IN')} – {new Date(a.end_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹{a.contract_value?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{a.visits_completed}/{a.visits_included}</td>
                    <td className="px-6 py-4">{amcBadge(a.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-sm text-gray-400">No AMC contracts found. Contact us to learn about our maintenance packages.</div>
          )}
        </div>
      </section>
    </div>
  );
}
