// utils/logger.ts
// Lightweight logger utility with optional pino integration.

type LogFn = (...args: unknown[]) => void;

interface Logger {
  error: LogFn;
  warn: LogFn;
  info: LogFn;
  debug: LogFn;
}

const level =
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

let logger: Logger;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore - pino types may not be installed in this environment
  const pino = require('pino');
  logger = pino({ level });
} catch {
  const levels: Record<string, number> = { error: 0, warn: 1, info: 2, debug: 3 };
  const current = levels[level] ?? 2;
  logger = {
    error: (...args) => current >= levels.error && console.error(...args),
    warn: (...args) => current >= levels.warn && console.warn(...args),
    info: (...args) => current >= levels.info && console.log(...args),
    debug: (...args) => current >= levels.debug && console.debug(...args),
  } as Logger;
}

export default logger;

