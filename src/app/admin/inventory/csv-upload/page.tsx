import { CsvUpload } from '@/components/admin/CsvUpload';
import { bulkUpdateStock } from '../actions';

const TEMPLATE_FIELDS = [
  { key: 'sku', label: 'SKU', required: true, example: 'HK-CAM-4MP', description: 'Product SKU to identify the product' },
  { key: 'stock_quantity', label: 'Stock Quantity', required: true, example: '100', description: 'The stock value to apply' },
  { key: 'adjustment_type', label: 'Adjustment Type', required: false, example: 'SET', description: 'SET (replace), ADD (add to current), SUBTRACT (remove from current). Defaults to SET.' },
];

export default function InventoryCsvUploadPage() {
  return (
    <CsvUpload
      entityName="Inventory"
      templateFields={TEMPLATE_FIELDS}
      onImport={bulkUpdateStock}
      backHref="/admin/inventory"
    />
  );
}
