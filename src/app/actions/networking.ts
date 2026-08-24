'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// 1. Register a physical Rack
export async function registerRack(siteId: string, rackName: string, locationDetails?: string, uHeight: number = 42) {
  const supabase = await createClient();

  const { data, error } = await supabase.from('net_racks').insert({
    site_id: siteId,
    rack_name: rackName,
    location_details: locationDetails,
    u_height: uHeight
  });

  if (error) {
    console.error('Error registering rack:', error);
    throw new Error(error.message);
  }

  revalidatePath('/admin/networking/topology');
}

// 2. Log Cable Drops
export async function logCableDrops(siteId: string, rackId: string, ticketId: string, type: 'DATA' | 'VOICE' | 'FIBER' | 'CCTV', quantity: number, tested: boolean = false) {
  const supabase = await createClient();

  const { data, error } = await supabase.from('net_cable_drops').insert({
    site_id: siteId,
    rack_id: rackId,
    ticket_id: ticketId,
    drop_type: type,
    quantity: quantity,
    tested_and_certified: tested
  });

  if (error) {
    console.error('Error logging cable drops:', error);
    throw new Error(error.message);
  }

  revalidatePath('/admin/networking/drops');
  revalidatePath('/admin/networking/topology');
}

// 3. Certify Drops
export async function certifyDrops(dropId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('net_cable_drops')
    .update({ tested_and_certified: true })
    .eq('id', dropId);

  if (error) {
    console.error('Error certifying cable drops:', error);
    throw new Error(error.message);
  }

  revalidatePath('/admin/networking/drops');
}
