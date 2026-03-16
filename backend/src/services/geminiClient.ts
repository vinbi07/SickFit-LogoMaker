import { buildPrompt } from './promptBuilder';
import type { AIGenerationRequest, AIGenerationVariant } from '../types/jobs';
import { logger } from '../utils/logger';

type GeminiImageResult = {
  mimeType: string;
  data: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
  error?: {
    code?: number;
    message?: string;
  };
};

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GENERATION_TIMEOUT_MS = 60_000;

export async function generateMockupImage(
  payload: AIGenerationRequest,
  variant: AIGenerationVariant,
  apiKey: string,
): Promise<GeminiImageResult> {
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
  const startedAt = Date.now();

  const prompt = buildPrompt(variant);
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];

  if (payload.texturePng) {
    const rawBase64 = payload.texturePng.includes(',')
      ? payload.texturePng.split(',')[1]
      : payload.texturePng;

    if (rawBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: rawBase64,
        },
      });
    }
  }

  logger.info('gemini.request.start', {
    variant,
    model,
    hasTexturePng: Boolean(payload.texturePng),
    texturePngLength: payload.texturePng?.length ?? 0,
    promptLength: prompt.length,
    timeoutMs: GENERATION_TIMEOUT_MS,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        }),
        signal: controller.signal,
      },
    );

    logger.info('gemini.request.response', {
      variant,
      model,
      status: response.status,
      ok: response.ok,
      durationMs: Date.now() - startedAt,
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error('gemini.request.non_200', {
        variant,
        model,
        status: response.status,
        responseBody: body.slice(0, 1500),
      });
      throw new Error(`Gemini API error ${response.status}: ${body}`);
    }

    const parsed = (await response.json()) as GeminiResponse;
    if (parsed.error) {
      logger.error('gemini.request.error_payload', {
        variant,
        model,
        code: parsed.error.code ?? null,
        message: parsed.error.message ?? null,
      });
      throw new Error(
        `Gemini error ${parsed.error.code ?? ''}: ${parsed.error.message ?? 'unknown error'}`,
      );
    }

    for (const candidate of parsed.candidates ?? []) {
      for (const part of candidate.content?.parts ?? []) {
        if (part.inlineData?.data) {
          logger.info('gemini.request.success', {
            variant,
            model,
            mimeType: part.inlineData.mimeType,
            base64Length: part.inlineData.data.length,
            durationMs: Date.now() - startedAt,
          });

          return {
            mimeType: part.inlineData.mimeType,
            data: part.inlineData.data,
          };
        }
      }
    }

    logger.warn('gemini.request.no_image_data', {
      variant,
      model,
      candidateCount: parsed.candidates?.length ?? 0,
      durationMs: Date.now() - startedAt,
    });

    throw new Error('Gemini returned no image data.');
  } catch (error) {
    logger.error(
      'gemini.request.failed',
      {
        variant,
        model,
        durationMs: Date.now() - startedAt,
      },
      error,
    );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
