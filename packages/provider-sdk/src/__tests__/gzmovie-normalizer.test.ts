import { describe, expect, it } from 'vitest';
import { extractDetail, extractItems, toHomeResponse, toSearchResponse, toTitleDetail } from '../adapters/gzmovie-normalizer';

describe('gzmovie normalizer', () => {
  it('extracts items from a wrapped list response', () => {
    const raw = {
      data: [
        { subjectId: 's1', title: 'Alpha', genres: ['Action'] },
        { subjectId: 's2', title: 'Beta', genres: ['Drama'] },
      ],
    };
    const items = extractItems(raw);
    expect(items).toHaveLength(2);
  });

  it('extracts items from a top-level results key', () => {
    const raw = { results: [{ id: 's1', name: 'Gamma' }] };
    expect(extractItems(raw)).toHaveLength(1);
  });

  it('extracts a single detail from a wrapped response', () => {
    const raw = { data: { subjectId: 's9', title: 'Delta' } };
    const detail = extractDetail(raw);
    expect(detail?.subjectId).toBe('s9');
    expect(detail?.title).toBe('Delta');
  });

  it('maps a GZMovie item onto a TitleDetail', () => {
    const detail = toTitleDetail({
      subjectId: 's1',
      title: 'Lagos Nights',
      overview: 'A story set in Lagos.',
      release_year: 2024,
      runtime: 110,
      genres: ['Drama', 'Thriller'],
      country: 'Nigeria',
      poster: 'https://example.com/poster.jpg',
      cast: ['Actor One', 'Actor Two'],
    });
    expect(detail.title).toBe('Lagos Nights');
    expect(detail.kind).toBe('movie');
    expect(detail.maturityRating).toBe('G');
    expect(detail.genres).toEqual(['Drama', 'Thriller']);
    expect(detail.countries).toEqual(['NG']);
    expect(detail.artwork[0]?.url).toBe('https://example.com/poster.jpg');
    expect(detail.primaryAssetId).toBe('gz-s1');
    expect(detail.cast).toEqual(['Actor One', 'Actor Two']);
  });

  it('detects series kind', () => {
    const detail = toTitleDetail({ subjectId: 's3', name: 'The River', subjectType: 'series' });
    expect(detail.kind).toBe('series');
  });

  it('builds a home response with hero and rails', () => {
    const home = toHomeResponse({
      data: [{ subjectId: 'a', title: 'One' }, { subjectId: 'b', title: 'Two' }],
    });
    expect(home.hero.title).toBe('One');
    expect(home.rails.length).toBeGreaterThan(0);
    expect(home.rails[0]?.items.length).toBe(2);
  });

  it('builds a search response', () => {
    const search = toSearchResponse('lag', {
      results: [{ subjectId: 'x', title: 'Lagos', genres: ['Action'] }],
    });
    expect(search.results[0]?.title).toBe('Lagos');
    expect(search.suggestions).toContain('Lagos');
  });
});
