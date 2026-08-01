import { redactObject } from './redaction';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  traceId?: string;
  requestId?: string;
  actorId?: string;
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

function write(level: LogLevel, message: string, context: LogContext = {}): void {
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...redactObject(context),
  };

  if (level === 'error') {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === 'warn') {
    console.warn(JSON.stringify(payload));
    return;
  }

  // Keep info/debug on stdout for container log collectors.
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

export function createLogger(namespace: string): Logger {
  return {
    debug: (message, context) => write('debug', message, { namespace, ...context }),
    info: (message, context) => write('info', message, { namespace, ...context }),
    warn: (message, context) => write('warn', message, { namespace, ...context }),
    error: (message, context) => write('error', message, { namespace, ...context }),
  };
}
