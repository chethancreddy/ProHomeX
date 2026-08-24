import { createAdminClient } from '@/lib/supabase/admin';
import ProductsClientPage from './ProductsClientPage';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = createAdminClient();

  const [{ data: products }, { data: categories }, { data: services }] = await Promise.all([
    supabase
      .from('products')
      .select(`
        id, name, sku, brand, model, description, unit,
        gst_rate, stock_quantity, low_stock_threshold,
        image_url, is_public, is_active, created_at, category_id,
        product_categories ( id, name, services ( id, name ) ),
        product_prices ( purchase_price, selling_price, is_current )
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('product_categories')
      .select('id, name, service_id, services ( name )')
      .eq('is_active', true)
      .order('name'),
    supabase.from('services').select('id, name').eq('is_active', true).order('name'),
  ]);

  return (
    <ProductsClientPage
      products={(products || []) as any[]}
      categories={(categories || []) as any[]}
      services={(services || []) as any[]}
    />
  );
}
