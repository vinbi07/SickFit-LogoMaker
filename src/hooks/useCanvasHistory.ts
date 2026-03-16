import { useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import { useDesignerStore } from '../store/useDesignerStore';
import type { CanvasSnapshot } from '../types/designer';

const MAX_HISTORY = 50;

function buildSnapshot(canvas: fabric.Canvas): CanvasSnapshot {
  const state = useDesignerStore.getState();
  return {
    canvasJson: canvas.toDatalessJSON(),
    viewportTransform: [...(canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0])],
    zoom: canvas.getZoom(),
    width: canvas.getWidth(),
    height: canvas.getHeight(),
    selectedColor: state.selectedColor,
  };
}

export function useCanvasHistory(canvas: fabric.Canvas | null) {
  const history = useDesignerStore((state) => state.history);
  const historyStep = useDesignerStore((state) => state.historyStep);
  const isRestoringHistory = useDesignerStore((state) => state.isRestoringHistory);
  const setHistory = useDesignerStore((state) => state.setHistory);
  const setIsRestoringHistory = useDesignerStore((state) => state.setIsRestoringHistory);
  const setSelectedColor = useDesignerStore((state) => state.setSelectedColor);

  const pushSnapshot = useCallback(() => {
    if (!canvas || isRestoringHistory) {
      return;
    }

    const snapshot = buildSnapshot(canvas);
    const cropped = history.slice(0, historyStep + 1);
    const nextHistory = [...cropped, snapshot].slice(-MAX_HISTORY);
    setHistory(nextHistory, nextHistory.length - 1);
  }, [canvas, history, historyStep, isRestoringHistory, setHistory]);

  const restoreSnapshot = useCallback(
    (targetStep: number) => {
      if (!canvas || targetStep < 0 || targetStep >= history.length) {
        return;
      }

      const snapshot = history[targetStep];
      setIsRestoringHistory(true);

      canvas.loadFromJSON(snapshot.canvasJson, () => {
        canvas.setWidth(snapshot.width);
        canvas.setHeight(snapshot.height);
        canvas.setViewportTransform(snapshot.viewportTransform);
        canvas.setZoom(snapshot.zoom);
        canvas.requestRenderAll();
        setSelectedColor(snapshot.selectedColor);
        setHistory(history, targetStep);
        setIsRestoringHistory(false);
      });
    },
    [canvas, history, setHistory, setIsRestoringHistory, setSelectedColor],
  );

  const undo = useCallback(() => {
    if (historyStep <= 0) {
      return;
    }

    restoreSnapshot(historyStep - 1);
  }, [historyStep, restoreSnapshot]);

  const redo = useCallback(() => {
    if (historyStep >= history.length - 1) {
      return;
    }

    restoreSnapshot(historyStep + 1);
  }, [history.length, historyStep, restoreSnapshot]);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    const onMutation = () => pushSnapshot();

    canvas.on('object:added', onMutation);
    canvas.on('object:modified', onMutation);
    canvas.on('object:removed', onMutation);

    return () => {
      canvas.off('object:added', onMutation);
      canvas.off('object:modified', onMutation);
      canvas.off('object:removed', onMutation);
    };
  }, [canvas, pushSnapshot]);

  return {
    historyStep,
    historyLength: history.length,
    canUndo: historyStep > 0,
    canRedo: historyStep < history.length - 1,
    pushSnapshot,
    undo,
    redo,
  };
}
