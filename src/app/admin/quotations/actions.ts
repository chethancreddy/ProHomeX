'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface QuotationLineItem {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  discount: number;
  gstAmount: number;
  lineTotal: number;
  sortOrder: number;
}

export interface CreateQuotationData {
  customerId: string;
  siteId?: string;
  title?: string;
  terms?: string;
  validUntil?: string;
  advancePercentage: number;
  subtotal: number;
  gstTotal: number;
  discountTotal: number;
  totalAmount: number;
  items: QuotationLineItem[];
}

export async function createQuotation(data: CreateQuotationData): Promise<string> {
  const supabase = createAdminClient();
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();

  const { data: quotation, error } = await supabase
    .from('quotations')
    .insert({
      customer_id: data.customerId,
      site_id: data.siteId || null,
      title: data.title?.trim() || null,
      terms: data.terms?.trim() || null,
      valid_until: data.validUntil || null,
      advance_percentage: data.advancePercentage,
      advance_amount: data.totalAmount * data.advancePercentage / 100,
      subtotal: data.subtotal,
      gst_total: data.gstTotal,
      discount_total: data.discountTotal,
      total_amount: data.totalAmount,
      status: 'DRAFT',
      created_by: user?.id,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create quotation: ${error.message}`);

  if (data.items.length > 0) {
    const itemRows = data.items.map((item, i) => ({
      quotation_id: quotation.id,
      product_id: item.productId || null,
      description: item.description,
      quantity: item.quantity,
      unit_price_at_time: item.unitPrice,
      gst_rate: item.gstRate,
      gst_amount: item.gstAmount,
      discount: item.discount,
      line_total: item.lineTotal,
      sort_order: item.sortOrder ?? i,
    }));

    const { error: itemErr } = await supabase.from('quotation_items').insert(itemRows);
    if (itemErr) throw new Error(`Failed to add items: ${itemErr.message}`);
  }

  revalidatePath('/admin/quotations');
  return quotation.id;
}

export async function updateQuotation(id: string, data: CreateQuotationData): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from('quotations').update({
    customer_id: data.customerId,
    site_id: data.siteId || null,
    title: data.title?.trim() || null,
    terms: data.terms?.trim() || null,
    valid_until: data.validUntil || null,
    advance_percentage: data.advancePercentage,
    advance_amount: data.totalAmount * data.advancePercentage / 100,
    subtotal: data.subtotal,
    gst_total: data.gstTotal,
    discount_total: data.discountTotal,
    total_amount: data.totalAmount,
  }).eq('id', id);

  if (error) throw new Error(error.message);

  // Replace items
  await supabase.from('quotation_items').delete().eq('quotation_id', id);
  if (data.items.length > 0) {
    const itemRows = data.items.map((item, i) => ({
      quotation_id: id,
      product_id: item.productId || null,
      description: item.description,
      quantity: item.quantity,
      unit_price_at_time: item.unitPrice,
      gst_rate: item.gstRate,
      gst_amount: item.gstAmount,
      discount: item.discount,
      line_total: item.lineTotal,
      sort_order: item.sortOrder ?? i,
    }));
    await supabase.from('quotation_items').insert(itemRows);
  }

  revalidatePath('/admin/quotations');
  revalidatePath(`/admin/quotations/${id}`);
}

export async function markAsSent(quotationId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('quotations')
    .update({ status: 'SENT' }).eq('id', quotationId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/quotations');
  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function confirmQuotation(quotationId: string): Promise<void> {
  const supabase = createAdminClient();
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();

  const { error } = await supabase.from('quotations').update({
    status: 'CONFIRMED',
    confirmed_by: user?.id,
    confirmed_at: new Date().toISOString(),
  }).eq('id', quotationId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/quotations');
  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function rejectQuotation(quotationId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('quotations')
    .update({ status: 'REJECTED' }).eq('id', quotationId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/quotations');
  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function recordAdvancePayment(data: {
  quotationId: string;
  customerId: string;
  amount: number;
  method: string;
  reference?: string;
  receivedAt: string;
  notes?: string;
}): Promise<string> {
  const supabase = createAdminClient();
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();

  // 1. Create payment record
  const { error: payErr } = await supabase.from('payments').insert({
    customer_id: data.customerId,
    quotation_id: data.quotationId,
    payment_type: 'ADVANCE',
    amount: data.amount,
    payment_method: data.method,
    reference_number: data.reference || null,
    received_at: data.receivedAt,
    notes: data.notes || null,
    created_by: user?.id,
  });
  if (payErr) throw new Error(payErr.message);

  // 2. Update quotation
  const { error: qErr } = await supabase.from('quotations').update({
    status: 'ADVANCE_RECEIVED',
    advance_amount: data.amount,
    advance_paid_at: data.receivedAt,
  }).eq('id', data.quotationId);
  if (qErr) throw new Error(qErr.message);

  // 3. Fetch quotation details to build work order
  const { data: quotation } = await supabase.from('quotations')
    .select('customer_id, site_id, quotation_items(id, product_id, description, quantity, unit_price_at_time, gst_rate)')
    .eq('id', data.quotationId)
    .single();

  // 4. Create work order
  const { data: wo, error: woErr } = await supabase.from('work_orders').insert({
    quotation_id: data.quotationId,
    customer_id: quotation!.customer_id,
    site_id: quotation!.site_id,
    status: 'PENDING',
    created_by: user?.id,
  }).select('id').single();
  if (woErr) throw new Error(woErr.message);

  // 5. Copy quotation items to work order items
  const items = (quotation?.quotation_items || []) as any[];
  if (items.length > 0) {
    await supabase.from('work_order_items').insert(
      items.map((item: any) => ({
        work_order_id: wo.id,
        quotation_item_id: item.id,
        product_id: item.product_id,
        description: item.description || 'Item',
        original_qty: item.quantity,
        original_price: item.unit_price_at_time,
        gst_rate: item.gst_rate || 0,
        change_type: 'ORIGINAL',
      }))
    );
  }

  revalidatePath('/admin/quotations');
  revalidatePath(`/admin/quotations/${data.quotationId}`);
  revalidatePath('/admin/work-orders');
  return wo.id;
}
