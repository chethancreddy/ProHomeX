'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// 1. Create Net Metering Application
export async function createNetMeteringApplication(siteId: string, ticketId: string, applicationNumber?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.from('solar_net_metering').insert({
    site_id: siteId,
    ticket_id: ticketId,
    application_number: applicationNumber,
    status: 'DOCUMENT_COLLECTION'
  });

  if (error) {
    console.error('Error creating net metering application:', error);
    throw new Error(error.message);
  }

  revalidatePath('/admin/solar/net-metering');
}

// 2. Update Net Metering Status
export async function updateNetMeteringStatus(id: string, newStatus: 'DOCUMENT_COLLECTION' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'COMMISSIONED', applicationNumber?: string) {
  const supabase = await createClient();

  const updates: any = { status: newStatus };
  
  if (newStatus === 'SUBMITTED') updates.submission_date = new Date().toISOString();
  if (newStatus === 'APPROVED') updates.approval_date = new Date().toISOString();
  if (applicationNumber) updates.application_number = applicationNumber;

  const { error } = await supabase.from('solar_net_metering').update(updates).eq('id', id);

  if (error) {
    console.error('Error updating net metering status:', error);
    throw new Error(error.message);
  }

  revalidatePath('/admin/solar/net-metering');
}
