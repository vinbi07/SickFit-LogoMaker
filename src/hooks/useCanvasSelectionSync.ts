import { useEffect } from 'react';
import { fabric } from 'fabric';
import { useDesignerStore } from '../store/useDesignerStore';

export function useCanvasSelectionSync(canvas: fabric.Canvas | null): void {
  const setActiveObject = useDesignerStore((state) => state.setActiveObject);
  const setTextControls = useDesignerStore((state) => state.setTextControls);
  const resetTextControls = useDesignerStore((state) => state.resetTextControls);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    const syncSelection = () => {
      const activeObject = canvas.getActiveObject();
      setActiveObject(activeObject ?? null);

      if (!activeObject || activeObject.type !== 'text') {
        resetTextControls();
        return;
      }

      const text = activeObject as fabric.Text;
      setTextControls({
        text: text.text ?? '',
        fontFamily: text.fontFamily ?? 'Arial',
        fill: (text.fill as string) ?? '#000000',
        bold: text.fontWeight === 'bold',
        italic: text.fontStyle === 'italic',
        underline: text.underline === true,
      });
    };

    const clearSelection = () => {
      setActiveObject(null);
      resetTextControls();
    };

    canvas.on('selection:created', syncSelection);
    canvas.on('selection:updated', syncSelection);
    canvas.on('selection:cleared', clearSelection);

    return () => {
      canvas.off('selection:created', syncSelection);
      canvas.off('selection:updated', syncSelection);
      canvas.off('selection:cleared', clearSelection);
    };
  }, [canvas, resetTextControls, setActiveObject, setTextControls]);
}
