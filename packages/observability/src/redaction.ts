const SENSITIVE_KEYS = [
  'authorization',
  'cookie',
  'set-cookie',
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'signedUrl',
  'sourceUrl',
  'playbackUrl',
  'providerKey',
];

const SIGNED_URL_PARAM_PATTERN = /([?&](?:token|signature|expires|key|Policy|Signature|Key-Pair-Id)=)[^&\s]+/gi;

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitiveKey) => normalized.includes(sensitiveKey.toLowerCase()));
}

export function redactSignedUrl(value: string): string {
  return value.replace(SIGNED_URL_PARAM_PATTERN, '$1[REDACTED]');
}

export function redactValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return redactSignedUrl(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }

  if (value && typeof value === 'object') {
    return redactObject(value as Record<string, unknown>);
  }

  return value;
}

export function redactObject(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      isSensitiveKey(key) ? '[REDACTED]' : redactValue(value),
    ]),
  );
}
