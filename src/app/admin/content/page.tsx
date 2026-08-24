import { getAllSiteSettings } from '@/lib/cms';
import CMSManager from './CMSManager';

export default async function AdminContentPage() {
  const settings = await getAllSiteSettings();

  return <CMSManager initialSettings={settings} />;
}
