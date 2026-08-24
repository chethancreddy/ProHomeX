import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client using the service role key.
 *
 * IMPORTANT: Use ONLY in server-side code (Server Components, Server Actions,
 * Route Handlers). This bypasses Row Level Security completely — never expose
 * this client or its credentials to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase admin credentials. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
