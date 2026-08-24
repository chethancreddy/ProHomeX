'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function saveSiteSettings(key: string, value: any): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/content');
    revalidatePath('/admin/settings');
    revalidatePath('/cctv');
    revalidatePath('/solar');
    revalidatePath('/ups');
    revalidatePath('/about');
    revalidatePath('/contact');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while saving settings.' };
  }
}
