import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MediCore Patient Portal',
    short_name: 'MediCore',
    description: 'Portal Pasien & Jadwal Pengobatan Terpadu MediCore',
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

