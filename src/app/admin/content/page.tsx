import { getAllSiteSettings } from '@/lib/cms';
import CMSManager from './CMSManager';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const settings = await getAllSiteSettings();

  return <CMSManager initialSettings={settings} />;
}
