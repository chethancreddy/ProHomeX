import { getStaffAccounts } from './actions';
import SettingsClient from './SettingsClient';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch staff accounts to manage
  const staff = await getStaffAccounts();

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings & Staff Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your own credentials and internal staff accounts.</p>
      </div>

      <SettingsClient initialStaff={staff} currentUserEmail={user.email || ''} />
    </div>
  );
}
