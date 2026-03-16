import { Router } from 'express';
import { createJob, getJob, getJobImage } from '../services/jobProcessor';
import type { AIGenerationRequest } from '../types/jobs';

export const mockupsRouter = Router();

mockupsRouter.post('/mockups/jobs', (req, res) => {
  const body = req.body as AIGenerationRequest;

  if (
    !body ||
    !body.canvasJson ||
    !body.printArea ||
    !body.selectedColor ||
    !Array.isArray(body.variants) ||
    body.variants.length === 0
  ) {
    res.status(400).json({
      error:
        'Invalid request payload. Required: canvasJson, printArea, selectedColor, variants.',
    });
    return;
  }

  const job = createJob(body);
  res.status(201).json(job);
});

mockupsRouter.get('/mockups/jobs/:jobId', (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: 'Job not found.' });
    return;
  }

  res.json(job);
});

mockupsRouter.get('/mockups/images/:jobId/:variant', (req, res) => {
  const image = getJobImage(req.params.jobId, req.params.variant);
  if (!image) {
    res.status(404).json({ error: 'Image not found.' });
    return;
  }

  const buffer = Buffer.from(image.data, 'base64');
  res.setHeader('Content-Type', image.mimeType);
  res.setHeader('Content-Length', String(buffer.length));
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(buffer);
});
