import { createAdminClient } from '@/lib/supabase/admin';
import LeadsManagerClient, { LeadItem } from './LeadsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  const supabase = createAdminClient();

  // Try selecting all columns including remarks
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, reference_number, name, phone, email, service, location, requirement, message, status, remarks, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads with remarks:', error.message);
    // If remarks column does not exist yet, fallback to legacy columns
    const { data: fallbackLeads } = await supabase
      .from('leads')
      .select('id, reference_number, name, phone, email, service, location, requirement, message, status, created_at, updated_at')
      .order('created_at', { ascending: false });

    return <LeadsManagerClient initialLeads={(fallbackLeads as LeadItem[]) || []} />;
  }

  return <LeadsManagerClient initialLeads={(leads as LeadItem[]) || []} />;
}
