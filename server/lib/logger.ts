/**
 * Structured server logging.
 *
 * Never logs request bodies: they contain crop images, farm locations and audio.
 * Never logs env values — only whether a key is present.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = ORDER[(process.env.LOG_LEVEL as Level) ?? 'info'] ?? ORDER.info;

function emit(level: Level, message: string, fields?: Record<string, unknown>): void {
  if (ORDER[level] < threshold) return;
  const line = { level, message, time: new Date().toISOString(), ...fields };
  const sink = level === 'error' || level === 'warn' ? console.error : console.log;
  sink(JSON.stringify(line));
}

export const log = {
  debug: (message: string, fields?: Record<string, unknown>) => emit('debug', message, fields),
  info: (message: string, fields?: Record<string, unknown>) => emit('info', message, fields),
  warn: (message: string, fields?: Record<string, unknown>) => emit('warn', message, fields),
  error: (message: string, fields?: Record<string, unknown>) => emit('error', message, fields),
};

/** Reduces an unknown thrown value to something safe to log. */
export function describeError(cause: unknown): { name: string; message: string } {
  if (cause instanceof Error) return { name: cause.name, message: cause.message };
  return { name: 'UnknownError', message: String(cause) };
}
