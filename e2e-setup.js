const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setup() {
  console.log("Setting up E2E test users...");

  // ── 1. Admin User ──────────────────────────────────────────────────────────
  const adminEmail = 'admin_e2e@techmaha.com';
  const adminPassword = 'password123';

  let adminUserId;
  let { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: 'E2E Admin', role: 'ADMIN' }
  });

  if (adminErr && adminErr.code === 'email_exists') {
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list?.users?.find(u => u.email === adminEmail);
    adminUserId = existing?.id;
    console.log("Admin user already exists:", adminUserId);
  } else if (adminErr) {
    console.error("Error creating admin:", adminErr);
  } else {
    adminUserId = adminUser.user.id;
    console.log("Created admin user:", adminUserId);
  }

  if (adminUserId) {
    await supabase.from('profiles').update({ role: 'ADMIN' }).eq('id', adminUserId);
  }

  // ── 2. Customer User ───────────────────────────────────────────────────────
  const customerEmail = 'customer_e2e@techmaha.com';
  const customerPassword = 'password123';

  let customerUserId;
  let { data: customerUser, error: customerErr } = await supabase.auth.admin.createUser({
    email: customerEmail,
    password: customerPassword,
    email_confirm: true,
    user_metadata: { full_name: 'E2E Customer', role: 'CUSTOMER' }
  });

  if (customerErr && customerErr.code === 'email_exists') {
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list?.users?.find(u => u.email === customerEmail);
    customerUserId = existing?.id;
    console.log("Customer user already exists:", customerUserId);
  } else if (customerErr) {
    console.error("Error creating customer:", customerErr);
  } else {
    customerUserId = customerUser.user.id;
    console.log("Created customer user:", customerUserId);
  }

  // ── 3. Ensure a `customers` row exists for the E2E customer ───────────────
  // The auth trigger creates this automatically for new users, but if the trigger
  // was not present when the user was first created, this backfill is needed.
  if (customerUserId) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('profile_id', customerUserId)
      .maybeSingle();

    if (!existing) {
      const { error: custInsertErr } = await supabase.from('customers').insert({
        profile_id: customerUserId,
        company_name: 'E2E Test Company',
      });
      if (custInsertErr) {
        console.error("Error creating customers row:", custInsertErr.message);
      } else {
        console.log("Created customers row for E2E customer.");
      }
    } else {
      console.log("customers row already exists for E2E customer.");
    }
  }

  console.log("E2E Setup complete!");
}

setup();
