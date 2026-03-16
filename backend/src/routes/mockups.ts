import { Router } from 'express';
import { createJob, getJob, getJobImage } from '../services/jobProcessor';
import type { AIGenerationRequest } from '../types/jobs';
import { logger } from '../utils/logger';

export const mockupsRouter = Router();

mockupsRouter.post('/mockups/jobs', (req, res) => {
  const body = req.body as AIGenerationRequest;
  const requestId = res.locals.requestId as string | undefined;

  if (
    !body ||
    !body.canvasJson ||
    !body.printArea ||
    !body.selectedColor ||
    !Array.isArray(body.variants) ||
    body.variants.length === 0
  ) {
    logger.warn('job.create.invalid_payload', {
      requestId,
      hasCanvasJson: Boolean(body?.canvasJson),
      hasPrintArea: Boolean(body?.printArea),
      selectedColor: body?.selectedColor ?? null,
      variantsCount: Array.isArray(body?.variants) ? body.variants.length : 0,
    });

    res.status(400).json({
      error:
        'Invalid request payload. Required: canvasJson, printArea, selectedColor, variants.',
    });
    return;
  }

  logger.info('job.create.request', {
    requestId,
    selectedColor: body.selectedColor,
    quality: body.quality,
    variants: body.variants,
    hasTexturePng: Boolean(body.texturePng),
    texturePngLength: body.texturePng?.length ?? 0,
    canvasSize: body.canvasSize,
  });

  const job = createJob(body);
  logger.info('job.create.accepted', { requestId, jobId: job.id });
  res.status(201).json(job);
});

mockupsRouter.get('/mockups/jobs/:jobId', (req, res) => {
  const requestId = res.locals.requestId as string | undefined;
  const { jobId } = req.params;
  const job = getJob(jobId);
  if (!job) {
    logger.warn('job.status.not_found', { requestId, jobId });
    res.status(404).json({ error: 'Job not found.' });
    return;
  }

  logger.debug('job.status.found', { requestId, jobId, status: job.status });
  res.json(job);
});

mockupsRouter.get('/mockups/images/:jobId/:variant', (req, res) => {
  const requestId = res.locals.requestId as string | undefined;
  const { jobId, variant } = req.params;
  const image = getJobImage(jobId, variant);
  if (!image) {
    logger.warn('job.image.not_found', { requestId, jobId, variant });
    res.status(404).json({ error: 'Image not found.' });
    return;
  }

  logger.info('job.image.serve', {
    requestId,
    jobId,
    variant,
    mimeType: image.mimeType,
    base64Length: image.data.length,
  });

  const buffer = Buffer.from(image.data, 'base64');
  res.setHeader('Content-Type', image.mimeType);
  res.setHeader('Content-Length', String(buffer.length));
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(buffer);
});
