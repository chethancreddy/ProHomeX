import { createAdminClient } from '@/lib/supabase/admin';
import QuotationBuilder from './QuotationBuilder';

interface Props {
  searchParams?: Promise<{ customerId?: string }>;
}

export default async function NewQuotationPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialCustomerId = params?.customerId;

  const supabase = createAdminClient();

  const [
    { data: customers },
    { data: customerSites },
    { data: products },
    { data: services },
    { data: categories },
    { data: productTypes },
  ] = await Promise.all([
    supabase.from('customers')
      .select('id, company_name, tax_id, profiles(full_name, email, phone_number)')
      .order('created_at', { ascending: false }),

    supabase.from('customer_sites')
      .select('id, customer_id, name')
      .order('name'),

    supabase.from('products')
      .select(`
        id, name, sku, brand, model, unit, gst_rate, category_id, type_id,
        product_categories(id, name, service_id, services(id, name)),
        product_types(id, name),
        product_prices(selling_price, is_current)
      `)
      .eq('is_active', true)
      .order('name'),

    supabase.from('services')
      .select('id, name')
      .order('name'),

    supabase.from('product_categories')
      .select('id, service_id, name')
      .order('name'),

    supabase.from('product_types')
      .select('id, category_id, name')
      .order('name'),
  ]);

  return (
    <QuotationBuilder
      customers={(customers || []) as any[]}
      customerSites={(customerSites || []) as any[]}
      products={(products || []) as any[]}
      services={(services || []) as any[]}
      categories={(categories || []) as any[]}
      productTypes={(productTypes || []) as any[]}
      initialData={initialCustomerId ? { customerId: initialCustomerId, items: [] } : undefined}
    />
  );
}
