import { fabric } from 'fabric';
import type { PrintAreaConfig } from '../types/designer';

export function extractDesignTexture(
  canvas: fabric.Canvas,
  printArea: PrintAreaConfig,
): string {
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  const left = Math.round(canvasWidth * printArea.xRatio);
  const top = Math.round(canvasHeight * printArea.yRatio);
  const width = Math.round(canvasWidth * printArea.widthRatio);
  const height = Math.round(canvasHeight * printArea.heightRatio);

  const background = canvas.backgroundImage as fabric.Object | undefined;
  if (background) {
    background.set('visible', false);
  }
  canvas.requestRenderAll();

  const textureDataUrl = canvas.toDataURL({
    format: 'png',
    quality: 1,
    left,
    top,
    width,
    height,
  });

  if (background) {
    background.set('visible', true);
  }
  canvas.requestRenderAll();

  return textureDataUrl;
}
