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
    // If remarks column does not exist yet in DB, fallback to legacy schema seamlessly
    const { data: fallbackLeads } = await supabase
      .from('leads')
      .select('id, reference_number, name, phone, email, service, location, requirement, message, status, created_at, updated_at')
      .order('created_at', { ascending: false });

    const parsedFallback = (fallbackLeads || []).map((l: any) => {
      let remarks = l.remarks || '';
      if (!remarks && l.message && l.message.includes('[Closed:')) {
        const match = l.message.match(/\[Closed:\s*([^\]]+)\]/);
        if (match) remarks = match[1];
      }
      return { ...l, remarks };
    });

    return <LeadsManagerClient initialLeads={(parsedFallback as LeadItem[]) || []} />;
  }

  // Parse remarks if stored in message fallback
  const parsedLeads = (leads || []).map((l: any) => {
    let remarks = l.remarks || '';
    if (!remarks && l.message && l.message.includes('[Closed:')) {
      const match = l.message.match(/\[Closed:\s*([^\]]+)\]/);
      if (match) remarks = match[1];
    }
    return { ...l, remarks };
  });

  return <LeadsManagerClient initialLeads={(parsedLeads as LeadItem[]) || []} />;
}
