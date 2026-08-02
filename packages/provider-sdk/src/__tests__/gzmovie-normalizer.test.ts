import { describe, expect, it } from 'vitest';
import {
  enrichTitleDetail,
  extractItems,
  extractSubject,
  toHomeResponse,
  toSearchResponse,
  toTitleDetail,
} from '../adapters/gzmovie-normalizer';
import { homeResponseSchema } from '@cinenova/contracts';

// Fixtures based on real ZST LABS responses.
const searchResponse = {
  status: true,
  statusCode: 200,
  creator: 'Godszeal (ZST LABS)',
  endpoint: '/api/search',
  data: {
    pager: { hasMore: true },
    items: [
      {
        subjectId: '5608459269503862552',
        subjectType: 1,
        title: 'AVENGERS',
        description: '',
        releaseDate: '2025-08-24',
        duration: 0,
        genre: 'yoruba',
        cover: { url: 'https://pbcdnw.aoneroom.com/image/2026/03/30/x.jpg', width: 1280, height: 720 },
        countryName: 'Nigeria',
        imdbRatingValue: '0',
        detailPath: 'avengers-QExqQyMNiG6',
      },
      {
        subjectId: '5154075108704669480',
        subjectType: 1,
        title: 'The Avengers',
        description: '',
        releaseDate: '2012-05-04',
        duration: 8580,
        genre: 'Action,Sci-Fi',
        cover: { url: 'https://pbcdnw.aoneroom.com/image/2026/01/27/y.jpg' },
        countryName: 'United States',
        imdbRatingValue: '8.0',
        detailPath: 'the-avengers-ChBgfByIJ86',
      },
      {
        subjectId: '8454918444612471512',
        subjectType: 2,
        title: 'Avengers Assemble S1-S5',
        releaseDate: '2013-05-26',
        duration: 0,
        genre: 'Animation,Action,Adventure',
        cover: { url: 'https://pbcdnw.aoneroom.com/image/z.jpg' },
        countryName: 'United States',
        detailPath: 'avengers-assemble-WH7r7AcCz4a',
      },
    ],
  },
};

const homepageResponse = {
  status: true,
  statusCode: 200,
  endpoint: '/api/homepage',
  data: {
    homeList: [],
    topPickList: [],
    operatingList: [
      {
        type: 'BANNER',
        position: 1,
        title: 'Banner_Africa',
        banner: {
          items: [
            {
              id: '0',
              title: 'The Avengers',
              image: { url: 'https://pbcdnw.aoneroom.com/image/2026/01/27/y.jpg' },
              url: 'https://h5.aoneroom.com/detail/the-avengers-ChBgfByIJ86',
              subjectId: '5154075108704669480',
              subjectType: 1,
              subject: {
                subjectId: '5154075108704669480',
                subjectType: 1,
                title: 'The Avengers',
                description: 'Earths mightiest heroes.',
                releaseDate: '2012-05-04',
                duration: 8580,
                genre: 'Action,Sci-Fi',
                cover: { url: 'https://pbcdnw.aoneroom.com/image/2026/01/27/y.jpg' },
                countryName: 'United States',
                imdbRatingValue: '8.0',
                detailPath: 'the-avengers-ChBgfByIJ86',
              },
              detailPath: 'the-avengers-ChBgfByIJ86',
            },
          ],
        },
      },
    ],
  },
};

const itemDetailsResponse = {
  status: true,
  statusCode: 200,
  endpoint: '/api/item-details',
  subjectId: '758465225426354376',
  data: {
    subject: {
      subjectId: '758465225426354376',
      subjectType: 2,
      title: 'Genesis',
      description: 'A gospel queen faces chaos.',
      releaseDate: '2025-04-21',
      duration: 0,
      genre: 'Drama',
      cover: { url: 'https://pbcdnw.aoneroom.com/image/c.jpg' },
      countryName: 'South Africa',
      imdbRatingValue: '9.1',
      detailPath: 'genesis-MStWSChM1U',
      isSeries: true,
    },
    stars: [
      { staffId: '1', staffType: 2, name: 'Luthando Mngomezulu', character: 'Director' },
      { staffId: '2', staffType: 1, name: 'Baby Cele', character: 'Felicia' },
    ],
    seasons: [{ se: 1, maxEp: 260, allEp: '1,2,3' }],
  },
};

describe('gzmovie normalizer', () => {
  it('extracts items from a search response', () => {
    const items = extractItems(searchResponse);
    expect(items).toHaveLength(3);
  });

  it('maps a search item onto a TitleDetail', () => {
    const detail = toTitleDetail(extractItems(searchResponse)[1]!);
    expect(detail.id).toBe('5154075108704669480');
    expect(detail.slug).toBe('the-avengers-ChBgfByIJ86');
    expect(detail.title).toBe('The Avengers');
    expect(detail.kind).toBe('movie');
    expect(detail.genres).toEqual(['Action', 'Sci-Fi']);
    expect(detail.countries).toEqual(['US']);
    expect(detail.runtimeSeconds).toBe(8580);
    expect(detail.releaseYear).toBe(2012);
    expect(detail.artwork[0]?.url).toBe('https://pbcdnw.aoneroom.com/image/2026/01/27/y.jpg');
  });

  it('detects series from subjectType 2', () => {
    const detail = toTitleDetail(extractItems(searchResponse)[2]!);
    expect(detail.kind).toBe('series');
  });

  it('builds a search response', () => {
    const search = toSearchResponse('Avengers', searchResponse);
    expect(search.results).toHaveLength(3);
    expect(search.suggestions).toContain('The Avengers');
  });

  it('builds a home response with a real banner hero and non-empty slugs', () => {
    const home = toHomeResponse(homepageResponse, extractItems(searchResponse));
    expect(home.hero.title).toBe('The Avengers'); // from operatingList banner.subject
    expect(home.hero.slug).toBe('the-avengers-ChBgfByIJ86');
    expect(home.rails.length).toBeGreaterThan(0);
    expect(home.rails[0]?.items.length).toBeGreaterThan(0);
    // Regression: every rail item must keep a non-empty slug (detailPath).
    for (const rail of home.rails) {
      for (const item of rail.items) {
        expect(item.slug.length).toBeGreaterThan(0);
      }
    }
  });

  it('parses a real operatingList homepage into a valid HomeResponse', () => {
    const home = toHomeResponse(homepageResponse, []);
    // Must satisfy the full Zod contract (would have thrown with empty slugs).
    const parsed = homeResponseSchema.parse({ ...home, generatedAt: new Date().toISOString() });
    expect(parsed.hero.title).toBe('The Avengers');
    expect(parsed.rails[0]?.items.length).toBeGreaterThan(0);
  });

  it('extracts a subject from item-details', () => {
    const subject = extractSubject(itemDetailsResponse);
    expect(subject?.title).toBe('Genesis');
    expect(subject?.detailPath).toBe('genesis-MStWSChM1U');
  });

  it('enriches a title with cast, directors, and seasons', () => {
    const base = toTitleDetail(extractSubject(itemDetailsResponse)!);
    const stars = itemDetailsResponse.data.stars;
    const seasons = itemDetailsResponse.data.seasons;
    const detail = enrichTitleDetail(base, stars, seasons);
    expect(detail.kind).toBe('series');
    expect(detail.directors).toContain('Luthando Mngomezulu');
    expect(detail.cast).toContain('Baby Cele');
    expect(detail.seasons[0]?.episodes).toHaveLength(3);
    expect(detail.seasons[0]?.episodes[0]?.assetId).toBe('758465225426354376:1:1');
  });
});
