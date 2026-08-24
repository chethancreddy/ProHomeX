import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Users, Plus, Building2, Phone, Mail, MapPin } from 'lucide-react';
import AddCustomerModal from './AddCustomerModal';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const supabase = createAdminClient();

  const { data: customers, error } = await supabase
    .from('customers')
    .select(`
      id, company_name, tax_id, created_at,
      profiles(full_name, email, phone_number),
      customer_sites(id, name, city)
    `)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching customers:', error.message);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {customers?.length || 0} customer{customers?.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <AddCustomerModal />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{customers?.length || 0}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Customers</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">
            {customers?.filter((c: any) => c.company_name).length || 0}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">Business Accounts</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">
            {(customers as any[])?.reduce((s: number, c: any) => s + (c.customer_sites?.length || 0), 0) || 0}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">Total Sites</p>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {customers && customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Sites</th>
                  <th className="px-5 py-3">Since</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(customers as any[]).map(c => {
                  const profile = c.profiles;
                  const sites = c.customer_sites || [];
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {(c.company_name || profile?.full_name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{profile?.full_name || 'No name'}</p>
                            {c.company_name && <p className="text-xs text-slate-400">{c.company_name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {profile?.email && (
                          <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                            <Mail size={12} /> {profile.email}
                          </a>
                        )}
                        {profile?.phone_number && (
                          <a href={`tel:${profile.phone_number}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mt-0.5 transition-colors">
                            <Phone size={12} /> {profile.phone_number}
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {c.company_name
                          ? <span className="flex items-center gap-1.5 text-sm text-slate-700"><Building2 size={13} />{c.company_name}</span>
                          : <span className="text-xs text-slate-300">Individual</span>
                        }
                        {c.tax_id && <p className="text-xs text-slate-400 mt-0.5">GST: {c.tax_id}</p>}
                      </td>
                      <td className="px-5 py-4">
                        {sites.length > 0 ? (
                          <div className="space-y-0.5">
                            {sites.slice(0, 2).map((s: any) => (
                              <p key={s.id} className="flex items-center gap-1 text-xs text-slate-600">
                                <MapPin size={10} className="text-slate-400" /> {s.name}{s.city ? `, ${s.city}` : ''}
                              </p>
                            ))}
                            {sites.length > 2 && <p className="text-xs text-slate-400">+{sites.length - 2} more</p>}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">No sites</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/admin/quotations/new?customerId=${c.id}`}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            + Quote
                          </Link>
                          <Link href={`/admin/customers/${c.id}`}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            View →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Users className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-base font-semibold text-gray-600">No customers yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">Add your first customer to get started.</p>
            <AddCustomerModal />
          </div>
        )}
      </div>
    </div>
  );
}
