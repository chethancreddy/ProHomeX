'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateAdminCredentials(email?: string, password?: string) {
  try {
    const supabase = await createClient();
    const updates: any = {};
    if (email) updates.email = email;
    if (password) updates.password = password;

    const { error } = await supabase.auth.updateUser(updates);
    
    if (error) return { success: false, error: error.message };
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred' };
  }
}

export async function createStaffAccount(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as string;

    const supabaseAdmin = createAdminClient();
    
    // Create the user in auth.users
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role,
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred' };
  }
}

export async function updateStaffRole(userId: string, newRole: string) {
  try {
    const supabaseAdmin = createAdminClient();
    
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) return { success: false, error: error.message };
    
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred' };
  }
}

export async function getStaffAccounts() {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .neq('role', 'CUSTOMER')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
