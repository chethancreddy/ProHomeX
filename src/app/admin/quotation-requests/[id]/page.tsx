import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import QuotationRequestActions from './QuotationRequestActions';

interface Props { params: Promise<{ id: string }> }

export default async function QuotationRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: request, error } = await supabase
    .from('quotation_requests')
    .select(`
      id, request_number, status, customer_notes, admin_notes, created_at, converted_quotation_id,
      customers (
        id, company_name,
        profiles ( full_name, email, phone )
      ),
      quotation_request_items (
        id, quantity, notes,
        products (
          id, name, sku, brand, model, unit,
          product_categories ( name, services ( name ) ),
          product_prices ( selling_price, is_current )
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !request) notFound();

  const customer = request.customers as any;
  const profile = customer?.profiles;
  const items = request.quotation_request_items as any[];

  const estimatedTotal = items.reduce((sum: number, item: any) => {
    const price = item.products?.product_prices?.find((p: any) => p.is_current)?.selling_price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/quotation-requests" className="hover:text-blue-600">Quote Requests</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{request.request_number}</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Main Content */}
        <div className="col-span-2 space-y-5">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Customer</h2>
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">{customer?.company_name || profile?.full_name}</p>
              {profile?.full_name && customer?.company_name && <p className="text-sm text-gray-600">{profile.full_name}</p>}
              {profile?.email && <p className="text-sm text-gray-500">{profile.email}</p>}
              {profile?.phone && <p className="text-sm text-gray-500">{profile.phone}</p>}
            </div>
            {request.customer_notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Customer Note</p>
                <p className="text-sm text-gray-700 italic">"{request.customer_notes}"</p>
              </div>
            )}
          </div>

          {/* Requested Products */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Requested Products</h2>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3 text-center">Qty</th>
                  <th className="px-5 py-3 text-right">Est. Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any) => {
                  const product = item.products;
                  const price = product?.product_prices?.find((p: any) => p.is_current)?.selling_price || 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-900">{product?.name}</p>
                        <p className="text-xs text-slate-400">{product?.brand} {product?.model}</p>
                        <p className="text-xs text-slate-300">{product?.product_categories?.services?.name} / {product?.product_categories?.name}</p>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-slate-500">{product?.sku}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="font-bold text-slate-800">{item.quantity}</span>
                        <span className="text-xs text-slate-400 ml-1">{product?.unit}</span>
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-slate-700">
                        {price ? `₹${(price * item.quantity).toLocaleString('en-IN')}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {estimatedTotal > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td colSpan={3} className="px-5 py-3 text-sm font-bold text-slate-700 text-right">Estimated Total</td>
                    <td className="px-5 py-3 text-right text-base font-bold text-slate-900">₹{estimatedTotal.toLocaleString('en-IN')}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Right: Actions Panel */}
        <div className="col-span-1">
          <QuotationRequestActions
            requestId={request.id}
            currentStatus={request.status}
            adminNotes={request.admin_notes || ''}
            convertedQuotationId={request.converted_quotation_id}
            createdAt={request.created_at}
          />
        </div>
      </div>
    </div>
  );
}
