// ============================================================
// MarketSim Pro - Root Layout
// ============================================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/query-provider';

// ------------------------------------------------------------
// Font Configuration
// ------------------------------------------------------------

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

// ------------------------------------------------------------
// Metadata
// ------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    default: 'MarketSim Pro - Simulation d\'Entreprise',
    template: '%s | MarketSim Pro',
  },
  description:
    'MarketSim Pro est un serious game pédagogique permettant aux équipes d\'étudiants de diriger une entreprise de fabrication de vélos en compétition.',
  keywords: [
    'MarketSim Pro',
    'serious game',
    'simulation',
    'pédagogie',
    'entreprise',
    'vélos',
    'formation',
    'gestion',
  ],
  authors: [{ name: 'MarketSim Pro Team' }],
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    title: 'MarketSim Pro - Simulation d\'Entreprise',
    description: 'Serious game pédagogique de gestion d\'entreprise',
    type: 'website',
    locale: 'fr_FR',
  },
};

// ------------------------------------------------------------
// Root Layout Component
// ------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 text-gray-800`}
      >
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
