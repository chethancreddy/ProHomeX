'use client';

import Link from 'next/link';
import { AnnouncementBarSettings } from '@/lib/cms';
import { ArrowRight } from 'lucide-react';

interface Props {
  settings?: AnnouncementBarSettings;
}

export default function AnnouncementBar({ settings }: Props) {
  if (!settings || !settings.enabled || !settings.text) return null;

  return (
    <div className="bg-black text-white py-2 px-4 text-xs tracking-normal font-medium no-print relative z-40 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center flex-wrap">
        <span className="text-white/90">{settings.text}</span>
        {settings.link && (
          <Link
            href={settings.link}
            className="inline-flex items-center gap-1.5 bg-[#ff3d8b] hover:bg-[#eb2b7a] text-white px-3 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95"
          >
            Explore <ArrowRight size={11} />
          </Link>
        )}
      </div>
    </div>
  );
}

