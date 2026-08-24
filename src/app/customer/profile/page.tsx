'use client';
import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Phone, Building, Save } from 'lucide-react';
import { useEffect } from 'react';

export default function CustomerProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: c } = await supabase.from('customers').select('company_name, tax_id').eq('profile_id', user.id).single();
      setProfile({ ...p, ...c, email: user.email });
      setFullName(p?.full_name || '');
      setPhone(p?.phone_number || '');
      setCompany(c?.company_name || '');
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: pe } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone_number: phone })
        .eq('id', user.id);
      if (pe) throw pe;

      const { error: ce } = await supabase
        .from('customers')
        .update({ company_name: company })
        .eq('profile_id', user.id);
      if (ce) throw ce;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your contact details and account information.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Avatar banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-24 relative">
          <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-xl font-bold text-blue-600">
            {fullName?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
        </div>
        <div className="pt-12 px-6 pb-2">
          <p className="text-lg font-bold text-gray-900">{fullName || 'Customer'}</p>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <FormField icon={User} label="Full Name">
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </FormField>

          <FormField icon={Mail} label="Email Address">
            <input
              type="email"
              value={profile.email || ''}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support if needed.</p>
          </FormField>

          <FormField icon={Phone} label="Phone Number">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </FormField>

          <FormField icon={Building} label="Company Name">
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Your company name (optional)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </FormField>

          <div className="pt-2 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm shadow-sm"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ icon: Icon, label, children }: { icon: React.ComponentType<any>; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
        <Icon size={14} className="text-gray-400" /> {label}
      </label>
      {children}
    </div>
  );
}
