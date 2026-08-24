'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProduct(productData: {
  category_id: string;
  name: string;
  sku: string;
  brand?: string;
  model?: string;
  hsn_sac?: string;
  gst_rate?: number;
}) {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .insert(productData)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw new Error(error.message);
  }

  revalidatePath('/admin/products');
  return product.id;
}

export async function setProductPrice(productId: string, prices: { purchase_price: number, selling_price: number }) {
  const supabase = await createClient();

  // 1. Mark existing current price as not current
  const { error: updateErr } = await supabase
    .from('product_prices')
    .update({ is_current: false })
    .eq('product_id', productId)
    .eq('is_current', true);

  if (updateErr) {
    console.error('Error disabling old price:', updateErr);
    throw new Error(updateErr.message);
  }

  // 2. Insert new current price
  const { error: insertErr } = await supabase
    .from('product_prices')
    .insert({
      product_id: productId,
      purchase_price: prices.purchase_price,
      selling_price: prices.selling_price,
      is_current: true
    });

  if (insertErr) {
    console.error('Error setting new price:', insertErr);
    throw new Error(insertErr.message);
  }

  revalidatePath('/admin/products');
}
