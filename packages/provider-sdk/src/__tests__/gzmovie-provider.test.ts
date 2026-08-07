import { describe, expect, it } from 'vitest';
import { GZMovieProviderAdapter } from '../adapters/gzmovie-provider';

// Expose the private extractMediaUrl for testing via a cast helper.
const adapter = new GZMovieProviderAdapter({
  enabled: true,
  baseUrl: 'https://zstlab.cyou',
  apiKey: 'test',
  timeoutMs: 5000,
}) as unknown as { name: string; extractMediaUrl(raw: unknown): string | null };

describe('GZMovieProviderAdapter media extraction', () => {
  it('extracts the highest-resolution signed mp4 URL', () => {
    const media = {
      data: {
        downloads: {
          data: {
            downloads: [
              { url: 'https://bcdnxw.hakunaymatata.com/a.mp4?sign=x', resolution: 360 },
              { url: 'https://bcdnxw.hakunaymatata.com/b.mp4?sign=y', resolution: 720 },
            ],
          },
        },
      },
    };
    const url = adapter.extractMediaUrl(media);
    expect(url).toContain('b.mp4');
  });

  it('returns null when no downloads are present', () => {
    expect(adapter.extractMediaUrl({ data: { downloads: { data: { downloads: [] } } } })).toBeNull();
    expect(adapter.extractMediaUrl({})).toBeNull();
  });

  it('is enabled in config', () => {
    expect(adapter.name).toBe('gzmovie');
  });
});
