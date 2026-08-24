'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// 1. Convert Quotation to Order
export async function convertQuotationToOrder(quotationId: string) {
  const supabase = await createClient();

  // Fetch Quotation
  const { data: quotation, error: fetchErr } = await supabase
    .from('quotations')
    .select('*, quotation_items(*)')
    .eq('id', quotationId)
    .single();

  if (fetchErr || !quotation) throw new Error('Quotation not found');
  if (quotation.status !== 'ACCEPTED') throw new Error('Quotation must be ACCEPTED first');

  // Create Order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      quotation_id: quotation.id,
      customer_id: quotation.customer_id,
      site_id: quotation.site_id,
      status: 'PENDING',
      total_amount: quotation.total_amount
    })
    .select()
    .single();

  if (orderErr) throw new Error(orderErr.message);

  // Copy Items
  const orderItems = quotation.quotation_items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price_at_time
  }));

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
  if (itemsErr) throw new Error(itemsErr.message);

  revalidatePath('/admin/orders');
  return order.id;
}

// 2. Create Ticket from Order
export async function createTicketFromOrder(orderId: string, assignedTo?: string, priority = 'MEDIUM') {
  const supabase = await createClient();

  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
    
  if (fetchErr || !order) throw new Error('Order not found');

  const { data: ticket, error: ticketErr } = await supabase
    .from('tickets')
    .insert({
      order_id: order.id,
      customer_id: order.customer_id,
      site_id: order.site_id,
      assigned_to: assignedTo,
      status: 'OPEN',
      priority
    })
    .select()
    .single();

  if (ticketErr) throw new Error(ticketErr.message);

  revalidatePath('/admin/tickets');
  return ticket.id;
}

// 3. Close Ticket & Generate Invoice
export async function closeTicketAndGenerateInvoice(ticketId: string) {
  const supabase = await createClient();

  // Mark Ticket Closed
  const { error: ticketErr } = await supabase
    .from('tickets')
    .update({ status: 'CLOSED' })
    .eq('id', ticketId);
    
  if (ticketErr) throw new Error(ticketErr.message);

  // Fetch Ticket and its parent Order to get pricing
  const { data: ticket, error: fetchErr } = await supabase
    .from('tickets')
    .select('*, orders(*)')
    .eq('id', ticketId)
    .single();

  if (fetchErr || !ticket) throw new Error('Ticket not found');

  const order: any = Array.isArray(ticket.orders) ? ticket.orders[0] : ticket.orders;

  // Create Invoice
  const { data: invoice, error: invoiceErr } = await supabase
    .from('invoices')
    .insert({
      ticket_id: ticket.id,
      customer_id: ticket.customer_id,
      status: 'DRAFT',
      total_amount: order?.total_amount || 0
    })
    .select()
    .single();

  if (invoiceErr) throw new Error(invoiceErr.message);

  // If we had order items, we would ideally map them to invoice items here.
  // For simplicity, we just create a single line item for the order total.
  if (order?.total_amount) {
      await supabase.from('invoice_items').insert({
          invoice_id: invoice.id,
          description: `Services rendered for Work Order #${ticket.id.split('-')[0]}`,
          amount: order.total_amount
      });
  }

  revalidatePath('/admin/tickets');
  revalidatePath('/admin/invoices');
  return invoice.id;
}
