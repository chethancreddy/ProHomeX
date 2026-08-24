import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import QuoteRequestForm from './QuoteRequestForm';

export default async function CustomerRequestQuotePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', user.id)
    .single();

  return (
    <QuoteRequestForm
      customerName={profile?.full_name || ''}
      customerEmail={profile?.email || user.email || ''}
    />
  );
}
