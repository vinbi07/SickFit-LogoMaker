export const SOCK_COLORS = [
  'white',
  'black',
  'red',
  'blue',
  'gray',
  'creme',
  'pink',
] as const;

export type SockColorKey = (typeof SOCK_COLORS)[number];

export type CanvasSnapshot = {
  canvasJson: Record<string, unknown>;
  viewportTransform: number[];
  zoom: number;
  width: number;
  height: number;
  selectedColor: SockColorKey;
};

export type TextControlsState = {
  text: string;
  fontFamily: string;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fill: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

export type PrintAreaConfig = {
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
};

export type ExportConfig = {
  templateUrl: string;
  mockupUrl: string;
  redirectUrl: string;
  fileName: string;
  printArea: PrintAreaConfig;
};

export type AIGenerationVariant = 'studio' | 'on-foot' | 'lifestyle';

export type AIGenerationQuality = 'preview' | 'final';

export type AIGenerationRequest = {
  canvasJson: Record<string, unknown>;
  canvasSize: {
    width: number;
    height: number;
  };
  printArea: PrintAreaConfig;
  selectedColor: SockColorKey;
  variants: AIGenerationVariant[];
  quality: AIGenerationQuality;
  texturePng?: string;
};

export type AIGenerationJobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed';

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
