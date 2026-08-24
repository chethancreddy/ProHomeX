'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createCustomer(data: {
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  taxId?: string;
  // Site (optional)
  siteName?: string;
  siteAddress?: string;
  siteCity?: string;
  siteState?: string;
}): Promise<{ customerId: string; error?: string }> {
  const supabase = createAdminClient();

  // Check if profile already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', data.email)
    .maybeSingle();

  let profileId: string;

  if (existing?.id) {
    profileId = existing.id;
  } else {
    // Create auth user (no password — they can set via email invite later)
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: data.email,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });

    if (authErr) return { customerId: '', error: authErr.message };

    // Profile is created by the auth trigger, but update it with full details
    await supabase.from('profiles').upsert({
      id: authUser.user.id,
      email: data.email,
      full_name: data.fullName,
      phone_number: data.phone || null,
      role: 'CUSTOMER',
    });

    profileId = authUser.user.id;
  }

  // Check if customer record already exists for this profile
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (existingCustomer?.id) {
    return { customerId: existingCustomer.id, error: 'A customer with this email already exists.' };
  }

  // Create customer record
  const { data: customer, error: custErr } = await supabase
    .from('customers')
    .insert({
      profile_id: profileId,
      company_name: data.companyName?.trim() || null,
      tax_id: data.taxId?.trim() || null,
    })
    .select('id')
    .single();

  if (custErr) return { customerId: '', error: custErr.message };

  // Create initial site if provided
  if (data.siteName?.trim()) {
    await supabase.from('customer_sites').insert({
      customer_id: customer.id,
      name: data.siteName.trim(),
      address_line1: data.siteAddress?.trim() || '',
      city: data.siteCity?.trim() || null,
      state: data.siteState?.trim() || null,
    });
  }

  revalidatePath('/admin/customers');
  revalidatePath('/admin/quotations/new');
  return { customerId: customer.id };
}
