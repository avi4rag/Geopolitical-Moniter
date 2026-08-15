import pino from 'pino';

// ─── Logger ───────────────────────────────────────────────────────────────────
// Uses Pino for structured JSON logging in production.
// In development, uses pino-pretty for human-readable output.
// ─────────────────────────────────────────────────────────────────────────────

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
});
