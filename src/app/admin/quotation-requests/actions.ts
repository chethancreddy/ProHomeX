'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

  // Create the request
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

  // Insert items
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

// Admin actions
export async function updateRequestStatus(requestId: string, status: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('quotation_requests')
    .update({ status })
    .eq('id', requestId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/quotation-requests');
  revalidatePath(`/admin/quotation-requests/${requestId}`);
}

export async function addAdminNote(requestId: string, note: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('quotation_requests')
    .update({ admin_notes: note })
    .eq('id', requestId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/quotation-requests/${requestId}`);
}

export async function convertRequestToQuotation(requestId: string): Promise<string> {
  const supabase = createAdminClient();

  // Fetch full request with items and selling prices
  const { data: request, error: rErr } = await supabase
    .from('quotation_requests')
    .select(`
      id, customer_id,
      quotation_request_items(
        product_id, quantity,
        products(name, product_prices(selling_price, is_current))
      )
    `)
    .eq('id', requestId)
    .single();

  if (rErr || !request) throw new Error('Request not found');

  const items = request.quotation_request_items as any[];
  const totalAmount = items.reduce((sum: number, item: any) => {
    const currentPrice = (item.products?.product_prices || []).find((p: any) => p.is_current);
    return sum + (currentPrice?.selling_price || 0) * item.quantity;
  }, 0);

  // Create formal quotation
  const { data: quotation, error: qErr } = await supabase
    .from('quotations')
    .insert({
      customer_id: request.customer_id,
      status: 'DRAFT',
      total_amount: totalAmount,
      source: 'CUSTOMER_REQUEST',
    })
    .select('id')
    .single();

  if (qErr) throw new Error(qErr.message);

  // Create quotation items
  const qItems = items.map((item: any) => {
    const currentPrice = (item.products?.product_prices || []).find((p: any) => p.is_current);
    return {
      quotation_id: quotation.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_at_time: currentPrice?.selling_price || 0,
    };
  });

  await supabase.from('quotation_items').insert(qItems);

  // Link request → quotation and mark as QUOTED
  await supabase.from('quotation_requests').update({
    status: 'QUOTED',
    converted_quotation_id: quotation.id,
  }).eq('id', requestId);

  revalidatePath('/admin/quotation-requests');
  revalidatePath('/admin/quotations');
  return quotation.id;
}
