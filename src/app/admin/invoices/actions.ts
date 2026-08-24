'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function markInvoiceIssued(invoiceId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('invoices').update({ status: 'ISSUED' }).eq('id', invoiceId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath('/admin/invoices');
}

export async function recordFinalPayment(data: {
  invoiceId: string;
  customerId: string;
  quotationId?: string;
  workOrderId?: string;
  amount: number;
  method: string;
  reference?: string;
  receivedAt: string;
  notes?: string;
  newBalance: number;
}): Promise<void> {
  const supabase = createAdminClient();

  const { error: payErr } = await supabase.from('payments').insert({
    customer_id: data.customerId,
    quotation_id: data.quotationId || null,
    work_order_id: data.workOrderId || null,
    invoice_id: data.invoiceId,
    payment_type: data.newBalance <= 0 ? 'FINAL' : 'PARTIAL',
    amount: data.amount,
    payment_method: data.method,
    reference_number: data.reference || null,
    received_at: data.receivedAt,
    notes: data.notes || null,
  });
  if (payErr) throw new Error(payErr.message);

  const update: any = { balance_due: data.newBalance };
  if (data.newBalance <= 0) {
    update.status = 'PAID';
    update.paid_at = new Date().toISOString();
  }

  const { error: invErr } = await supabase.from('invoices').update(update).eq('id', data.invoiceId);
  if (invErr) throw new Error(invErr.message);

  revalidatePath(`/admin/invoices/${data.invoiceId}`);
  revalidatePath('/admin/invoices');
}
