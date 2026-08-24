'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// 1. Generate Warranty from Ticket
export async function generateWarrantyFromTicket(ticketId: string, durationMonths: number = 12) {
  const supabase = await createClient();

  // Fetch ticket and order items to know what products were installed
  const { data: ticket, error: ticketErr } = await supabase
    .from('tickets')
    .select('id, site_id, orders(id, order_items(product_id))')
    .eq('id', ticketId)
    .single();

  if (ticketErr || !ticket) throw new Error('Ticket not found');

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + durationMonths);

  const order: any = Array.isArray(ticket.orders) ? ticket.orders[0] : ticket.orders;
  const items = order?.order_items || [];
  
  if (items.length === 0) {
    throw new Error('No products found in the associated order to warranty.');
  }

  const warranties = items.map((item: any) => ({
    site_id: ticket.site_id,
    ticket_id: ticket.id,
    product_id: item.product_id,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    status: 'ACTIVE'
  }));

  const { error: warrantyErr } = await supabase.from('site_warranties').insert(warranties);
  if (warrantyErr) throw new Error(warrantyErr.message);

  revalidatePath('/admin/cctv/warranties');
}

// 2. Create AMC Contract
export async function createAMCContract(siteId: string, customerId: string, durationMonths: number = 12, visits: number = 4, contractValue: number = 0) {
  const supabase = await createClient();

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + durationMonths);

  const { error } = await supabase.from('site_amc_contracts').insert({
    site_id: siteId,
    customer_id: customerId,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    contract_value: contractValue,
    visits_included: visits,
    visits_completed: 0,
    status: 'ACTIVE'
  });

  if (error) throw new Error(error.message);

  revalidatePath('/admin/cctv/amc');
}
