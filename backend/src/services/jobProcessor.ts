import { v4 as uuidv4 } from 'uuid';
import { generateMockupImage } from './geminiClient';
import type {
  AIGenerationJob,
  AIGenerationRequest,
  AIGenerationResult,
  AIGenerationVariant,
} from '../types/jobs';

const MAX_VARIANTS = 3;

const jobs = new Map<string, AIGenerationJob>();
const images = new Map<string, { mimeType: string; data: string }>();

export function createJob(payload: AIGenerationRequest): AIGenerationJob {
  const id = uuidv4();
  const job: AIGenerationJob = {
    id,
    status: 'queued',
    createdAt: new Date().toISOString(),
  };

  jobs.set(id, job);

  void runJob(id, payload);

  return job;
}

export function getJob(jobId: string): AIGenerationJob | undefined {
  return jobs.get(jobId);
}

export function getJobImage(jobId: string, variant: string) {
  return images.get(`${jobId}:${variant}`);
}

async function runJob(jobId: string, payload: AIGenerationRequest): Promise<void> {
  const original = jobs.get(jobId);
  if (!original) {
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    jobs.set(jobId, {
      ...original,
      status: 'failed',
      errorMessage: 'Backend is missing GEMINI_API_KEY.',
    });
    return;
  }

  jobs.set(jobId, {
    ...original,
    status: 'running',
  });

  try {
    const variants = (payload.variants ?? ['studio']).slice(
      0,
      MAX_VARIANTS,
    ) as AIGenerationVariant[];

    const baseUrl = (process.env.BASE_URL ?? 'http://localhost:8787').replace(
      /\/$/,
      '',
    );

    const results: AIGenerationResult[] = [];

    for (const variant of variants) {
      const image = await generateMockupImage(payload, variant, apiKey);

      images.set(`${jobId}:${variant}`, {
        mimeType: image.mimeType,
        data: image.data,
      });

      results.push({
        variant,
        imageUrl: `${baseUrl}/api/mockups/images/${jobId}/${variant}`,
      });
    }

    const completed = jobs.get(jobId);
    if (!completed) {
      return;
    }

    jobs.set(jobId, {
      ...completed,
      status: 'completed',
      results,
    });
  } catch (error) {
    const failed = jobs.get(jobId);
    if (!failed) {
      return;
    }

    jobs.set(jobId, {
      ...failed,
      status: 'failed',
      errorMessage:
        error instanceof Error ? error.message : 'Unknown job processing error.',
    });
  }
}
