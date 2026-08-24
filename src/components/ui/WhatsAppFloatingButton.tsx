'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { WhatsAppButtonSettings } from '@/lib/cms';

interface Props {
  settings?: WhatsAppButtonSettings;
}

export default function WhatsAppFloatingButton({ settings }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [dismissPopup, setDismissPopup] = useState(false);

  // If disabled by admin, don't render
  if (settings && !settings.enabled) return null;

  const phone = settings?.phone || '+919876543210';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = settings?.default_message || 'Hello ProHomeX team! I would like to get a quote and consultation for installation services.';
  const popupText = settings?.popup_text || 'Chat with ProHomeX on WhatsApp!';
  const isLeft = settings?.position === 'bottom-left';
  const pulse = settings?.pulse_animation !== false;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <div
      className={`fixed z-50 bottom-6 ${isLeft ? 'left-6' : 'right-6'} flex items-center gap-3 no-print select-none`}
    >
      {/* Interactive Tooltip / Chat Popup */}
      {!dismissPopup && popupText && (
        <div
          className={`hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs font-semibold py-2 px-3.5 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 ${
            isHovered ? 'scale-105 shadow-2xl' : 'opacity-95'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">
            {popupText}
          </a>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDismissPopup(true);
            }}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
            aria-label="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Chat on WhatsApp"
        className={`relative group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/40 hover:bg-[#20ba59] active:scale-95 ${
          pulse ? 'animate-bounce-short' : ''
        }`}
      >
        {/* Glow / Pulse Ring */}
        {pulse && (
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-pulse pointer-events-none" />
        )}

        {/* WhatsApp Brand Icon */}
        <svg
          className="w-7 h-7 fill-current relative z-10 transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>

        {/* Small Active Green Dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
      </a>
    </div>
  );
}
