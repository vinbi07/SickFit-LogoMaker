export type SockColorKey =
  | 'white'
  | 'black'
  | 'red'
  | 'blue'
  | 'gray'
  | 'creme'
  | 'pink';

export type AIGenerationVariant = 'studio' | 'on-foot' | 'lifestyle';

export type AIGenerationQuality = 'preview' | 'final';

export type PrintAreaConfig = {
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
};

export type AIGenerationRequest = {
  canvasJson: Record<string, unknown>;
  canvasSize: { width: number; height: number };
  printArea: PrintAreaConfig;
  selectedColor: SockColorKey;
  variants: AIGenerationVariant[];
  quality: AIGenerationQuality;
  texturePng?: string;
};

export type AIGenerationJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export type AIGenerationResult = {
  variant: AIGenerationVariant;
  imageUrl: string;
};

export type AIGenerationJob = {
  id: string;
  status: AIGenerationJobStatus;
  createdAt: string;
  errorMessage?: string;
  results?: AIGenerationResult[];
};
