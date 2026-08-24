'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface QuoteItem {
  productId: string;
  quantity: number;
}

export async function submitQuotationRequest(
  items: QuoteItem[],
  notes: string
): Promise<{ requestId: string; requestNumber: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get customer record
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!customer) throw new Error('Customer profile not found. Please contact support.');
  if (!items.length) throw new Error('No items in your quote request.');

  // Create the request record
  const { data: request, error: reqErr } = await supabase
    .from('quotation_requests')
    .insert({
      customer_id: customer.id,
      customer_notes: notes.trim() || null,
      status: 'PENDING',
    })
    .select('id, request_number')
    .single();

  if (reqErr) throw new Error(reqErr.message);

  // Insert all items
  const itemRows = items.map((item) => ({
    request_id: request.id,
    product_id: item.productId,
    quantity: item.quantity,
  }));

  const { error: itemErr } = await supabase.from('quotation_request_items').insert(itemRows);
  if (itemErr) throw new Error(itemErr.message);

  revalidatePath('/customer/quotations');
  return { requestId: request.id, requestNumber: request.request_number };
}
