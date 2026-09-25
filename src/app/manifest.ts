import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fe-Tablet - Portal Monitoring & Suplementasi TTD',
    short_name: 'Fe-Tablet',
    description: 'Aplikasi Monitoring Konsumsi TTD Siswi & Portal Manajemen Anemia Sekolah',
    start_url: '/splash',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#e11d48',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
