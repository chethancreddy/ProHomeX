import { CsvUpload } from '@/components/admin/CsvUpload';
import { bulkUpsertProducts } from '../actions';

const TEMPLATE_FIELDS = [
  { key: 'name', label: 'Product Name', required: true, example: 'Hikvision 4MP IP Camera', description: 'Full product name' },
  { key: 'sku', label: 'SKU', required: true, example: 'HK-CAM-4MP', description: 'Unique product code. Existing SKUs will be updated.' },
  { key: 'category', label: 'Category', required: false, example: 'IP Cameras', description: 'Category name (must exist in system)' },
  { key: 'brand', label: 'Brand', required: false, example: 'Hikvision', description: '' },
  { key: 'model', label: 'Model', required: false, example: 'DS-2CD2143G2-I', description: '' },
  { key: 'description', label: 'Description', required: false, example: '4MP AcuSense Fixed Dome Network Camera', description: '' },
  { key: 'unit', label: 'Unit', required: false, example: 'pcs', description: 'pcs / set / meter / kg / box / roll' },
  { key: 'selling_price', label: 'Selling Price', required: false, example: '8500', description: '₹ selling price (no currency symbol)' },
  { key: 'purchase_price', label: 'Purchase Price', required: false, example: '6200', description: '₹ purchase price (internal only)' },
  { key: 'gst_rate', label: 'GST Rate', required: false, example: '18', description: '0 / 5 / 12 / 18 / 28' },
  { key: 'stock_quantity', label: 'Stock Quantity', required: false, example: '50', description: 'Current stock count' },
  { key: 'is_public', label: 'Is Public', required: false, example: 'true', description: 'true / false — show in customer catalog' },
];

export default function ProductsCsvUploadPage() {
  return (
    <CsvUpload
      entityName="Products"
      templateFields={TEMPLATE_FIELDS}
      onImport={bulkUpsertProducts}
      backHref="/admin/products"
    />
  );
}
