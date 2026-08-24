'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface ProductFormData {
  id?: string;
  name: string;
  sku: string;
  category_id?: string;
  brand?: string;
  model?: string;
  description?: string;
  unit?: string;
  hsn_sac?: string;
  gst_rate?: number;
  purchase_price?: number;
  selling_price?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  image_url?: string;
  is_public?: boolean;
  is_active?: boolean;
}

export interface ImportResult {
  created: number;
  updated: number;
  failed: { row: number; data: Record<string, string>; error: string }[];
}

export async function createOrUpdateProduct(data: ProductFormData): Promise<string> {
  const supabase = createAdminClient();

  const payload = {
    name: data.name.trim(),
    sku: data.sku.toUpperCase().trim(),
    category_id: data.category_id || null,
    brand: data.brand?.trim() || null,
    model: data.model?.trim() || null,
    description: data.description?.trim() || null,
    unit: data.unit || 'pcs',
    hsn_sac: data.hsn_sac?.trim() || null,
    gst_rate: Number(data.gst_rate) || 0,
    stock_quantity: Number(data.stock_quantity) ?? 0,
    low_stock_threshold: Number(data.low_stock_threshold) ?? 5,
    image_url: data.image_url?.trim() || null,
    is_public: data.is_public ?? true,
    is_active: data.is_active ?? true,
  };

  let productId = data.id;

  if (data.id) {
    const { error } = await supabase.from('products').update(payload).eq('id', data.id);
    if (error) throw new Error(`Update failed: ${error.message}`);
  } else {
    const { data: created, error } = await supabase
      .from('products')
      .insert(payload)
      .select('id')
      .single();
    if (error) throw new Error(`Create failed: ${error.message}`);
    productId = created.id;
  }

  // Update price if provided
  if (productId && (data.selling_price !== undefined || data.purchase_price !== undefined)) {
    await supabase
      .from('product_prices')
      .update({ is_current: false })
      .eq('product_id', productId)
      .eq('is_current', true);

    const { error: priceErr } = await supabase.from('product_prices').insert({
      product_id: productId,
      purchase_price: Number(data.purchase_price) || 0,
      selling_price: Number(data.selling_price) || 0,
      is_current: true,
    });
    if (priceErr) throw new Error(`Price update failed: ${priceErr.message}`);
  }

  revalidatePath('/admin/products');
  revalidatePath('/customer/products');
  return productId!;
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
  revalidatePath('/customer/products');
}

export async function bulkUpsertProducts(rows: Record<string, string>[]): Promise<ImportResult> {
  const supabase = createAdminClient();
  let created = 0;
  let updated = 0;
  const failed: ImportResult['failed'] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 = 1-indexed + header row

    // Validate required fields
    if (!row.name?.trim()) {
      failed.push({ row: rowNum, data: row, error: 'name is required' });
      continue;
    }
    if (!row.sku?.trim()) {
      failed.push({ row: rowNum, data: row, error: 'sku is required' });
      continue;
    }

    const sku = row.sku.toUpperCase().trim();

    // Resolve category if provided by name
    let categoryId: string | null = null;
    if (row.category?.trim()) {
      const { data: cat } = await supabase
        .from('product_categories')
        .select('id')
        .ilike('name', row.category.trim())
        .maybeSingle();
      categoryId = cat?.id || null;
    }

    const productPayload = {
      name: row.name.trim(),
      sku,
      category_id: categoryId,
      brand: row.brand?.trim() || null,
      model: row.model?.trim() || null,
      description: row.description?.trim() || null,
      unit: row.unit?.trim() || 'pcs',
      hsn_sac: row.hsn_sac?.trim() || null,
      gst_rate: parseFloat(row.gst_rate || '18') || 18,
      stock_quantity: parseInt(row.stock_quantity || '0', 10) || 0,
      low_stock_threshold: parseInt(row.low_stock_threshold || '5', 10) || 5,
      is_public: row.is_public?.toLowerCase() !== 'false',
      is_active: row.is_active?.toLowerCase() !== 'false',
    };

    try {
      // Check if product with this SKU exists
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('sku', sku)
        .maybeSingle();

      let productId: string;

      if (existing) {
        const { error } = await supabase.from('products').update(productPayload).eq('id', existing.id);
        if (error) throw new Error(error.message);
        productId = existing.id;
        updated++;
      } else {
        const { data: newP, error } = await supabase
          .from('products')
          .insert(productPayload)
          .select('id')
          .single();
        if (error) throw new Error(error.message);
        productId = newP.id;
        created++;
      }

      // Handle prices
      const sellingPrice = parseFloat(row.selling_price || '');
      const purchasePrice = parseFloat(row.purchase_price || '');
      if (!isNaN(sellingPrice) || !isNaN(purchasePrice)) {
        await supabase
          .from('product_prices')
          .update({ is_current: false })
          .eq('product_id', productId)
          .eq('is_current', true);
        await supabase.from('product_prices').insert({
          product_id: productId,
          selling_price: isNaN(sellingPrice) ? 0 : sellingPrice,
          purchase_price: isNaN(purchasePrice) ? 0 : purchasePrice,
          is_current: true,
        });
      }
    } catch (err: any) {
      failed.push({ row: rowNum, data: row, error: err.message });
    }
  }

  revalidatePath('/admin/products');
  revalidatePath('/customer/products');
  return { created, updated, failed };
}
