import { fabric } from 'fabric';
import type { ExportConfig } from '../types/designer';
import { loadFabricImage } from './fabricImageLoader';

type UserObjectState = {
  object: fabric.Object;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
};

type OriginalCanvasState = {
  width: number;
  height: number;
  zoom: number;
  viewportTransform: number[];
};

function getOriginalCanvasState(canvas: fabric.Canvas): OriginalCanvasState {
  return {
    width: canvas.getWidth(),
    height: canvas.getHeight(),
    zoom: canvas.getZoom(),
    viewportTransform: [...(canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0])],
  };
}

function restoreCanvasState(canvas: fabric.Canvas, state: OriginalCanvasState): void {
  canvas.setWidth(state.width);
  canvas.setHeight(state.height);
  canvas.setViewportTransform(state.viewportTransform);
  canvas.setZoom(state.zoom);
  canvas.requestRenderAll();
}

export async function renderMockupPreview(
  canvas: fabric.Canvas,
  config: ExportConfig,
): Promise<string> {
  const original = getOriginalCanvasState(canvas);

  const userObjects: UserObjectState[] = canvas
    .getObjects()
    .filter((obj: fabric.Object) => obj.selectable)
    .map((obj: fabric.Object) => ({
      object: obj,
      left: obj.left ?? 0,
      top: obj.top ?? 0,
      scaleX: obj.scaleX ?? 1,
      scaleY: obj.scaleY ?? 1,
    }));

  let bgImg: fabric.Image | null = null;
  let mockImg: fabric.Image | null = null;

  try {
    const overlayImage = await loadFabricImage(config.templateUrl);
    const mockupImage = await loadFabricImage(config.mockupUrl);

    const overlayWidth = overlayImage.width ?? original.width;
    const overlayHeight = overlayImage.height ?? original.height;

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setZoom(1);
    canvas.setWidth(overlayWidth);
    canvas.setHeight(overlayHeight);

    const printX = overlayWidth * config.printArea.xRatio;
    const printY = overlayHeight * config.printArea.yRatio;
    const printW = overlayWidth * config.printArea.widthRatio;
    const printH = overlayHeight * config.printArea.heightRatio;

    const placementScale = Math.min(printW / original.width, printH / original.height);
    const offsetX = printX + (printW - original.width * placementScale) / 2;
    const offsetY = printY + (printH - original.height * placementScale) / 2;

    userObjects.forEach(({ object }: UserObjectState) => {
      object.left = offsetX + (object.left ?? 0) * placementScale;
      object.top = offsetY + (object.top ?? 0) * placementScale;
      object.scaleX = (object.scaleX ?? 1) * placementScale;
      object.scaleY = (object.scaleY ?? 1) * placementScale;
      object.setCoords();
    });

    overlayImage.set({
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    });

    const mockScale = Math.min(
      printW / (mockupImage.width ?? printW),
      printH / (mockupImage.height ?? printH),
    );

    mockupImage.set({
      selectable: false,
      evented: false,
      scaleX: mockScale,
      scaleY: mockScale,
      left: printX + (printW - (mockupImage.width ?? printW) * mockScale) / 2,
      top: printY + (printH - (mockupImage.height ?? printH) * mockScale) / 2,
    });

    bgImg = overlayImage;
    mockImg = mockupImage;

    canvas.add(overlayImage);
    canvas.sendToBack(overlayImage);
    canvas.add(mockupImage);
    canvas.moveTo(mockupImage, 1);
    canvas.requestRenderAll();

    const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
    return dataURL;
  } finally {
    if (bgImg) {
      canvas.remove(bgImg);
    }

    if (mockImg) {
      canvas.remove(mockImg);
    }

    userObjects.forEach(({ object, left, top, scaleX, scaleY }: UserObjectState) => {
      object.left = left;
      object.top = top;
      object.scaleX = scaleX;
      object.scaleY = scaleY;
      object.setCoords();
    });

    restoreCanvasState(canvas, original);
  }
}

export function downloadMockupDataUrl(dataURL: string, fileName: string): void {
  const anchor = document.createElement('a');
  anchor.href = dataURL;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
