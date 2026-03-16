import type { AIGenerationVariant } from '../types/jobs';

const SCENE_PROMPTS: Record<AIGenerationVariant, string> = {
  studio:
    'Professional ecommerce studio product photo of one cotton crew sock on a pure white background. Apply the provided reference design accurately on the sock knit fabric in the printable zone. Preserve exact colors and motif proportions from the reference image. High realism, sharp focus, soft natural shadows, no watermark, no text, no logos.',
  'on-foot':
    'Professional product photo of a cotton crew sock worn on a foot in a neutral studio environment. Apply the provided reference design accurately on the sock textile, preserving exact colors and motif proportions. Realistic fabric folds and lighting, clean composition, no text or watermark.',
  lifestyle:
    'Lifestyle ecommerce photo of a cotton crew sock featuring the provided design. Keep the print faithful to the reference image and naturally mapped to fabric. Clean modern scene, realistic lighting, photoreal look, no text or watermark.',
};

export function buildPrompt(variant: AIGenerationVariant): string {
  return SCENE_PROMPTS[variant] ?? SCENE_PROMPTS.studio;
}
