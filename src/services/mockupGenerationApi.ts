import type { AIGenerationJob, AIGenerationJobStatus, AIGenerationRequest } from '../types/designer';

const DEFAULT_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 2_000;

function getBaseApiUrl(): string {
  return (import.meta.env.VITE_AI_MOCKUP_API_URL as string | undefined)?.trim() ?? '';
}

function ensureApiConfigured(): string {
  const baseUrl = getBaseApiUrl();
  if (!baseUrl) {
    throw new Error('AI mockup API URL is not configured. Set VITE_AI_MOCKUP_API_URL.');
  }
  return baseUrl.replace(/\/$/, '');
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function isAIMockupEnabled(): boolean {
  return (import.meta.env.VITE_ENABLE_AI_MOCKUP as string | undefined) === 'true';
}

export async function createAIMockupJob(payload: AIGenerationRequest): Promise<AIGenerationJob> {
  const baseUrl = ensureApiConfigured();
  const response = await fetch(`${baseUrl}/mockups/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<AIGenerationJob>(response);
}

export async function getAIMockupJob(jobId: string): Promise<AIGenerationJob> {
  const baseUrl = ensureApiConfigured();
  const response = await fetch(`${baseUrl}/mockups/jobs/${encodeURIComponent(jobId)}`);
  return parseJsonResponse<AIGenerationJob>(response);
}

export async function waitForAIMockupJob(
  jobId: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<AIGenerationJob> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const job = await getAIMockupJob(jobId);
    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }

    await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
  }

  return {
    id: jobId,
    status: 'failed',
    createdAt: new Date().toISOString(),
    errorMessage: 'AI mockup generation timed out.',
  };
}

export function isFinalJobStatus(status: AIGenerationJobStatus): boolean {
  return status === 'completed' || status === 'failed';
}
