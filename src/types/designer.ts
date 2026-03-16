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

export type ExportConfig = {
  templateUrl: string;
  mockupUrl: string;
  redirectUrl: string;
  fileName: string;
  printArea: {
    xRatio: number;
    yRatio: number;
    widthRatio: number;
    heightRatio: number;
  };
};
