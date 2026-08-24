'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// 1. Assess Site Load
export async function assessSiteLoad(siteId: string, kva: number, phase: 'SINGLE' | 'THREE', notes?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.from('ups_site_loads').insert({
    site_id: siteId,
    calculated_kva: kva,
    phase_type: phase,
    notes: notes,
    last_assessed: new Date().toISOString()
  });

  if (error) {
    console.error('Error assessing site load:', error);
    throw new Error(error.message);
  }

  revalidatePath('/admin/ups/site-loads');
}

// 2. Register Battery Installation
export async function registerBatteryInstallation(siteId: string, ticketId: string, productId: string, quantity: number, lifeMonths: number = 36) {
  const supabase = await createClient();

  const { data, error } = await supabase.from('ups_battery_lifecycles').insert({
    site_id: siteId,
    ticket_id: ticketId,
    product_id: productId,
    quantity: quantity,
    installation_date: new Date().toISOString(),
    expected_life_months: lifeMonths,
    replacement_status: 'HEALTHY'
  });

  if (error) {
    console.error('Error registering battery:', error);
    throw new Error(error.message);
  }

  revalidatePath('/admin/ups/battery-replacements');
}
