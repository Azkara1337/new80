import type { Metadata, Viewport } from 'next';
import { Anton, Inter } from 'next/font/google';
import { preconnect } from 'react-dom';
import './globals.css';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Photos – NEW80', template: '%s' },
  description: 'Retrouve tes photos des soirées NEW80.',
  openGraph: { siteName: 'NEW80', locale: 'fr_FR', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#0a0a0b', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) preconnect(process.env.NEXT_PUBLIC_R2_PUBLIC_URL);
  return (
    <html lang="fr" className={`${anton.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-noir font-sans text-ink">{children}</body>
    </html>
  );
}
