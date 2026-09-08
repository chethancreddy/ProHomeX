'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateLeadStatus(
  leadId: string,
  status: string,
  remarks?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (remarks !== undefined) {
      updatePayload.remarks = remarks;
    }

    if (status === 'CLOSED') {
      updatePayload.closed_at = new Date().toISOString();
    }

    // Attempt update with remarks
    const { error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', leadId);

    if (error) {
      // If error is column does not exist (e.g. remarks column pending migration in active DB), fallback to status only
      if (error.message.includes('column "remarks"') || error.message.includes('column "closed_at"')) {
        const { error: fallbackError } = await supabase
          .from('leads')
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', leadId);

        if (fallbackError) {
          return { success: false, error: fallbackError.message };
        }
      } else {
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/admin/leads');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update lead status.' };
  }
}

export async function deleteLead(leadId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('leads').delete().eq('id', leadId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/leads');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete lead.' };
  }
}
