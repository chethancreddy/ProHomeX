import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function AdminLeadsPage() {
  // Use service role client to bypass RLS (avoids "Error fetching leads: {}" bug)
  const supabase = createAdminClient();
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, reference_number, name, phone, email, service, location, requirement, status, created_at')
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching leads:', error.message);

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-700',
      CONTACTED: 'bg-yellow-100 text-yellow-700',
      CONVERTED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-gray-100 text-gray-600',
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[s] || 'bg-gray-100'}`}>{s}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-sm text-gray-500 mt-0.5">Enquiries received from the public website quote form.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {leads && leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Requirement</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-blue-600">{l.reference_number || '—'}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-900">{l.name}</p>
                      {l.email && <p className="text-xs text-slate-400">{l.email}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{l.phone}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{l.service}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{l.location || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 max-w-[200px] truncate">{l.requirement || '—'}</td>
                    <td className="px-5 py-4">{statusBadge(l.status)}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{new Date(l.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-gray-400">
            <p className="font-medium text-gray-600 text-base">No leads yet</p>
            <p className="mt-1">Leads submitted via the public &quot;Request a Quote&quot; form will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
