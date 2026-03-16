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
  const loadingRef = useRef(false);

  useEffect(() => {
    const element = canvasElementRef.current;
    if (!element) {
      return;
    }

    const nextCanvas = new fabric.Canvas(element, {
      preserveObjectStacking: true,
    });

    setCanvas(nextCanvas);

    return () => {
      nextCanvas.dispose();
      setCanvas(null);
    };
  }, [canvasElementRef, setCanvas]);

  const loadSockBackground = useCallback(
    async (color: SockColorKey, clearCanvas = true) => {
      if (!canvas || loadingRef.current) {
        return;
      }

      const backgroundUrl = sockImages[color]?.right;
      if (!backgroundUrl) {
        return;
      }

      loadingRef.current = true;

      try {
        const img = await loadFabricImage(backgroundUrl);
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

        img.set({
          left: 0,
          top: 0,
          originX: 'left',
          originY: 'top',
          scaleX: scale,
          scaleY: scale,
        });

        canvas.setBackgroundImage(img, () => {
          canvas.requestRenderAll();
        });
      } finally {
        loadingRef.current = false;
      }
    },
    [canvas],
  );

  return { loadSockBackground };
}
