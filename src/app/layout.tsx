import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getSectionSettings, WhatsAppButtonSettings } from "@/lib/cms";
import WhatsAppFloatingButton from "@/components/ui/WhatsAppFloatingButton";
import PwaRegister from "@/components/pwa/PwaRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ProHomeX Systems & Solutions",
  description: "Smart Security, Reliable Power & Sustainable Solar Energy Solutions.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ProHomeX",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const waSettings = await getSectionSettings<WhatsAppButtonSettings>('whatsapp_button');

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="application-name" content="ProHomeX" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ProHomeX" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-black">
        {children}
        <WhatsAppFloatingButton settings={waSettings} />
        <PwaRegister />
      </body>
    </html>
  );
}

