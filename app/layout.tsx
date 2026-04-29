import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { AppStateProvider } from '@/contexts/AppStateContext';
import TabBar from '@/components/TabBar';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description:
    'A quiet habit tracker that picks today’s lineup so you don’t have to.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Habit Tracker',
  appleWebApp: {
    capable: true,
    title: 'Habits',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF8F4',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppStateProvider>
          <main className="mx-auto w-full max-w-xl px-5 pt-6">{children}</main>
          <TabBar />
          <ServiceWorkerRegistrar />
        </AppStateProvider>
      </body>
    </html>
  );
}
