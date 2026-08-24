import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import QuotationBuilder from '../../new/QuotationBuilder';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditQuotationPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [
    { data: q, error: qErr },
    { data: customers },
    { data: customerSites },
    { data: products },
    { data: services },
    { data: categories },
    { data: productTypes },
  ] = await Promise.all([
    supabase.from('quotations')
      .select(`
        id, customer_id, site_id, title, terms, valid_until, advance_percentage, status,
        quotation_items (
          id, product_id, description, quantity, unit_price_at_time, gst_rate, discount, sort_order
        )
      `)
      .eq('id', id)
      .single(),

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

  if (qErr || !q) notFound();

  const sortedItems = ((q.quotation_items as any[]) || []).sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  const initialData = {
    customerId: q.customer_id,
    siteId: q.site_id || '',
    title: q.title || '',
    terms: q.terms || '',
    validUntil: q.valid_until || '',
    advancePercentage: Number(q.advance_percentage) || 30,
    items: sortedItems.map(item => ({
      _key: item.id,
      productId: item.product_id || '',
      description: item.description,
      qty: Number(item.quantity) || 1,
      unitPrice: Number(item.unit_price_at_time) || 0,
      gstRate: Number(item.gst_rate) || 18,
      discount: Number(item.discount) || 0,
    })),
  };

  return (
    <QuotationBuilder
      editMode={true}
      quotationId={id}
      customers={(customers || []) as any[]}
      customerSites={(customerSites || []) as any[]}
      products={(products || []) as any[]}
      services={(services || []) as any[]}
      categories={(categories || []) as any[]}
      productTypes={(productTypes || []) as any[]}
      initialData={initialData}
    />
  );
}
