import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { mockupsRouter } from './routes/mockups';
import { logger } from './utils/logger';

dotenv.config({ path: '../.env' });

const app = express();
const port = Number(process.env.PORT ?? 8787);
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

app.use(
  cors({
    origin: corsOrigin,
  }),
);
app.use(express.json({ limit: '15mb' }));

app.use((req, res, next) => {
  const startedAt = Date.now();
  const requestId = Math.random().toString(36).slice(2, 10);
  res.locals.requestId = requestId;

  logger.info('request.start', {
    requestId,
    method: req.method,
    path: req.path,
    userAgent: req.get('user-agent') ?? 'unknown',
  });

  res.on('finish', () => {
    logger.info('request.end', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', mockupsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('server.unhandled_error', {}, err);
  res.status(500).json({ error: 'Internal server error.' });
});

process.on('unhandledRejection', (reason) => {
  logger.error('process.unhandled_rejection', {}, reason);
});

process.on('uncaughtException', (error) => {
  logger.error('process.uncaught_exception', {}, error);
});

app.listen(port, () => {
  logger.info('server.started', {
    port,
    corsOrigin,
    baseUrl: process.env.BASE_URL ?? null,
    geminiModel: process.env.GEMINI_MODEL ?? 'gemini-3.1-flash-image-preview',
    geminiApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});
