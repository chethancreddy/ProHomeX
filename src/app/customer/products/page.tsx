import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProductCatalog from './ProductCatalog';

export default async function CustomerProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch public products with selling prices (use admin client to see prices)
  const adminSupabase = createAdminClient();
  const { data: products } = await adminSupabase
    .from('products')
    .select(`
      id, name, sku, brand, model, description, unit, stock_quantity, image_url,
      product_categories ( id, name, services ( id, name ) ),
      product_prices ( selling_price, is_current )
    `)
    .eq('is_active', true)
    .eq('is_public', true)
    .order('name');

  const { data: services } = await adminSupabase
    .from('services')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  return (
    <ProductCatalog
      products={(products || []) as any[]}
      services={(services || []) as any[]}
    />
  );
}
