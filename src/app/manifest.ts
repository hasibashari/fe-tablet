import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fe-Tablet Siswi & Monitoring Portal',
    short_name: 'Fe-Tablet',
    description: 'Aplikasi Pencegahan Anemia & Monitoring Suplementasi Tablet Tambah Darah (TTD) Remaja Putri',
    start_url: '/user/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0ea5e9',
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
    ],
  }
}

