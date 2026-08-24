import { createAdminClient } from '@/lib/supabase/admin';
import ReportsDashboard from './ReportsDashboard';

export default async function AdminReportsPage() {
  const supabase = createAdminClient();

  const [
    { data: invoices },
    { data: payments },
    { data: quotations },
    { data: workOrders },
    { data: leads },
    { data: tickets },
    { data: customers },
    { data: products },
  ] = await Promise.all([
    supabase.from('invoices')
      .select('id, invoice_number, status, total_amount, subtotal, gst_total, advance_paid, balance_due, created_at, paid_at, customer_id, customers(company_name, tax_id, profiles(full_name))')
      .order('created_at', { ascending: false }),

    supabase.from('payments')
      .select('id, payment_number, payment_type, amount, payment_method, received_at, reference_number, customer_id, customers(company_name, profiles(full_name))')
      .order('received_at', { ascending: false }),

    supabase.from('quotations')
      .select('id, quotation_number, title, status, total_amount, advance_amount, created_at, customer_id, customers(company_name, profiles(full_name))')
      .order('created_at', { ascending: false }),

    supabase.from('work_orders')
      .select('id, work_order_number, status, scheduled_date, completed_date, created_at, profiles:assigned_to(full_name), customers(company_name, profiles(full_name))')
      .order('created_at', { ascending: false }),

    supabase.from('leads')
      .select('id, reference_number, name, phone, email, service, location, status, created_at')
      .order('created_at', { ascending: false }),

    supabase.from('tickets')
      .select('id, ticket_number, category, status, priority, created_at, customers(company_name, profiles(full_name))')
      .order('created_at', { ascending: false }),

    supabase.from('customers')
      .select('id, company_name, tax_id, created_at, profiles(full_name, email, phone_number)')
      .order('created_at', { ascending: false }),

    supabase.from('products')
      .select('id, name, sku, brand, gst_rate, product_categories(name, services(name))')
  ]);

  return (
    <ReportsDashboard
      invoices={(invoices || []) as any[]}
      payments={(payments || []) as any[]}
      quotations={(quotations || []) as any[]}
      workOrders={(workOrders || []) as any[]}
      leads={(leads || []) as any[]}
      tickets={(tickets || []) as any[]}
      customers={(customers || []) as any[]}
      products={(products || []) as any[]}
    />
  );
}
