import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DSA Practice',
    template: '%s · DSA Practice',
  },
  description:
    'Mobile-first, offline-capable practice companion around the NeetCode roadmap and LeetCode problems.',
  applicationName: 'DSA Practice',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'DSA Practice' },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: '/icons/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icons/icon-192.png' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8fb' },
    { media: '(prefers-color-scheme: dark)', color: '#14161d' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Deliberately not user-scalable=no: pinch zoom is an accessibility requirement.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}