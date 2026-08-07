import { describe, expect, it } from 'vitest';
import { redactObject, redactSignedUrl } from '../index';

describe('redaction', () => {
  it('redacts sensitive object keys recursively', () => {
    expect(
      redactObject({
        authorization: 'Bearer token',
        nested: { sourceUrl: 'https://example.test/file.m3u8?signature=abc' },
        title: 'The Amber Signal',
      }),
    ).toEqual({
      authorization: '[REDACTED]',
      nested: { sourceUrl: '[REDACTED]' },
      title: 'The Amber Signal',
    });
  });

  it('redacts signed URL query parameters in safe strings', () => {
    expect(redactSignedUrl('https://cdn.test/video.m3u8?Signature=abc&expires=123&quality=hd')).toBe(
      'https://cdn.test/video.m3u8?Signature=[REDACTED]&expires=[REDACTED]&quality=hd',
    );
  });
});
