'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('ProHomeX PWA Service Worker registered with scope:', registration.scope);
          })
          .catch((err) => {
            console.warn('ProHomeX Service Worker registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
