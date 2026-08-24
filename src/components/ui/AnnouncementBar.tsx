'use client';

import Link from 'next/link';
import { AnnouncementBarSettings } from '@/lib/cms';
import { ChevronRight } from 'lucide-react';

interface Props {
  settings?: AnnouncementBarSettings;
}

const BG_STYLES: Record<string, string> = {
  blue: 'bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 text-white',
  emerald: 'bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-700 text-white',
  amber: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white',
  purple: 'bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-700 text-white',
  slate: 'bg-slate-900 text-slate-100',
};

export default function AnnouncementBar({ settings }: Props) {
  if (!settings || !settings.enabled || !settings.text) return null;

  const bgCls = BG_STYLES[settings.bg_color || 'blue'] || BG_STYLES.blue;

  return (
    <div className={`${bgCls} py-2 px-4 text-xs font-semibold text-center no-print relative z-40 transition-colors shadow-sm`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span>{settings.text}</span>
        {settings.link && (
          <Link
            href={settings.link}
            className="inline-flex items-center gap-0.5 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full text-[11px] underline underline-offset-2 transition-colors ml-1"
          >
            Learn More <ChevronRight size={12} />
          </Link>
        )}
      </div>
    </div>
  );
}
