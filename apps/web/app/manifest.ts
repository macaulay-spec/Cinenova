import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CineNova',
    short_name: 'CineNova',
    description: 'Rights-aware cinematic streaming platform.',
    start_url: '/',
    display: 'standalone',
    background_color: '#05070b',
    theme_color: '#05070b',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
