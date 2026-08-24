'use client';

import { useState, useMemo, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Trash2, ChevronDown, ArrowLeft, Save, Filter,
  Search, Check, Sparkles, Layers, Box, Tag, ShieldCheck,
  Building2, MapPin, Calendar, Percent, X
} from 'lucide-react';
import { createQuotation, updateQuotation, type CreateQuotationData } from '../actions';

export type Product = {
  id: string;
  name: string;
  sku: string;
  brand: string | null;
  model: string | null;
  unit: string;
  gst_rate: number;
  category_id?: string | null;
  type_id?: string | null;
  product_prices?: { selling_price: number; is_current: boolean }[];
  product_categories?: {
    id: string;
    name: string;
    service_id?: string;
    services?: { id: string; name: string } | null;
  } | null;
  product_types?: { id: string; name: string } | null;
};

export type ServiceGroup = { id: string; name: string };
export type ProductCategory = { id: string; service_id: string; name: string };
export type ProductType = { id: string; category_id: string; name: string };

type Customer = {
  id: string;
  company_name: string | null;
  tax_id?: string | null;
  profiles: { full_name: string; email: string; phone_number?: string } | null;
};

type CustomerSite = { id: string; customer_id: string; name: string; city?: string | null };

type LineItem = {
  _key: string;
  productId: string;
  description: string;
  qty: number;
  unitPrice: number;
  gstRate: number;
  discount: number;
};

function uid() { return Math.random().toString(36).slice(2); }

function calcLine(item: LineItem) {
  const base = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
  const afterDiscount = Math.max(0, base - (Number(item.discount) || 0));
  const gstAmt = afterDiscount * (Number(item.gstRate) || 0) / 100;
  return { taxable: afterDiscount, gstAmt, total: afterDiscount + gstAmt };
}

interface Props {
  customers: Customer[];
  customerSites: CustomerSite[];
  products: Product[];
  services?: ServiceGroup[];
  categories?: ProductCategory[];
  productTypes?: ProductType[];
  editMode?: boolean;
  quotationId?: string;
  initialData?: {
    customerId: string;
    siteId?: string;
    title?: string;
    terms?: string;
    validUntil?: string;
    advancePercentage?: number;
    items?: (LineItem & { productId: string })[];
  };
}

const BUILTIN_SERVICES: ServiceGroup[] = [
  { id: 'srv-cctv', name: 'CCTV' },
  { id: 'srv-solar', name: 'Solar' },
  { id: 'srv-ups', name: 'UPS' },
  { id: 'srv-automation', name: 'Home Automation' },
  { id: 'srv-network', name: 'Networking' },
];

const BUILTIN_CATEGORIES: ProductCategory[] = [
  { id: 'cat-ha-motor', service_id: 'srv-automation', name: 'Motor & Water Automation' },
  { id: 'cat-ha-light', service_id: 'srv-automation', name: 'Smart Lighting & Sensors' },
  { id: 'cat-ha-hub', service_id: 'srv-automation', name: 'Automation Hubs & Gateways' },
  { id: 'cat-ha-access', service_id: 'srv-automation', name: 'Smart Access & Curtains' },
];

const BUILTIN_PRODUCT_TYPES: ProductType[] = [
  { id: 'typ-ha-sump', category_id: 'cat-ha-motor', name: 'Auto Sump Controller' },
  { id: 'typ-ha-sensor', category_id: 'cat-ha-motor', name: 'Water Level Sensors' },
  { id: 'typ-ha-pir', category_id: 'cat-ha-light', name: 'PIR Motion Sensor' },
  { id: 'typ-ha-radar', category_id: 'cat-ha-light', name: 'Radar Sensor Switch' },
  { id: 'typ-ha-touch', category_id: 'cat-ha-light', name: 'Smart Touch Switch' },
  { id: 'typ-ha-hub', category_id: 'cat-ha-hub', name: 'Zigbee Gateway Hub' },
  { id: 'typ-ha-lock', category_id: 'cat-ha-access', name: 'Smart Door Lock' },
];

const BUILTIN_PRODUCTS: Product[] = [
  {
    id: 'prod-ha-01',
    name: 'ProHomeX SumpMaster Pro Dual Tank Auto Motor Controller',
    sku: 'HA-SMP-01',
    brand: 'ProHomeX',
    model: 'SMP-2026',
    unit: 'set',
    gst_rate: 18,
    product_prices: [{ selling_price: 4499, is_current: true }],
    product_categories: { id: 'cat-ha-motor', name: 'Motor & Water Automation', services: { id: 'srv-automation', name: 'Home Automation' } },
    product_types: { id: 'typ-ha-sump', name: 'Auto Sump Controller' }
  },
  {
    id: 'prod-ha-02',
    name: 'ProHomeX Precision Ultrasonic Water Level Sensor (0-5m)',
    sku: 'HA-WLS-02',
    brand: 'ProHomeX',
    model: 'US-5M-IP68',
    unit: 'pcs',
    gst_rate: 18,
    product_prices: [{ selling_price: 1999, is_current: true }],
    product_categories: { id: 'cat-ha-motor', name: 'Motor & Water Automation', services: { id: 'srv-automation', name: 'Home Automation' } },
    product_types: { id: 'typ-ha-sensor', name: 'Water Level Sensors' }
  },
  {
    id: 'prod-ha-03',
    name: 'ProHomeX 360° Ceiling PIR Motion Sensor Switch with Lux Detection',
    sku: 'HA-PIR-03',
    brand: 'ProHomeX',
    model: 'PIR-360-LUX',
    unit: 'pcs',
    gst_rate: 18,
    product_prices: [{ selling_price: 899, is_current: true }],
    product_categories: { id: 'cat-ha-light', name: 'Smart Lighting & Sensors', services: { id: 'srv-automation', name: 'Home Automation' } },
    product_types: { id: 'typ-ha-pir', name: 'PIR Motion Sensor' }
  },
  {
    id: 'prod-ha-04',
    name: 'ProHomeX 5.8GHz Microwave Doppler Radar Sensor Switch (Hidden Mount)',
    sku: 'HA-RAD-04',
    brand: 'ProHomeX',
    model: 'MW-58G-RAD',
    unit: 'pcs',
    gst_rate: 18,
    product_prices: [{ selling_price: 1299, is_current: true }],
    product_categories: { id: 'cat-ha-light', name: 'Smart Lighting & Sensors', services: { id: 'srv-automation', name: 'Home Automation' } },
    product_types: { id: 'typ-ha-radar', name: 'Radar Sensor Switch' }
  },
  {
    id: 'prod-ha-05',
    name: 'ProHomeX 4-Gang Tempered Glass Smart Touch Switch (Wi-Fi + Zigbee)',
    sku: 'HA-TSW-05',
    brand: 'ProHomeX',
    model: 'TS-4G-GLS',
    unit: 'pcs',
    gst_rate: 18,
    product_prices: [{ selling_price: 2499, is_current: true }],
    product_categories: { id: 'cat-ha-light', name: 'Smart Lighting & Sensors', services: { id: 'srv-automation', name: 'Home Automation' } },
    product_types: { id: 'typ-ha-touch', name: 'Smart Touch Switch' }
  },
  {
    id: 'prod-ha-06',
    name: 'ProHomeX Zigbee 3.0 Wireless Mesh Gateway Hub (Matter Ready)',
    sku: 'HA-HUB-06',
    brand: 'ProHomeX',
    model: 'ZGB-30-HUB',
    unit: 'pcs',
    gst_rate: 18,
    product_prices: [{ selling_price: 3299, is_current: true }],
    product_categories: { id: 'cat-ha-hub', name: 'Automation Hubs & Gateways', services: { id: 'srv-automation', name: 'Home Automation' } },
    product_types: { id: 'typ-ha-hub', name: 'Zigbee Gateway Hub' }
  },
  {
    id: 'prod-ha-07',
    name: 'ProHomeX 5-in-1 Biometric Smart Door Lock (Fingerprint + RFID + App)',
    sku: 'HA-LCK-07',
    brand: 'ProHomeX',
    model: 'LCK-BIO-5IN1',
    unit: 'set',
    gst_rate: 18,
    product_prices: [{ selling_price: 9999, is_current: true }],
    product_categories: { id: 'cat-ha-access', name: 'Smart Access & Curtains', services: { id: 'srv-automation', name: 'Home Automation' } },
    product_types: { id: 'typ-ha-lock', name: 'Smart Door Lock' }
  }
];

/**
 * Hierarchical Category-Wise Product Selector Modal / Popover
 * Allows filtering by Group (CCTV/UPS/Solar/Home Automation) -> Category -> Subcategory/Type -> Specific Product
 */
function HierarchicalProductSelector({
  products: inputProducts,
  services: inputServices = [],
  categories: inputCategories = [],
  productTypes: inputProductTypes = [],
  onSelectProduct,
  onSelectCustom,
  onClose,
}: {
  products: Product[];
  services?: ServiceGroup[];
  categories?: ProductCategory[];
  productTypes?: ProductType[];
  onSelectProduct: (product: Product) => void;
  onSelectCustom: () => void;
  onClose: () => void;
}) {
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Merge database products with built-in Home Automation catalog
  const products = useMemo(() => {
    const existingSkus = new Set(inputProducts.map(p => p.sku));
    const extra = BUILTIN_PRODUCTS.filter(p => !existingSkus.has(p.sku));
    return [...inputProducts, ...extra];
  }, [inputProducts]);

  const services = useMemo(() => {
    const map = new Map<string, ServiceGroup>();
    BUILTIN_SERVICES.forEach(s => map.set(s.name, s));
    inputServices.forEach(s => map.set(s.name, s));
    return Array.from(map.values());
  }, [inputServices]);

  const categories = useMemo(() => {
    const map = new Map<string, ProductCategory>();
    BUILTIN_CATEGORIES.forEach(c => map.set(c.name, c));
    inputCategories.forEach(c => map.set(c.name, c));
    return Array.from(map.values());
  }, [inputCategories]);

  const productTypes = useMemo(() => {
    const map = new Map<string, ProductType>();
    BUILTIN_PRODUCT_TYPES.forEach(t => map.set(t.name, t));
    inputProductTypes.forEach(t => map.set(t.name, t));
    return Array.from(map.values());
  }, [inputProductTypes]);

  // Extract distinct service groups from services list or products
  const serviceOptions = useMemo(() => {
    const map = new Map<string, string>();
    services.forEach(s => map.set(s.name, s.name));
    products.forEach(p => {
      const sName = p.product_categories?.services?.name;
      if (sName) map.set(sName, sName);
    });
    return Array.from(map.values()).sort();
  }, [services, products]);

  // Filter available categories based on selected service
  const categoryOptions = useMemo(() => {
    return categories
      .filter(c => {
        if (selectedService === 'ALL') return true;
        const sMatch = services.find(s => s.name === selectedService);
        if (sMatch && (sMatch.id === c.service_id || sMatch.name === selectedService)) return true;
        if (selectedService.toLowerCase().includes('automation') && c.name.toLowerCase().includes('automation')) return true;
        return false;
      })
      .map(c => c.name)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
  }, [categories, services, selectedService]);

  // Filter available subcategories / product types based on selected category & service
  const typeOptions = useMemo(() => {
    const list = productTypes
      .filter(t => {
        if (selectedCategory === 'ALL') return true;
        const cMatch = categories.find(c => c.name === selectedCategory);
        return cMatch ? (t.category_id === cMatch.id || t.name.includes(selectedCategory)) : true;
      })
      .map(t => t.name);

    // Also include standard resolution / subtype tags if products contain them
    const defaults = [
      '2MP Camera', '4MP Camera', '5MP Camera', '8MP Camera', 'Dome Camera', 'Bullet Camera', 'PTZ Camera', 'NVR', 'DVR', 'PoE Switch',
      'Auto Sump Controller', 'Water Level Sensors', 'PIR Motion Sensor', 'Radar Sensor Switch', 'Smart Touch Switch', 'Zigbee Gateway Hub', 'Smart Door Lock'
    ];
    const merged = Array.from(new Set([...list, ...defaults])).sort();
    return merged;
  }, [productTypes, categories, selectedCategory]);

  // Filter products based on all 4 dimensions: Group -> Category -> Subcategory -> Search Text
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();

    return products.filter(p => {
      const serviceName = p.product_categories?.services?.name || '';
      const categoryName = p.product_categories?.name || '';
      const typeName = p.product_types?.name || '';
      const pName = p.name.toLowerCase();
      const pSku = p.sku.toLowerCase();
      const pBrand = (p.brand || '').toLowerCase();
      const pModel = (p.model || '').toLowerCase();

      // 1. Service / Group Match
      if (selectedService !== 'ALL') {
        const matchesService = serviceName.toLowerCase() === selectedService.toLowerCase() ||
          categoryName.toLowerCase().includes(selectedService.toLowerCase()) ||
          pName.includes(selectedService.toLowerCase());
        if (!matchesService) return false;
      }

      // 2. Category Match
      if (selectedCategory !== 'ALL') {
        const matchesCat = categoryName.toLowerCase() === selectedCategory.toLowerCase() ||
          pName.includes(selectedCategory.toLowerCase());
        if (!matchesCat) return false;
      }

      // 3. Subcategory / Type Match (e.g. "2MP", "4MP", "Dome", "Bullet", "NVR", "DVR")
      if (selectedType !== 'ALL') {
        const typeLower = selectedType.toLowerCase();
        const matchesExplicitType = typeName.toLowerCase() === typeLower;
        const matchesKeywordInName = pName.includes(typeLower) ||
          pModel.includes(typeLower) ||
          // Substring matches like "2mp" in "2MP Eco Bullet"
          (typeLower.includes('2mp') && pName.includes('2mp')) ||
          (typeLower.includes('4mp') && pName.includes('4mp')) ||
          (typeLower.includes('5mp') && pName.includes('5mp')) ||
          (typeLower.includes('8mp') && pName.includes('8mp')) ||
          (typeLower.includes('dome') && pName.includes('dome')) ||
          (typeLower.includes('bullet') && pName.includes('bullet')) ||
          (typeLower.includes('ptz') && pName.includes('ptz')) ||
          (typeLower.includes('nvr') && (pName.includes('nvr') || pSku.includes('nvr'))) ||
          (typeLower.includes('dvr') && (pName.includes('dvr') || pSku.includes('dvr')));

        if (!matchesExplicitType && !matchesKeywordInName) return false;
      }

      // 4. Free Text Search
      if (q) {
        const matchesSearch = pName.includes(q) || pSku.includes(q) || pBrand.includes(q) || pModel.includes(q) || categoryName.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [products, selectedService, selectedCategory, selectedType, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Layers className="text-blue-400" size={20} />
            <div>
              <h2 className="text-base font-bold">Select Product / Service Catalog Item</h2>
              <p className="text-xs text-slate-400">Filter by Group, Category, and Subcategory (e.g. CCTV &gt; Camera &gt; 2MP)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-5 bg-slate-50 border-b border-gray-200 space-y-4">
          {/* 3-Level Cascading Hierarchy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Group / Service */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                <Box size={12} className="text-blue-600" /> 1. Group / System
              </label>
              <select
                value={selectedService}
                onChange={e => {
                  setSelectedService(e.target.value);
                  setSelectedCategory('ALL');
                  setSelectedType('ALL');
                }}
                className="w-full text-xs font-semibold bg-white border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              >
                <option value="ALL">All Groups (CCTV, UPS, Solar...)</option>
                {serviceOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 2. Category */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                <Layers size={12} className="text-purple-600" /> 2. Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => {
                  setSelectedCategory(e.target.value);
                  setSelectedType('ALL');
                }}
                className="w-full text-xs font-semibold bg-white border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              >
                <option value="ALL">All Categories</option>
                {categoryOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 3. Subcategory / Resolution / Type */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                <Tag size={12} className="text-emerald-600" /> 3. Subcategory / Type (e.g. 2MP)
              </label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              >
                <option value="ALL">All Subcategories / Types</option>
                {typeOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search bar + Custom Item shortcut */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by product name, model (e.g. DS-2CE56D0T), SKU, or brand..."
                className="w-full text-xs bg-white border border-gray-300 rounded-xl pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectCustom();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-dashed border-gray-300 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors flex-shrink-0"
            >
              <Sparkles size={13} className="text-amber-500" /> + Custom / Labour Item
            </button>
          </div>

          {/* Active Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-gray-400 text-[11px]">Active Filters:</span>
            {selectedService !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                Group: {selectedService}
                <button onClick={() => setSelectedService('ALL')}><X size={11} /></button>
              </span>
            )}
            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-medium">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('ALL')}><X size={11} /></button>
              </span>
            )}
            {selectedType !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold">
                Type: {selectedType}
                <button onClick={() => setSelectedType('ALL')}><X size={11} /></button>
              </span>
            )}
            {(selectedService !== 'ALL' || selectedCategory !== 'ALL' || selectedType !== 'ALL' || search) && (
              <button
                onClick={() => {
                  setSelectedService('ALL');
                  setSelectedCategory('ALL');
                  setSelectedType('ALL');
                  setSearch('');
                }}
                className="text-[11px] text-red-600 hover:underline font-medium ml-1"
              >
                Reset all
              </button>
            )}
            <span className="ml-auto text-gray-500 font-medium text-[11px]">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Product Results Grid / Table */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredProducts.map(p => {
                const currentPrice = p.product_prices?.find(pp => pp.is_current)?.selling_price;
                const serviceName = p.product_categories?.services?.name;
                const catName = p.product_categories?.name;
                const typeName = p.product_types?.name;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(p);
                      onClose();
                    }}
                    className="p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all duration-150 flex flex-col justify-between group shadow-sm hover:shadow-md bg-white"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {serviceName && (
                              <span className="text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {serviceName}
                              </span>
                            )}
                            {catName && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">
                                {catName}
                              </span>
                            )}
                            {typeName && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                                {typeName}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {p.name}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {p.brand && <span className="font-medium text-slate-700">Brand: {p.brand}</span>}
                        {p.model && <span>Model: {p.model}</span>}
                        <span className="font-mono text-gray-400">SKU: {p.sku}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-base font-bold text-gray-900">
                          {currentPrice ? `₹${Number(currentPrice).toLocaleString('en-IN')}` : '₹0'}
                        </span>
                        <span className="text-[11px] text-gray-400 ml-1">/ {p.unit || 'unit'}</span>
                        <span className="text-[10px] text-gray-500 ml-2 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                          GST: {p.gst_rate}%
                        </span>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg group-hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Plus size={13} /> Select
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <Box size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-600">No products match the selected filters</p>
              <p className="text-xs text-gray-400 mt-1">
                Try selecting &ldquo;All Groups&rdquo; or clearing the search query.
              </p>
              <button
                type="button"
                onClick={() => {
                  onSelectCustom();
                  onClose();
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
              >
                <Plus size={13} /> Add Custom Line Item Instead
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Click any product to add it with current catalog price and GST rate.</span>
          <button onClick={onClose} className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuotationBuilder({
  customers,
  customerSites,
  products,
  services = [],
  categories = [],
  productTypes = [],
  editMode,
  quotationId,
  initialData
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [customerId, setCustomerId] = useState(initialData?.customerId || '');
  const [siteId, setSiteId] = useState(initialData?.siteId || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [terms, setTerms] = useState(initialData?.terms || 'Payment terms: 30% advance on confirmation, balance upon completion.\nAll prices include GST unless explicitly noted.\nWarranty: 1-Year Comprehensive On-Site Support.');
  const [validUntil, setValidUntil] = useState(
    initialData?.validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [advancePct, setAdvancePct] = useState(initialData?.advancePercentage ?? 30);
  const [error, setError] = useState('');

  // Selector Modal state
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [targetItemIndex, setTargetItemIndex] = useState<number | null>(null);

  const [items, setItems] = useState<LineItem[]>(
    initialData?.items?.length
      ? initialData.items.map(i => ({ ...i, _key: uid() }))
      : [
          {
            _key: uid(),
            productId: '',
            description: '',
            qty: 1,
            unitPrice: 0,
            gstRate: 18,
            discount: 0,
          }
        ]
  );

  const filteredSites = useMemo(() => {
    if (!customerId) return [];
    return customerSites.filter(s => s.customer_id === customerId);
  }, [customerSites, customerId]);

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === customerId);
  }, [customers, customerId]);

  // Calculations
  const summary = useMemo(() => {
    let subtotal = 0;
    let gstTotal = 0;
    let discountTotal = 0;

    items.forEach(item => {
      const { taxable, gstAmt } = calcLine(item);
      subtotal += taxable;
      gstTotal += gstAmt;
      discountTotal += Number(item.discount) || 0;
    });

    const totalAmount = subtotal + gstTotal;
    const advanceAmount = (totalAmount * advancePct) / 100;

    return { subtotal, gstTotal, discountTotal, totalAmount, advanceAmount };
  }, [items, advancePct]);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems(prev => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems(prev => [
      ...prev,
      {
        _key: uid(),
        productId: '',
        description: '',
        qty: 1,
        unitPrice: 0,
        gstRate: 18,
        discount: 0,
      }
    ]);
  }

  function removeItem(index: number) {
    if (items.length === 1) {
      setItems([{ _key: uid(), productId: '', description: '', qty: 1, unitPrice: 0, gstRate: 18, discount: 0 }]);
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  }

  // Handle selection from Category-Wise Modal
  function handleModalSelectProduct(product: Product) {
    const currentPrice = product.product_prices?.find(pp => pp.is_current)?.selling_price || 0;
    const desc = `${product.name}${product.model ? ` (${product.model})` : ''}`;

    if (targetItemIndex !== null && targetItemIndex < items.length) {
      // Replace existing item
      updateItem(targetItemIndex, {
        productId: product.id,
        description: desc,
        unitPrice: Number(currentPrice),
        gstRate: Number(product.gst_rate) || 18,
      });
    } else {
      // Append new item
      setItems(prev => [
        ...prev,
        {
          _key: uid(),
          productId: product.id,
          description: desc,
          qty: 1,
          unitPrice: Number(currentPrice),
          gstRate: Number(product.gst_rate) || 18,
          discount: 0,
        }
      ]);
    }
    setTargetItemIndex(null);
  }

  function handleModalSelectCustom() {
    if (targetItemIndex !== null && targetItemIndex < items.length) {
      updateItem(targetItemIndex, {
        productId: '',
        description: 'Installation / Labour Charges',
        unitPrice: 0,
        gstRate: 18,
      });
    } else {
      setItems(prev => [
        ...prev,
        {
          _key: uid(),
          productId: '',
          description: 'Installation / Labour Charges',
          qty: 1,
          unitPrice: 0,
          gstRate: 18,
          discount: 0,
        }
      ]);
    }
    setTargetItemIndex(null);
  }

  async function handleSave() {
    setError('');
    if (!customerId) {
      setError('Please select a customer.');
      return;
    }
    if (items.some(i => !i.description.trim())) {
      setError('All line items must have a description.');
      return;
    }
    if (items.some(i => Number(i.qty) <= 0)) {
      setError('Quantity must be greater than 0 for all items.');
      return;
    }

    const payload: CreateQuotationData = {
      customerId,
      siteId: siteId || undefined,
      title: title.trim() || undefined,
      terms: terms.trim() || undefined,
      validUntil: validUntil || undefined,
      advancePercentage: advancePct,
      subtotal: summary.subtotal,
      gstTotal: summary.gstTotal,
      discountTotal: summary.discountTotal,
      totalAmount: summary.totalAmount,
      items: items.map((item, i) => {
        const { gstAmt, total } = calcLine(item);
        return {
          productId: item.productId || undefined,
          description: item.description.trim(),
          quantity: Number(item.qty),
          unitPrice: Number(item.unitPrice),
          gstRate: Number(item.gstRate),
          discount: Number(item.discount),
          gstAmount: gstAmt,
          lineTotal: total,
          sortOrder: i,
        };
      }),
    };

    startTransition(async () => {
      try {
        if (editMode && quotationId) {
          await updateQuotation(quotationId, payload);
          router.push(`/admin/quotations/${quotationId}`);
        } else {
          const id = await createQuotation(payload);
          router.push(`/admin/quotations/${id}`);
        }
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 mb-1.5 transition-colors"
          >
            <ArrowLeft size={13} /> Back to Quotations
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{editMode ? 'Edit Quotation' : 'Create Quotation'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Save size={15} /> {isPending ? 'Saving...' : 'Save Quotation'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Main Grid: Form (Left 2/3) + Financial Summary (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Location Box */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-1.5">
              <Building2 size={14} className="text-blue-600" /> Customer &amp; Project Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Customer *</label>
                <select
                  value={customerId}
                  onChange={e => {
                    setCustomerId(e.target.value);
                    setSiteId('');
                  }}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.company_name || c.profiles?.full_name || 'Customer'} {c.tax_id ? `(GST: ${c.tax_id})` : ''}
                    </option>
                  ))}
                </select>
                {selectedCustomer && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    {selectedCustomer.profiles?.full_name} · {selectedCustomer.profiles?.phone_number || selectedCustomer.profiles?.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Installation Site</label>
                <select
                  value={siteId}
                  onChange={e => setSiteId(e.target.value)}
                  disabled={!customerId}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Default / Main Site</option>
                  {filteredSites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}{s.city ? ` (${s.city})` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Quotation Title / Project Name</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., CCTV &amp; Security System Package (8 Cameras + 4K NVR)"
                  className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Valid Until Date</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Advance Payment Required (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={advancePct}
                    onChange={e => setAdvancePct(Number(e.target.value))}
                    className="w-24 text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <span className="text-xs text-gray-500 font-medium">
                    = ₹{summary.advanceAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table & Category-Wise Picker Trigger */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Quotation Line Items</h2>
                <p className="text-xs text-gray-500 mt-0.5">Select products by category (Group &gt; Category &gt; 2MP/4MP Subcategory)</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTargetItemIndex(null);
                  setSelectorOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Filter size={13} /> Category Product Picker
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wide border-b border-gray-200">
                    <th className="px-4 py-3">Item Description</th>
                    <th className="px-3 py-3 w-20 text-center">Qty</th>
                    <th className="px-3 py-3 w-28 text-right">Unit Price (₹)</th>
                    <th className="px-3 py-3 w-20 text-center">GST %</th>
                    <th className="px-3 py-3 w-24 text-right">Discount (₹)</th>
                    <th className="px-4 py-3 w-28 text-right">Line Total</th>
                    <th className="px-3 py-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, idx) => {
                    const line = calcLine(item);
                    return (
                      <tr key={item._key} className="hover:bg-slate-50/70 transition-colors">
                        {/* Description + Change product button */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              value={item.description}
                              onChange={e => updateItem(idx, { description: e.target.value })}
                              placeholder="Product name / labour service..."
                              className="flex-1 text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setTargetItemIndex(idx);
                                setSelectorOpen(true);
                              }}
                              title="Pick from categorized catalog"
                              className="px-2 py-1.5 text-xs bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg border border-gray-200 flex-shrink-0 transition-colors"
                            >
                              Catalog
                            </button>
                          </div>
                        </td>

                        {/* Qty */}
                        <td className="px-3 py-3 text-center">
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={e => updateItem(idx, { qty: Math.max(1, Number(e.target.value)) })}
                            className="w-16 text-center text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </td>

                        {/* Unit Price */}
                        <td className="px-3 py-3 text-right">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.unitPrice}
                            onChange={e => updateItem(idx, { unitPrice: Math.max(0, Number(e.target.value)) })}
                            className="w-24 text-right text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </td>

                        {/* GST % */}
                        <td className="px-3 py-3 text-center">
                          <select
                            value={item.gstRate}
                            onChange={e => updateItem(idx, { gstRate: Number(e.target.value) })}
                            className="text-xs border border-gray-300 rounded-lg px-1.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>

                        {/* Discount */}
                        <td className="px-3 py-3 text-right">
                          <input
                            type="number"
                            min={0}
                            value={item.discount}
                            onChange={e => updateItem(idx, { discount: Math.max(0, Number(e.target.value)) })}
                            className="w-20 text-right text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </td>

                        {/* Line Total */}
                        <td className="px-4 py-3 text-right text-xs font-bold text-slate-900 font-mono">
                          ₹{line.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Remove */}
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions for items */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetItemIndex(null);
                    setSelectorOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 shadow-sm"
                >
                  <Plus size={13} className="text-blue-600" /> + Add from Catalog
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50"
                >
                  + Add Blank Line
                </button>
              </div>
              <span className="text-xs text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Terms &amp; Conditions</h2>
            <textarea
              rows={3}
              value={terms}
              onChange={e => setTerms(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Right column: Summary Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6 space-y-5">
            <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">Financial Summary</h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Taxable Subtotal</span>
                <span className="font-mono font-medium">₹{summary.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Total GST</span>
                <span className="font-mono font-medium">₹{summary.gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {summary.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Total Discount</span>
                  <span className="font-mono font-medium">−₹{summary.discountTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Grand Total</span>
                <span className="text-xl font-bold text-blue-600 font-mono">
                  ₹{summary.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Advance payment highlight */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Advance Required ({advancePct}%)</p>
              <p className="text-lg font-bold text-blue-700 font-mono">
                ₹{summary.advanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-blue-600">
                Receiving this advance will auto-create the Work Order.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Save size={16} /> {isPending ? 'Saving...' : 'Save Quotation'}
            </button>
          </div>
        </div>
      </div>

      {/* Hierarchical Product Selector Modal */}
      {selectorOpen && (
        <HierarchicalProductSelector
          products={products}
          services={services}
          categories={categories}
          productTypes={productTypes}
          onSelectProduct={handleModalSelectProduct}
          onSelectCustom={handleModalSelectCustom}
          onClose={() => {
            setSelectorOpen(false);
            setTargetItemIndex(null);
          }}
        />
      )}
    </div>
  );
}
