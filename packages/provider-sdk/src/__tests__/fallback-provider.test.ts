import { describe, expect, it } from 'vitest';
import type { HomeResponse, SearchResponse } from '@cinenova/contracts';
import type { StreamingCatalogProvider } from '../ports';
import { FallbackCatalogueProvider } from '../adapters/fallback-provider';

const failProvider: StreamingCatalogProvider = {
  name: 'fail',
  async healthCheck() {
    return { provider: 'fail', status: 'unhealthy', latencyMs: 1, checkedAt: new Date(), message: 'down' };
  },
  async homepage() {
    throw new Error('primary down');
  },
  async search() {
    throw new Error('primary down');
  },
  async titleBySlug() {
    throw new Error('primary down');
  },
  async titleById() {
    throw new Error('primary down');
  },
  async recommendations() {
    throw new Error('primary down');
  },
  async mediaManifest() {
    throw new Error('primary down');
  },
};

const mockProvider: StreamingCatalogProvider = {
  name: 'mock',
  async healthCheck() {
    return { provider: 'mock', status: 'healthy', latencyMs: 1, checkedAt: new Date(), message: 'ok' };
  },
  async homepage(): Promise<HomeResponse> {
    return {
      hero: { id: 'm1', slug: 'mock-hero', kind: 'movie', title: 'Mock Hero', synopsis: 's', releaseYear: 2026, runtimeSeconds: 100, maturityRating: 'G', genres: [], countries: ['NG'], artwork: [], availableFrom: '', availableUntil: '', minimumPlan: 'standard', offlineDownloadAllowed: false, cast: [], directors: [], audioTracks: [], subtitleTracks: [], seasons: [], primaryAssetId: 'a1', rightsExplanation: 'r' },
      rails: [{ id: 'r1', title: 'Rail', items: [] }],
      generatedAt: new Date().toISOString(),
    };
  },
  async search(): Promise<SearchResponse> {
    return { query: 'q', results: [], suggestions: [] };
  },
  async titleBySlug() {
    return null;
  },
  async titleById() {
    return null;
  },
  async recommendations() {
    return [];
  },
  async mediaManifest() {
    return null;
  },
};

describe('FallbackCatalogueProvider', () => {
  const fallback = new FallbackCatalogueProvider({ primary: failProvider, fallback: mockProvider });

  it('falls back to the mock provider when the primary throws', async () => {
    const home = await fallback.homepage('NG');
    expect(home.hero.title).toBe('Mock Hero');
  });

  it('reports degraded health when the primary is unhealthy', async () => {
    const health = await fallback.healthCheck();
    expect(health.status).toBe('degraded');
    expect(health.message).toContain('fallback');
  });

  it('serves search from fallback', async () => {
    const search = await fallback.search('q', 'NG');
    expect(search.results).toEqual([]);
  });
});
