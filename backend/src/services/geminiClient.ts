import { buildPrompt } from './promptBuilder';
import type { AIGenerationRequest, AIGenerationVariant } from '../types/jobs';

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
  const model =
    process.env.GEMINI_MODEL ?? 'gemini-2.0-flash-preview-image-generation';

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

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${body}`);
    }

    const parsed = (await response.json()) as GeminiResponse;
    if (parsed.error) {
      throw new Error(
        `Gemini error ${parsed.error.code ?? ''}: ${parsed.error.message ?? 'unknown error'}`,
      );
    }

    for (const candidate of parsed.candidates ?? []) {
      for (const part of candidate.content?.parts ?? []) {
        if (part.inlineData?.data) {
          return {
            mimeType: part.inlineData.mimeType,
            data: part.inlineData.data,
          };
        }
      }
    }

    throw new Error('Gemini returned no image data.');
  } finally {
    clearTimeout(timeout);
  }
}
