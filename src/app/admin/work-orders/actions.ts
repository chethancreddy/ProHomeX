'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function assignTechnician(workOrderId: string, technicianId: string, scheduledDate?: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('work_orders').update({
    assigned_to: technicianId || null,
    scheduled_date: scheduledDate || null,
    status: technicianId ? 'ASSIGNED' : 'PENDING',
  }).eq('id', workOrderId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/work-orders/${workOrderId}`);
  revalidatePath('/admin/work-orders');
}

export async function updateWorkOrderStatus(workOrderId: string, status: string): Promise<void> {
  const supabase = createAdminClient();
  const update: any = { status };
  if (status === 'IN_PROGRESS') update.started_at = new Date().toISOString();
  const { error } = await supabase.from('work_orders').update(update).eq('id', workOrderId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/work-orders/${workOrderId}`);
  revalidatePath('/admin/work-orders');
}

export interface ChangeData {
  changeType: 'ADDED' | 'REMOVED' | 'QTY_CHANGE' | 'PRICE_CHANGE' | 'DISCOUNT' | 'SERVICE';
  quotationItemId?: string; // for changes to existing items
  productId?: string;
  description: string;
  originalQty: number;
  originalPrice: number;
  gstRate: number;
  revisedQty?: number;
  revisedPrice?: number;
  changeNotes?: string;
}

export async function addWorkOrderChange(workOrderId: string, change: ChangeData): Promise<void> {
  const supabase = createAdminClient();
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();

  const { error } = await supabase.from('work_order_items').insert({
    work_order_id: workOrderId,
    quotation_item_id: change.quotationItemId || null,
    product_id: change.productId || null,
    description: change.description.trim(),
    original_qty: Number(change.originalQty) || 0,
    original_price: Number(change.originalPrice) || 0,
    gst_rate: Number(change.gstRate) || 0,
    change_type: change.changeType,
    revised_qty: change.revisedQty !== undefined && change.revisedQty !== null ? Number(change.revisedQty) : null,
    revised_price: change.revisedPrice !== undefined && change.revisedPrice !== null ? Number(change.revisedPrice) : null,
    change_notes: change.changeNotes?.trim() || null,
    changed_at: new Date().toISOString(),
    changed_by: user?.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/work-orders/${workOrderId}`);
  revalidatePath('/admin/work-orders');
}

export async function completeWorkOrderAndGenerateInvoice(workOrderId: string): Promise<string> {
  const supabase = createAdminClient();

  // 1. Fetch work order details
  const { data: wo, error: woErr } = await supabase
    .from('work_orders')
    .select('id, customer_id, site_id, quotation_id')
    .eq('id', workOrderId)
    .single();
  if (woErr || !wo) throw new Error(woErr?.message || 'Work order not found');

  // 2. Fetch all work order items
  const { data: items, error: itemsErr } = await supabase
    .from('work_order_items')
    .select('*')
    .eq('work_order_id', workOrderId)
    .order('created_at');
  if (itemsErr) throw new Error(itemsErr.message);

  // 3. Fetch total advance paid for this quotation
  let totalAdvancePaid = 0;
  if (wo.quotation_id) {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('quotation_id', wo.quotation_id)
      .eq('payment_type', 'ADVANCE');
    totalAdvancePaid = (payments || []).reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
  }

  // 4. Reconcile modifications against original items
  const allItems = (items || []) as any[];
  const originals = allItems.filter(i => i.change_type === 'ORIGINAL');

  // Build sets/maps by quotation_item_id AND by description for resilient matching
  const removedKeys = new Set<string>();
  const qtyChangeMap = new Map<string, any>();
  const priceChangeMap = new Map<string, any>();

  allItems.forEach(i => {
    const key1 = i.quotation_item_id ? String(i.quotation_item_id) : null;
    const key2 = (i.description || '').toLowerCase().trim();

    if (i.change_type === 'REMOVED') {
      if (key1) removedKeys.add(key1);
      if (key2) removedKeys.add(key2);
    }
    if (i.change_type === 'QTY_CHANGE') {
      if (key1) qtyChangeMap.set(key1, i);
      if (key2) qtyChangeMap.set(key2, i);
    }
    if (i.change_type === 'PRICE_CHANGE') {
      if (key1) priceChangeMap.set(key1, i);
      if (key2) priceChangeMap.set(key2, i);
    }
  });

  const additions = allItems.filter(i => ['ADDED', 'SERVICE'].includes(i.change_type));
  const discounts = allItems.filter(i => i.change_type === 'DISCOUNT');

  const invoiceLines: {
    description: string;
    quantity: number;
    unit_price: number;
    gst_rate: number;
    gst_amount: number;
    discount: number;
    amount: number;
    item_type: string;
    sort_order: number;
  }[] = [];

  let sortIdx = 0;

  // Process Original items (with updates/removals)
  for (const item of originals) {
    const key1 = item.quotation_item_id ? String(item.quotation_item_id) : null;
    const key2 = (item.description || '').toLowerCase().trim();

    // Check if removed
    if ((key1 && removedKeys.has(key1)) || removedKeys.has(key2)) {
      continue;
    }

    // Check for quantity change
    const qtyChange = (key1 ? qtyChangeMap.get(key1) : null) || qtyChangeMap.get(key2);
    // Check for price change
    const priceChange = (key1 ? priceChangeMap.get(key1) : null) || priceChangeMap.get(key2);

    const finalQty = Number(qtyChange && qtyChange.revised_qty !== null ? qtyChange.revised_qty : item.original_qty);
    const finalPrice = Number(priceChange && priceChange.revised_price !== null ? priceChange.revised_price : item.original_price);
    const rate = Number(item.gst_rate) || 0;

    const taxable = finalQty * finalPrice;
    const gstAmt = (taxable * rate) / 100;

    invoiceLines.push({
      description: item.description,
      quantity: finalQty,
      unit_price: finalPrice,
      gst_rate: rate,
      gst_amount: gstAmt,
      discount: 0,
      amount: taxable + gstAmt,
      item_type: 'PRODUCT',
      sort_order: sortIdx++,
    });
  }

  // Process Added items / Service charges
  for (const item of additions) {
    const qty = Number(item.original_qty) || 1;
    const price = Number(item.original_price) || 0;
    const rate = Number(item.gst_rate) || 0;
    const taxable = qty * price;
    const gstAmt = (taxable * rate) / 100;

    invoiceLines.push({
      description: item.description,
      quantity: qty,
      unit_price: price,
      gst_rate: rate,
      gst_amount: gstAmt,
      discount: 0,
      amount: taxable + gstAmt,
      item_type: item.change_type === 'SERVICE' ? 'SERVICE' : 'PRODUCT',
      sort_order: sortIdx++,
    });
  }

  // Process Discounts
  for (const item of discounts) {
    const discAmt = Number(item.original_price) || Number(item.revised_price) || 0;
    if (discAmt > 0) {
      invoiceLines.push({
        description: item.description || 'Special Discount / Price Adjustment',
        quantity: 1,
        unit_price: -discAmt,
        gst_rate: 0,
        gst_amount: 0,
        discount: 0,
        amount: -discAmt,
        item_type: 'DISCOUNT',
        sort_order: sortIdx++,
      });
    }
  }

  // Calculate invoice financial totals
  const subtotal = invoiceLines
    .filter(l => l.item_type !== 'DISCOUNT')
    .reduce((s, l) => s + (l.quantity * l.unit_price), 0);

  const gstTotal = invoiceLines
    .filter(l => l.item_type !== 'DISCOUNT')
    .reduce((s, l) => s + l.gst_amount, 0);

  const discountTotal = Math.abs(
    invoiceLines
      .filter(l => l.item_type === 'DISCOUNT')
      .reduce((s, l) => s + l.amount, 0)
  );

  const totalAmount = Math.max(0, subtotal + gstTotal - discountTotal);
  const balanceDue = Math.max(0, totalAmount - totalAdvancePaid);

  // 5. Create Invoice record (Note: invoices table does NOT have created_by)
  const { data: invoice, error: invErr } = await supabase.from('invoices').insert({
    customer_id: wo.customer_id,
    work_order_id: workOrderId,
    quotation_id: wo.quotation_id || null,
    status: 'DRAFT',
    subtotal,
    gst_total: gstTotal,
    discount_total: discountTotal,
    advance_paid: totalAdvancePaid,
    balance_due: balanceDue,
    total_amount: totalAmount,
  }).select('id').single();

  if (invErr) throw new Error(`Invoice generation failed: ${invErr.message}`);

  // 6. Insert all itemized lines
  if (invoiceLines.length > 0) {
    const { error: itemsInsertErr } = await supabase.from('invoice_items').insert(
      invoiceLines.map(l => ({
        invoice_id: invoice.id,
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unit_price,
        gst_rate: l.gst_rate,
        gst_amount: l.gst_amount,
        discount: l.discount,
        amount: l.amount,
        item_type: l.item_type,
        sort_order: l.sort_order,
      }))
    );
    if (itemsInsertErr) throw new Error(`Invoice items insert failed: ${itemsInsertErr.message}`);
  }

  // 7. Mark Work Order as COMPLETED
  await supabase.from('work_orders').update({
    status: 'COMPLETED',
    completed_date: new Date().toISOString().split('T')[0],
  }).eq('id', workOrderId);

  // 8. Revalidate routes
  revalidatePath('/admin/work-orders');
  revalidatePath(`/admin/work-orders/${workOrderId}`);
  revalidatePath('/admin/invoices');
  revalidatePath(`/admin/invoices/${invoice.id}`);
  revalidatePath('/admin/accounting');

  return invoice.id;
}
