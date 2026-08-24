'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, Search, Package, X, FileQuestion } from 'lucide-react';

type Product = {
  id: string; name: string; sku: string; brand: string | null; model: string | null;
  description: string | null; unit: string; stock_quantity: number; image_url: string | null;
  product_categories: { id: string; name: string; services: { id: string; name: string } | null } | null;
  product_prices: { selling_price: number; is_current: boolean }[];
};
type Service = { id: string; name: string };
type CartItem = { productId: string; quantity: number; name: string; sku: string; price: number; unit: string };

const CART_KEY = 'prohomex_quote_cart';
const LEGACY_CART_KEY = 'techmaha_quote_cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY) || localStorage.getItem(LEGACY_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

interface Props { products: Product[]; services: Service[]; }

export default function ProductCatalog({ products, services }: Props) {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => { setCart(loadCart()); }, []);

  const filteredProducts = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q);
    const matchService = !serviceFilter || p.product_categories?.services?.id === serviceFilter;
    return matchSearch && matchService;
  }), [products, search, serviceFilter]);

  function getCartQty(productId: string) {
    return cart.find(i => i.productId === productId)?.quantity || 0;
  }

  function addToCart(product: Product) {
    const price = product.product_prices?.find(p => p.is_current)?.selling_price || 0;
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      let next: CartItem[];
      if (existing) {
        next = prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        next = [...prev, { productId: product.id, quantity: 1, name: product.name, sku: product.sku, price, unit: product.unit || 'pcs' }];
      }
      saveCart(next);
      return next;
    });
  }

  function removeFromCart(productId: string) {
    setCart(prev => {
      const next = prev.filter(i => i.productId !== productId);
      saveCart(next);
      return next;
    });
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => {
      const next = prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i);
      saveCart(next);
      return next;
    });
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  function stockLabel(qty: number) {
    if (qty === 0) return <span className="text-xs text-red-600 font-medium">Out of Stock</span>;
    if (qty <= 5) return <span className="text-xs text-orange-600 font-medium">Only {qty} left</span>;
    return <span className="text-xs text-green-600 font-medium">In Stock</span>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Browse our catalog and add products to your quote request.</p>
        </div>
        {cart.length > 0 && (
          <button onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <ShoppingCart size={16} />
            Quote Basket
            <span className="bg-white text-blue-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setServiceFilter('')}
            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${!serviceFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
            All
          </button>
          {services.map(s => (
            <button key={s.id} onClick={() => setServiceFilter(s.id === serviceFilter ? '' : s.id)}
              className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${serviceFilter === s.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(p => {
            const price = p.product_prices?.find(pp => pp.is_current)?.selling_price;
            const qty = getCartQty(p.id);
            const outOfStock = p.stock_quantity === 0;

            return (
              <div key={p.id} className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden ${outOfStock ? 'opacity-70' : ''}`}>
                {/* Product Image */}
                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={36} className="text-slate-300" />
                  )}
                  {p.product_categories?.services?.name && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600/90 text-white text-xs font-medium rounded-full">
                      {p.product_categories.services.name}
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-slate-400 font-mono mb-1">{p.sku}</p>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{p.name}</h3>
                  {p.brand && <p className="text-xs text-slate-500 mt-0.5">{p.brand}{p.model ? ` — ${p.model}` : ''}</p>}
                  {p.description && <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{p.description}</p>}

                  <div className="mt-auto pt-3 flex items-end justify-between">
                    <div>
                      {price ? (
                        <p className="text-lg font-bold text-slate-900">₹{Number(price).toLocaleString('en-IN')}</p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Price on request</p>
                      )}
                      {stockLabel(p.stock_quantity)}
                    </div>

                    {!outOfStock && (
                      qty > 0 ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateQty(p.id, qty - 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-sm font-bold text-blue-700">{qty}</span>
                          <button onClick={() => addToCart(p)}
                            className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                          <Plus size={12} /> Add
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Package size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-600 font-medium">No products found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different search or filter.</p>
        </div>
      )}

      {/* Floating Cart Sidebar */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Quote Basket ({cartCount} items)</h2>
              <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.map(item => (
                <div key={item.productId} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs font-mono text-slate-400">{item.sku}</p>
                    {item.price > 0 && <p className="text-xs text-slate-600 mt-0.5">₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"><Minus size={10} /></button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"><Plus size={10} /></button>
                    <button onClick={() => removeFromCart(item.productId)} className="w-6 h-6 rounded bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 ml-1"><X size={10} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-200">
              {cartTotal > 0 && (
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-600">Est. Total</span>
                  <span className="font-bold text-slate-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <Link href="/customer/request-quote" onClick={() => setCartOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                <FileQuestion size={16} /> Request Quotation
              </Link>
              <button onClick={() => { setCart([]); saveCart([]); setCartOpen(false); }}
                className="mt-2 w-full py-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
                Clear Cart
              </button>
            </div>
          </div>
        </>
      )}

      {/* Sticky bottom bar when cart has items */}
      {cart.length > 0 && !cartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <button onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-105">
            <ShoppingCart size={18} />
            <span>{cartCount} items in basket</span>
            {cartTotal > 0 && <span className="text-blue-200">· ₹{cartTotal.toLocaleString('en-IN')}</span>}
          </button>
        </div>
      )}
    </div>
  );
}
