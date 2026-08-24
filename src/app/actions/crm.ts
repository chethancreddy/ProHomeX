'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createCustomerSite(customerId: string, siteData: { name: string, address_line1: string, city?: string, state?: string, zip?: string }) {
  const supabase = await createClient();

  // Validate admin rights or if the user is the customer themselves
  // In a real app, rely on RLS or enforce explicitly here:
  const { data: user, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user?.user) throw new Error('Unauthorized');

  const { error } = await supabase.from('customer_sites').insert({
    customer_id: customerId,
    ...siteData
  });

  if (error) {
    console.error('Error creating site:', error);
    throw new Error(error.message);
  }

  revalidatePath('/admin/customers');
  revalidatePath('/dashboard');
}

export async function createCustomerContact(customerId: string, contactData: { name: string, phone?: string, email?: string, is_primary?: boolean }) {
  const supabase = await createClient();

  const { error } = await supabase.from('customer_contacts').insert({
    customer_id: customerId,
    ...contactData
  });

  if (error) {
    console.error('Error creating contact:', error);
    throw new Error(error.message);
  }

  revalidatePath('/admin/customers');
  revalidatePath('/dashboard');
}
