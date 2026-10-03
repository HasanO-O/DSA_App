import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DSA Practice — NeetCode Companion',
    short_name: 'DSA Practice',
    description:
      'Mobile-first, offline-capable practice companion with Excalidraw visualization, code drafting and progress tracking.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f7f8fb',
    theme_color: '#f7f8fb',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}