'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export type StockAdjustType = 'ADD' | 'SUBTRACT' | 'SET';

export async function adjustStock(
  productId: string,
  amount: number,
  type: StockAdjustType,
  notes?: string
): Promise<number> {
  const supabase = createAdminClient();

  // Get current stock
  const { data: product, error: fetchErr } = await supabase
    .from('products')
    .select('stock_quantity, name')
    .eq('id', productId)
    .single();

  if (fetchErr || !product) throw new Error('Product not found');

  let newQty: number;
  let changeAmount: number;

  switch (type) {
    case 'ADD':
      newQty = product.stock_quantity + amount;
      changeAmount = amount;
      break;
    case 'SUBTRACT':
      newQty = Math.max(0, product.stock_quantity - amount);
      changeAmount = -(product.stock_quantity - newQty);
      break;
    case 'SET':
      newQty = amount;
      changeAmount = amount - product.stock_quantity;
      break;
  }

  // Update product stock
  const { error: updateErr } = await supabase
    .from('products')
    .update({ stock_quantity: newQty })
    .eq('id', productId);

  if (updateErr) throw new Error(updateErr.message);

  // Log to inventory_transactions for audit trail
  await supabase.from('inventory_transactions').insert({
    product_id: productId,
    quantity_change: changeAmount,
    transaction_type: changeAmount >= 0 ? 'RESTOCK' : 'CONSUMED',
    notes: notes || `Manual adjustment: ${type} ${amount}`,
  });

  revalidatePath('/admin/inventory');
  revalidatePath('/admin/products');
  return newQty;
}

export interface BulkStockUpdate {
  created: number;
  updated: number;
  failed: { row: number; data: Record<string, string>; error: string }[];
}

export async function bulkUpdateStock(rows: Record<string, string>[]): Promise<BulkStockUpdate> {
  const supabase = createAdminClient();
  let updated = 0;
  const failed: BulkStockUpdate['failed'] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    if (!row.sku?.trim()) {
      failed.push({ row: rowNum, data: row, error: 'sku is required' });
      continue;
    }
    if (!row.stock_quantity?.trim()) {
      failed.push({ row: rowNum, data: row, error: 'stock_quantity is required' });
      continue;
    }

    const qty = parseInt(row.stock_quantity, 10);
    if (isNaN(qty) || qty < 0) {
      failed.push({ row: rowNum, data: row, error: 'stock_quantity must be a non-negative number' });
      continue;
    }

    const type = (row.adjustment_type?.toUpperCase() || 'SET') as StockAdjustType;
    if (!['ADD', 'SUBTRACT', 'SET'].includes(type)) {
      failed.push({ row: rowNum, data: row, error: 'adjustment_type must be ADD, SUBTRACT, or SET' });
      continue;
    }

    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('id, stock_quantity')
        .eq('sku', row.sku.toUpperCase().trim())
        .maybeSingle();

      if (error || !product) {
        failed.push({ row: rowNum, data: row, error: `Product with SKU "${row.sku}" not found` });
        continue;
      }

      await adjustStock(product.id, qty, type, `Bulk CSV import`);
      updated++;
    } catch (err: any) {
      failed.push({ row: rowNum, data: row, error: err.message });
    }
  }

  revalidatePath('/admin/inventory');
  return { created: 0, updated, failed };
}
