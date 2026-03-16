type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogMeta = Record<string, unknown>;

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { message: String(error) };
}

function emit(level: LogLevel, message: string, meta?: LogMeta, error?: unknown): void {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
    ...(error ? { error: serializeError(error) } : {}),
  };

  console.log(JSON.stringify(payload));
}

export const logger = {
  debug(message: string, meta?: LogMeta): void {
    emit('debug', message, meta);
  },
  info(message: string, meta?: LogMeta): void {
    emit('info', message, meta);
  },
  warn(message: string, meta?: LogMeta, error?: unknown): void {
    emit('warn', message, meta, error);
  },
  error(message: string, meta?: LogMeta, error?: unknown): void {
    emit('error', message, meta, error);
  },
};
