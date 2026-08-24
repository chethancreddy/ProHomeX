import { redirect } from 'next/navigation';

export default function QuotationRequestsRedirect() {
  redirect('/admin/leads');
}
