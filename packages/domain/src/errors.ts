export type ErrorCode =
  | 'AUTH_INVALID'
  | 'RIGHTS_DENIED'
  | 'PROFILE_RESTRICTED'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_AUTH_ERROR'
  | 'PLAYBACK_SOURCE_EXPIRED'
  | 'DOWNLOAD_NOT_ALLOWED'
  | 'RATE_LIMITED'
  | 'VALIDATION_FAILED'
  | 'INTERNAL_ERROR';

export class CineNovaError extends Error {
  public readonly code: ErrorCode;
  public readonly safeMessage: string;
  public readonly status: number;

  constructor(code: ErrorCode, safeMessage: string, status = 400) {
    super(safeMessage);
    this.name = 'CineNovaError';
    this.code = code;
    this.safeMessage = safeMessage;
    this.status = status;
  }
}
