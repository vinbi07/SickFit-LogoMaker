import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { fabric } from 'fabric';
import { useDesignerStore } from '../store/useDesignerStore';
import type { SockColorKey } from '../types/designer';
import { getCanvasScale } from '../utils/canvasScaling';
import { loadFabricImage } from '../utils/fabricImageLoader';
import { sockImages } from '../utils/sockImages';

type UseFabricCanvasResult = {
  loadSockBackground: (color: SockColorKey, clearCanvas?: boolean) => Promise<void>;
};

export function useFabricCanvas(
  canvasElementRef: RefObject<HTMLCanvasElement | null>,
): UseFabricCanvasResult {
  const canvas = useDesignerStore((state) => state.canvas);
  const setCanvas = useDesignerStore((state) => state.setCanvas);
  const requestRef = useRef(0);

  useEffect(() => {
    const element = canvasElementRef.current;
    if (!element) {
      return;
    }

    const nextCanvas = new fabric.Canvas(element, {
      preserveObjectStacking: true,
    });

    const selectionElement = nextCanvas.getSelectionElement();
    selectionElement.style.backgroundColor = 'transparent';
    selectionElement.style.opacity = '1';

    setCanvas(nextCanvas);

    return () => {
      nextCanvas.dispose();
      setCanvas(null);
    };
  }, [canvasElementRef, setCanvas]);

  const loadSockBackground = useCallback(
    async (color: SockColorKey, clearCanvas = true) => {
      if (!canvas) {
        throw new Error('Canvas not ready');
      }

      const backgroundUrl = sockImages[color]?.right;
      if (!backgroundUrl) {
        throw new Error('Missing background URL');
      }

      const requestId = ++requestRef.current;

      const img = await loadFabricImage(backgroundUrl);

      if (requestId !== requestRef.current) {
        return;
      }

      img.selectable = false;
      img.evented = false;

      const imageWidth = img.width ?? 600;
      const imageHeight = img.height ?? 600;
      const scale = getCanvasScale(imageWidth, imageHeight);

      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvas.setZoom(1);

      if (clearCanvas) {
        canvas.clear();
      }

      canvas.setWidth(imageWidth * scale);
      canvas.setHeight(imageHeight * scale);
      canvas.setBackgroundColor('#e6ebf2', () => {
        canvas.requestRenderAll();
      });

      const widthPx = `${imageWidth * scale}px`;
      const heightPx = `${imageHeight * scale}px`;

      const lowerCanvasElement = canvas.getElement();
      const upperCanvasElement = canvas.getSelectionElement();
      const wrapperElement = lowerCanvasElement.parentElement;

      lowerCanvasElement.style.width = widthPx;
      lowerCanvasElement.style.height = heightPx;
      upperCanvasElement.style.width = widthPx;
      upperCanvasElement.style.height = heightPx;

      if (wrapperElement) {
        wrapperElement.style.width = widthPx;
        wrapperElement.style.height = heightPx;
      }

      canvas.calcOffset();

      img.set({
        left: 0,
        top: 0,
        originX: 'left',
        originY: 'top',
        scaleX: scale,
        scaleY: scale,
      });

      await new Promise<void>((resolve) => {
        canvas.setBackgroundImage(img, () => {
          canvas.calcOffset();
          canvas.renderAll();
          resolve();
        });
      });
    },
    [canvas],
  );

  return { loadSockBackground };
}
