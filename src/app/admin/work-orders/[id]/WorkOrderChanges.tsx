'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Minus, RefreshCw, Percent, Wrench, ChevronDown,
  Layers, Search, Check, X, Sparkles, Box, Tag, AlertCircle
} from 'lucide-react';
import { addWorkOrderChange, type ChangeData } from '../actions';

type OriginalItem = {
  id: string;
  quotationItemId?: string;
  description: string;
  qty: number;
  price: number;
  gstRate?: number;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  brand: string | null;
  model: string | null;
  unit: string;
  gst_rate: number;
  product_prices?: { selling_price: number; is_current: boolean }[];
  product_categories?: {
    id: string;
    name: string;
    services?: { id: string; name: string } | null;
  } | null;
  product_types?: { id: string; name: string } | null;
};

const CHANGE_TYPES = [
  { value: 'ADDED', label: '+ Add Extra Item', icon: Plus, color: 'border-green-300 text-green-700 bg-green-50' },
  { value: 'REMOVED', label: '− Remove Item', icon: Minus, color: 'border-red-300 text-red-700 bg-red-50' },
  { value: 'QTY_CHANGE', label: '↕ Change Quantity', icon: RefreshCw, color: 'border-blue-300 text-blue-700 bg-blue-50' },
  { value: 'PRICE_CHANGE', label: '↕ Change Price', icon: RefreshCw, color: 'border-orange-300 text-orange-700 bg-orange-50' },
  { value: 'DISCOUNT', label: '% Site Discount', icon: Percent, color: 'border-purple-300 text-purple-700 bg-purple-50' },
  { value: 'SERVICE', label: '⚙ Service / Labour Charge', icon: Wrench, color: 'border-teal-300 text-teal-700 bg-teal-50' },
] as const;

interface Props {
  workOrderId: string;
  originalItems: OriginalItem[];
  products?: Product[];
  services?: any[];
  categories?: any[];
  productTypes?: any[];
}

export default function WorkOrderChanges({
  workOrderId,
  originalItems,
  products = [],
  services = [],
  categories = [],
  productTypes = []
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Form state
  const [changeType, setChangeType] = useState<ChangeData['changeType']>('ADDED');
  const [selectedOriginalId, setSelectedOriginalId] = useState('');
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [gstRate, setGstRate] = useState(18);
  const [revisedQty, setRevisedQty] = useState<number | ''>('');
  const [revisedPrice, setRevisedPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Catalog picker inside changes
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [catalogSearch, setCatalogSearch] = useState('');

  const needsOriginalRef = ['REMOVED', 'QTY_CHANGE', 'PRICE_CHANGE'].includes(changeType);
  const isNewItem = changeType === 'ADDED';
  const isService = changeType === 'SERVICE';
  const isDiscount = changeType === 'DISCOUNT';

  function handleOriginalSelect(woItemId: string) {
    setSelectedOriginalId(woItemId);
    const item = originalItems.find(i => i.id === woItemId);
    if (item) {
      setDescription(item.description);
      setQty(item.qty);
      setPrice(item.price);
      setGstRate(item.gstRate || 18);
      if (changeType === 'QTY_CHANGE') setRevisedQty(item.qty);
      if (changeType === 'PRICE_CHANGE') setRevisedPrice(item.price);
    }
  }

  function resetForm() {
    setSelectedOriginalId('');
    setDescription('');
    setProductId('');
    setQty(1);
    setPrice(0);
    setGstRate(18);
    setRevisedQty('');
    setRevisedPrice('');
    setNotes('');
    setError('');
  }

  // Filter products for category picker
  const filteredProducts = useMemo(() => {
    const q = catalogSearch.toLowerCase().trim();
    return products.filter(p => {
      const sName = p.product_categories?.services?.name || '';
      const cName = p.product_categories?.name || '';
      const tName = p.product_types?.name || '';
      const pName = p.name.toLowerCase();

      if (selectedService !== 'ALL' && !sName.toLowerCase().includes(selectedService.toLowerCase()) && !pName.includes(selectedService.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'ALL' && !cName.toLowerCase().includes(selectedCategory.toLowerCase())) {
        return false;
      }
      if (selectedType !== 'ALL') {
        const typeLower = selectedType.toLowerCase();
        if (!tName.toLowerCase().includes(typeLower) && !pName.includes(typeLower)) {
          return false;
        }
      }
      if (q && !pName.includes(q) && !p.sku.toLowerCase().includes(q) && !(p.brand || '').toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [products, selectedService, selectedCategory, selectedType, catalogSearch]);

  function handlePickProduct(p: Product) {
    const currentPrice = p.product_prices?.find(pp => pp.is_current)?.selling_price || 0;
    setProductId(p.id);
    setDescription(`${p.name}${p.model ? ` (${p.model})` : ''}`);
    setPrice(Number(currentPrice));
    setGstRate(Number(p.gst_rate) || 18);
    setPickerOpen(false);
  }

  async function handleSubmit() {
    setError('');

    const selectedItem = originalItems.find(i => i.id === selectedOriginalId);

    if (needsOriginalRef && !selectedOriginalId) {
      setError('Please select which original item is affected.');
      return;
    }

    if (!needsOriginalRef && !description.trim()) {
      setError('Description is required.');
      return;
    }

    if (changeType === 'QTY_CHANGE' && (revisedQty === '' || Number(revisedQty) <= 0)) {
      setError('Please enter a valid revised quantity greater than 0.');
      return;
    }

    if (changeType === 'PRICE_CHANGE' && (revisedPrice === '' || Number(revisedPrice) < 0)) {
      setError('Please enter a valid revised price.');
      return;
    }

    if (isDiscount && Number(price) <= 0) {
      setError('Please enter a valid discount amount.');
      return;
    }

    const change: ChangeData = {
      changeType,
      quotationItemId: selectedItem?.quotationItemId || (selectedOriginalId ? selectedItem?.id : undefined),
      productId: productId || undefined,
      description: description || selectedItem?.description || '',
      originalQty: needsOriginalRef ? (selectedItem?.qty || qty) : qty,
      originalPrice: needsOriginalRef ? (selectedItem?.price || price) : price,
      gstRate: needsOriginalRef ? (selectedItem?.gstRate || gstRate) : gstRate,
      revisedQty: changeType === 'QTY_CHANGE' && revisedQty !== '' ? Number(revisedQty) : (changeType === 'REMOVED' ? 0 : undefined),
      revisedPrice: changeType === 'PRICE_CHANGE' && revisedPrice !== '' ? Number(revisedPrice) : undefined,
      changeNotes: notes.trim() || undefined,
    };

    startTransition(async () => {
      try {
        await addWorkOrderChange(workOrderId, change);
        setSuccess('Installation change logged successfully!');
        resetForm();
        setOpen(false);
        setTimeout(() => setSuccess(''), 3000);
        router.refresh();
      } catch (e: any) {
        setError(e.message);
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-dashed border-gray-200 flex items-center justify-between bg-slate-50/70">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Log Installation Change on Site</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Add extra items, remove cancelled items, change quantities, apply on-site discounts or add service charges.
          </p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors shadow-sm ${
            open ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Plus size={14} /> {open ? 'Cancel' : 'Log Change'}
        </button>
      </div>

      {open && (
        <div className="p-6 space-y-5">
          {/* Change Type Buttons */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Select Change Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {CHANGE_TYPES.map(ct => {
                const Icon = ct.icon;
                const isSelected = changeType === ct.value;
                return (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => {
                      setChangeType(ct.value as any);
                      resetForm();
                    }}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Icon size={14} /> {ct.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. Affects Which Original Item? (For REMOVED, QTY_CHANGE, PRICE_CHANGE) */}
          {needsOriginalRef && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Original Quotation Item to Modify / Remove *
              </label>
              <select
                value={selectedOriginalId}
                onChange={e => handleOriginalSelect(e.target.value)}
                className="w-full text-sm font-medium border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select item from original scope...</option>
                {originalItems.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.description} (Original: {i.qty} units × ₹{i.price.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>

              {selectedOriginalId && (
                <div className="text-xs text-slate-600 flex items-center gap-4 mt-2">
                  <span>Current Qty: <strong>{originalItems.find(i => i.id === selectedOriginalId)?.qty}</strong></span>
                  <span>Current Price: <strong>₹{originalItems.find(i => i.id === selectedOriginalId)?.price.toLocaleString('en-IN')}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* 2. New Item / Service Charge Description with Categorized Product Picker */}
          {(isNewItem || isService || isDiscount) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {isDiscount ? 'Discount Reason / Description *' : isService ? 'Service Charge Description *' : 'Item Description *'}
                </label>
                {isNewItem && products.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(!pickerOpen)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                  >
                    <Layers size={12} /> {pickerOpen ? 'Close Catalog' : 'Pick from Product Catalog (2MP/4MP/etc.)'}
                  </button>
                )}
              </div>

              {/* Categorized Product Picker Drawer */}
              {pickerOpen && isNewItem && (
                <div className="p-4 bg-slate-50 border border-blue-200 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select
                      value={selectedService}
                      onChange={e => setSelectedService(e.target.value)}
                      className="text-xs font-semibold bg-white border border-gray-300 rounded-lg p-2"
                    >
                      <option value="ALL">All Systems (CCTV/UPS/Solar/Automation)</option>
                      <option value="CCTV">CCTV</option>
                      <option value="UPS">UPS &amp; Power</option>
                      <option value="Solar">Solar</option>
                      <option value="Home Automation">Home &amp; Sump Automation</option>
                      <option value="Networking">Networking</option>
                    </select>

                    <select
                      value={selectedType}
                      onChange={e => setSelectedType(e.target.value)}
                      className="text-xs font-semibold bg-white border border-gray-300 rounded-lg p-2"
                    >
                      <option value="ALL">All Types</option>
                      <option value="2MP">2MP Camera</option>
                      <option value="4MP">4MP Camera</option>
                      <option value="5MP">5MP Camera</option>
                      <option value="8MP">8MP Camera</option>
                      <option value="Dome">Dome Camera</option>
                      <option value="Bullet">Bullet Camera</option>
                      <option value="PTZ">PTZ Camera</option>
                      <option value="NVR">NVR</option>
                      <option value="DVR">DVR</option>
                      <option value="Sump">Auto Sump Controller</option>
                      <option value="Ultrasonic">Water Level Sensor</option>
                      <option value="PIR">PIR Motion Sensor</option>
                      <option value="Microwave">Radar Sensor Switch</option>
                      <option value="Touch">Smart Touch Switch</option>
                      <option value="Hub">Zigbee Gateway Hub</option>
                      <option value="Lock">Smart Door Lock</option>
                    </select>

                    <input
                      value={catalogSearch}
                      onChange={e => setCatalogSearch(e.target.value)}
                      placeholder="Search product..."
                      className="text-xs bg-white border border-gray-300 rounded-lg p-2"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-200 bg-white rounded-xl border border-gray-200">
                    {filteredProducts.slice(0, 15).map(p => {
                      const curPrice = p.product_prices?.find(pp => pp.is_current)?.selling_price || 0;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handlePickProduct(p)}
                          className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-gray-900">{p.name}</p>
                            <p className="text-gray-400">{p.sku} {p.brand ? `· ${p.brand}` : ''}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-blue-600">₹{Number(curPrice).toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-gray-400 ml-1">GST: {p.gst_rate}%</span>
                          </div>
                        </div>
                      );
                    })}
                    {filteredProducts.length === 0 && (
                      <p className="p-4 text-center text-xs text-gray-400">No matching products found in catalog.</p>
                    )}
                  </div>
                </div>
              )}

              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={
                  isDiscount
                    ? 'e.g., On-site settlement discount / goodwill credit'
                    : isService
                    ? 'e.g., Additional conduit piping & core drilling labour'
                    : 'e.g., Extra 2MP Eco Bullet Camera, 305m Cat6 Cable Box'
                }
                className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          )}

          {/* 3. Numeric inputs for Quantity, Unit Price, GST Rate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Added / Service items: Qty + Price + GST */}
            {(isNewItem || isService) && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={qty}
                    onChange={e => setQty(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">GST Rate (%)</label>
                  <select
                    value={gstRate}
                    onChange={e => setGstRate(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </>
            )}

            {/* Discount Amount */}
            {isDiscount && (
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Amount to Deduct (₹) *</label>
                <input
                  type="number"
                  min={1}
                  step={0.01}
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  placeholder="Enter discount amount in ₹"
                  className="w-full text-sm font-bold text-purple-700 border border-purple-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            )}

            {/* Quantity Change Input */}
            {changeType === 'QTY_CHANGE' && (
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New / Revised Total Quantity (was {originalItems.find(i => i.id === selectedOriginalId)?.qty || '?'}) *
                </label>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={revisedQty}
                  onChange={e => setRevisedQty(Number(e.target.value))}
                  placeholder="Enter actual installed quantity"
                  className="w-full text-sm font-bold text-blue-700 border border-blue-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            )}

            {/* Price Change Input */}
            {changeType === 'PRICE_CHANGE' && (
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New / Revised Unit Price (was ₹{originalItems.find(i => i.id === selectedOriginalId)?.price.toLocaleString('en-IN') || '?'}) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={revisedPrice}
                  onChange={e => setRevisedPrice(Number(e.target.value))}
                  placeholder="Enter agreed unit price"
                  className="w-full text-sm font-bold text-orange-700 border border-orange-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>
            )}
          </div>

          {/* Site / Customer Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Reason / Site Log Note</label>
            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., Extra camera requested by client on site, Site constraint prevented 2nd sensor"
              className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm"
            >
              {isPending ? 'Logging Change...' : 'Confirm & Log Change'}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="px-6 py-3 text-xs font-bold text-green-700 bg-green-50 border-t border-green-200 text-center">
          ✓ {success}
        </div>
      )}
    </div>
  );
}
