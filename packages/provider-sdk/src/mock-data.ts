import type { HomeResponse, TitleDetail, TitleSummary } from '@cinenova/contracts';
import type { ContentRight } from '@cinenova/domain';

const availableFrom = '2026-01-01T00:00:00.000Z';
const availableUntil = '2028-01-01T00:00:00.000Z';

export const MOCK_TITLES: TitleDetail[] = [
  {
    id: 'title-amber-signal',
    slug: 'the-amber-signal',
    kind: 'movie',
    title: 'The Amber Signal',
    synopsis:
      'A Lagos radio engineer follows a strange amber transmission across the coast and uncovers a city-wide memory experiment.',
    releaseYear: 2026,
    runtimeSeconds: 6420,
    maturityRating: 'PG_13',
    genres: ['Sci-Fi', 'Mystery', 'Nollywood Noir'],
    countries: ['NG'],
    artwork: [
      {
        url: '/artwork/amber-signal-poster.svg',
        kind: 'poster',
        alt: 'Poster artwork for The Amber Signal showing a glowing amber radio tower',
        width: 600,
        height: 900,
        dominantColor: '#e46b4a',
      },
      {
        url: '/artwork/amber-signal-hero.svg',
        kind: 'hero',
        alt: 'Hero artwork for The Amber Signal with a dark skyline and amber light',
        width: 1920,
        height: 1080,
        dominantColor: '#4f1d16',
      },
    ],
    availableFrom,
    availableUntil,
    minimumPlan: 'standard',
    offlineDownloadAllowed: false,
    reasonLabel: 'Because you watched cerebral sci-fi thrillers',
    cast: ['Ife Adeyemi', 'Tomi Bakare', 'Nia Okonkwo'],
    directors: ['Amara Cole'],
    audioTracks: [
      { language: 'en', label: 'English', kind: 'audio', accessibility: false },
      { language: 'yo', label: 'Yorùbá', kind: 'audio', accessibility: false },
    ],
    subtitleTracks: [
      { language: 'en', label: 'English CC', kind: 'captions', accessibility: true },
      { language: 'fr', label: 'French', kind: 'subtitles', accessibility: false },
    ],
    seasons: [],
    trailerAssetId: 'asset-amber-trailer',
    primaryAssetId: 'asset-amber-feature',
    rightsExplanation: 'Available in NG, GH, and KE for Standard and Premium plans until 2028.',
  },
  {
    id: 'title-riverlight',
    slug: 'riverlight',
    kind: 'series',
    title: 'Riverlight',
    synopsis:
      'In a floating riverside settlement, four families race to protect their home when the water begins reflecting possible futures.',
    releaseYear: 2025,
    runtimeSeconds: null,
    maturityRating: 'PG',
    genres: ['Drama', 'Adventure', 'Family'],
    countries: ['NG', 'GH'],
    artwork: [
      {
        url: '/artwork/riverlight-poster.svg',
        kind: 'poster',
        alt: 'Poster artwork for Riverlight showing lanterns over water',
        width: 600,
        height: 900,
        dominantColor: '#d49a48',
      },
      {
        url: '/artwork/riverlight-hero.svg',
        kind: 'hero',
        alt: 'Hero artwork for Riverlight with warm lights on a river at night',
        width: 1920,
        height: 1080,
        dominantColor: '#2f3b33',
      },
    ],
    availableFrom,
    availableUntil,
    minimumPlan: 'free',
    offlineDownloadAllowed: true,
    reasonLabel: 'Warm, character-led storytelling',
    cast: ['Sade Ibrahim', 'Kojo Mensah', 'Mina Hart'],
    directors: ['Ebele Nwosu'],
    audioTracks: [{ language: 'en', label: 'English', kind: 'audio', accessibility: false }],
    subtitleTracks: [{ language: 'en', label: 'English CC', kind: 'captions', accessibility: true }],
    seasons: [
      {
        id: 'season-riverlight-1',
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'episode-riverlight-101',
            slug: 'riverlight-s1-e1-the-glow',
            title: 'The Glow',
            synopsis: 'A child spots impossible reflections under the midnight bridge.',
            seasonNumber: 1,
            episodeNumber: 1,
            runtimeSeconds: 2780,
            assetId: 'asset-riverlight-101',
          },
          {
            id: 'episode-riverlight-102',
            slug: 'riverlight-s1-e2-low-tide',
            title: 'Low Tide',
            synopsis: 'The settlement votes on whether to leave before the tide reveals more secrets.',
            seasonNumber: 1,
            episodeNumber: 2,
            runtimeSeconds: 3010,
            assetId: 'asset-riverlight-102',
          },
        ],
      },
    ],
    trailerAssetId: 'asset-riverlight-trailer',
    primaryAssetId: 'asset-riverlight-101',
    rightsExplanation: 'Available in NG and GH for Free, Standard, and Premium plans with offline download.',
  },
  {
    id: 'title-orbit-silence',
    slug: 'orbit-of-silence',
    kind: 'movie',
    title: 'Orbit of Silence',
    synopsis:
      'A maintenance pilot stranded above Mars hears a voice from Earth that stopped transmitting twelve years earlier.',
    releaseYear: 2024,
    runtimeSeconds: 5940,
    maturityRating: 'PG_13',
    genres: ['Sci-Fi', 'Drama'],
    countries: ['US', 'ZA'],
    artwork: [
      {
        url: '/artwork/orbit-silence-poster.svg',
        kind: 'poster',
        alt: 'Poster artwork for Orbit of Silence showing a small spacecraft against Mars',
        width: 600,
        height: 900,
        dominantColor: '#c55f4a',
      },
      {
        url: '/artwork/orbit-silence-hero.svg',
        kind: 'hero',
        alt: 'Hero artwork for Orbit of Silence with a quiet spacecraft orbiting Mars',
        width: 1920,
        height: 1080,
        dominantColor: '#2e1d22',
      },
    ],
    availableFrom,
    availableUntil,
    minimumPlan: 'premium',
    offlineDownloadAllowed: false,
    reasonLabel: 'Premium premiere',
    cast: ['Lena Frost', 'Dayo Stone'],
    directors: ['Mika Reyes'],
    audioTracks: [{ language: 'en', label: 'English', kind: 'audio', accessibility: false }],
    subtitleTracks: [
      { language: 'en', label: 'English CC', kind: 'captions', accessibility: true },
      { language: 'es', label: 'Spanish', kind: 'subtitles', accessibility: false },
    ],
    seasons: [],
    trailerAssetId: 'asset-orbit-trailer',
    primaryAssetId: 'asset-orbit-feature',
    rightsExplanation: 'Premium plan premiere available in NG, ZA, and US until 2028.',
  },
  {
    id: 'title-lagos-midnight',
    slug: 'lagos-after-midnight',
    kind: 'movie',
    title: 'Lagos After Midnight',
    synopsis:
      'An archivist, a courier, and a jazz trumpeter cross paths during one rain-soaked night when every road leads to the same club.',
    releaseYear: 2023,
    runtimeSeconds: 5520,
    maturityRating: 'R',
    genres: ['Thriller', 'Music', 'Drama'],
    countries: ['NG'],
    artwork: [
      {
        url: '/artwork/lagos-midnight-poster.svg',
        kind: 'poster',
        alt: 'Poster artwork for Lagos After Midnight with neon rain and a trumpet silhouette',
        width: 600,
        height: 900,
        dominantColor: '#8b2d24',
      },
      {
        url: '/artwork/lagos-midnight-hero.svg',
        kind: 'hero',
        alt: 'Hero artwork for Lagos After Midnight showing neon reflected in rain',
        width: 1920,
        height: 1080,
        dominantColor: '#171a22',
      },
    ],
    availableFrom,
    availableUntil,
    minimumPlan: 'standard',
    offlineDownloadAllowed: false,
    reasonLabel: 'Gritty late-night drama',
    cast: ['Bisi Kalu', 'Mara Ellis', 'Tunde King'],
    directors: ['Ola Mbeki'],
    audioTracks: [{ language: 'en', label: 'English', kind: 'audio', accessibility: false }],
    subtitleTracks: [{ language: 'en', label: 'English CC', kind: 'captions', accessibility: true }],
    seasons: [],
    trailerAssetId: 'asset-lagos-trailer',
    primaryAssetId: 'asset-lagos-feature',
    rightsExplanation: 'Available in NG for adult profiles on Standard and Premium plans.',
  },
];

export const MOCK_RIGHTS: ContentRight[] = MOCK_TITLES.map((title) => ({
  id: `right-${title.id}`,
  titleId: title.id,
  territories: title.id === 'title-orbit-silence' ? ['NG', 'ZA', 'US'] : title.countries,
  startsAt: new Date(title.availableFrom),
  endsAt: new Date(title.availableUntil),
  minimumPlan: title.minimumPlan,
  streamAllowed: true,
  offlineDownloadAllowed: title.offlineDownloadAllowed,
  permittedAssetIds: [
    title.primaryAssetId,
    ...(title.trailerAssetId ? [title.trailerAssetId] : []),
    ...title.seasons.flatMap((season) => season.episodes.map((episode) => episode.assetId)),
  ],
}));

export const MOCK_ASSET_URLS: Record<string, { url: string; type: 'mp4' | 'hls' | 'dash'; host: string }> = {
  'asset-amber-feature': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'mp4',
    host: 'commondatastorage.googleapis.com',
  },
  'asset-riverlight-101': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: 'mp4',
    host: 'commondatastorage.googleapis.com',
  },
  'asset-riverlight-102': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    type: 'mp4',
    host: 'commondatastorage.googleapis.com',
  },
  'asset-orbit-feature': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    type: 'mp4',
    host: 'commondatastorage.googleapis.com',
  },
  'asset-lagos-feature': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    type: 'mp4',
    host: 'commondatastorage.googleapis.com',
  },
};

export function toTitleSummary(title: TitleDetail): TitleSummary {
  const {
    cast: _cast,
    directors: _directors,
    audioTracks: _audioTracks,
    subtitleTracks: _subtitleTracks,
    seasons: _seasons,
    trailerAssetId: _trailerAssetId,
    primaryAssetId: _primaryAssetId,
    rightsExplanation: _rightsExplanation,
    ...summary
  } = title;
  return summary;
}

export const MOCK_HOME: HomeResponse = {
  hero: MOCK_TITLES[0]!,
  rails: [
    {
      id: 'continue-watching',
      title: 'Continue Watching',
      subtitle: 'Resume the stories you started',
      items: MOCK_TITLES.slice(0, 3).map(toTitleSummary),
    },
    {
      id: 'new-worlds',
      title: 'New worlds, familiar feelings',
      subtitle: 'Cinematic originals and licensed mock premieres',
      items: MOCK_TITLES.map(toTitleSummary),
    },
    {
      id: 'download-ready',
      title: 'Available for authorized download',
      subtitle: 'Only shown where offline rights are explicitly enabled',
      items: MOCK_TITLES.filter((title) => title.offlineDownloadAllowed).map(toTitleSummary),
    },
  ],
  generatedAt: new Date('2026-08-01T00:00:00.000Z').toISOString(),
};
